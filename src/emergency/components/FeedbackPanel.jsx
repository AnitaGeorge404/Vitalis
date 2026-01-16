import './FeedbackPanel.css'

function FeedbackPanel({ 
  postureCorrect, 
  postureFeedback, 
  rhythmFeedback, 
  compressionCount, 
  compressionRate 
}) {
  return (
    <div className="feedback-panel">
      <h2>📊 Real-Time Feedback</h2>

      <div className={`feedback-card posture-card ${
        postureCorrect === null ? 'neutral' :
        postureCorrect ? 'correct' : 'incorrect'
      }`}>
        <div className="feedback-icon">
          {postureCorrect === null ? '⏳' :
           postureCorrect ? '✅' : '❌'}
        </div>
        <div className="feedback-content">
          <h3>Posture Status</h3>
          <p className="feedback-text">
            {postureFeedback || 'Initializing...'}
          </p>
        </div>
      </div>

      <div className="feedback-card stats-card">
        <div className="stat-item">
          <div className="stat-value">{compressionCount}</div>
          <div className="stat-label">Total Compressions</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{compressionRate}</div>
          <div className="stat-label">Current Rate (BPM)</div>
        </div>
      </div>

      {postureCorrect && rhythmFeedback && (
        <div className={`feedback-card rhythm-card ${
          rhythmFeedback.includes('Good') ? 'correct' :
          rhythmFeedback.includes('faster') ? 'warning-fast' : 'warning-slow'
        }`}>
          <div className="feedback-icon">
            {rhythmFeedback.includes('Good') ? '🎯' : '⚡'}
          </div>
          <div className="feedback-content">
            <h3>Rhythm Guidance</h3>
            <p className="feedback-text">{rhythmFeedback}</p>
          </div>
        </div>
      )}

      {!postureCorrect && postureCorrect !== null && (
        <div className="priority-message">
          ⚠️ Fix posture before focusing on rhythm
        </div>
      )}
    </div>
  )
}

export default FeedbackPanel
