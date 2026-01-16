import { useState } from 'react';
import './InfoButton.css';

/**
 * "Why This Matters" Info Button
 * Explains reasoning briefly with static educational content
 */
function InfoButton({ title, content }) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="info-button-container">
      <button 
        className="info-button"
        onClick={() => setShowInfo(!showInfo)}
        aria-label="More information"
      >
        <span className="info-icon">ℹ️</span>
        Why This Matters
      </button>

      {showInfo && (
        <div className="info-panel">
          <div className="info-header">
            <h4>{title}</h4>
            <button 
              className="close-info"
              onClick={() => setShowInfo(false)}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="info-content">
            {typeof content === 'string' ? <p>{content}</p> : content}
          </div>
        </div>
      )}
    </div>
  );
}

export default InfoButton;
