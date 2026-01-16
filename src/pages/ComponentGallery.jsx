import React, { useState } from 'react';

// Import all enhancement components
import EmergencyTimer from '../components/EmergencyTimer';
import ScreenWakeLock from '../components/ScreenWakeLock';
import HapticFeedback from '../components/HapticFeedback';
import EmergencyCallButton from '../components/EmergencyCallButton';
import EmergencyNotes from '../components/EmergencyNotes';
import SafetyBanner from '../components/SafetyBanner';
import ConfidenceMeter from '../components/ConfidenceMeter';
import PainScale from '../components/PainScale';
import FollowUpReminder from '../components/FollowUpReminder';
import SymptomHistory from '../components/SymptomHistory';
import InfoButton from '../components/InfoButton';
import OfflineIndicator from '../components/OfflineIndicator';

/**
 * Component Gallery
 * Visual showcase of all enhancement components
 * 
 * USE THIS TO:
 * - See all components in action
 * - Test component functionality
 * - Demo features to judges
 * - Copy integration code
 * 
 * TO VIEW: Import this in App.jsx and add route
 */

function ComponentGallery() {
  const [cprActive, setCprActive] = useState(false);
  const [painLevel, setPainLevel] = useState(0);
  const [screenLockEnabled, setScreenLockEnabled] = useState(false);
  const [hapticEnabled, setHapticEnabled] = useState(false);

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '2rem',
      backgroundColor: '#f9fafb' 
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '3rem' }}>
        🎨 Vitalis Component Gallery
      </h1>

      {/* Safety Banners */}
      <Section title="Safety Banners" description="Medical disclaimers for trust">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <SafetyBanner variant="default" />
          <SafetyBanner variant="emergency" />
          <SafetyBanner variant="health" />
          <SafetyBanner variant="cpr" />
        </div>
        <CodeBlock>{`<SafetyBanner variant="emergency" />`}</CodeBlock>
      </Section>

      {/* Emergency Timer */}
      <Section title="Emergency Timer" description="Tracks emergency + CPR duration">
        <div style={{ marginBottom: '1rem' }}>
          <button 
            onClick={() => setCprActive(!cprActive)}
            style={buttonStyle}
          >
            {cprActive ? 'Stop CPR' : 'Start CPR'}
          </button>
        </div>
        <EmergencyTimer cprActive={cprActive} />
        <CodeBlock>{`<EmergencyTimer cprActive={true} />`}</CodeBlock>
      </Section>

      {/* Screen Wake Lock */}
      <Section title="Screen Wake Lock" description="Prevents screen sleep">
        <div style={{ marginBottom: '1rem' }}>
          <button 
            onClick={() => setScreenLockEnabled(!screenLockEnabled)}
            style={buttonStyle}
          >
            {screenLockEnabled ? 'Disable Wake Lock' : 'Enable Wake Lock'}
          </button>
        </div>
        <ScreenWakeLock enabled={screenLockEnabled} />
        <CodeBlock>{`<ScreenWakeLock enabled={true} />`}</CodeBlock>
      </Section>

      {/* Haptic Feedback */}
      <Section title="Haptic Feedback" description="Vibrates with CPR rhythm">
        <div style={{ marginBottom: '1rem' }}>
          <button 
            onClick={() => setHapticEnabled(!hapticEnabled)}
            style={buttonStyle}
          >
            {hapticEnabled ? 'Stop Haptic' : 'Start Haptic'} (if supported)
          </button>
        </div>
        <HapticFeedback enabled={hapticEnabled} bpm={100} />
        <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
          {hapticEnabled ? '📳 Vibrating at 100 BPM' : '⏸️ Haptic feedback disabled'}
        </p>
        <CodeBlock>{`<HapticFeedback enabled={true} bpm={100} />`}</CodeBlock>
      </Section>

      {/* Emergency Call Button */}
      <Section title="Emergency Call Button" description="One-tap 911 with location">
        <EmergencyCallButton emergencyNumber="911" />
        <CodeBlock>{`<EmergencyCallButton emergencyNumber="911" />`}</CodeBlock>
      </Section>

      {/* Emergency Notes */}
      <Section title="Emergency Notes" description="Quick documentation">
        <EmergencyNotes sessionId="gallery_demo" />
        <CodeBlock>{`<EmergencyNotes sessionId="emergency_001" />`}</CodeBlock>
      </Section>

      {/* Confidence Meter */}
      <Section title="Confidence Meter" description="Shows concern level">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <ConfidenceMeter 
            level="low" 
            factors={['Mild symptoms', 'No fever']}
          />
          <ConfidenceMeter 
            level="medium" 
            factors={['Persistent pain', 'Moderate symptoms']}
          />
          <ConfidenceMeter 
            level="high" 
            factors={['Severe pain', 'Multiple symptoms', 'Duration > 24hrs']}
          />
        </div>
        <CodeBlock>{`<ConfidenceMeter level="medium" factors={['Pain: 6/10']} />`}</CodeBlock>
      </Section>

      {/* Pain Scale */}
      <Section title="Pain Scale" description="Interactive 0-10 assessment">
        <PainScale 
          value={painLevel} 
          onChange={setPainLevel}
          showDescription={true}
        />
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          Current pain level: <strong>{painLevel}/10</strong>
        </p>
        <CodeBlock>{`<PainScale value={5} onChange={setValue} />`}</CodeBlock>
      </Section>

      {/* Follow-Up Reminder */}
      <Section title="Follow-Up Reminder" description="Set recheck notifications">
        <FollowUpReminder />
        <CodeBlock>{`<FollowUpReminder />`}</CodeBlock>
      </Section>

      {/* Symptom History */}
      <Section title="Symptom History" description="Timeline of past checks">
        <SymptomHistory 
          currentCheck={null}
          maxItems={5}
        />
        <CodeBlock>{`<SymptomHistory currentCheck={{ symptoms: ['Headache'] }} />`}</CodeBlock>
      </Section>

      {/* Info Button */}
      <Section title="Info Button" description="Educational popovers">
        <InfoButton 
          title="Why Track Pain?"
          content={
            <>
              <p>Pain tracking helps healthcare providers:</p>
              <ul>
                <li>Assess severity</li>
                <li>Monitor treatment effectiveness</li>
                <li>Determine urgency</li>
              </ul>
            </>
          }
        />
        <CodeBlock>{`<InfoButton title="Why?" content={<p>Because...</p>} />`}</CodeBlock>
      </Section>

      {/* Offline Indicator */}
      <Section title="Offline Indicator" description="Network status + offline features">
        <OfflineIndicator 
          offlineFeatures={[
            'CPR Coach',
            'Emergency Timer',
            'Emergency Notes',
            'Burn Help'
          ]}
        />
        <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '1rem' }}>
          💡 Fixed position (bottom-right). Try going offline in DevTools!
        </p>
        <CodeBlock>{`<OfflineIndicator offlineFeatures={['CPR', 'Timer']} />`}</CodeBlock>
      </Section>

      {/* Integration Guide */}
      <Section 
        title="🚀 Ready to Integrate?" 
        description="Copy examples above or check documentation"
      >
        <div style={{ 
          padding: '1.5rem', 
          backgroundColor: '#dbeafe', 
          borderRadius: '8px',
          border: '2px solid #3b82f6'
        }}>
          <h3 style={{ marginTop: 0 }}>Quick Links:</h3>
          <ul style={{ lineHeight: '2' }}>
            <li><strong>QUICK_START.md</strong> - 5-minute integration</li>
            <li><strong>FEATURES_GUIDE.md</strong> - Full documentation</li>
            <li><strong>src/examples/</strong> - Working integration examples</li>
          </ul>
          <p style={{ marginBottom: 0, fontWeight: 600 }}>
            All components are production-ready ✅
          </p>
        </div>
      </Section>
    </div>
  );
}

// Helper Components
function Section({ title, description, children }) {
  return (
    <div style={{ 
      backgroundColor: 'white',
      padding: '2rem',
      marginBottom: '2rem',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ marginTop: 0, color: '#1f2937' }}>{title}</h2>
      <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>{description}</p>
      {children}
    </div>
  );
}

function CodeBlock({ children }) {
  return (
    <pre style={{
      backgroundColor: '#1f2937',
      color: '#10b981',
      padding: '1rem',
      borderRadius: '8px',
      overflow: 'auto',
      fontSize: '0.9rem',
      marginTop: '1rem'
    }}>
      <code>{children}</code>
    </pre>
  );
}

const buttonStyle = {
  padding: '0.75rem 1.5rem',
  backgroundColor: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s'
};

export default ComponentGallery;
