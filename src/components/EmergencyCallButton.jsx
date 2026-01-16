import { useState, useEffect } from 'react';
import './EmergencyCallButton.css';

/**
 * One-Tap Emergency Call Button
 * Calls emergency number with location if available
 */
function EmergencyCallButton({ emergencyNumber = '911' }) {
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [showShareDialog, setShowShareDialog] = useState(false);

  useEffect(() => {
    // Get user location if available
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location error:', error.message);
          setLocationError('Location unavailable');
        }
      );
    }
  }, []);

  const handleEmergencyCall = () => {
    // Try to initiate call
    window.location.href = `tel:${emergencyNumber}`;
  };

  const handleShareLocation = async () => {
    if (!navigator.share) {
      setShowShareDialog(true);
      return;
    }

    const locationText = location 
      ? `My location: https://maps.google.com/?q=${location.lat},${location.lng}`
      : 'Emergency - location unavailable';

    try {
      await navigator.share({
        title: 'Emergency Alert',
        text: `🚨 EMERGENCY 🚨\n\n${locationText}\n\nI need help!`,
      });
    } catch (err) {
      console.log('Share failed:', err);
    }
  };

  return (
    <div className="emergency-call-section">
      <button 
        className="emergency-call-button"
        onClick={handleEmergencyCall}
        aria-label={`Call ${emergencyNumber}`}
      >
        <span className="call-icon">📞</span>
        <div className="call-text">
          <span className="call-label">CALL EMERGENCY</span>
          <span className="call-number">{emergencyNumber}</span>
        </div>
      </button>

      <button 
        className="share-location-button"
        onClick={handleShareLocation}
        aria-label="Share your location"
      >
        <span className="location-icon">📍</span>
        <span>Share Location</span>
        {location && <span className="location-ready">✓</span>}
      </button>

      {showShareDialog && location && (
        <div className="location-share-dialog">
          <p>Copy this location link:</p>
          <input 
            type="text" 
            readOnly 
            value={`https://maps.google.com/?q=${location.lat},${location.lng}`}
            onClick={(e) => e.target.select()}
          />
          <button onClick={() => setShowShareDialog(false)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default EmergencyCallButton;
