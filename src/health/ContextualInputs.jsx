import React, { useState } from "react";
import { AGE_GROUPS, CHRONIC_CONDITIONS, RECENT_EVENTS } from "./TriageEngine";
import "./DoctorNeed.css";

/**
 * Contextual Inputs Component
 * Collects age, gender, chronic conditions, and recent events
 */
function ContextualInputs({ context, onUpdate, onNext, onBack }) {
  const [localContext, setLocalContext] = useState(context);

  const handleAgeGroupChange = (ageGroup) => {
    setLocalContext({ ...localContext, ageGroup });
  };

  const handleGenderChange = (gender) => {
    setLocalContext({ ...localContext, gender });
  };

  const handlePregnancyChange = (pregnancyStatus) => {
    setLocalContext({ ...localContext, pregnancyStatus });
  };

  const handleChronicConditionToggle = (condId) => {
    const conditions = localContext.chronicConditions || [];
    const updated = conditions.includes(condId)
      ? conditions.filter((c) => c !== condId)
      : [...conditions, condId];
    setLocalContext({ ...localContext, chronicConditions: updated });
  };

  const handleRecentEventToggle = (eventId) => {
    const events = localContext.recentEvents || [];
    const updated = events.includes(eventId)
      ? events.filter((e) => e !== eventId)
      : [...events, eventId];
    setLocalContext({ ...localContext, recentEvents: updated });
  };

  const handleNext = () => {
    onUpdate(localContext);
    onNext();
  };

  return (
    <div className="contextual-inputs">
      <div className="section-header">
        <h3>Step 3: Health Context (Optional)</h3>
        <p className="section-subtitle">
          This helps us understand your risk better
        </p>
      </div>

      <div className="context-form">
        {/* Age Group */}
        <div className="form-section">
          <h4 className="form-section-title">📅 Age Group</h4>
          <div className="option-group">
            {AGE_GROUPS.map((ageGroup) => (
              <label key={ageGroup.value} className="option-label">
                <input
                  type="radio"
                  name="ageGroup"
                  value={ageGroup.value}
                  checked={localContext.ageGroup === ageGroup.value}
                  onChange={(e) => handleAgeGroupChange(e.target.value)}
                />
                <span>{ageGroup.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Gender */}
        <div className="form-section">
          <h4 className="form-section-title">👤 Gender (Optional)</h4>
          <div className="option-group">
            <label className="option-label">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={localContext.gender === "male"}
                onChange={() => handleGenderChange("male")}
              />
              <span>Male</span>
            </label>
            <label className="option-label">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={localContext.gender === "female"}
                onChange={() => handleGenderChange("female")}
              />
              <span>Female</span>
            </label>
            <label className="option-label">
              <input
                type="radio"
                name="gender"
                value="other"
                checked={localContext.gender === "other"}
                onChange={() => handleGenderChange("other")}
              />
              <span>Other</span>
            </label>
            <label className="option-label">
              <input
                type="radio"
                name="gender"
                value="prefer_not"
                checked={localContext.gender === "prefer_not"}
                onChange={() => handleGenderChange("prefer_not")}
              />
              <span>Prefer not to say</span>
            </label>
          </div>
        </div>

        {/* Pregnancy Status */}
        {(localContext.gender === "female" || !localContext.gender) && (
          <div className="form-section">
            <h4 className="form-section-title">
              🤰 Pregnancy Status (Optional)
            </h4>
            <div className="option-group">
              <label className="option-label">
                <input
                  type="radio"
                  name="pregnant"
                  value="yes"
                  checked={localContext.pregnancyStatus === true}
                  onChange={() => handlePregnancyChange(true)}
                />
                <span>Currently Pregnant</span>
              </label>
              <label className="option-label">
                <input
                  type="radio"
                  name="pregnant"
                  value="no"
                  checked={localContext.pregnancyStatus === false}
                  onChange={() => handlePregnancyChange(false)}
                />
                <span>Not Pregnant</span>
              </label>
            </div>
          </div>
        )}

        {/* Chronic Conditions */}
        <div className="form-section">
          <h4 className="form-section-title">
            🏥 Chronic Conditions (Select all that apply)
          </h4>
          <div className="checkbox-group">
            {CHRONIC_CONDITIONS.map((condition) => (
              <label key={condition.id} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={(localContext.chronicConditions || []).includes(
                    condition.id
                  )}
                  onChange={() => handleChronicConditionToggle(condition.id)}
                />
                <span>{condition.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Recent Events */}
        <div className="form-section">
          <h4 className="form-section-title">
            ⚡ Recent Events (Select all that apply)
          </h4>
          <div className="checkbox-group">
            {RECENT_EVENTS.map((event) => (
              <label key={event.id} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={(localContext.recentEvents || []).includes(event.id)}
                  onChange={() => handleRecentEventToggle(event.id)}
                />
                <span>{event.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="contextual-footer">
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <button className="btn btn-primary" onClick={handleNext}>
          Calculate Assessment →
        </button>
      </div>
    </div>
  );
}

export default ContextualInputs;
