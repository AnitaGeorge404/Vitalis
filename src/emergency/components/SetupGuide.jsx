import './SetupGuide.css'

function SetupGuide({ onStart }) {
  return (
    <div className="setup-guide">
      <div className="setup-content">
        <h2>🎯 CPR Training Setup</h2>
        
        <button className="start-button" onClick={onStart}>
          ▶ Start CPR Training Session
        </button>

        <div className="setup-columns">
          <div className="setup-column">
            <div className="setup-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Position Your Camera</h3>
                <p>Set up camera to capture side view of your body</p>
                <p className="step-detail">📸 Shoulders, elbows, wrists, and hips must be visible</p>
              </div>
            </div>

            <div className="setup-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Prepare Practice Area</h3>
                <p>Use a firm surface or CPR mannequin</p>
                <p className="step-detail">🛋️ Floor or training mat recommended</p>
              </div>
            </div>
          </div>

          <div className="setup-column">
            <div className="setup-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Proper CPR Position</h3>
                <p>Kneel beside the surface, arms straight</p>
                <p className="step-detail">✋ Place hands center of chest, lock elbows</p>
              </div>
            </div>

            <div className="setup-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Start Training</h3>
                <p>Click above to begin real-time coaching</p>
                <p className="step-detail">🎯 System will analyze your form and timing</p>
              </div>
            </div>
          </div>
        </div>

        <div className="setup-warning">
          <h3>⚠️ Important Safety Notes</h3>
          <ul>
            <li>This is a training tool - not for actual emergencies</li>
            <li>Never practice on a real person</li>
            <li>Use only on CPR mannequins or firm surfaces</li>
            <li>Seek professional CPR certification</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default SetupGuide
