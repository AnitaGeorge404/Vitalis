import { useState } from 'react'
import { Bandage, Flame, Eye, Hospital, FileText } from 'lucide-react'
import FeatureCard from '../components/FeatureCard'
import SafetyBanner from '../components/SafetyBanner'
import SymptomHistory from '../components/SymptomHistory'
import '../styles/cards.css'

/**
 * Health Check Mode Page
 * Displays all health-related features as cards
 */
function HealthCheck() {
  const [currentCheck, setCurrentCheck] = useState(null)
  const healthFeatures = [
    {
      title: 'Wound Watch',
      description: 'Assess and track wound healing progress',
      icon: Bandage,
      route: '/health/wound-watch'
    },
    {
      title: 'Burn First-Aid Guide',
      description: 'Step-by-step burn treatment and assessment',
      icon: Flame,
      route: '/health/burn-guide'
    },
    {
      title: 'Respi Track',
      description: 'Monitor respiratory and eye conditions',
      icon: Eye,
      route: '/health/respi-track'
    },
    {
      title: 'Do I Need a Doctor? Checklist',
      description: 'Evaluate symptoms and determine care level needed',
      icon: Hospital,
      route: '/health/doctor-checklist'
    },
    {
      title: 'Symptom Sieve',
      description: 'Prepare organized health information for your visit',
      icon: FileText,
      route: '/health/symptom-sieve'
    }
  ]

  return (
    <div className="page-container">
      <SafetyBanner variant="health" />

      <div className="page-header health-header" style={{ marginTop: '1rem' }}>
        <h1 className="page-title">Health Check Mode</h1>
        <p className="page-subtitle">
          Assess health situations and get guidance
        </p>
      </div>

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
    </div>
  )
}

export default HealthCheck
