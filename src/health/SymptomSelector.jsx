import React, { useState } from 'react';
import { SYMPTOMS, SYMPTOM_CATEGORIES, DURATION_OPTIONS } from './TriageEngine';
import './DoctorNeed.css';

/**
 * Symptom Selector Component
 * Allows users to select symptoms and their severity/duration
 */
function SymptomSelector({ selectedSymptoms, onUpdate, onNext }) {
  const [expandedSymptom, setExpandedSymptom] = useState(null);
  const [showAllSymptoms, setShowAllSymptoms] = useState(false);

  const handleSymptomToggle = (symptomId) => {
    const existing = selectedSymptoms.find(s => s.id === symptomId);
    
    if (existing) {
      onUpdate(selectedSymptoms.filter(s => s.id !== symptomId));
    } else {
      onUpdate([
        ...selectedSymptoms,
        {
          id: symptomId,
          severity: 'moderate',
          duration: 'days_1_7'
        }
      ]);
    }
  };

  const handleSeverityChange = (symptomId, severity) => {
    onUpdate(
      selectedSymptoms.map(s =>
        s.id === symptomId ? { ...s, severity } : s
      )
    );
  };

  const handleDurationChange = (symptomId, duration) => {
    onUpdate(
      selectedSymptoms.map(s =>
        s.id === symptomId ? { ...s, duration } : s
      )
    );
  };

  // Group symptoms by category
  const symptomsByCategory = {};
  SYMPTOMS.forEach(symptom => {
    if (!symptomsByCategory[symptom.category]) {
      symptomsByCategory[symptom.category] = [];
    }
    symptomsByCategory[symptom.category].push(symptom);
  });

  const categories = Object.keys(symptomsByCategory);
  const displayLimit = showAllSymptoms ? Infinity : 4;
  let displayedCount = 0;

  return (
    <div className="symptom-selector">
      <div className="section-header">
        <h3>Step 1: Select Your Symptoms</h3>
        <p className="section-subtitle">Choose all symptoms you're experiencing</p>
      </div>

      <div className="symptoms-container">
        {categories.map((category, idx) => (
          <div key={category} className="symptom-category">
            <h4 className="category-name">{getCategoryLabel(category)}</h4>
            <div className="symptoms-list">
              {symptomsByCategory[category].map(symptom => {
                const isSelected = selectedSymptoms.find(s => s.id === symptom.id);
                const isDisplayed = displayedCount < displayLimit;
                displayedCount++;

                return (
                  <div key={symptom.id} className="symptom-item">
                    <label className={`symptom-checkbox ${isSelected ? 'selected' : ''} ${!isDisplayed ? 'hidden' : ''}`}>
                      <input
                        type="checkbox"
                        checked={!!isSelected}
                        onChange={() => handleSymptomToggle(symptom.id)}
                      />
                      <span className="symptom-label-text">
                        {symptom.isRedFlag && <span className="red-flag-badge">🚨</span>}
                        {symptom.label}
                      </span>
                    </label>

                    {isSelected && (
                      <div className="symptom-details">
                        <div className="detail-row">
                          <label>Severity:</label>
                          <select
                            value={isSelected.severity}
                            onChange={(e) => handleSeverityChange(symptom.id, e.target.value)}
                            className="detail-select"
                          >
                            <option value="mild">Mild</option>
                            <option value="moderate">Moderate</option>
                            <option value="severe">Severe</option>
                          </select>
                        </div>

                        <div className="detail-row">
                          <label>Duration:</label>
                          <select
                            value={isSelected.duration}
                            onChange={(e) => handleDurationChange(symptom.id, e.target.value)}
                            className="detail-select"
                          >
                            {DURATION_OPTIONS.map(d => (
                              <option key={d.value} value={d.value}>
                                {d.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="symptom-explanation">
                          <small>ℹ️ {symptom.explanation}</small>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!showAllSymptoms && displayedCount > displayLimit && (
        <button
          className="show-more-btn"
          onClick={() => setShowAllSymptoms(true)}
        >
          Show More Symptoms ({SYMPTOMS.length - displayLimit} more)
        </button>
      )}

      <div className="symptom-selector-footer">
        <div className="selected-count">
          <strong>{selectedSymptoms.length}</strong> symptom{selectedSymptoms.length !== 1 ? 's' : ''} selected
        </div>
        <button
          className="btn btn-primary"
          onClick={onNext}
          disabled={selectedSymptoms.length === 0}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

/**
 * Helper to get human-readable category names
 */
function getCategoryLabel(category) {
  const labels = {
    cardiovascular: '❤️ Heart & Circulation',
    respiratory: '🫁 Breathing & Lungs',
    neurological: '🧠 Brain & Nervous System',
    gastrointestinal: '🍽️ Stomach & Digestion',
    infectious: '🦠 Infection Signs',
    integumentary: '🩹 Skin & Bleeding',
    sensory: '👁️ Eyes & Vision',
    trauma: '⚡ Injury & Trauma'
  };
  return labels[category] || category;
}

export default SymptomSelector;
