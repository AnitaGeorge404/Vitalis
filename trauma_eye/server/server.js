const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

// In-memory storage for triage cards
// Structure: Map<token, { data, expiresAt, createdAt, accessLog }>
const triageCards = new Map();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Allow larger payloads for images

/**
 * POST /api/analyze-wound
 * Analyzes wound image using Python OpenCV script
 * 
 * Body:
 * {
 *   "image": "data:image/jpeg;base64,...",
 *   "previous_wound_data": {...} // optional
 * }
 */
app.post('/api/analyze-wound', async (req, res) => {
  try {
    const { image, previous_wound_data } = req.body;

    // Validate input
    if (!image) {
      return res.status(400).json({
        error: true,
        message: 'No image data provided'
      });
    }

    // Check image size (base64 encoded ~10MB limit)
    const imageSizeBytes = Buffer.byteLength(image, 'utf8');
    const imageSizeMB = imageSizeBytes / (1024 * 1024);
    
    if (imageSizeMB > 10) {
      return res.status(400).json({
        error: true,
        message: `Image too large (${imageSizeMB.toFixed(2)}MB). Maximum size is 10MB.`
      });
    }

    // Prepare input for Python script
    const pythonInput = JSON.stringify({
      image,
      previous_wound_data: previous_wound_data || null
    });

    // Spawn Python process
    const pythonPath = 'python3'; // Use 'python3' on Unix systems
    const scriptPath = path.join(__dirname, 'trauma_eye.py');
    
    const pythonProcess = spawn(pythonPath, [scriptPath]);

    let outputData = '';
    let errorData = '';
    let isResponseSent = false;

    // Set a timeout for the Python process (30 seconds)
    const processTimeout = setTimeout(() => {
      if (!isResponseSent) {
        pythonProcess.kill('SIGKILL');
        isResponseSent = true;
        return res.status(504).json({
          error: true,
          message: 'Analysis timeout. Please try with a smaller image or better lighting.'
        });
      }
    }, 30000);

    // Collect stdout
    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString();
    });

    // Collect stderr
    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
    });

    // Handle process completion
    pythonProcess.on('close', (code) => {
      clearTimeout(processTimeout);
      
      if (isResponseSent) {
        return; // Already sent timeout response
      }
      
      isResponseSent = true;
      
      if (code !== 0) {
        console.error('Python script error:', errorData);
        return res.status(500).json({
          error: true,
          message: 'Wound analysis failed. Please try again with a clearer image.',
          details: process.env.NODE_ENV === 'development' ? errorData : undefined
        });
      }

      try {
        // Parse JSON output from Python
        const result = JSON.parse(outputData);
        
        // Check if Python returned an error
        if (result.error) {
          return res.status(400).json(result);
        }

        // Return successful analysis
        res.json(result);
      } catch (parseError) {
        console.error('Failed to parse Python output:', outputData);
        res.status(500).json({
          error: true,
          message: 'Failed to process analysis results',
          details: process.env.NODE_ENV === 'development' ? outputData : undefined
        });
      }
    });

    // Handle process errors
    pythonProcess.on('error', (error) => {
      clearTimeout(processTimeout);
      
      if (isResponseSent) return;
      isResponseSent = true;
      
      console.error('Failed to start Python process:', error);
      res.status(500).json({
        error: true,
        message: 'Analysis service unavailable. Please ensure Python and required dependencies are installed.'
      });
    });

    // Send input to Python script via stdin
    pythonProcess.stdin.write(pythonInput);
    pythonProcess.stdin.end();

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Trauma Eye API' });
});

/**
 * Triage Classification Logic
 * Returns: { level: 'RED'|'ORANGE'|'YELLOW'|'GREEN', explanation: string }
 */
function calculateTriageLevel(symptoms = [], traumaEyeResult = null, location = {}) {
  let score = 0;
  let riskFactors = [];

  // Analyze symptoms
  const highSymptoms = symptoms.filter(s => s.severity === 'high').length;
  const moderateSymptoms = symptoms.filter(s => s.severity === 'moderate').length;
  
  if (highSymptoms >= 2) {
    score += 30;
    riskFactors.push('multiple severe symptoms');
  } else if (highSymptoms === 1) {
    score += 20;
    riskFactors.push('severe symptom present');
  }
  
  if (moderateSymptoms >= 3) {
    score += 15;
    riskFactors.push('multiple moderate symptoms');
  }

  // Analyze trauma eye result
  if (traumaEyeResult) {
    const severity = traumaEyeResult.severity?.toLowerCase() || '';
    const bodyPart = traumaEyeResult.body_part?.toLowerCase() || '';
    
    if (severity === 'severe' || severity === 'high') {
      score += 25;
      riskFactors.push('severe injury detected');
      
      // Critical body parts
      if (bodyPart.includes('head') || bodyPart.includes('chest') || bodyPart.includes('neck')) {
        score += 15;
        riskFactors.push('critical body area affected');
      }
    } else if (severity === 'moderate') {
      score += 15;
      riskFactors.push('moderate injury detected');
    } else if (severity === 'low' || severity === 'minor') {
      score += 5;
    }
  }

  // Location risk factors (minor weight)
  if (location.remoteArea) {
    score += 5;
    riskFactors.push('remote location');
  }

  // Determine triage level
  let level, explanation, color;
  
  if (score >= 40) {
    level = 'RED';
    color = '#dc2626';
    explanation = 'Immediate medical attention required - ' + riskFactors.join(', ');
  } else if (score >= 25) {
    level = 'ORANGE';
    color = '#ea580c';
    explanation = 'Very urgent - seek emergency care immediately - ' + riskFactors.join(', ');
  } else if (score >= 15) {
    level = 'YELLOW';
    color = '#ca8a04';
    explanation = 'Urgent care needed - seek medical attention soon - ' + riskFactors.join(', ');
  } else {
    level = 'GREEN';
    color = '#16a34a';
    explanation = score > 0 ? 'Non-urgent - monitor condition and seek care if worsens' : 'Low-risk presentation - routine care advised';
  }

  return { level, color, explanation, score };
}

/**
 * POST /api/triage/create
 * Generate a secure Smart-Link for emergency triage
 * 
 * Body:
 * {
 *   "symptoms": [{ name: string, severity: 'low'|'moderate'|'high' }],
 *   "traumaEyeResult": { injury_type, body_part, severity, confidence },
 *   "location": { highTraffic, remoteArea, industrialArea },
 *   "patientInfo": { ageGroup: string, gender: string }
 * }
 */
app.post('/api/triage/create', (req, res) => {
  try {
    const { symptoms, traumaEyeResult, location, patientInfo } = req.body;

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Calculate triage level
    const triage = calculateTriageLevel(symptoms, traumaEyeResult, location);
    
    // Set expiration (60 minutes from now)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    const createdAt = new Date();

    // Store triage card
    const triageData = {
      token,
      triage,
      symptoms: symptoms || [],
      traumaEyeResult: traumaEyeResult || null,
      location: location || {},
      patientInfo: patientInfo || {},
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      accessLog: []
    };

    triageCards.set(token, triageData);

    // Auto-delete after expiration
    setTimeout(() => {
      triageCards.delete(token);
      console.log(`🗑️ Expired triage card: ${token}`);
    }, 60 * 60 * 1000);

    console.log(`✅ Created triage card: ${token} (${triage.level})`);

    // Return response
    res.json({
      success: true,
      token,
      url: `/triage/${token}`,
      fullUrl: `${req.protocol}://${req.get('host')}/triage/${token}`,
      triage: triage,
      expiresAt: expiresAt.toISOString()
    });

  } catch (error) {
    console.error('Triage creation error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to create triage card'
    });
  }
});

/**
 * GET /api/triage/:token
 * Retrieve triage card data (read-only, no auth required)
 */
app.get('/api/triage/:token', (req, res) => {
  try {
    const { token } = req.params;

    // Check if token exists
    const triageData = triageCards.get(token);
    
    if (!triageData) {
      return res.status(404).json({
        error: true,
        message: 'Triage card not found or expired'
      });
    }

    // Check if expired
    if (new Date() > new Date(triageData.expiresAt)) {
      triageCards.delete(token);
      return res.status(410).json({
        error: true,
        message: 'Triage card has expired'
      });
    }

    // Log access
    triageData.accessLog.push({
      timestamp: new Date().toISOString(),
      ip: req.ip
    });

    console.log(`👁️ Triage card accessed: ${token}`);

    // Return triage data (excluding token)
    const { token: _, ...publicData } = triageData;
    res.json({
      success: true,
      data: publicData
    });

  } catch (error) {
    console.error('Triage retrieval error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to retrieve triage card'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🏥 Trauma Eye API server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📍 Analyze endpoint: http://localhost:${PORT}/api/analyze-wound`);
});
