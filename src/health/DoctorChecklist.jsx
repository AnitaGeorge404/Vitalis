import React, { useState, useEffect } from "react";
import SymptomSelector from "./SymptomSelector";
import VitalInputs from "./VitalInputs";
import ContextualInputs from "./ContextualInputs";
import ResultsDisplay from "./ResultsDisplay";
import { calculateTriage } from "./TriageEngine";
import SafetyBanner from "../components/SafetyBanner";
import FollowUpReminder from "../components/FollowUpReminder";
import "./DoctorNeed.css";

/**
 * "Do I Need a Doctor?" Checklist Feature
 * Complete health triage system with symptom-based decision support
 */
function DoctorChecklist() {
  const [step, setStep] = useState(1);
  const [symptoms, setSymptoms] = useState([]);
  const [vitals, setVitals] = useState({});
  const [context, setContext] = useState({});
  const [result, setResult] = useState(null);
  const [assessmentHistory, setAssessmentHistory] = useState([]);
  const [showReminder, setShowReminder] = useState(false);

  // Load assessment history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("doctorChecklist_history");
    if (saved) {
      try {
        const history = JSON.parse(saved);
        setAssessmentHistory(history.slice(-5)); // Keep last 5 assessments
      } catch (e) {
        console.log("Could not load assessment history");
      }
    }
  }, []);

  const handleSymptomUpdate = (selectedSymptoms) => {
    setSymptoms(selectedSymptoms);
  };

  const handleVitalUpdate = (vitalData) => {
    setVitals(vitalData);
  };

  const handleContextUpdate = (contextData) => {
    setContext(contextData);
  };

  const handleCalculateAssessment = () => {
    const assessment = {
      symptoms,
      vitals,
      ageGroup: context.ageGroup,
      chronicConditions: context.chronicConditions || [],
      recentEvents: context.recentEvents || [],
      pregnancyStatus: context.pregnancyStatus || false,
    };

    const triageResult = calculateTriage(assessment);

    // Save to history
    const newHistory = [
      ...assessmentHistory,
      {
        timestamp: new Date().toISOString(),
        level: triageResult.level,
        score: triageResult.score,
        symptomCount: symptoms.length,
      },
    ];
    localStorage.setItem(
      "doctorChecklist_history",
      JSON.stringify(newHistory.slice(-5))
    );
    setAssessmentHistory(newHistory);

    setResult(triageResult);
    setStep(4);
  };

  const handleRestart = () => {
    setStep(1);
    setSymptoms([]);
    setVitals({});
    setContext({});
    setResult(null);
    setShowReminder(false);
  };

  const handleSetReminder = (hours) => {
    setShowReminder(true);
  };

  return (
    <div className="doctor-checklist-page">
      <SafetyBanner variant="health" />

      <div className="page-header health-header">
        <h1 className="page-title">🏥 Do I Need a Doctor?</h1>
        <p className="page-subtitle">Health assessment and decision support</p>
      </div>

      <div className="checklist-container">
        {/* Progress Indicator */}
        <div className="progress-indicator">
          <div className="progress-steps">
            <div
              className={`progress-step ${step >= 1 ? "active" : ""} ${
                step > 1 ? "completed" : ""
              }`}
            >
              <span className="step-number">1</span>
              <span className="step-label">Symptoms</span>
            </div>
            <div className="progress-connector"></div>

            <div
              className={`progress-step ${step >= 2 ? "active" : ""} ${
                step > 2 ? "completed" : ""
              }`}
            >
              <span className="step-number">2</span>
              <span className="step-label">Vitals</span>
            </div>
            <div className="progress-connector"></div>

            <div
              className={`progress-step ${step >= 3 ? "active" : ""} ${
                step > 3 ? "completed" : ""
              }`}
            >
              <span className="step-number">3</span>
              <span className="step-label">Context</span>
            </div>
            <div className="progress-connector"></div>

            <div className={`progress-step ${step >= 4 ? "active" : ""}`}>
              <span className="step-number">✓</span>
              <span className="step-label">Result</span>
            </div>
          </div>
        </div>

        {/* Step 1: Symptom Selection */}
        {step === 1 && (
          <SymptomSelector
            selectedSymptoms={symptoms}
            onUpdate={handleSymptomUpdate}
            onNext={() => setStep(2)}
          />
        )}

        {/* Step 2: Vital Inputs */}
        {step === 2 && (
          <VitalInputs
            vitals={vitals}
            onUpdate={handleVitalUpdate}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {/* Step 3: Contextual Inputs */}
        {step === 3 && (
          <ContextualInputs
            context={context}
            onUpdate={handleContextUpdate}
            onNext={handleCalculateAssessment}
            onBack={() => setStep(2)}
          />
        )}

        {/* Step 4: Results */}
        {step === 4 && result && (
          <ResultsDisplay
            result={result}
            assessment={{ symptoms, vitals, ...context }}
            onRestart={handleRestart}
            onSetReminder={handleSetReminder}
          />
        )}
      </div>

      {/* Follow-Up Reminder */}
      {showReminder && step === 4 && (
        <div className="reminder-container">
          <FollowUpReminder />
        </div>
      )}

      {/* Assessment History - if available */}
      {assessmentHistory.length > 0 && step === 1 && (
        <div className="history-section">
          <h3>📋 Recent Assessments</h3>
          <div className="history-list">
            {assessmentHistory
              .slice()
              .reverse()
              .map((assessment, idx) => (
                <div key={idx} className="history-item">
                  <span className="history-time">
                    {new Date(assessment.timestamp).toLocaleDateString()}
                  </span>
                  <span
                    className={`history-level history-${assessment.level.toLowerCase()}`}
                  >
                    {assessment.level} - Score: {assessment.score}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorChecklist;
