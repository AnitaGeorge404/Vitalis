/**
 * EXAMPLE: Enhanced Health Check Page
 * 
 * Shows how to integrate health-focused features
 */

import { useState } from 'react';
import SafetyBanner from '../components/SafetyBanner';
import PainScale from '../components/PainScale';
import ConfidenceMeter from '../components/ConfidenceMeter';
import SymptomHistory from '../components/SymptomHistory';
import FollowUpReminder from '../components/FollowUpReminder';
import InfoButton from '../components/InfoButton';
import OfflineIndicator from '../components/OfflineIndicator';

function EnhancedHealthCheck() {
  const [painLevel, setPainLevel] = useState(0);
  const [symptoms, setSymptoms] = useState([]);
  const [currentCheck, setCurrentCheck] = useState(null);

  // Simple rule-based assessment
  const getAssessmentLevel = () => {
    if (painLevel >= 7 || symptoms.includes('chest pain')) return 'high';
    if (painLevel >= 4 || symptoms.length >= 3) return 'medium';
    return 'low';
  };

  const getFactors = () => {
    const factors = [];
    if (painLevel > 0) factors.push(`Pain level: ${painLevel}/10`);
    if (symptoms.length > 0) factors.push(`${symptoms.length} symptom${symptoms.length > 1 ? 's' : ''} reported`);
    return factors;
  };

  const handleSubmitCheck = () => {
    const check = {
      symptoms: symptoms,
      painLevel: painLevel,
      severity: getAssessmentLevel(),
      notes: 'Health check completed',
      timestamp: new Date().toISOString()
    };
    setCurrentCheck(check);
  };

  return (
    <div className="page-container">
      <SafetyBanner variant="health" />

      <div className="page-header health-header" style={{ marginTop: '1rem' }}>
        <h1 className="page-title">🩺 Health Check</h1>
        <p className="page-subtitle">
          Assess your symptoms and get guidance
        </p>
      </div>

      {/* Pain assessment */}
      <div style={{ marginBottom: '1.5rem' }}>
        <PainScale 
          value={painLevel} 
          onChange={setPainLevel}
          showDescription={true}
        />
      </div>

      {/* Educational info */}
      <div style={{ marginBottom: '1.5rem' }}>
        <InfoButton 
          title="Why We Track Pain"
          content={
            <>
              <p>Pain level helps healthcare providers understand:</p>
              <ul>
                <li>Severity of your condition</li>
                <li>Whether treatment is working</li>
                <li>When immediate care is needed</li>
              </ul>
              <p><strong>Pain ≥7:</strong> Consider seeking medical attention</p>
            </>
          }
        />
      </div>

      {/* Assessment result */}
      {(painLevel > 0 || symptoms.length > 0) && (
        <div style={{ marginBottom: '1.5rem' }}>
          <ConfidenceMeter 
            level={getAssessmentLevel()}
            factors={getFactors()}
          />
        </div>
      )}

      {/* Follow-up reminder */}
      <div style={{ marginBottom: '1.5rem' }}>
        <FollowUpReminder 
          onReminderSet={(data) => console.log('Reminder set:', data)}
        />
      </div>

      {/* Symptom history timeline */}
      <div style={{ marginBottom: '1.5rem' }}>
        <SymptomHistory 
          currentCheck={currentCheck}
          maxItems={10}
        />
      </div>

      {/* Submit button (example) */}
      <button 
        onClick={handleSubmitCheck}
        style={{
          padding: '1rem 2rem',
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: '700',
          cursor: 'pointer',
          width: '100%'
        }}
      >
        Save Health Check
      </button>

      <OfflineIndicator 
        offlineFeatures={[
          'Pain Scale',
          'Symptom History',
          'Follow-Up Reminders',
          'Health Notes'
        ]}
      />
    </div>
  );
}

export default EnhancedHealthCheck;
