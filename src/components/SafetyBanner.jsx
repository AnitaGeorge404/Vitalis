import './SafetyBanner.css';

/**
 * Persistent Safety Disclaimer
 * Visible but non-intrusive disclaimer
 */
function SafetyBanner({ variant = 'default' }) {
  const banners = {
    default: {
      text: 'This app provides guidance, not medical diagnosis. Call emergency services for urgent situations.'
    },
    emergency: {
      text: 'Emergency guidance only. Always call 911 for life-threatening situations.'
    },
    health: {
      text: 'Health information only. Consult a healthcare professional for medical advice.'
    },
    cpr: {
      text: 'CPR guidance for trained individuals. This does not replace formal CPR certification.'
    }
  };

  const banner = banners[variant] || banners.default;

  return (
    <div className={`safety-banner ${variant}`}>
      <p className="banner-text">{banner.text}</p>
    </div>
  );
}

export default SafetyBanner;
