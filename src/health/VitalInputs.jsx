import React, { useState } from 'react';
import { VITAL_RANGES } from './TriageEngine';
import './DoctorNeed.css';

/**
 * Vital Inputs Component
 * Collects heart rate, temperature, and oxygen saturation
 */
function VitalInputs({ vitals, onUpdate, onNext, onBack }) {
  const [localVitals, setLocalVitals] = useState(vitals);
  const [showTips, setShowTips] = useState({});

  const handleChange = (key, value) => {
    const numValue = value ? parseFloat(value) : undefined;
    setLocalVitals({ ...localVitals, [key]: numValue });
  };

  const handleNext = () => {
    onUpdate(localVitals);
    onNext();
  };

  const getVitalStatus = (key, value) => {
    if (value === undefined || value === null) return null;

    const range = VITAL_RANGES[key];
    if (!range) return null;

    if (value < range.critical_low || value > range.critical_high) {
      return 'critical';
    }
    if (value < range.concerning.min || value > range.concerning.max) {
      return 'concerning';
    }
    return 'normal';
  };

  const getStatusLabel = (status) => {
    const labels = {
      critical: { text: 'CRITICAL', color: '#dc2626', icon: '🚨' },
      concerning: { text: 'Concerning', color: '#d97706', icon: '⚠️' },
      normal: { text: 'Normal', color: '#10b981', icon: '✓' }
    };
    return labels[status] || {};
  };

  return (
    <div className="vital-inputs">
      <div className="section-header">
        <h3>Step 2: Vital Signs (Optional but Helpful)</h3>
        <p className="section-subtitle">These help us understand your condition better. Leave blank if unknown.</p>
      </div>

      <div className="vitals-form">
        {/* Heart Rate */}
        <div className="vital-input-group">
          <div className="vital-label-row">
            <label htmlFor="heartRate">
              ❤️ Heart Rate (beats per minute)
              <button
                type="button"
                className="info-btn"
                onClick={() => setShowTips({ ...showTips, heartRate: !showTips.heartRate })}
              >
                ?
              </button>
            </label>
            {localVitals.heartRate !== undefined && (
              <span
                className="vital-status"
                style={{ color: getStatusLabel(getVitalStatus('heart_rate', localVitals.heartRate)).color }}
              >
                {getStatusLabel(getVitalStatus('heart_rate', localVitals.heartRate)).icon}
                {getStatusLabel(getVitalStatus('heart_rate', localVitals.heartRate)).text}
              </span>
            )}
          </div>
          <div className="input-group">
            <input
              id="heartRate"
              type="number"
              value={localVitals.heartRate ?? ''}
              onChange={(e) => handleChange('heartRate', e.target.value)}
              placeholder="60-100 bpm is typical"
              min="0"
              max="200"
              className="vital-input"
            />
            <span className="input-unit">bpm</span>
          </div>
          {showTips.heartRate && (
            <div className="vital-tip">
              <strong>Resting Heart Rate:</strong> Normal is 60-100 bpm. Higher rates can indicate stress, fever, or other conditions.
              Count beats for 60 seconds at rest for accuracy.
            </div>
          )}
        </div>

        {/* Temperature */}
        <div className="vital-input-group">
          <div className="vital-label-row">
            <label htmlFor="temperature">
              🌡️ Body Temperature (°F)
              <button
                type="button"
                className="info-btn"
                onClick={() => setShowTips({ ...showTips, temperature: !showTips.temperature })}
              >
                ?
              </button>
            </label>
            {localVitals.temperature !== undefined && (
              <span
                className="vital-status"
                style={{ color: getStatusLabel(getVitalStatus('temperature', localVitals.temperature)).color }}
              >
                {getStatusLabel(getVitalStatus('temperature', localVitals.temperature)).icon}
                {getStatusLabel(getVitalStatus('temperature', localVitals.temperature)).text}
              </span>
            )}
          </div>
          <div className="input-group">
            <input
              id="temperature"
              type="number"
              value={localVitals.temperature ?? ''}
              onChange={(e) => handleChange('temperature', e.target.value)}
              placeholder="98.6°F is typical"
              step="0.1"
              min="90"
              max="110"
              className="vital-input"
            />
            <span className="input-unit">°F</span>
          </div>
          {showTips.temperature && (
            <div className="vital-tip">
              <strong>Normal Range:</strong> 97-99°F. Use an oral thermometer and wait 3 minutes for accuracy.
              <br />
              <strong>Fever:</strong> Temperature above 100.4°F (38°C) can indicate infection.
            </div>
          )}
        </div>

        {/* Oxygen Saturation */}
        <div className="vital-input-group">
          <div className="vital-label-row">
            <label htmlFor="oxygenSaturation">
              💨 Oxygen Saturation (%)
              <button
                type="button"
                className="info-btn"
                onClick={() => setShowTips({ ...showTips, oxygen: !showTips.oxygen })}
              >
                ?
              </button>
            </label>
            {localVitals.oxygenSaturation !== undefined && (
              <span
                className="vital-status"
                style={{ color: getStatusLabel(getVitalStatus('oxygen_saturation', localVitals.oxygenSaturation)).color }}
              >
                {getStatusLabel(getVitalStatus('oxygen_saturation', localVitals.oxygenSaturation)).icon}
                {getStatusLabel(getVitalStatus('oxygen_saturation', localVitals.oxygenSaturation)).text}
              </span>
            )}
          </div>
          <div className="input-group">
            <input
              id="oxygenSaturation"
              type="number"
              value={localVitals.oxygenSaturation ?? ''}
              onChange={(e) => handleChange('oxygenSaturation', e.target.value)}
              placeholder="95-100% is typical"
              step="0.1"
              min="0"
              max="100"
              className="vital-input"
            />
            <span className="input-unit">%</span>
          </div>
          {showTips.oxygen && (
            <div className="vital-tip">
              <strong>Normal Range:</strong> 95-100% (measured with pulse oximeter).
              <br />
              <strong>Low Oxygen:</strong> Below 90% is concerning and needs urgent attention.
            </div>
          )}
        </div>
      </div>

      <div className="vitals-footer">
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <button className="btn btn-primary" onClick={handleNext}>
          Continue →
        </button>
      </div>
    </div>
  );
}

export default VitalInputs;
