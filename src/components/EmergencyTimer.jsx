import { useState, useEffect } from 'react';
import './EmergencyTimer.css';

/**
 * Emergency Countdown Timer
 * Tracks time since emergency started and time since CPR started
 */
function EmergencyTimer({ cprActive = false, onReset }) {
  const [emergencyStartTime] = useState(() => Date.now());
  const [cprStartTime, setCprStartTime] = useState(null);
  const [emergencyElapsed, setEmergencyElapsed] = useState(0);
  const [cprElapsed, setCprElapsed] = useState(0);

  // Start CPR timer when CPR becomes active
  useEffect(() => {
    if (cprActive && !cprStartTime) {
      setCprStartTime(Date.now());
    }
  }, [cprActive, cprStartTime]);

  // Update timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setEmergencyElapsed(Math.floor((now - emergencyStartTime) / 1000));
      
      if (cprStartTime) {
        setCprElapsed(Math.floor((now - cprStartTime) / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [emergencyStartTime, cprStartTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="emergency-timer">
      <div className="timer-display emergency-time">
        <span className="timer-label">Emergency Time</span>
        <span className="timer-value">{formatTime(emergencyElapsed)}</span>
      </div>
      
      {cprActive && (
        <div className="timer-display cpr-time">
          <span className="timer-label">CPR Time</span>
          <span className="timer-value pulse">{formatTime(cprElapsed)}</span>
        </div>
      )}
    </div>
  );
}

export default EmergencyTimer;
