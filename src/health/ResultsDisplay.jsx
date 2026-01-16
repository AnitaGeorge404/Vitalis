import React, { useState } from "react";
import "./DoctorNeed.css";

/**
 * Results Display Component - ENHANCED VERSION
 * Shows personalized triage assessment with clear explanations
 */
function ResultsDisplay({ result, assessment, onRestart, onSetReminder }) {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const formatTimestamp = (isoString) => {
    if (!isoString) return null;
    try {
      const date = new Date(isoString);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="results-display">
      {/* Main Result Banner */}
      <div
        className="result-banner"
        style={{
          backgroundColor: result.bgColor,
          borderLeftColor: result.color,
        }}
      >
        <div className="result-icon-row">
          <span className="result-title-icon">
            {result.title.split(" ")[0]}
          </span>
          <div className="result-info">
            <h2 className="result-title">{result.title}</h2>
            <p
              className="result-recommendation"
              style={{ color: result.textColor }}
            >
              {result.recommendation}
            </p>
            <p className="result-urgency" style={{ color: result.color }}>
              <strong>Timeframe:</strong> {result.timeframe}
            </p>
          </div>
        </div>
      </div>

      {/* Personalized Explanation */}
      {result.explanation && (
        <div
          className="explanation-section"
          style={{ borderLeftColor: result.color }}
        >
          <h3 className="explanation-title">Why This Recommendation?</h3>
          <p className="explanation-text">{result.explanation}</p>
          {result.symptomInfluencers &&
            result.symptomInfluencers.length > 0 && (
              <p className="symptom-influence">
                <strong>Main concern:</strong>{" "}
                {result.symptomInfluencers.join(", ")}
              </p>
            )}
        </div>
      )}

      {/* What Changed Prompt */}
      {result.changePrompt && (
        <div className="change-prompt-section">
          <h3 className="change-prompt-title">⚠️ Re-evaluate If:</h3>
          <p className="change-prompt-text">{result.changePrompt}</p>
        </div>
      )}

      {/* Important Actions */}
      <div className="actions-section" style={{ borderTopColor: result.color }}>
        <h3 className="section-title">
          <span className="section-icon">✓</span> What You Should Do
        </h3>
        <ul className="actions-list">
          {result.actions &&
            result.actions.map((action, idx) => (
              <li key={idx} className="action-item">
                <span className="action-number">{idx + 1}</span>
                <span>{action}</span>
              </li>
            ))}
        </ul>
      </div>

      {/* Assessment Details */}
      <div className="details-section">
        <button
          className="collapsible-header"
          onClick={() => toggleSection("details")}
          style={{
            borderBottomColor:
              expandedSection === "details" ? result.color : "#e5e7eb",
          }}
        >
          <span>📋 Assessment Details</span>
          <span className="collapse-icon">
            {expandedSection === "details" ? "−" : "+"}
          </span>
        </button>

        {expandedSection === "details" && (
          <div className="collapsible-content">
            {result.score && (
              <div className="detail-item">
                <strong>Risk Score:</strong>
                <span
                  className="score-badge"
                  style={{ backgroundColor: result.color }}
                >
                  {result.score}/10
                </span>
              </div>
            )}

            {result.riskMultiplier &&
              parseFloat(result.riskMultiplier) > 1.0 && (
                <div className="detail-item">
                  <strong>Risk Multiplier:</strong>
                  <span>{result.riskMultiplier}x</span>
                  <small>(Based on age, conditions, and recent events)</small>
                </div>
              )}

            {result.riskFactorsApplied &&
              result.riskFactorsApplied.length > 0 && (
                <div className="detail-item">
                  <strong>Risk Factors Considered:</strong>
                  <ul className="factors-list">
                    {result.riskFactorsApplied.map((factor, idx) => (
                      <li key={idx}>{factor}</li>
                    ))}
                  </ul>
                </div>
              )}

            {assessment.symptoms && assessment.symptoms.length > 0 && (
              <div className="detail-item">
                <strong>
                  Reported Symptoms ({assessment.symptoms.length}):
                </strong>
                <ul className="symptom-list">
                  {assessment.symptoms.map((sym, idx) => {
                    // Only show if user provided this symptom
                    return (
                      <li key={idx}>
                        {sym.label}
                        <span
                          className="severity-badge"
                          data-severity={sym.severity}
                        >
                          {sym.severity}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Warning Signs Section */}
      {result.warningSignsToWatch && (
        <div className="warning-section">
          <button
            className="collapsible-header"
            onClick={() => toggleSection("warnings")}
            style={{
              borderBottomColor:
                expandedSection === "warnings" ? "#dc2626" : "#e5e7eb",
            }}
          >
            <span>⚠️ Warning Signs to Watch For</span>
            <span className="collapse-icon">
              {expandedSection === "warnings" ? "−" : "+"}
            </span>
          </button>

          {expandedSection === "warnings" && (
            <div className="collapsible-content warning-content">
              {result.warningSignsToWatch.escalationSigns && (
                <div className="warning-subsection">
                  <strong className="warning-label">
                    Seek Immediate Help If:
                  </strong>
                  <ul className="warning-list escalation">
                    {result.warningSignsToWatch.escalationSigns.map(
                      (sign, idx) => (
                        <li key={idx}>
                          <span className="escalation-badge">!</span>
                          {sign}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Monitoring Recommendations */}
      {result.shouldMonitor && (
        <div className="monitoring-section">
          <button
            className="collapsible-header"
            onClick={() => toggleSection("monitoring")}
            style={{
              borderBottomColor:
                expandedSection === "monitoring" ? "#10b981" : "#e5e7eb",
            }}
          >
            <span>📊 How to Monitor Your Symptoms</span>
            <span className="collapse-icon">
              {expandedSection === "monitoring" ? "−" : "+"}
            </span>
          </button>

          {expandedSection === "monitoring" && (
            <div className="collapsible-content">
              <ul className="monitoring-list">
                <li>Track how symptoms change over time</li>
                <li>Note if severity increases or decreases</li>
                <li>Record any new symptoms that appear</li>
                <li>
                  Watch vital signs if available (temperature, heart rate)
                </li>
                <li>Document what helps or makes symptoms worse</li>
              </ul>
              {result.level === "YELLOW" && (
                <div className="monitoring-note">
                  ⏰ Set a reminder to recheck your symptoms and decision in 24
                  hours.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <div className="disclaimer-section">
        <h4>⚕️ Important Notice</h4>
        <p>
          <strong>This is not a medical diagnosis.</strong> This tool provides
          risk-based guidance and decision support only. It cannot replace
          professional medical advice.
        </p>
        <ul className="disclaimer-list">
          <li>This assessment is based on self-reported information only</li>
          <li>Only a qualified healthcare provider can diagnose conditions</li>
          <li>If you are ever unsure, consult a healthcare professional</li>
          <li>
            In case of emergency, always call 911 or local emergency services
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="results-footer">
        <button
          className="btn btn-secondary"
          onClick={() => {
            if (result.level === "YELLOW" && onSetReminder) {
              onSetReminder(24); // 24-hour reminder
            }
          }}
        >
          {result.level === "YELLOW" ? "⏰ Set 24-Hour Reminder" : "← Back"}
        </button>
        <button className="btn btn-primary" onClick={onRestart}>
          Start New Assessment
        </button>
      </div>

      {/* Assessment Timestamp */}
      {result.assessmentTimestamp &&
        formatTimestamp(result.assessmentTimestamp) && (
          <div className="assessment-meta">
            <small>
              Assessment: {formatTimestamp(result.assessmentTimestamp)}
            </small>
          </div>
        )}
    </div>
  );
}

export default ResultsDisplay;
