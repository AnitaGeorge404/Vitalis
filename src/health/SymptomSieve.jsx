import React, { useState } from "react";

// --- Configuration ---
const SYMPTOMS = [
  {
    id: "chest_pain",
    label: "Chest Pain/Pressure",
    weight: 10,
    critical: true,
  },
  {
    id: "breath",
    label: "Shortness of Breath",
    weight: 10,
    critical: true,
  },
  { id: "fever", label: "High Fever", weight: 3, critical: false },
  {
    id: "fatigue",
    label: "Extreme Fatigue",
    weight: 3,
    critical: false,
  },
  {
    id: "headache",
    label: "Severe Headache",
    weight: 2,
    critical: false,
  },
  {
    id: "cough",
    label: "Persistent Cough",
    weight: 2,
    critical: false,
  },
  {
    id: "dizziness",
    label: "Dizziness/Vertigo",
    weight: 4,
    critical: false,
  },
  {
    id: "nausea",
    label: "Nausea/Vomiting",
    weight: 2,
    critical: false,
  },
  {
    id: "chills",
    label: "Chills/Sweating",
    weight: 2,
    critical: false,
  },
  {
    id: "body_ache",
    label: "Body Aches",
    weight: 2,
    critical: false,
  },
];

const DURATION_OPTIONS = [
  { label: "Less than 24 hours", value: "new", weight: 1 },
  { label: "1 - 7 days", value: "recent", weight: 1.2 },
  { label: "1 - 3 weeks", value: "prolonged", weight: 1.5 },
  { label: "More than 3 weeks", value: "chronic", weight: 2.5 },
];

const CARE_SUGGESTIONS = {
  urgent: [
    "Call 911 or go to emergency room immediately",
    "Have your insurance card and medical history ready",
    "Tell the dispatcher your main symptoms",
    "Do not drive yourself if possible",
    "Notify a family member or emergency contact",
  ],
  moderate: [
    "Call your doctor's office to schedule an urgent appointment (24-48 hours)",
    "Keep a symptom diary to show your doctor",
    "Get plenty of rest and stay hydrated",
    "Monitor your temperature regularly",
    "Avoid strenuous activities",
    "Take over-the-counter pain relievers if needed",
    "Consider telehealth if you can't visit in person",
  ],
  low: [
    "Monitor your symptoms closely",
    "Rest, hydration, and nutrition are key",
    "Use over-the-counter medications as needed",
    "Avoid spreading illness to others",
    "Follow up if symptoms worsen or don't improve in 7 days",
    "Maintain good hygiene practices",
    "Stay warm and get adequate sleep",
  ],
};

const STYLES = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "20px",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  card: {
    maxWidth: "600px",
    margin: "20px auto",
    padding: "40px",
    borderRadius: "20px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    backgroundColor: "#fff",
    color: "#1e293b",
  },
  header: {
    textAlign: "center",
    marginBottom: "35px",
    borderBottom: "2px solid #e2e8f0",
    paddingBottom: "20px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#667eea",
    margin: "0 0 8px 0",
  },
  subtitle: {
    fontSize: "13px",
    color: "#94a3b8",
    margin: "8px 0 0 0",
  },
  stepIndicator: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "25px",
    gap: "10px",
  },
  step: {
    flex: 1,
    height: "6px",
    borderRadius: "3px",
    background: "#e2e8f0",
  },
  stepActive: {
    background: "#667eea",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "15px",
  },
  button: {
    padding: "12px 24px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#667eea",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
    marginTop: "15px",
    fontSize: "15px",
    transition: "all 0.3s",
  },
  buttonSecondary: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "2px solid #e2e8f0",
    backgroundColor: "transparent",
    color: "#667eea",
    cursor: "pointer",
    width: "100%",
    marginTop: "10px",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.3s",
  },
  symptomGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "15px",
  },
  symptomCard: {
    padding: "15px",
    border: "2px solid #e2e8f0",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s",
    textAlign: "center",
  },
  symptomCardSelected: {
    borderColor: "#667eea",
    backgroundColor: "#f0f4ff",
  },
  durationSelect: {
    width: "100%",
    padding: "12px",
    marginTop: "8px",
    borderRadius: "8px",
    border: "2px solid #e2e8f0",
    fontSize: "14px",
    color: "#1e293b",
    fontFamily: "inherit",
  },
  resultCard: {
    padding: "25px",
    borderRadius: "12px",
    textAlign: "center",
    marginBottom: "20px",
  },
  urgentResult: {
    backgroundColor: "#fee2e2",
    borderLeft: "5px solid #dc2626",
  },
  moderateResult: {
    backgroundColor: "#fef3c7",
    borderLeft: "5px solid #d97706",
  },
  lowResult: {
    backgroundColor: "#dcfce7",
    borderLeft: "5px solid #059669",
  },
  resultLevel: {
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "10px",
  },
  suggestionsBox: {
    marginTop: "20px",
    padding: "20px",
    background: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  suggestionsList: {
    listStyle: "none",
    padding: "0",
    margin: "0",
  },
  suggestionItem: {
    padding: "10px 0",
    fontSize: "14px",
    color: "#475569",
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
  },
  disclaimerBox: {
    marginTop: "25px",
    padding: "15px",
    backgroundColor: "#fef3c7",
    borderRadius: "10px",
    border: "1px solid #fcd34d",
    fontSize: "12px",
    color: "#78350f",
    lineHeight: "1.5",
  },
};

export default function SymptomSieve() {
  const [step, setStep] = useState(1);
  const [age, setAge] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [durations, setDurations] = useState({});
  const [showNotListed, setShowNotListed] = useState(false);
  const [result, setResult] = useState(null);

  const selectedSymptoms = SYMPTOMS.filter((s) => selectedIds.includes(s.id));
  const hasCritical = selectedSymptoms.some((s) => s.critical);
  const isAgeValid = age !== "" && parseInt(age) >= 0 && parseInt(age) <= 150;

  const handleSymptomNext = () => {
    if (hasCritical) {
      // Skip directly to results for critical symptoms
      evaluateAndShowResult();
      setStep(4);
    } else {
      setStep(3);
    }
  };

  const evaluateTriage = () => {
    if (hasCritical)
      return {
        level: "Urgent",
        color: "#dc2626",
        actions: [
          "Call 911/Emergency services immediately.",
          "Do not drive yourself.",
          "Have your list of medications ready.",
        ],
        type: "urgent",
      };

    let totalScore = 0;
    let isChronic = false;

    selectedSymptoms.forEach((s) => {
      const dKey = durations[s.id] || "new";
      if (dKey === "chronic") isChronic = true;
      const dWeight = DURATION_OPTIONS.find((d) => d.value === dKey).weight;
      totalScore += s.weight * dWeight;
    });

    const isHighRiskAge = parseInt(age) > 65 || parseInt(age) < 5;

    if (isChronic || totalScore >= 4 || (totalScore >= 2.5 && isHighRiskAge)) {
      return {
        level: "Moderate",
        color: "#d97706",
        actions: [
          "Consult a primary care physician within 24-48 hours.",
          "Monitor for worsening pain or new symptoms.",
          "Rest and track your temperature.",
        ],
        type: "moderate",
      };
    }

    return {
      level: "Low",
      color: "#059669",
      actions: [
        "Home care: Rest, hydration, and over-the-counter relief.",
        "Contact a doctor if symptoms persist beyond 7 days.",
      ],
      type: "low",
    };
  };

  const evaluateAndShowResult = () => {
    const result = evaluateTriage();
    setResult(result);
  };

  const getResultStyle = () => {
    if (!result) return STYLES.resultCard;
    switch (result.type) {
      case "urgent":
        return { ...STYLES.resultCard, ...STYLES.urgentResult };
      case "moderate":
        return { ...STYLES.resultCard, ...STYLES.moderateResult };
      default:
        return { ...STYLES.resultCard, ...STYLES.lowResult };
    }
  };

  // Reusable Disclaimer Component
  const Disclaimer = () => (
    <div style={STYLES.disclaimerBox}>
      <strong>IMPORTANT DISCLAIMER:</strong> This tool provides guidance only
      and is NOT a medical diagnosis. It cannot replace professional medical
      advice. Always trust your instincts—if you feel you need emergency help,
      call 911 immediately.
    </div>
  );

  // Step Indicator
  const StepIndicator = () => (
    <div style={STYLES.stepIndicator}>
      {[1, 2, 3, 4].map((s) => (
        <div
          key={s}
          style={{
            ...STYLES.step,
            ...(s <= step ? STYLES.stepActive : {}),
          }}
        />
      ))}
    </div>
  );

  return (
    <div style={STYLES.container}>
      <div style={STYLES.card}>
        <div style={STYLES.header}>
          <h1 style={STYLES.title}>💊 Symptom Sieve</h1>
          <p style={STYLES.subtitle}>Quick health assessment guide</p>
        </div>

        <StepIndicator />

        {step === 1 && (
          <div>
            <h3 style={STYLES.sectionTitle}>Step 1: Patient Profile</h3>
            <p
              style={{
                fontSize: "13px",
                color: "#64748b",
                marginBottom: "15px",
              }}
            >
              Age helps personalize your assessment. Healthcare needs vary by
              age group.
            </p>
            <input
              type="number"
              style={{
                width: "100%",
                padding: "14px",
                boxSizing: "border-box",
                borderRadius: "10px",
                border: "2px solid #e2e8f0",
                fontSize: "15px",
                transition: "border-color 0.3s",
              }}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Enter age (0-150)"
              onFocus={(e) => (e.target.style.borderColor = "#667eea")}
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
            />
            <button
              disabled={!isAgeValid}
              style={{ ...STYLES.button, opacity: isAgeValid ? 1 : 0.5 }}
              onClick={() => setStep(2)}
            >
              Continue →
            </button>
          </div>
        )}

        {step === 2 && !showNotListed && (
          <div>
            <h3 style={STYLES.sectionTitle}>Step 2: Select Your Symptoms</h3>
            <p
              style={{
                fontSize: "13px",
                color: "#64748b",
                marginBottom: "15px",
              }}
            >
              Select all that apply
            </p>
            <div style={STYLES.symptomGrid}>
              {SYMPTOMS.map((s) => (
                <div
                  key={s.id}
                  style={{
                    ...STYLES.symptomCard,
                    ...(selectedIds.includes(s.id)
                      ? STYLES.symptomCardSelected
                      : {}),
                  }}
                  onClick={() =>
                    setSelectedIds((prev) =>
                      prev.includes(s.id)
                        ? prev.filter((i) => i !== s.id)
                        : [...prev, s.id]
                    )
                  }
                >
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "500",
                      color: "#1e293b",
                    }}
                  >
                    {s.label}
                  </div>
                  {s.critical && (
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#dc2626",
                        marginTop: "4px",
                      }}
                    >
                      Critical
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button
              disabled={selectedIds.length === 0}
              style={{
                ...STYLES.button,
                opacity: selectedIds.length === 0 ? 0.5 : 1,
              }}
              onClick={handleSymptomNext}
            >
              {hasCritical ? "Get Emergency Assessment →" : "Continue →"}
            </button>
            <button
              style={STYLES.buttonSecondary}
              onClick={() => setShowNotListed(true)}
            >
              My symptom isn't listed →
            </button>
          </div>
        )}

        {showNotListed && (
          <div style={{ textAlign: "center" }}>
            <h3 style={STYLES.sectionTitle}>Symptom Not Listed</h3>
            <p
              style={{
                fontSize: "14px",
                color: "#475569",
                marginBottom: "20px",
                lineHeight: "1.6",
              }}
            >
              We recommend speaking with a nurse advice line or consulting your
              doctor for symptoms not found in this basic assessment.
            </p>
            <button
              style={STYLES.button}
              onClick={() => setShowNotListed(false)}
            >
              ← Go Back
            </button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 style={STYLES.sectionTitle}>
              Step 3: How Long Have You Had These?
            </h3>
            <p
              style={{
                fontSize: "13px",
                color: "#64748b",
                marginBottom: "15px",
              }}
            >
              Duration affects urgency of care needed
            </p>
            {selectedSymptoms.map((s) => (
              <div key={s.id} style={{ marginBottom: "18px" }}>
                <div
                  style={{
                    fontWeight: "600",
                    fontSize: "14px",
                    color: "#1e293b",
                    marginBottom: "6px",
                  }}
                >
                  {s.label}
                </div>
                <select
                  style={STYLES.durationSelect}
                  value={durations[s.id] || "new"}
                  onChange={(e) =>
                    setDurations({ ...durations, [s.id]: e.target.value })
                  }
                >
                  {DURATION_OPTIONS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            <button
              style={STYLES.button}
              onClick={() => {
                evaluateAndShowResult();
                setStep(4);
              }}
            >
              Get Assessment →
            </button>
          </div>
        )}

        {step === 4 && result && (
          <div>
            <div style={getResultStyle()}>
              <div style={{ ...STYLES.resultLevel, color: result.color }}>
                {result.level} Priority
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "#475569",
                  margin: "8px 0 0 0",
                }}
              >
                Based on your symptoms and duration
              </p>
            </div>

            <div
              style={{
                background: "#f8fafc",
                padding: "18px",
                borderRadius: "12px",
                marginBottom: "20px",
                border: "1px solid #e2e8f0",
              }}
            >
              <h4
                style={{
                  margin: "0 0 12px 0",
                  color: "#1e293b",
                  fontSize: "15px",
                  fontWeight: "600",
                }}
              >
                Recommended Actions:
              </h4>
              <ul style={STYLES.suggestionsList}>
                {(CARE_SUGGESTIONS[result.type] || []).map((suggestion, i) => (
                  <li key={i} style={STYLES.suggestionItem}>
                    <span style={{ color: "#667eea", marginTop: "2px" }}>
                      •
                    </span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              style={{ ...STYLES.button, backgroundColor: "#667eea" }}
              onClick={() => {
                setStep(1);
                setSelectedIds([]);
                setDurations({});
                setResult(null);
              }}
            >
              Start New Assessment
            </button>
          </div>
        )}

        <Disclaimer />
      </div>
    </div>
  );
}
