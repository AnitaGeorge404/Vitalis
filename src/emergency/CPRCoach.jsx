import { useState, useCallback } from 'react'
import CameraFeed from './components/CameraFeed'
import FeedbackPanel from './components/FeedbackPanel'
import RhythmAssist from './components/RhythmAssist'
import SetupGuide from './components/SetupGuide'
import ScreenWakeLock from '../components/ScreenWakeLock'
import HapticFeedback from '../components/HapticFeedback'
import SafetyBanner from '../components/SafetyBanner'
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
      {/* Safety Disclaimer */}
      <SafetyBanner variant="cpr" />

      {/* Screen Wake Lock - prevents sleep */}
      <ScreenWakeLock enabled={isSessionActive} />

      {/* Haptic Feedback - vibrates with rhythm */}
      <HapticFeedback enabled={isSessionActive} bpm={100} />
      
      <div className="cpr-header">
        <h1>🫀 CPR Coach</h1>
        <p className="cpr-subtitle">Real-time CPR guidance with AI-powered pose detection</p>
        <div className="disclaimer-banner">
          ⚠️ This tool provides guidance only - Not a substitute for professional medical training
        </div>
      </div>

      {!isSessionActive ? (
        <SetupGuide onStart={startSession} />
      ) : (
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

            <button className="cpr-reset-button" onClick={resetSession}>
              🔄 End Session
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CPRCoach
