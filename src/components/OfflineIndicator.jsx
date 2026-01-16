import { useState, useEffect } from 'react';
import './OfflineIndicator.css';

/**
 * Offline Status Indicator
 * Shows which features work offline
 */
function OfflineIndicator({ offlineFeatures = [] }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="offline-indicator">
      <div 
        className={`network-status ${isOnline ? 'online' : 'offline'}`}
        onClick={() => setShowDetails(!showDetails)}
      >
        <span className="status-icon">{isOnline ? '🟢' : '🔴'}</span>
        <span className="status-text">
          {isOnline ? 'Online' : 'Offline Mode'}
        </span>
        {!isOnline && offlineFeatures.length > 0 && (
          <span className="expand-icon">{showDetails ? '▼' : '▶'}</span>
        )}
      </div>

      {!isOnline && showDetails && offlineFeatures.length > 0 && (
        <div className="offline-features">
          <p className="offline-title">Available Offline:</p>
          <ul className="offline-list">
            {offlineFeatures.map((feature, index) => (
              <li key={index}>
                <span className="check-icon">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default OfflineIndicator;
