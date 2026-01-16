import { useState } from 'react';
import './PainScale.css';

/**
 * Pain Scale Slider (0-10)
 * Interactive pain assessment tool
 */
function PainScale({ value = 0, onChange, showDescription = true }) {
  const [currentValue, setCurrentValue] = useState(value);

  const painDescriptions = {
    0: { label: 'No Pain', emoji: '😊', color: '#10b981' },
    1: { label: 'Very Mild', emoji: '🙂', color: '#34d399' },
    2: { label: 'Mild', emoji: '😐', color: '#6ee7b7' },
    3: { label: 'Uncomfortable', emoji: '😕', color: '#fbbf24' },
    4: { label: 'Moderate', emoji: '😣', color: '#f59e0b' },
    5: { label: 'Distracting', emoji: '😖', color: '#f97316' },
    6: { label: 'Distressing', emoji: '😫', color: '#fb923c' },
    7: { label: 'Intense', emoji: '😩', color: '#ef4444' },
    8: { label: 'Severe', emoji: '😭', color: '#dc2626' },
    9: { label: 'Unbearable', emoji: '😱', color: '#b91c1c' },
    10: { label: 'Emergency', emoji: '🚨', color: '#991b1b' }
  };

  const handleChange = (e) => {
    const newValue = parseInt(e.target.value);
    setCurrentValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const currentPain = painDescriptions[currentValue];

  return (
    <div className="pain-scale">
      <div className="pain-scale-header">
        <label className="pain-scale-label">Pain Level Assessment</label>
        <div 
          className="pain-value-display"
          style={{ backgroundColor: currentPain.color }}
        >
          <span className="pain-emoji">{currentPain.emoji}</span>
          <span className="pain-number">{currentValue}</span>
        </div>
      </div>

      <div className="pain-slider-container">
        <input
          type="range"
          min="0"
          max="10"
          value={currentValue}
          onChange={handleChange}
          className="pain-slider"
          style={{
            background: `linear-gradient(to right, 
              #10b981 0%, 
              #fbbf24 50%, 
              #dc2626 100%)`
          }}
        />
        <div className="pain-scale-labels">
          <span className="scale-label">0<br/>No Pain</span>
          <span className="scale-label">5<br/>Moderate</span>
          <span className="scale-label">10<br/>Worst</span>
        </div>
      </div>

      {showDescription && (
        <div className="pain-description" style={{ borderLeftColor: currentPain.color }}>
          <span className="description-label">{currentPain.label}</span>
          {currentValue >= 7 && (
            <span className="urgent-notice">⚠️ Consider seeking medical attention</span>
          )}
        </div>
      )}
    </div>
  );
}

export default PainScale;
