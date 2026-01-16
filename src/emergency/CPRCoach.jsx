import { useState, useCallback } from 'react'
import CameraFeed from './components/CameraFeed'
import FeedbackPanel from './components/FeedbackPanel'
import RhythmAssist from './components/RhythmAssist'
import ScreenWakeLock from '../components/ScreenWakeLock'
import HapticFeedback from '../components/HapticFeedback'
import './styles/CPRCoach.css'

/**
 * CPR Coach Feature
 * Real-time CPR guidance with pose detection and rhythm assistance
 */
function CPRCoach() {
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [postureCorrect, setPostureCorrect] = useState(null)
  const [compressionRate, setCompressionRate] = useState(0)
  const [compressionCount, setCompressionCount] = useState(0)
  const [rhythmFeedback, setRhythmFeedback] = useState('')
  const [postureFeedback, setPostureFeedback] = useState('')

  const handlePostureUpdate = useCallback((isCorrect, feedback) => {
    setPostureCorrect(isCorrect)
    setPostureFeedback(feedback)
  }, [])

  const handleCompressionUpdate = useCallback((count, rate) => {
    setCompressionCount(count)
    setCompressionRate(rate)
  }, [])

  const handleRhythmFeedback = useCallback((feedback) => {
    setRhythmFeedback(feedback)
  }, [])

  const startSession = () => {
    setIsSessionActive(true)
    setCompressionCount(0)
    setCompressionRate(0)
  }

  const resetSession = () => {
    setIsSessionActive(false)
    setPostureCorrect(null)
    setCompressionCount(0)
    setCompressionRate(0)
    setRhythmFeedback('')
    setPostureFeedback('')
  }


  return (
    <div className="cpr-coach-container">
      {/* Screen Wake Lock - prevents sleep */}
      <ScreenWakeLock enabled={isSessionActive} />

      {/* Haptic Feedback - vibrates with rhythm */}
      <HapticFeedback enabled={isSessionActive} bpm={100} />
      
      {/* Header with Quick Start */}
      <div className="cpr-header">
        <div className="header-content">
          <div className="header-left">
            <h1>🫀 CPR Coach - Emergency Training</h1>
            <p className="cpr-subtitle">Real-time guidance with AI pose detection</p>
          </div>
          <div className="header-actions">
            {!isSessionActive ? (
              <button className="quick-start-button" onClick={startSession}>
                ▶ Start Training Now
              </button>
            ) : (
              <button className="cpr-stop-button" onClick={resetSession}>
                ⏹ Stop Session
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Training Area - Always Visible */}
      <div className="cpr-main-content">
        <div className="cpr-camera-section">
          <CameraFeed
            onPostureUpdate={handlePostureUpdate}
            onCompressionUpdate={handleCompressionUpdate}
            isActive={isSessionActive}
          />
        </div>

        <div className="cpr-control-panel">
          <FeedbackPanel
            postureCorrect={postureCorrect}
            postureFeedback={postureFeedback}
            rhythmFeedback={rhythmFeedback}
            compressionCount={compressionCount}
            compressionRate={compressionRate}
          />

          <RhythmAssist
            postureCorrect={postureCorrect}
            compressionRate={compressionRate}
            onRhythmFeedback={handleRhythmFeedback}
            isActive={isSessionActive}
          />
        </div>
      </div>

      {/* Instructions & Guidelines - Bottom Section */}
      <div className="cpr-instructions-section">
        <div className="instructions-header">
          <h2>📋 CPR Training Guide</h2>
          <p>Follow these steps for effective CPR practice</p>
        </div>

        <div className="instructions-grid">
          <div className="instruction-card">
            <div className="instruction-number">1</div>
            <h3>� Position Yourself</h3>
            <p>Position yourself side-on with shoulders, elbows, wrists, and hips visible</p>
          </div>

          <div className="instruction-card">
            <div className="instruction-number">2</div>
            <h3>🛋️ Prepare Surface</h3>
            <p>Use firm surface or CPR mannequin - never practice on real person</p>
          </div>

          <div className="instruction-card">
            <div className="instruction-number">3</div>
            <h3>✋ Proper Position</h3>
            <p>Kneel beside surface, lock elbows, hands center of chest</p>
          </div>

          <div className="instruction-card">
            <div className="instruction-number">4</div>
            <h3>🎯 Start Training</h3>
            <p>Click "Start Training" above and follow real-time feedback</p>
          </div>
        </div>

        <div className="safety-guidelines">
          <h3>⚠️ Critical Safety Information</h3>
          <div className="guidelines-grid">
            <div className="guideline-item">
              <span className="guideline-icon">🚫</span>
              <p><strong>Training Only:</strong> This is practice tool, not for real emergencies</p>
            </div>
            <div className="guideline-item">
              <span className="guideline-icon">�</span>
              <p><strong>Never on People:</strong> Only use on mannequins or firm surfaces</p>
            </div>
            <div className="guideline-item">
              <span className="guideline-icon">📚</span>
              <p><strong>Get Certified:</strong> Seek professional CPR certification training</p>
            </div>
            <div className="guideline-item">
              <span className="guideline-icon">📞</span>
              <p><strong>Call 911 First:</strong> In real emergency, always call emergency services</p>
            </div>
          </div>
        </div>

        <div className="technique-tips">
          <h3>💡 CPR Technique Tips</h3>
          <ul>
            <li>✓ Compress at least 2 inches (5cm) deep on adults</li>
            <li>✓ Allow full chest recoil between compressions</li>
            <li>✓ Keep elbows locked and arms straight</li>
            <li>✓ Use your body weight, not arm strength</li>
            <li>✓ Maintain 100-120 compressions per minute</li>
            <li>✓ Minimize interruptions in compressions</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default CPRCoach
