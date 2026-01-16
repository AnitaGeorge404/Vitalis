/**
 * EXAMPLE: Enhanced CPR Coach Integration
 * 
 * This file shows how to integrate value-adding features into the CPR Coach
 * WITHOUT modifying the core CPR logic.
 * 
 * Simply wrap the existing CPRCoach component with these enhancements.
 */

import { useState } from 'react';
import CPRCoach from '../emergency/CPRCoach';

// Import enhancement components
import EmergencyTimer from '../components/EmergencyTimer';
import ScreenWakeLock from '../components/ScreenWakeLock';
import HapticFeedback from '../components/HapticFeedback';
import SafetyBanner from '../components/SafetyBanner';
import EmergencyNotes from '../components/EmergencyNotes';
import OfflineIndicator from '../components/OfflineIndicator';

function EnhancedCPRCoach() {
  const [cprActive, setCprActive] = useState(false);
  const sessionId = useState(() => `cpr_${Date.now()}`)[0];

  return (
    <div className="enhanced-cpr-container">
      {/* Safety disclaimer at top */}
      <SafetyBanner variant="cpr" />
      
      {/* Emergency timer tracks session time */}
      <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
        <EmergencyTimer cprActive={cprActive} />
      </div>

      {/* Keep screen awake during session */}
      <ScreenWakeLock enabled={true} />
      
      {/* Haptic feedback synced with CPR rhythm */}
      <HapticFeedback enabled={cprActive} bpm={100} />
      
      {/* Original CPR Coach (core logic untouched) */}
      <CPRCoach 
        onSessionStart={() => setCprActive(true)}
        onSessionEnd={() => setCprActive(false)}
      />
      
      {/* Emergency notes for additional context */}
      <div style={{ marginTop: '1.5rem' }}>
        <EmergencyNotes sessionId={sessionId} />
      </div>

      {/* Offline indicator (fixed position) */}
      <OfflineIndicator 
        offlineFeatures={[
          'CPR Coach',
          'Pose Detection',
          'Rhythm Metronome',
          'Emergency Timer'
        ]}
      />
    </div>
  );
}

export default EnhancedCPRCoach;
