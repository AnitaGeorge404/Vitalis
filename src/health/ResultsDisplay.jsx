import React, { useState } from 'react';
import './DoctorNeed.css';

/**
 * Results Display Component
 * Shows the triage assessment result and guidance
 */
function ResultsDisplay({ result, assessment, onRestart, onSetReminder }) {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="results-display">
      {/* Main Result Banner */}
      <div
        className="result-banner"
        style={{
          backgroundColor: result.bgColor,
          borderLeftColor: result.color
        }}
      >
        <div className="result-icon-row">
          <span className="result-title-icon">{result.title.split(' ')[0]}</span>
          <div className="result-info">
            <h2 className="result-title">{result.title}</h2>
            <p className="result-recommendation" style={{ color: result.textColor }}>
              {result.recommendation}
            </p>
            <p className="result-urgency" style={{ color: result.color }}>
              <strong>Urgency Level:</strong> {result.urgency} • {result.timeframe}
            </p>
          </div>
        </div>
      </div>

      {/* Important Actions */}
      <div className="actions-section" style={{ borderTopColor: result.color }}>
        <h3 className="section-title">
          <span className="section-icon">✓</span> What You Should Do
        </h3>
        <ul className="actions-list">
          {result.actions.map((action, idx) => (
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
          onClick={() => toggleSection('details')}
          style={{ borderBottomColor: expandedSection === 'details' ? result.color : '#e5e7eb' }}
        >
          <span>📋 Assessment Details</span>
          <span className="collapse-icon">{expandedSection === 'details' ? '−' : '+'}</span>
        </button>

        {expandedSection === 'details' && (
          <div className="collapsible-content">
            <div className="detail-item">
              <strong>Risk Score:</strong>
              <span className="score-badge" style={{ backgroundColor: result.color }}>
                {result.score}/10
              </span>
            </div>

            {result.riskMultiplier > 1 && (
              <div className="detail-item">
                <strong>Risk Multiplier:</strong>
                <span>{result.riskMultiplier}x</span>
                <small>(Based on age, conditions, and recent events)</small>
              </div>
            )}

            {assessment.symptoms.length > 0 && (
              <div className="detail-item">
                <strong>Reported Symptoms ({assessment.symptoms.length}):</strong>
                <ul className="symptom-list">
                  {assessment.symptoms.map((sym, idx) => (
                    <li key={idx}>
                      {sym.label}
                      <span className="severity-badge" data-severity={sym.severity}>
                        {sym.severity}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.contributingFactors && result.contributingFactors.length > 0 && (
              <div className="detail-item">
                <strong>Key Contributing Factors:</strong>
                <ul className="factors-list">
                  {result.contributingFactors.slice(0, 5).map((factor, idx) => (
                    <li key={idx}>
                      {typeof factor === 'string' ? (
                        factor
                      ) : (
                        <>
                          <strong>{factor.symptom || factor.type}:</strong>{' '}
                          {factor.detail || factor.contribution}
                        </>
                      )}
                    </li>
                  ))}
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
            onClick={() => toggleSection('warnings')}
            style={{ borderBottomColor: expandedSection === 'warnings' ? '#dc2626' : '#e5e7eb' }}
          >
            <span>⚠️ Warning Signs to Watch For</span>
            <span className="collapse-icon">{expandedSection === 'warnings' ? '−' : '+'}</span>
          </button>

          {expandedSection === 'warnings' && (
            <div className="collapsible-content warning-content">
              {result.warningSignsToWatch.alreadyPresent &&
                result.warningSignsToWatch.alreadyPresent.length > 0 && (
                  <div className="warning-subsection">
                    <strong className="warning-label">Currently Present:</strong>
                    <ul className="warning-list">
                      {result.warningSignsToWatch.alreadyPresent.map((sign, idx) => (
                        <li key={idx}>{sign}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {result.warningSignsToWatch.escalationSigns && (
                <div className="warning-subsection">
                  <strong className="warning-label">Seek Immediate Help If:</strong>
                  <ul className="warning-list escalation">
                    {result.warningSignsToWatch.escalationSigns.map((sign, idx) => (
                      <li key={idx}>
                        <span className="escalation-badge">!</span>
                        {sign}
                      </li>
                    ))}
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
            onClick={() => toggleSection('monitoring')}
            style={{ borderBottomColor: expandedSection === 'monitoring' ? '#10b981' : '#e5e7eb' }}
          >
            <span>📊 How to Monitor Your Symptoms</span>
            <span className="collapse-icon">{expandedSection === 'monitoring' ? '−' : '+'}</span>
          </button>

          {expandedSection === 'monitoring' && (
            <div className="collapsible-content">
              <ul className="monitoring-list">
                <li>Track how symptoms change over time</li>
                <li>Note if severity increases or decreases</li>
                <li>Record any new symptoms that appear</li>
                <li>Watch vital signs if available (temperature, heart rate)</li>
                <li>Document what helps or makes symptoms worse</li>
              </ul>
              {result.level === 'YELLOW' && (
                <div className="monitoring-note">
                  ⏰ Set a reminder to recheck your symptoms and decision in 24 hours.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <div className="disclaimer-section">
        <h4>⚕️ Important Disclaimer</h4>
        <p>
          <strong>This feature does NOT provide a medical diagnosis.</strong> It is designed to provide
          risk-based guidance and decision support only. It cannot replace professional medical advice.
        </p>
        <ul className="disclaimer-list">
          <li>This assessment is based on self-reported information only</li>
          <li>Only a qualified healthcare provider can diagnose conditions</li>
          <li>If you are ever unsure, consult a healthcare professional</li>
          <li>In case of emergency, always call 911 or local emergency services</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="results-footer">
        <button
          className="btn btn-secondary"
          onClick={() => {
            if (result.level === 'YELLOW' && onSetReminder) {
              onSetReminder(24); // 24-hour reminder
            }
          }}
        >
          {result.level === 'YELLOW' ? '⏰ Set 24-Hour Reminder' : '← Back'}
        </button>
        <button className="btn btn-primary" onClick={onRestart}>
          Start New Assessment
        </button>
      </div>

      {/* Assessment Timestamp */}
      <div className="assessment-meta">
        <small>
          Assessment generated: {new Date(result.assessmentTimestamp).toLocaleString()}
        </small>
      </div>
    </div>
  );
}

export default ResultsDisplay;
