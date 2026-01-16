import FeatureCard from '../components/FeatureCard'
import '../styles/cards.css'

/**
 * Emergency Mode Page
 * Displays all emergency-related features as cards
 */
function Emergency() {
  const emergencyFeatures = [
    {
      title: 'CPR Coach',
      description: 'Step-by-step CPR guidance with visual and audio cues',
      icon: '🫀',
      route: '/emergency/cpr'
    },
    {
      title: 'Emergency Action Cards',
      description: 'Quick reference cards for various emergency situations',
      icon: '📋',
      route: '/emergency/action-cards'
    },
    {
      title: 'AED Finder',
      description: 'Locate nearest Automated External Defibrillators',
      icon: '🏥',
      route: '/emergency/aed-finder'
    },
    {
      title: 'Trauma Track',
      description: 'Assessment and monitoring for traumatic injuries',
      icon: '🩹',
      route: '/emergency/trauma-track'
    },
    {
      title: 'Burn Help',
      description: 'Immediate burn assessment and first aid guidance',
      icon: '�',
      route: '/emergency/burn-help'
    },
    {
      title: 'Smart Emergency Contacts',
      description: 'Quick alert system for emergency contacts',
      icon: '📞',
      route: '/emergency/contacts'
    },
    {
      title: 'Emergency AI Assistant',
      description: 'Real-time emergency guidance chatbot for critical situations',
      icon: '🤖',
      route: '/emergency/chatbot'
    },
    {
      title: 'Emergency Voice Guidance',
      description: 'Hands-free voice-guided emergency assistance',
      icon: '🎤',
      route: '/emergency/voice-guidance'
    }
  ]

  return (
    <div className="page-container">
      <div className="page-header emergency-header">
        <h1 className="page-title">🚨 Emergency Mode</h1>
        <p className="page-subtitle">
          Quick access to life-saving tools and guidance
        </p>
      </div>

      <div className="cards-grid">
        {emergencyFeatures.map((feature, index) => (
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

export default Emergency
