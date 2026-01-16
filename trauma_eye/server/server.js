const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

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

// Start server
app.listen(PORT, () => {
  console.log(`🏥 Trauma Eye API server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📍 Analyze endpoint: http://localhost:${PORT}/api/analyze-wound`);
});
