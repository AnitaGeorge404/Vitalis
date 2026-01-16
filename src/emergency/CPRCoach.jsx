import { useState, useCallback, useEffect, useRef } from 'react'
import CameraFeed from './components/CameraFeed'
import FeedbackPanel from './components/FeedbackPanel'
import RhythmAssist from './components/RhythmAssist'
import EmergencyTimer from '../components/EmergencyTimer'
import ScreenWakeLock from '../components/ScreenWakeLock'
import HapticFeedback from '../components/HapticFeedback'
import SafetyBanner from '../components/SafetyBanner'
import EmergencyNotes from '../components/EmergencyNotes'
import './styles/CPRCoach.css'

/**
 * CPR Coach Feature - Step-Based Flow
 * Step 0: Idle (START CPR button)
 * Step 1: Positioning (instructions + optional camera)
 * Step 2: Active CPR (compression counter + rhythm assist)
 * Step 3: Summary (session stats)
 * 
 * Camera is OPTIONAL - CPR works without it
 * Demo/Simulation mode available for testing
 */
function CPRCoach() {
  // Step management (0 = Idle, 1 = Positioning, 2 = Active, 3 = Summary)
  const [step, setStep] = useState(0)
  
  // Demo/Simulation mode
  const [demoMode, setDemoMode] = useState(false)
  
  // Camera state
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  
  // CPR state
  const [postureCorrect, setPostureCorrect] = useState(null)
  const [compressionRate, setCompressionRate] = useState(0)
  const [compressionCount, setCompressionCount] = useState(0)
  const [rhythmFeedback, setRhythmFeedback] = useState('')
  const [postureFeedback, setPostureFeedback] = useState('')
  
  // Session tracking
  const [sessionId] = useState(() => `cpr_${Date.now()}`)
  const [sessionStartTime, setSessionStartTime] = useState(null)
  const [sessionDuration, setSessionDuration] = useState(0)
  
  // Rhythm state
  const [rhythmActive, setRhythmActive] = useState(false)
  const rhythmIntervalRef = useRef(null)

  // Console logging for debugging
  useEffect(() => {
    console.log(`[CPRCoach] Step: ${step}, Demo: ${demoMode}, Camera: ${cameraEnabled}`)
  }, [step, demoMode, cameraEnabled])

  // Simulation mode - generates mock data
  useEffect(() => {
    if (!demoMode || step !== 2) return

    const simulationInterval = setInterval(() => {
      // Mock posture feedback
      const mockPostureCorrect = Math.random() > 0.3
      setPostureCorrect(mockPostureCorrect)
      setPostureFeedback(mockPostureCorrect ? '✓ Good posture (simulated)' : '⚠ Adjust posture (simulated)')
      
      // Mock compression rate
      const mockRate = 100 + Math.floor(Math.random() * 20)
      setCompressionRate(mockRate)
    }, 2000)

    return () => clearInterval(simulationInterval)
  }, [demoMode, step])

  // Session duration tracker
  useEffect(() => {
    if (step !== 2) return

    const interval = setInterval(() => {
      if (sessionStartTime) {
        setSessionDuration(Math.floor((Date.now() - sessionStartTime) / 1000))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [step, sessionStartTime])

  // Callbacks for camera-based detection
  const handlePostureUpdate = useCallback((isCorrect, feedback) => {
    if (!demoMode) {
      setPostureCorrect(isCorrect)
      setPostureFeedback(feedback)
    }
  }, [demoMode])

  const handleCompressionUpdate = useCallback((count, rate) => {
    if (!demoMode) {
      setCompressionCount(count)
      setCompressionRate(rate)
    }
  }, [demoMode])

  const handleRhythmFeedback = useCallback((feedback) => {
    setRhythmFeedback(feedback)
  }, [])

  // Step 0 → Step 1: Start CPR
  const handleStartCPR = () => {
    console.log('[CPRCoach] Starting CPR - Moving to positioning step')
    setStep(1)
  }

  // Step 1 → Step 2: Begin active CPR
  const handleContinue = () => {
    console.log('[CPRCoach] Continuing to active CPR')
    setStep(2)
    setSessionStartTime(Date.now())
    setRhythmActive(true)
    startRhythmCounter()
  }

  // Step 2 → Step 3: Stop CPR
  const handleStopCPR = () => {
    console.log('[CPRCoach] Stopping CPR - Moving to summary')
    setStep(3)
    setRhythmActive(false)
    stopRhythmCounter()
  }

  // Step 3 → Step 0: Exit CPR
  const handleExitCPR = () => {
    console.log('[CPRCoach] Exiting CPR Coach')
    resetSession()
  }

  // Pause/Resume rhythm (optional during active CPR)
  const handlePauseResume = () => {
    if (rhythmActive) {
      stopRhythmCounter()
    } else {
      startRhythmCounter()
    }
    setRhythmActive(!rhythmActive)
  }

  // Reset all state
  const resetSession = () => {
    setStep(0)
    setPostureCorrect(null)
    setCompressionCount(0)
    setCompressionRate(0)
    setRhythmFeedback('')
    setPostureFeedback('')
    setSessionStartTime(null)
    setSessionDuration(0)
    setRhythmActive(false)
    setCameraEnabled(false)
    setCameraError(null)
    stopRhythmCounter()
  }

  // Rhythm counter - increments on each beat (110 BPM)
  const TARGET_BPM = 110
  const BEAT_INTERVAL_MS = (60 / TARGET_BPM) * 1000

  const startRhythmCounter = () => {
    if (rhythmIntervalRef.current) return

    rhythmIntervalRef.current = setInterval(() => {
      setCompressionCount(prev => prev + 1)
      console.log('[CPRCoach] Rhythm beat - compression count incremented')
    }, BEAT_INTERVAL_MS)
  }

  const stopRhythmCounter = () => {
    if (rhythmIntervalRef.current) {
      clearInterval(rhythmIntervalRef.current)
      rhythmIntervalRef.current = null
    }
  }

  // Toggle demo mode
  const toggleDemoMode = () => {
    setDemoMode(!demoMode)
    console.log('[CPRCoach] Demo mode toggled:', !demoMode)
  }

  // Toggle camera
  const toggleCamera = () => {
    setCameraEnabled(!cameraEnabled)
    console.log('[CPRCoach] Camera toggled:', !cameraEnabled)
  }

  // Format duration as MM:SS
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }


  return (
    <div className="cpr-coach-container">
      {/* Safety Banner */}
      <SafetyBanner variant="cpr" />

      {/* Screen Wake Lock - prevents sleep during active CPR */}
      <ScreenWakeLock enabled={step === 2} />

      {/* Haptic Feedback - vibrates with rhythm during active CPR */}
      <HapticFeedback enabled={step === 2 && rhythmActive} bpm={TARGET_BPM} />

      {/* Header with progress indicator */}
      <div className="cpr-header">
        <h1>🫀 CPR Coach</h1>
        <div className="cpr-progress">
          <span className="progress-text">
            {step === 0 && 'Ready to start'}
            {step === 1 && 'Step 1 / 4: Positioning'}
            {step === 2 && 'Step 2 / 4: Active CPR'}
            {step === 3 && 'Step 3 / 4: Summary'}
          </span>
        </div>
      </div>

      {/* STEP 0: IDLE - Start CPR Button */}
      {step === 0 && (
        <div className="cpr-step-content">
          <div className="cpr-idle-screen">
            <div className="idle-icon">🫀</div>
            <h2>CPR Coach</h2>
            <p className="idle-subtitle">Real-time guidance for CPR training</p>
            
            <div className="disclaimer-box">
              <h3>⚠️ Important Safety Notes</h3>
              <ul>
                <li>This is a training tool - not for actual emergencies</li>
                <li>Never practice on a real person</li>
                <li>Use only on CPR mannequins or firm surfaces</li>
                <li>Seek professional CPR certification</li>
              </ul>
            </div>

            {/* Demo Mode Toggle */}
            <div className="demo-toggle">
              <label>
                <input 
                  type="checkbox" 
                  checked={demoMode} 
                  onChange={toggleDemoMode}
                />
                <span>Demo / Simulation Mode</span>
              </label>
              <p className="demo-hint">Enable this to test without a camera</p>
            </div>

            <button className="cpr-primary-button" onClick={handleStartCPR}>
              START CPR
            </button>
          </div>
        </div>
      )}

      {/* STEP 1: POSITIONING - Instructions & Optional Camera */}
      {step === 1 && (
        <div className="cpr-step-content">
          <div className="positioning-screen">
            <h2>Step 1: Positioning</h2>
            
            <div className="positioning-instructions">
              <div className="instruction-card">
                <div className="instruction-icon">✋</div>
                <h3>Hand Placement</h3>
                <p>Place hands at center of chest</p>
              </div>
              
              <div className="instruction-card">
                <div className="instruction-icon">💪</div>
                <h3>Arm Position</h3>
                <p>Keep arms straight, lock elbows</p>
              </div>
              
              <div className="instruction-card">
                <div className="instruction-icon">📐</div>
                <h3>Body Alignment</h3>
                <p>Shoulders directly over hands</p>
              </div>
            </div>

            {/* Camera Toggle */}
            {!demoMode && (
              <div className="camera-toggle">
                <button 
                  className="secondary-button" 
                  onClick={toggleCamera}
                >
                  {cameraEnabled ? '📷 Camera On' : '📷 Enable Camera (Optional)'}
                </button>
                <p className="camera-hint">Camera helps check your posture, but CPR works without it</p>
              </div>
            )}

            {/* Optional Camera Preview */}
            {cameraEnabled && !demoMode && (
              <div className="camera-preview">
                <CameraFeed
                  onPostureUpdate={handlePostureUpdate}
                  onCompressionUpdate={handleCompressionUpdate}
                  isActive={true}
                />
                {cameraError && <p className="error-text">{cameraError}</p>}
              </div>
            )}

            <button className="cpr-primary-button" onClick={handleContinue}>
              CONTINUE
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: ACTIVE CPR - Compression Counter & Rhythm */}
      {step === 2 && (
        <div className="cpr-step-content cpr-active-screen">
          {/* Large Compression Counter */}
          <div className="compression-counter-section">
            <div className="counter-label">Compressions</div>
            <div className="counter-value">{compressionCount}</div>
            <div className="counter-duration">{formatDuration(sessionDuration)}</div>
          </div>

          {/* Visual Pulse Indicator */}
          <div className={`visual-pulse ${rhythmActive ? 'pulsing' : ''}`}>
            <div className="pulse-ring"></div>
            <div className="pulse-text">{rhythmActive ? '♪' : '○'}</div>
          </div>

          {/* Feedback Panel (if camera enabled) */}
          {cameraEnabled && !demoMode && (
            <div className="active-feedback">
              <FeedbackPanel
                postureCorrect={postureCorrect}
                postureFeedback={postureFeedback}
                rhythmFeedback={rhythmFeedback}
                compressionCount={compressionCount}
                compressionRate={compressionRate}
              />
            </div>
          )}

          {/* Demo Mode Indicator */}
          {demoMode && (
            <div className="demo-indicator">
              <p>🎭 Demo Mode Active</p>
              <p className="demo-stats">
                Rate: {compressionRate} BPM | Posture: {postureCorrect ? '✓ Good' : '⚠ Adjust'}
              </p>
            </div>
          )}

          {/* Rhythm Info */}
          <div className="rhythm-info">
            <p>🎵 Target: {TARGET_BPM} BPM</p>
            <p>💡 Compress on each beat</p>
          </div>

          {/* Action Buttons - STICKY BOTTOM */}
          <div className="cpr-action-buttons">
            <button 
              className="secondary-button" 
              onClick={handlePauseResume}
            >
              {rhythmActive ? '⏸ PAUSE' : '▶ RESUME'}
            </button>
            <button 
              className="cpr-primary-button stop-button" 
              onClick={handleStopCPR}
            >
              ⏹ STOP CPR
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SUMMARY - Session Stats */}
      {step === 3 && (
        <div className="cpr-step-content">
          <div className="summary-screen">
            <div className="summary-icon">✅</div>
            <h2>Session Complete</h2>
            
            <div className="summary-stats">
              <div className="stat-card">
                <div className="stat-value">{compressionCount}</div>
                <div className="stat-label">Total Compressions</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">{formatDuration(sessionDuration)}</div>
                <div className="stat-label">Duration</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">
                  {sessionDuration > 0 ? Math.round((compressionCount / sessionDuration) * 60) : 0}
                </div>
                <div className="stat-label">Average BPM</div>
              </div>
            </div>

            <div className="summary-message">
              <p>
                {compressionCount > 0 
                  ? '🎯 Great job! Keep practicing to improve your CPR skills.' 
                  : '💡 Next time, try doing some compressions!'}
              </p>
            </div>

            {/* Emergency Notes for documentation */}
            <div className="summary-notes">
              <EmergencyNotes sessionId={sessionId} />
            </div>

            <button className="cpr-primary-button" onClick={handleExitCPR}>
              EXIT CPR
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CPRCoach
