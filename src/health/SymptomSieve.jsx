import React, { useState } from "react";

// --- Configuration ---
const SYMPTOMS = [
  { id: "chest_pain", label: "Chest Pain", weight: 10, critical: true },
  { id: "breath", label: "Shortness of Breath", weight: 10, critical: true },
  { id: "fever", label: "High Fever", weight: 3, critical: false },
  { id: "fatigue", label: "Extreme Fatigue", weight: 3, critical: false },
  { id: "headache", label: "Severe Headache", weight: 2, critical: false },
  { id: "cough", label: "Persistent Cough", weight: 2, critical: false },
];

const DURATION_OPTIONS = [
  { label: "Less than 24 hours", value: "new", weight: 1 },
  { label: "1 - 7 days", value: "recent", weight: 1.2 },
  { label: "1 - 3 weeks", value: "prolonged", weight: 1.5 },
  { label: "More than 3 weeks", value: "chronic", weight: 2.5 },
];

const STYLES = {
  card: { maxWidth: "500px", margin: "40px auto", padding: "30px", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", fontFamily: "sans-serif", backgroundColor: "#fff", color: "#1e293b" },
  button: { padding: "12px 24px", borderRadius: "8px", border: "none", backgroundColor: "#2563eb", color: "white", fontWeight: "600", cursor: "pointer", width: "100%", marginTop: "10px" },
  secondaryBtn: { padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "transparent", color: "#64748b", cursor: "pointer", width: "100%", marginTop: "10px", fontSize: "14px" },
  disclaimerBox: { marginTop: "30px", padding: "15px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px", color: "#64748b", lineHeight: "1.4" }
};

export default function SymptomSieve() {
  const [step, setStep] = useState(1); 
  const [age, setAge] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [durations, setDurations] = useState({});
  const [showNotListed, setShowNotListed] = useState(false);

  const selectedSymptoms = SYMPTOMS.filter(s => selectedIds.includes(s.id));
  const hasCritical = selectedSymptoms.some(s => s.critical);
  const isAgeValid = age !== "" && parseInt(age) >= 0 && parseInt(age) <= 150;

  const handleSymptomNext = () => {
    if (hasCritical) setStep(4);
    else setStep(3);
  };

  const evaluateTriage = () => {
    if (hasCritical) return { 
      level: "Urgent", color: "#dc2626", 
      actions: ["Call 911/Emergency services immediately.", "Do not drive yourself.", "Have your list of medications ready."] 
    };

    let totalScore = 0;
    let isChronic = false;

    selectedSymptoms.forEach(s => {
      const dKey = durations[s.id] || "new";
      if (dKey === "chronic") isChronic = true;
      const dWeight = DURATION_OPTIONS.find(d => d.value === dKey).weight;
      totalScore += (s.weight * dWeight);
    });

    const isHighRiskAge = parseInt(age) > 65 || parseInt(age) < 5;

    if (isChronic || totalScore >= 4 || (totalScore >= 2.5 && isHighRiskAge)) {
      return { 
        level: "Moderate", color: "#d97706", 
        actions: ["Consult a primary care physician within 24-48 hours.", "Monitor for worsening pain or new symptoms.", "Rest and track your temperature."] 
      };
    }

    return { 
      level: "Low", color: "#059669", 
      actions: ["Home care: Rest, hydration, and over-the-counter relief.", "Contact a doctor if symptoms persist beyond 7 days."] 
    };
  };

  const result = evaluateTriage();

  // Reusable Disclaimer Component
  const Disclaimer = () => (
    <div style={STYLES.disclaimerBox}>
      <strong>NOT A MEDICAL DIAGNOSIS:</strong> This tool uses basic logic to provide health information. It is not a substitute for professional medical advice. If you are in severe distress, stop using this and call emergency services.
    </div>
  );

  return (
    <div style={STYLES.card}>
      <h1 style={{ textAlign: "center", fontSize: "20px", color: "#2563eb", marginBottom: "25px" }}>Health Sieve v3</h1>

      {step === 1 && (
        <div>
          <h3>Step 1: Patient Profile</h3>
          <p style={{fontSize: "14px", color: "#64748b"}}>Triage logic changes based on age (0-150).</p>
          <input type="number" style={{width:"100%", padding:"12px", boxSizing:"border-box", borderRadius:"8px", border:"1px solid #ccc"}} value={age} onChange={(e) => setAge(e.target.value)} placeholder="Enter age" />
          <button disabled={!isAgeValid} style={{...STYLES.button, opacity: isAgeValid ? 1 : 0.5}} onClick={() => setStep(2)}>Continue</button>
        </div>
      )}

      {step === 2 && !showNotListed && (
        <div>
          <h3>Step 2: Symptoms</h3>
          {SYMPTOMS.map(s => (
            <label key={s.id} style={{ display: "block", padding: "12px", border: "1px solid #f1f5f9", marginBottom: "8px", borderRadius: "8px", background: selectedIds.includes(s.id) ? "#eff6ff" : "white", cursor: "pointer" }}>
              <input type="checkbox" checked={selectedIds.includes(s.id)} onChange={() => setSelectedIds(prev => prev.includes(s.id) ? prev.filter(i => i !== s.id) : [...prev, s.id])} /> 
              <span style={{marginLeft: "10px", fontWeight: s.critical ? "bold" : "normal"}}>{s.label} {s.critical && "⚠️"}</span>
            </label>
          ))}
          <button disabled={selectedIds.length === 0} style={STYLES.button} onClick={handleSymptomNext}>Next</button>
          <button style={STYLES.secondaryBtn} onClick={() => setShowNotListed(true)}>My symptom isn't listed</button>
        </div>
      )}

      {showNotListed && (
        <div style={{textAlign: "center"}}>
          <h3>Unlisted Symptom</h3>
          <p style={{fontSize: "14px", color: "#475569"}}>We recommend speaking with a nurse advice line for symptoms not found in this basic list.</p>
          <button style={STYLES.button} onClick={() => setShowNotListed(false)}>Go Back</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h3>Step 3: Duration</h3>
          {selectedSymptoms.map(s => (
            <div key={s.id} style={{ marginBottom: "15px" }}>
              <div style={{ fontWeight: "bold", fontSize: "14px" }}>{s.label}</div>
              <select style={{width:"100%", padding:"10px", marginTop:"5px"}} onChange={(e) => setDurations({...durations, [s.id]: e.target.value})}>
                {DURATION_OPTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
          ))}
          <button style={STYLES.button} onClick={() => setStep(4)}>Evaluate</button>
        </div>
      )}

      {step === 4 && (
        <div style={{ textAlign: "center" }}>
          <h2 style={{ color: result.color }}>{result.level} Priority</h2>
          <div style={{ textAlign: "left", margin: "20px 0", background: "#f8fafc", padding: "20px", borderRadius: "12px" }}>
            <h4 style={{marginTop: 0}}>Recommended Next Steps:</h4>
            <ul style={{paddingLeft: "20px", fontSize: "14px"}}>
              {result.actions.map((a, i) => <li key={i} style={{marginBottom: "8px"}}>{a}</li>)}
            </ul>
          </div>
          <button style={{ ...STYLES.button, backgroundColor: "#64748b" }} onClick={() => { setStep(1); setSelectedIds([]); setDurations({}); }}>Restart Assessment</button>
        </div>
      )}

      <Disclaimer />
    </div>
  );
}