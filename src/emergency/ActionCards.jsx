import React, { useState, useEffect } from 'react';

const ActionCards = () => {
  // Default emergencies
  const EMERGENCY_CARDS = {
    bleeding: [
      'Stay calm and call for help if bleeding is severe.',
      'Apply firm, direct pressure on the wound with clean cloth or gauze.',
      'Do not remove soaked cloth; add more layers if needed.',
      'Keep the injured limb elevated if possible.',
      'If bleeding does not slow in 10 minutes, seek emergency care.',
    ],
    burns: [
      'Remove the person from the source of heat safely.',
      'Cool the burn with cool (not ice-cold) running water for 20 minutes.',
      'Remove tight items like rings or watches from the area if possible.',
      'Do NOT apply ice, butter, oil, or toothpaste.',
      'Cover with clean, non‑fluffy cloth and seek medical help if large or deep.',
    ],
    unconscious: [
      'Check surroundings for safety before approaching.',
      'Gently tap the person and shout to check responsiveness.',
      'If not responsive and not breathing normally, call emergency services.',
      'Begin chest compressions if trained and safe to do so.',
      'Do not give food or drink to an unconscious person.',
    ],
    choking: [
      'Ask: “Are you choking?”. If they can talk or cough, encourage them to keep coughing.',
      'If unable to speak, cough, or breathe, call emergency services immediately.',
      'Give up to 5 firm back blows between the shoulder blades with the heel of your hand.',
      'If still choking and you are trained, give up to 5 abdominal thrusts.',
      'If they become unresponsive, start CPR and continue until help arrives.',
    ],
    heart_attack: [
      'Call emergency services immediately if chest pain or pressure lasts more than a few minutes.',
      'Keep the person sitting or lying in a comfortable position and reassure them.',
      'Loosen tight clothing and help them stay calm and still.',
      'If they have prescribed heart medication, help them take it as directed.',
      'Be ready to start CPR if they become unresponsive and stop breathing normally.',
    ],
    fracture: [
      'Encourage the person not to move the injured area.',
      'Support the injured limb with a sling or padding on both sides if possible.',
      'Apply a cold pack wrapped in cloth to reduce swelling.',
      'Do not attempt to straighten a deformed limb.',
      'Seek urgent medical care, especially if pain is severe or limb looks deformed.',
    ],
    hypothermia: [
      'Move the person to a warm, dry place if possible.',
      'Remove wet clothing and replace with dry layers or blankets.',
      'Warm the center of the body first: chest, neck, head, and groin.',
      'Give warm, sweet drinks if they are awake and can swallow. Avoid alcohol.',
      'Call emergency services if shivering stops, confusion worsens, or they become very drowsy.',
    ],
    allergic_reaction: [
      'Look for signs like swelling of lips/face, difficulty breathing, or widespread rash.',
      'If they have an epinephrine auto‑injector, help them use it immediately.',
      'Call emergency services if breathing is difficult, voice is hoarse, or swelling is rapid.',
      'Help them sit in a comfortable position and stay with them.',
      'If they become unresponsive, begin CPR and use an AED if available.',
    ],
    asthma_attack: [
      'Help the person sit upright and stay calm. Do not have them lie down.',
      'Encourage slow, deep breaths if possible.',
      'Help them use their reliever inhaler (usually blue) as prescribed.',
      'If breathing does not improve, worsens, or speech becomes difficult, call emergency services.',
      'If they become drowsy, confused, or unresponsive, seek emergency help immediately.',
    ],
  };

  // Extra emergencies for manual typing
  const EXTRA_EMERGENCY_CARDS = {
    fainting: [
      'Lay the person flat on their back.',
      'Elevate legs slightly if possible.',
      'Loosen tight clothing around the neck and waist.',
      'Check breathing and responsiveness.',
      'Call emergency services if they do not regain consciousness quickly.',
    ],
    seizure: [
      'Clear the area around the person to prevent injury.',
      'Do not restrain their movements.',
      'Place something soft under their head.',
      'Time the seizure and monitor breathing.',
      'Call emergency services if seizure lasts more than 5 minutes or repeats.',
    ],
    panic_attack: [
      'Help the person sit in a comfortable position.',
      'Encourage slow, deep breathing.',
      'Remain calm and speak reassuringly.',
      'Remove them from stressful stimuli if possible.',
      'Seek professional help if symptoms worsen or do not improve.',
    ],
  };

  // States
  const [selectedEmergency, setSelectedEmergency] = useState('bleeding'); // dropdown value
  const [loadedEmergency, setLoadedEmergency] = useState('bleeding'); // steps displayed
  const [manualInput, setManualInput] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);
  const [lockState, setLockState] = useState({ locked: false, currentStep: 0 });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [stepSpeakCounts, setStepSpeakCounts] = useState({});
  const [voice, setVoice] = useState(null);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 640 : false);

  // Steps
  const steps = loadedEmergency
    ? EMERGENCY_CARDS[loadedEmergency] || EXTRA_EMERGENCY_CARDS[loadedEmergency] || []
    : [];

  // Responsive
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Voice loading
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const synth = window.speechSynthesis;
    const pickVoice = () => {
      const voices = synth.getVoices();
      if (!voices || !voices.length) return;
      const preferred = voices.find(
        (v) =>
          /female/i.test(v.name) ||
          /woman/i.test(v.name) ||
          /Google UK English Female/i.test(v.name) ||
          /Google US English/i.test(v.name)
      );
      setVoice(preferred || voices[0]);
    };
    pickVoice();
    if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = pickVoice;
  }, []);

  const speak = (text) => {
    if (typeof window === 'undefined') return;
    const synth = window.speechSynthesis;
    if (!synth || !text) return;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.6;
    utterance.pitch = 0.85;
    utterance.volume = 0.9;
    if (voice) utterance.voice = voice;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    synth.speak(utterance);
  };

  // Auto speak step
  useEffect(() => {
    const idx = lockState.currentStep;
    const text = steps[idx];
    if (!text || !lockState.locked) return;
    const key = `${loadedEmergency}-${idx}`;
    const currentCount = stepSpeakCounts[key] || 0;
    if (currentCount >= 2) return;
    speak(text);
    setStepSpeakCounts((prev) => ({ ...prev, [key]: currentCount + 1 }));
  }, [lockState.currentStep, lockState.locked, steps, loadedEmergency, stepSpeakCounts]);

  const advanceStep = () => setLockState((prev) => ({ ...prev, currentStep: Math.min(prev.currentStep + 1, steps.length - 1) }));
  const resetSteps = () => {
    setLockState({ locked: false, currentStep: 0 });
    setIsSpeaking(false);
    setStepSpeakCounts({});
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
  };

  // Styles
  const container = { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: isMobile ? '10px' : '20px', background: '#f3f4f6', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif', color: '#065f46' };
  const shell = { width: '100%', maxWidth: isMobile ? '100%' : 760, margin: '0 auto' };
  const sectionCard = { borderRadius: isMobile ? 12 : 16, padding: isMobile ? 16 : 24, background: '#ffffff', border: '2px solid #e5e7eb', boxShadow: '0 4px 16px rgba(15,118,110,0.08)' };
  const topRow = { display: 'flex', flexWrap: 'wrap', gap: isMobile ? 12 : 16, marginBottom: isMobile ? 12 : 16, alignItems: 'flex-start', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row' };
  const headingBlock = { borderBottom: '2px solid #bbf7d0', paddingBottom: 10, marginBottom: 8 };
  const heading = { fontSize: isMobile ? 20 : 24, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#064e3b' };
  const subText = { fontSize: isMobile ? 14 : 15, color: '#6b7280', maxWidth: isMobile ? '100%' : 560, lineHeight: 1.6 };
  const selectLabel = { fontSize: 13, color: '#6b7280', marginBottom: 6, fontWeight: 600 };
  const select = { fontSize: isMobile ? 15 : 16, padding: isMobile ? '10px 14px' : '12px 16px', borderRadius: 10, background: '#ecfdf5', color: '#065f46', border: '2px solid #a7f3d0', cursor: 'pointer', minWidth: isMobile ? 0 : 200, width: isMobile ? '100%' : 'auto', fontWeight: 600 };
  const stepsWrapper = { marginTop: isMobile ? 14 : 20, background: '#f9fafb', borderRadius: 16, padding: isMobile ? 16 : 20, border: '2px solid #e5e7eb' };
  const stepRow = (isCurrent, isDisabled) => ({ display: 'flex', alignItems: 'flex-start', gap: 12, padding: isMobile ? '10px 12px' : '14px 16px', borderRadius: 12, marginBottom: 10, background: isCurrent ? '#ecfdf5' : 'transparent', border: isCurrent ? '2px solid #6ee7b7' : 'none', opacity: isDisabled ? 0.4 : 1, transition: 'all 0.2s ease' });
  const stepNumber = (isCurrent) => ({ minWidth: isMobile ? 28 : 32, height: isMobile ? 28 : 32, borderRadius: 999, border: '2px solid #9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? 14 : 16, fontWeight: 700, background: isCurrent ? '#22c55e' : '#dcfce7', color: isCurrent ? '#ffffff' : '#065f46' });
  const stepText = { fontSize: isMobile ? 16 : 18, color: '#065f46', lineHeight: 1.7, fontWeight: 500 };
  const buttonsRow = { marginTop: isMobile ? 12 : 16, display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: isMobile ? 14 : 15 };
  const baseButton = { padding: isMobile ? '10px 16px' : '12px 20px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: isMobile ? 14 : 15 };
  const infoBox = { marginTop: isMobile ? 14 : 16, fontSize: isMobile ? 13 : 14, color: '#6b7280', padding: isMobile ? '12px 16px' : '14px 18px', borderRadius: 12, background: '#ecfeff', border: '2px solid #bae6fd', lineHeight: 1.6 };

  return (
    <div style={container}>
      <div style={shell}>
        <div style={sectionCard}>
          <div style={topRow}>
            <div style={{ flex: 1, minWidth: isMobile ? '100%' : 220 }}>
              <div style={headingBlock}>
                <div style={heading}>EMERGENCY ACTION CARDS</div>
              </div>
              <div style={subText}>
                Calm, step‑by‑step guidance for common first‑aid situations.
                Lock the checklist to move in order; each step is read aloud slowly.
              </div>
            </div>

            <div style={{ minWidth: isMobile ? '100%' : 200 }}>
              <div style={selectLabel}>Situation</div>
              <select
                value={
                  loadedEmergency && EMERGENCY_CARDS[loadedEmergency]
                    ? loadedEmergency
                    : isManualMode
                    ? 'manual'
                    : selectedEmergency
                }
                onChange={(e) => {
                  const val = e.target.value;
                  setManualInput('');
                  setLockState({ locked: false, currentStep: 0 });
                  setStepSpeakCounts({});
                  if (val === 'manual') {
                    setIsManualMode(true);
                    setSelectedEmergency('');
                    setLoadedEmergency('');
                  } else {
                    setIsManualMode(false);
                    setSelectedEmergency(val);
                    setLoadedEmergency(val);
                  }
                }}
                style={select}
              >
                <option value="bleeding">Bleeding</option>
                <option value="burns">Burns</option>
                <option value="unconscious">Unconscious</option>
                <option value="choking">Choking</option>
                <option value="heart_attack">Heart attack</option>
                <option value="fracture">Fracture / suspected break</option>
                <option value="hypothermia">Hypothermia</option>
                <option value="allergic_reaction">Allergic reaction</option>
                <option value="asthma_attack">Asthma attack</option>
                <option value="manual">Other / Type manually</option>
              </select>

              {isManualMode && (
                <div style={{ marginTop: 8 }}>
                  <div style={selectLabel}>Type emergency keyword</div>
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="e.g., fainting, seizure"
                    style={{ ...select, width: '100%', background: '#fef3c7', border: '1px solid #fde68a' }}
                  />
                  <button
                    onClick={() => {
                      const key = manualInput.trim().toLowerCase();
                      if (EMERGENCY_CARDS[key] || EXTRA_EMERGENCY_CARDS[key]) {
                        setLoadedEmergency(key);
                        setLockState({ locked: false, currentStep: 0 });
                        setStepSpeakCounts({});
                        setIsManualMode(false);
                        setSelectedEmergency(EMERGENCY_CARDS[key] ? key : 'manual');
                      } else {
                        alert('Emergency not recognized. Try: fainting, seizure, panic_attack, or existing options.');
                      }
                    }}
                    style={{ ...baseButton, marginTop: 6, background: '#f59e0b', color: 'white', border: 'none' }}
                  >
                    Load emergency
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={stepsWrapper}>
            {steps.map((step, idx) => {
              const isCurrent = idx === lockState.currentStep;
              const isDisabled = lockState.locked && !isCurrent && idx > lockState.currentStep;
              return (
                <div key={idx} style={stepRow(isCurrent, isDisabled)}>
                  <div style={stepNumber(isCurrent)}>{idx + 1}</div>
                  <div style={stepText}>{step}</div>
                </div>
              );
            })}
          </div>

          <div style={buttonsRow}>
            <button
              onClick={() => setLockState((prev) => ({ ...prev, locked: !prev.locked }))}
              style={{ ...baseButton, border: '1px solid #22c55e', background: lockState.locked ? '#dcfce7' : '#bbf7d0', color: '#065f46' }}
            >
              {lockState.locked ? 'Unlock checklist' : 'Lock checklist'}
            </button>

            <button
              onClick={advanceStep}
              disabled={!lockState.locked}
              style={{ ...baseButton, border: 'none', background: lockState.locked ? '#22c55e' : '#9ca3af', color: 'white', cursor: lockState.locked ? 'pointer' : 'not-allowed', opacity: lockState.locked ? 1 : 0.6 }}
            >
              Next step
            </button>

            <button onClick={resetSteps} style={{ ...baseButton, border: 'none', background: '#e5e7eb', color: '#374151' }}>
              Reset
            </button>
          </div>

          <div style={infoBox}>
            This guide offers basic first‑aid steps only and does not replace professional training.
            If you are unsure or symptoms are severe, contact your local emergency number immediately.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionCards;