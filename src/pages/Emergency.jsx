import { Heart, FileText, MapPin, Activity, Phone, Bot } from 'lucide-react'
import FeatureCard from '../components/FeatureCard'
import SafetyBanner from '../components/SafetyBanner'
import EmergencyCallButton from '../components/EmergencyCallButton'
import EmergencyNotes from '../components/EmergencyNotes'
import '../styles/cards.css'

/**
 * Emergency Mode Page
 * Displays all emergency-related features as compact cards
 */
function Emergency() {
  const emergencyFeatures = [
    {
      title: 'CPR Coach',
      description: 'Step-by-step CPR guidance with visual and audio cues',
      icon: Heart,
      route: '/emergency/cpr'
    },
    {
      title: 'Emergency Action Cards',
      description: 'Quick reference cards for various emergency situations',
      icon: FileText,
      route: '/emergency/action-cards'
    },
    {
      title: 'Resource Locator',
      description: 'Find nearby AEDs and emergency facilities',
      icon: MapPin,
      route: '/emergency/aed-finder'
    },
    {
      title: 'Trauma Eye',
      description: 'Assessment and monitoring for traumatic injuries',
      icon: Activity,
      route: '/emergency/trauma-track'
    },
    {
      title: 'Smart Emergency Contacts',
      description: 'Quick alert system for emergency contacts',
      icon: Phone,
      route: '/emergency/contacts'
    },
    {
      title: 'Emergency AI Assistant',
      description: 'Real-time emergency guidance chatbot for critical situations',
      icon: Bot,
      route: '/emergency/chatbot'
    }
  ]

  return (
    <div className="page-container">
      <SafetyBanner variant="emergency" />

      <div className="page-header emergency-header compact-header">
        <h1 className="page-title">Emergency Mode</h1>
        <p className="page-subtitle">
          Quick access to life-saving tools and guidance
        </p>
      </div>

      <div className="compact-section">
        <EmergencyCallButton emergencyNumber="911" />
      </div>

      <div className="compact-section">
        <EmergencyNotes sessionId="emergency_main" />
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
