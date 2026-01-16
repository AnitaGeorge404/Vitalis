import { useState, useEffect, useRef } from 'react';
import { Play, Square, Check, AlertCircle, Activity, Volume2, VolumeX, Camera, CameraOff } from 'lucide-react';
import './styles/CPRCoach.css';
import PoseDetector from './components/PoseDetector';
import CPRAnalyzer from './components/CPRAnalyzer';

/**
 * CPR Coach - Rebuilt from scratch
 * Step-based flow, always-visible CTAs, works without camera
 * Now with optional pose detection for real-time posture feedback
 * Designed for panic situations and demo reliability
 */
function CPRCoach() {
  // State Machine: 'start' → 'positioning' → 'active' → 'stopped'
  const [step, setStep] = useState('start'); // start, positioning, active, stopped
  const [compressionCount, setCompressionCount] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [metronomePlaying, setMetronomePlaying] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [simulationMode, setSimulationMode] = useState(true); // Default to demo mode
  
  // Camera & Pose Detection
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [postureFeedback, setPostureFeedback] = useState('');
  const [postureValid, setPostureValid] = useState(false);
  
  // Refs
  const metronomeIntervalRef = useRef(null);
  const sessionTimerRef = useRef(null);
  const audioContextRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseDetectorRef = useRef(null);
  const cprAnalyzerRef = useRef(null);

  // Console logging for debugging
  useEffect(() => {
    console.log('[CPR Coach] Step changed:', step);
    console.log('[CPR Coach] Compression count:', compressionCount);
    console.log('[CPR Coach] Session time:', sessionTime);
  }, [step, compressionCount, sessionTime]);

  // Initialize Audio Context
  const initAudioContext = () => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        console.log('[CPR Coach] Audio context initialized');
      } catch (error) {
        console.error('[CPR Coach] Audio context error:', error);
      }
    }
  };

  // Metronome beep sound (110 BPM)
  const playBeep = () => {
    if (!audioEnabled || !audioContextRef.current) return;
    
    try {
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = 800; // Hz
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    } catch (error) {
      console.error('[CPR Coach] Beep sound error:', error);
    }
  };

  // Start metronome (110 BPM = 545ms per beat)
  const startMetronome = () => {
    if (metronomeIntervalRef.current) return;
    
    initAudioContext();
    setMetronomePlaying(true);
    console.log('[CPR Coach] Metronome started');
    
    const bpm = 110;
    const interval = (60 / bpm) * 1000; // milliseconds
    
    metronomeIntervalRef.current = setInterval(() => {
      playBeep();
      setCompressionCount(prev => prev + 1);
    }, interval);
  };

  // Stop metronome
  const stopMetronome = () => {
    if (metronomeIntervalRef.current) {
      clearInterval(metronomeIntervalRef.current);
      metronomeIntervalRef.current = null;
      setMetronomePlaying(false);
      console.log('[CPR Coach] Metronome stopped');
    }
  };

  // Start session timer
  const startSessionTimer = () => {
    if (sessionTimerRef.current) return;
    
    sessionTimerRef.current = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
  };

  // Stop session timer
  const stopSessionTimer = () => {
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMetronome();
      stopSessionTimer();
      stopCamera();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Camera & Pose Detection Functions
  const startCamera = async () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('[CPR Coach] Video or canvas ref not available');
      return;
    }
    
    try {
      console.log('[CPR Coach] Starting camera...');
      console.log('[CPR Coach] Video element:', videoRef.current);
      console.log('[CPR Coach] Canvas element:', canvasRef.current);
      
      // Initialize CPR Analyzer
      cprAnalyzerRef.current = new CPRAnalyzer(
        (isValid, feedback) => {
          setPostureValid(isValid);
          setPostureFeedback(feedback);
          console.log('[CPR Coach] Posture update:', feedback);
        },
        (count, rate) => {
          // Update compression count from pose detection
          if (cameraEnabled && !simulationMode) {
            console.log('[CPR Coach] Compression update:', count, 'Rate:', rate);
            setCompressionCount(count);
          }
        }
      );

      console.log('[CPR Coach] CPR Analyzer initialized');

      // Initialize Pose Detector
      poseDetectorRef.current = new PoseDetector(
        videoRef.current,
        canvasRef.current,
        (results) => {
          if (results.poseLandmarks && cprAnalyzerRef.current) {
            cprAnalyzerRef.current.analyzePose(results.poseLandmarks);
          }
        }
      );

      console.log('[CPR Coach] Pose Detector created, starting...');
      await poseDetectorRef.current.start();
      setCameraActive(true);
      console.log('[CPR Coach] Camera started successfully!');
      setPostureFeedback('Camera active - Position yourself for CPR');
    } catch (error) {
      console.error('[CPR Coach] Camera error:', error);
      console.error('[CPR Coach] Error message:', error.message);
      setCameraActive(false);
      setPostureFeedback('❌ Camera unavailable - using manual mode');
    }
  };

  const stopCamera = () => {
    if (poseDetectorRef.current) {
      poseDetectorRef.current.stop();
      poseDetectorRef.current = null;
    }
    if (cprAnalyzerRef.current) {
      cprAnalyzerRef.current = null;
    }
    setCameraActive(false);
    console.log('[CPR Coach] Camera stopped');
  };

  const toggleCamera = () => {
    if (cameraEnabled) {
      setCameraEnabled(false);
      stopCamera();
    } else {
      setCameraEnabled(true);
      startCamera();
    }
  };

  // Start camera when entering active mode (if enabled)
  useEffect(() => {
    if (step === 'active' && cameraEnabled && !simulationMode) {
      startCamera();
    } else if (step !== 'active') {
      stopCamera();
    }
  }, [step, cameraEnabled, simulationMode]);

  // Step 1: Start CPR
  const handleStartCPR = () => {
    console.log('[CPR Coach] Starting CPR flow');
    setStep('positioning');
  };

  // Step 2: Continue to Active CPR
  const handleContinueToActive = () => {
    console.log('[CPR Coach] Moving to active CPR');
    setStep('active');
    setCompressionCount(0);
    setSessionTime(0);
    startMetronome();
    startSessionTimer();
  };

  // Stop CPR
  const handleStopCPR = () => {
    console.log('[CPR Coach] Stopping CPR');
    stopMetronome();
    stopSessionTimer();
    setStep('stopped');
  };

  // Reset and start over
  const handleReset = () => {
    console.log('[CPR Coach] Resetting CPR');
    stopMetronome();
    stopSessionTimer();
    setStep('start');
    setCompressionCount(0);
    setSessionTime(0);
  };

  // Manual compression tap (fallback mode)
  const handleManualCompression = () => {
    setCompressionCount(prev => prev + 1);
    playBeep();
  };

  // Format time (seconds to MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate compressions per minute
  const compressionRate = sessionTime > 0 ? Math.round((compressionCount / sessionTime) * 60) : 0;

  return (
    <div className="cpr-coach-full">
      {/* Step Indicator */}
      <div className="cpr-step-indicator">
        <div className={`step ${step === 'start' ? 'active' : step !== 'start' ? 'completed' : ''}`}>
          {step !== 'start' ? <Check size={16} /> : '1'}
        </div>
        <div className="step-line"></div>
        <div className={`step ${step === 'positioning' ? 'active' : (step === 'active' || step === 'stopped') ? 'completed' : ''}`}>
          {(step === 'active' || step === 'stopped') ? <Check size={16} /> : '2'}
        </div>
        <div className="step-line"></div>
        <div className={`step ${step === 'active' || step === 'stopped' ? 'active' : ''}`}>
          3
        </div>
      </div>

      {/* STEP 1: START */}
      {step === 'start' && (
        <div className="cpr-step-screen">
          <div className="cpr-content-center">
            <Activity size={80} className="cpr-icon" />
            <h1 className="cpr-title">CPR Coach</h1>
            <p className="cpr-description">
              Step-by-step guidance for performing CPR
            </p>
            
            <div className="cpr-disclaimer">
              <AlertCircle size={20} />
              <p>
                <strong>Emergency Notice:</strong> This tool provides guidance only. 
                Call 911 immediately. Not a substitute for professional medical training.
              </p>
            </div>

            <div className="cpr-simulation-toggle">
              <label>
                <input 
                  type="checkbox" 
                  checked={simulationMode}
                  onChange={(e) => setSimulationMode(e.target.checked)}
                />
                <span>Demo/Simulation Mode (No camera needed)</span>
              </label>
            </div>

            {!simulationMode && (
              <div className="cpr-simulation-toggle" style={{ marginTop: '1rem' }}>
                <label>
                  <input 
                    type="checkbox" 
                    checked={cameraEnabled}
                    onChange={(e) => setCameraEnabled(e.target.checked)}
                  />
                  <span>Enable camera for posture checking</span>
                </label>
              </div>
            )}
          </div>

          <div className="cpr-action-footer">
            <button 
              className="cpr-btn cpr-btn-primary cpr-btn-large"
              onClick={handleStartCPR}
            >
              <Play size={24} /> START CPR
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: POSITIONING */}
      {step === 'positioning' && (
        <div className="cpr-step-screen">
          <div className="cpr-content-center">
            <h2 className="cpr-step-title">Position & Posture</h2>
            
            <div className="cpr-instructions-card">
              <h3>Proper CPR Position:</h3>
              <ol>
                <li>
                  <strong>Kneel beside the person</strong>
                  <p>Position yourself at their side, near their chest</p>
                </li>
                <li>
                  <strong>Place hands correctly</strong>
                  <p>Put one hand on the center of the chest, other hand on top</p>
                </li>
                <li>
                  <strong>Lock your elbows</strong>
                  <p>Keep arms straight, shoulders directly over hands</p>
                </li>
                <li>
                  <strong>Prepare for compressions</strong>
                  <p>Use your body weight, not just arms</p>
                </li>
              </ol>
            </div>

            <div className="cpr-ready-checklist">
              <label className="cpr-checkbox">
                <input type="checkbox" />
                <span>I am positioned correctly</span>
              </label>
              <label className="cpr-checkbox">
                <input type="checkbox" />
                <span>My arms are straight</span>
              </label>
              <label className="cpr-checkbox">
                <input type="checkbox" />
                <span>I am ready to begin</span>
              </label>
            </div>
          </div>

          <div className="cpr-action-footer">
            <button 
              className="cpr-btn cpr-btn-secondary"
              onClick={handleReset}
            >
              Back
            </button>
            <button 
              className="cpr-btn cpr-btn-primary cpr-btn-large"
              onClick={handleContinueToActive}
            >
              CONTINUE TO CPR
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: ACTIVE CPR */}
      {step === 'active' && (
        <div className="cpr-step-screen cpr-active-screen">
          <div className="cpr-active-header">
            <h2>CPR IN PROGRESS</h2>
            <p>Follow the rhythm - Push hard and fast</p>
          </div>

          <div className="cpr-active-content">
            {/* Camera Feed (if enabled) */}
            {cameraEnabled && !simulationMode && (
              <div className="cpr-camera-section">
                <div className="cpr-video-container">
                  <video ref={videoRef} autoPlay playsInline muted style={{ display: 'none' }} />
                  <canvas ref={canvasRef} className="cpr-canvas" />
                  {cameraActive && (
                    <div className="cpr-camera-status">
                      <Camera size={16} />
                      <span>Camera Active</span>
                    </div>
                  )}
                </div>
                
                {/* Posture Feedback */}
                {postureFeedback && (
                  <div className={`cpr-posture-feedback ${postureValid ? 'valid' : 'invalid'}`}>
                    {postureFeedback}
                  </div>
                )}
              </div>
            )}

            {/* Compression Counter */}
            <div className="cpr-counter-display">
              <div className="cpr-counter-label">Compressions</div>
              <div className="cpr-counter-value">{compressionCount}</div>
              <div className="cpr-counter-rate">
                {compressionRate} per minute
                {compressionRate >= 100 && compressionRate <= 120 && (
                  <span className="cpr-rate-good"> ✓ Good pace</span>
                )}
              </div>
            </div>

            {/* Visual Pulse Indicator */}
            <div className="cpr-pulse-container">
              <div className={`cpr-pulse ${metronomePlaying ? 'pulsing' : ''}`}></div>
              <p>Follow the pulse</p>
            </div>

            {/* Session Timer */}
            <div className="cpr-session-info">
              <div className="cpr-info-item">
                <span className="label">Time:</span>
                <span className="value">{formatTime(sessionTime)}</span>
              </div>
              <div className="cpr-info-item">
                <span className="label">Target:</span>
                <span className="value">100-120 CPM</span>
              </div>
            </div>

            {/* Audio Toggle */}
            <button 
              className="cpr-audio-toggle"
              onClick={() => setAudioEnabled(!audioEnabled)}
            >
              {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              <span>{audioEnabled ? 'Sound On' : 'Sound Off'}</span>
            </button>

            {/* Manual Tap (Fallback) */}
            {!metronomePlaying && (
              <button 
                className="cpr-manual-tap"
                onClick={handleManualCompression}
              >
                TAP FOR EACH COMPRESSION
              </button>
            )}
          </div>

          <div className="cpr-action-footer">
            {!simulationMode && (
              <button 
                className="cpr-btn cpr-btn-secondary"
                onClick={toggleCamera}
              >
                {cameraEnabled ? <CameraOff size={20} /> : <Camera size={20} />}
                {cameraEnabled ? 'Disable Camera' : 'Enable Camera'}
              </button>
            )}
            <button 
              className="cpr-btn cpr-btn-stop cpr-btn-large"
              onClick={handleStopCPR}
            >
              <Square size={24} /> STOP CPR
            </button>
          </div>
        </div>
      )}

      {/* STOPPED STATE */}
      {step === 'stopped' && (
        <div className="cpr-step-screen">
          <div className="cpr-content-center">
            <Check size={80} className="cpr-icon cpr-icon-success" />
            <h2 className="cpr-step-title">CPR Session Ended</h2>
            
            <div className="cpr-summary-card">
              <h3>Session Summary</h3>
              <div className="cpr-summary-stats">
                <div className="cpr-stat">
                  <span className="stat-label">Total Compressions</span>
                  <span className="stat-value">{compressionCount}</span>
                </div>
                <div className="cpr-stat">
                  <span className="stat-label">Duration</span>
                  <span className="stat-value">{formatTime(sessionTime)}</span>
                </div>
                <div className="cpr-stat">
                  <span className="stat-label">Average Rate</span>
                  <span className="stat-value">{compressionRate} CPM</span>
                </div>
              </div>
            </div>

            <div className="cpr-next-steps">
              <h4>Next Steps:</h4>
              <ul>
                <li>Check for signs of breathing or movement</li>
                <li>Continue CPR if no response</li>
                <li>Wait for emergency services to arrive</li>
                <li>Be prepared to provide patient information</li>
              </ul>
            </div>
          </div>

          <div className="cpr-action-footer">
            <button 
              className="cpr-btn cpr-btn-secondary cpr-btn-large"
              onClick={handleReset}
            >
              NEW SESSION
            </button>
            <button 
              className="cpr-btn cpr-btn-primary cpr-btn-large"
              onClick={handleContinueToActive}
            >
              <Play size={24} /> RESUME CPR
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CPRCoach;
