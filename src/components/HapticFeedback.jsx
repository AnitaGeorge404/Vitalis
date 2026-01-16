import { useEffect } from 'react';

/**
 * Haptic Feedback for CPR Rhythm
 * Provides vibration synced with CPR metronome beat
 */
function HapticFeedback({ enabled = false, bpm = 100 }) {
  useEffect(() => {
    if (!enabled) return;

    // Check if Vibration API is supported
    if (!('vibrate' in navigator)) {
      console.log('Vibration API not supported');
      return;
    }

    const interval = 60000 / bpm; // Convert BPM to milliseconds
    
    const vibrate = () => {
      // Short pulse (50ms) for rhythm feedback
      navigator.vibrate(50);
    };

    // Start vibration on beat
    const intervalId = setInterval(vibrate, interval);

    // Initial vibration
    vibrate();

    return () => {
      clearInterval(intervalId);
      // Stop any ongoing vibration
      navigator.vibrate(0);
    };
  }, [enabled, bpm]);

  // This component doesn't render anything
  return null;
}

export default HapticFeedback;
