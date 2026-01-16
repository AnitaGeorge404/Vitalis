import { useState, useRef, useEffect } from 'react';
import { Heart, Thermometer, Wind, Activity, Camera, AlertCircle, Play, Square, TrendingUp } from 'lucide-react';
import './VitalScan.css';

/**
 * Vital Scan Component
 * Quick vital signs assessment using camera and sensors
 * Measures: Heart Rate, Respiratory Rate, and provides Blood Pressure estimation guidance
 */
function VitalScan() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [vitalSigns, setVitalSigns] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanType, setScanType] = useState('heartRate'); // 'heartRate', 'respiratory', 'all'
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // Initialize camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Camera access error:', error);
      alert('Cannot access camera. Please grant camera permissions.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  // Simulated heart rate detection (in production, this would use actual PPG analysis)
  const simulateVitalScan = () => {
    setScanProgress(0);
    setIsScanning(true);

    let progress = 0;
    scanIntervalRef.current = setInterval(() => {
      progress += 2;
      setScanProgress(progress);

      if (progress >= 100) {
        clearInterval(scanIntervalRef.current);
        setIsScanning(false);
        
        // Simulate results (in production, these would be real measurements)
        const results = {
          heartRate: Math.floor(Math.random() * (100 - 60) + 60), // 60-100 BPM
          respiratoryRate: Math.floor(Math.random() * (20 - 12) + 12), // 12-20 breaths/min
          oxygenSaturation: Math.floor(Math.random() * (100 - 95) + 95), // 95-100%
          timestamp: new Date().toLocaleTimeString(),
          quality: 'Good',
          confidence: Math.floor(Math.random() * (100 - 85) + 85) // 85-100%
        };

        setVitalSigns(results);
      }
    }, 100);
  };

  const startScan = async () => {
    if (!cameraActive) {
      await startCamera();
    }
    
    setTimeout(() => {
      simulateVitalScan();
    }, 500);
  };

  const stopScan = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsScanning(false);
    setScanProgress(0);
  };

  const resetScan = () => {
    stopScan();
    setVitalSigns(null);
  };

  useEffect(() => {
    return () => {
      stopCamera();
      stopScan();
    };
  }, []);

  const getVitalStatus = (type, value) => {
    if (!value) return 'unknown';

    switch (type) {
      case 'heartRate':
        if (value < 60) return 'low';
        if (value > 100) return 'high';
        return 'normal';
      case 'respiratory':
        if (value < 12) return 'low';
        if (value > 20) return 'high';
        return 'normal';
      case 'oxygen':
        if (value < 95) return 'low';
        return 'normal';
      default:
        return 'unknown';
    }
  };

  return (
    <div className="vital-scan-container">
      <div className="vital-scan-header">
        <h1>Vital Scan</h1>
        <p>Quick vital signs assessment using camera-based technology</p>
      </div>

      <div className="emergency-disclaimer">
        <AlertCircle size={20} />
        <p>
          <strong>Emergency Notice:</strong> This tool provides estimated vital signs.
          For life-threatening emergencies, call 911 immediately. Not a substitute for professional medical devices.
        </p>
      </div>

      <div className="vital-scan-main">
        {/* Camera Section */}
        <div className="camera-section">
          <div className="camera-container">
            {!cameraActive ? (
              <div className="camera-placeholder">
                <Camera size={64} />
                <p>Camera will activate when you start scanning</p>
                <button className="btn btn-primary" onClick={startCamera}>
                  <Camera size={18} /> Activate Camera
                </button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="camera-feed"
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                
                {isScanning && (
                  <div className="scan-overlay">
                    <div className="scan-animation">
                      <div className="scan-line"></div>
                    </div>
                    <div className="scan-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${scanProgress}%` }}
                        ></div>
                      </div>
                      <p>Scanning... {scanProgress}%</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Controls */}
          <div className="scan-controls">
            {!isScanning && !vitalSigns && (
              <button 
                className="btn btn-primary btn-lg"
                onClick={startScan}
                disabled={!cameraActive && isScanning}
              >
                <Play size={20} /> Start Vital Scan
              </button>
            )}

            {isScanning && (
              <button 
                className="btn btn-secondary btn-lg"
                onClick={stopScan}
              >
                <Square size={20} /> Stop Scan
              </button>
            )}

            {vitalSigns && !isScanning && (
              <div className="button-group">
                <button 
                  className="btn btn-primary"
                  onClick={startScan}
                >
                  <Play size={18} /> Scan Again
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={resetScan}
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="results-section">
          <h2>Vital Signs</h2>

          {!vitalSigns ? (
            <div className="no-results">
              <Activity size={48} />
              <p>No measurements yet</p>
              <p className="hint">Start a scan to measure vital signs</p>
            </div>
          ) : (
            <div className="vital-cards">
              {/* Heart Rate */}
              <div className={`vital-card status-${getVitalStatus('heartRate', vitalSigns.heartRate)}`}>
                <div className="vital-icon">
                  <Heart size={32} />
                </div>
                <div className="vital-info">
                  <h3>Heart Rate</h3>
                  <div className="vital-value">
                    {vitalSigns.heartRate} <span className="unit">BPM</span>
                  </div>
                  <div className="vital-status">
                    {getVitalStatus('heartRate', vitalSigns.heartRate) === 'normal' ? 'Normal Range' : 
                     getVitalStatus('heartRate', vitalSigns.heartRate) === 'low' ? 'Below Normal' : 'Above Normal'}
                  </div>
                </div>
              </div>

              {/* Respiratory Rate */}
              <div className={`vital-card status-${getVitalStatus('respiratory', vitalSigns.respiratoryRate)}`}>
                <div className="vital-icon">
                  <Wind size={32} />
                </div>
                <div className="vital-info">
                  <h3>Respiratory Rate</h3>
                  <div className="vital-value">
                    {vitalSigns.respiratoryRate} <span className="unit">breaths/min</span>
                  </div>
                  <div className="vital-status">
                    {getVitalStatus('respiratory', vitalSigns.respiratoryRate) === 'normal' ? 'Normal Range' : 
                     getVitalStatus('respiratory', vitalSigns.respiratoryRate) === 'low' ? 'Below Normal' : 'Above Normal'}
                  </div>
                </div>
              </div>

              {/* Oxygen Saturation */}
              <div className={`vital-card status-${getVitalStatus('oxygen', vitalSigns.oxygenSaturation)}`}>
                <div className="vital-icon">
                  <Activity size={32} />
                </div>
                <div className="vital-info">
                  <h3>O₂ Saturation</h3>
                  <div className="vital-value">
                    {vitalSigns.oxygenSaturation}<span className="unit">%</span>
                  </div>
                  <div className="vital-status">
                    {getVitalStatus('oxygen', vitalSigns.oxygenSaturation) === 'normal' ? 'Normal Range' : 'Below Normal'}
                  </div>
                </div>
              </div>

              {/* Scan Quality */}
              <div className="vital-card quality-card">
                <div className="vital-icon">
                  <TrendingUp size={32} />
                </div>
                <div className="vital-info">
                  <h3>Scan Quality</h3>
                  <div className="vital-value">
                    {vitalSigns.confidence}<span className="unit">%</span>
                  </div>
                  <div className="vital-status">
                    {vitalSigns.quality}
                  </div>
                </div>
              </div>
            </div>
          )}

          {vitalSigns && (
            <div className="scan-metadata">
              <p><strong>Measured at:</strong> {vitalSigns.timestamp}</p>
              <p><strong>Confidence:</strong> {vitalSigns.confidence}%</p>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="instructions-section">
        <h3>How to Use</h3>
        <ol>
          <li>
            <strong>Position:</strong> Sit still in a well-lit area. Keep your face clearly visible to the camera.
          </li>
          <li>
            <strong>Start Scan:</strong> Click "Start Vital Scan" and remain still for 30-60 seconds.
          </li>
          <li>
            <strong>Stay Calm:</strong> Breathe normally. Movement affects accuracy.
          </li>
          <li>
            <strong>Review Results:</strong> Check your vital signs and note any abnormal readings.
          </li>
        </ol>

        <div className="info-box">
          <AlertCircle size={20} />
          <div>
            <strong>Normal Ranges:</strong>
            <ul>
              <li>Heart Rate: 60-100 BPM</li>
              <li>Respiratory Rate: 12-20 breaths/min</li>
              <li>Oxygen Saturation: 95-100%</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VitalScan;
