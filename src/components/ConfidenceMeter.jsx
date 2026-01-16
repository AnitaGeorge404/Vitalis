import './ConfidenceMeter.css';

/**
 * Confidence Meter
 * Shows concern level as Low/Medium/High (rule-based, non-diagnostic)
 */
function ConfidenceMeter({ level = 'medium', factors = [] }) {
  const levels = {
    low: {
      color: '#10b981',
      label: 'Low Concern',
      icon: '✓',
      description: 'Situation appears manageable'
    },
    medium: {
      color: '#f59e0b',
      label: 'Medium Concern',
      icon: '⚠',
      description: 'Monitor closely and consider medical advice'
    },
    high: {
      color: '#dc2626',
      label: 'High Concern',
      icon: '🚨',
      description: 'Seek immediate medical attention'
    }
  };

  const currentLevel = levels[level.toLowerCase()] || levels.medium;
  const percentage = level === 'low' ? 33 : level === 'medium' ? 66 : 100;

  return (
    <div className="confidence-meter">
      <div className="meter-header">
        <span className="meter-label">Assessment Level</span>
        <span 
          className={`meter-badge ${level}`}
          style={{ backgroundColor: currentLevel.color }}
        >
          {currentLevel.icon} {currentLevel.label}
        </span>
      </div>

      <div className="meter-bar-container">
        <div 
          className={`meter-bar ${level}`}
          style={{ 
            width: `${percentage}%`,
            backgroundColor: currentLevel.color 
          }}
        />
      </div>

      <p className="meter-description">{currentLevel.description}</p>

      {factors && factors.length > 0 && (
        <div className="meter-factors">
          <p className="factors-label">Based on:</p>
          <ul className="factors-list">
            {factors.map((factor, index) => (
              <li key={index}>{factor}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="meter-disclaimer">
        <small>This is guidance only, not a medical diagnosis</small>
      </div>
    </div>
  );
}

export default ConfidenceMeter;
