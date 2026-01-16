import FollowUpReminder from '../components/FollowUpReminder'

/**
 * Wound Watch Feature
 * Assess and track wound healing progress with follow-up reminders
 */
function WoundWatch() {
  return (
    <div className="feature-page">
      <div className="feature-header">
        <h1>🩹 Wound Watch</h1>
        <p>Assess and track wound healing progress</p>
      </div>
      
      <div className="feature-content">
        {/* Follow-Up Reminder for Wound Checks */}
        <div style={{ marginBottom: '2rem' }}>
          <FollowUpReminder context="wound" />
        </div>

        <div className="feature-placeholder">
          <h2>Feature Coming Soon</h2>
          <p>This feature will help you:</p>
          <ul>
            <li>Document wound appearance with photos</li>
            <li>Track healing progress over time</li>
            <li>Identify signs of infection</li>
            <li>Get wound care recommendations</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default WoundWatch
