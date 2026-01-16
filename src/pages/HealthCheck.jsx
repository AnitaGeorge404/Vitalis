import FeatureCard from '../components/FeatureCard'
import '../styles/cards.css'

/**
 * Health Check Mode Page
 * Displays all health-related features as cards
 */
function HealthCheck() {
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
      <div className="page-header health-header">
        <h1 className="page-title">🩺 Health Check Mode</h1>
        <p className="page-subtitle">
          Assess health situations and get guidance
        </p>
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
