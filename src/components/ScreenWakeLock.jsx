import { useEffect, useState } from 'react';
import './ScreenWakeLock.css';

/**
 * Screen Stay Awake
 * Prevents screen from sleeping during emergency using Wake Lock API
 */
function ScreenWakeLock({ enabled = true }) {
  const [wakeLock, setWakeLock] = useState(null);
  const [supported, setSupported] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if Wake Lock API is supported
    if ('wakeLock' in navigator) {
      setSupported(true);
    }
  }, []);

  useEffect(() => {
    if (!enabled || !supported) {
      // Release wake lock if disabled
      if (wakeLock) {
        wakeLock.release();
        setWakeLock(null);
      }
      return;
    }

    const requestWakeLock = async () => {
      try {
        const lock = await navigator.wakeLock.request('screen');
        setWakeLock(lock);
        setError(null);

        // Handle wake lock release (e.g., when tab becomes hidden)
        lock.addEventListener('release', () => {
          console.log('Wake Lock released');
        });
      } catch (err) {
        console.error('Wake Lock error:', err);
        setError('Unable to prevent screen sleep');
      }
    };

    requestWakeLock();

    // Re-request wake lock when page becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (wakeLock) {
        wakeLock.release();
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, supported, wakeLock]);

  if (!enabled) return null;

  return (
    <div className="wake-lock-indicator">
      {supported && wakeLock && (
        <div className="wake-lock-active">
          <span className="wake-lock-icon">🔒</span>
          <span>Screen locked awake</span>
        </div>
      )}
      {!supported && (
        <div className="wake-lock-unsupported">
          <span>⚠️ Auto-sleep prevention not supported</span>
        </div>
      )}
      {error && (
        <div className="wake-lock-error">
          <span>⚠️ {error}</span>
        </div>
      )}
    </div>
  );
}

export default ScreenWakeLock;
