import { useState } from 'react'
import FeatureCard from '../components/FeatureCard'
import SafetyBanner from '../components/SafetyBanner'
import PainScale from '../components/PainScale'
import FollowUpReminder from '../components/FollowUpReminder'
import SymptomHistory from '../components/SymptomHistory'
import OfflineIndicator from '../components/OfflineIndicator'
import '../styles/cards.css'

/**
 * Health Check Mode Page
 * Displays all health-related features as cards
 */
function HealthCheck() {
  const [painLevel, setPainLevel] = useState(0)
  const [currentCheck, setCurrentCheck] = useState(null)
  const healthFeatures = [
    {
      title: 'Wound Watch',
      description: 'Assess and track wound healing progress',
      icon: '🩹',
      route: '/health/wound-watch'
    },
    {
      title: 'Burn First-Aid Guide',
      description: 'Step-by-step burn treatment and assessment',
      icon: '🔥',
      route: '/health/burn-guide'
    },
    {
      title: 'Respi Track',
      description: 'Monitor respiratory and eye conditions',
      icon: '👁️',
      route: '/health/respi-track'
    },
    {
      title: '"Do I Need a Doctor?" Checklist',
      description: 'Evaluate symptoms and determine care level needed',
      icon: '🏥',
      route: '/health/doctor-checklist'
    },
    {
      title: 'Doctor-Prep Summary',
      description: 'Prepare organized health information for your visit',
      icon: '📝',
      route: '/health/doctor-prep'
    },{
      title: 'Symptom Sieve',
      description: 'Prepare organized health information for your visit',
      icon: '📝',
      route: '/health/symptom-sieve'
    }
  ]

  return (
    <div className="page-container">
      {/* Safety Disclaimer Banner */}
      <SafetyBanner variant="health" />

      <div className="page-header health-header" style={{ marginTop: '1rem' }}>
        <h1 className="page-title">🩺 Health Check Mode</h1>
        <p className="page-subtitle">
          Assess health situations and get guidance
        </p>
      </div>

      {/* Pain Assessment Tool */}
      <div style={{ marginBottom: '2rem' }}>
        <PainScale 
          value={painLevel} 
          onChange={setPainLevel}
          showDescription={true}
        />
      </div>

      {/* Follow-Up Reminder */}
      <div style={{ marginBottom: '2rem' }}>
        <FollowUpReminder />
      </div>

      {/* Symptom History Timeline */}
      <div style={{ marginBottom: '2rem' }}>
        <SymptomHistory 
          currentCheck={currentCheck}
          maxItems={10}
        />
      </div>

      <div className="cards-grid">
        {healthFeatures.map((feature, index) => (
          <FeatureCard
            key={index}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
            route={feature.route}
          />
        ))}
      </div>

      {/* Offline Indicator */}
      <OfflineIndicator 
        offlineFeatures={[
          'Pain Scale',
          'Symptom History',
          'Follow-Up Reminders',
          'Wound Watch',
          'Burn Guide'
        ]}
      />
    </div>
  )
}

export default HealthCheck
