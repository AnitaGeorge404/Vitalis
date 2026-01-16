import { Phone } from 'lucide-react';
import './EmergencyCallButton.css';

/**
 * One-Tap Emergency Call Button
 * Calls emergency number immediately
 */
function EmergencyCallButton({ emergencyNumber = '911' }) {
  const handleEmergencyCall = () => {
    window.location.href = `tel:${emergencyNumber}`;
  };

  return (
    <div className="emergency-call-section">
      <button 
        className="emergency-call-button"
        onClick={handleEmergencyCall}
        aria-label={`Call ${emergencyNumber}`}
      >
        <Phone className="call-icon" />
        <div className="call-text">
          <span className="call-label">CALL EMERGENCY</span>
          <span className="call-number">{emergencyNumber}</span>
        </div>
      </button>
    </div>
  );
}

export default EmergencyCallButton;
