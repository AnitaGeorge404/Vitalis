import { useState } from 'react'
import { Heart, FileText, MapPin, Activity, Phone, Bot, Scan, Link } from 'lucide-react'
import FeatureCard from '../components/FeatureCard'
import SafetyBanner from '../components/SafetyBanner'
import EmergencyCallButton from '../components/EmergencyCallButton'
import SmartLinkGenerator from '../emergency/SmartLinkGenerator'
import '../styles/cards.css'

/**
 * Emergency Mode Page
 * Displays all emergency-related features as compact cards
 */
function Emergency() {
  const [showSmartLinkGenerator, setShowSmartLinkGenerator] = useState(false)

  const emergencyFeatures = [
    {
      title: 'Vital Scan',
      description: 'Quick vital signs assessment using camera and sensors',
      icon: Scan,
      route: '/emergency/vital-scan'
    },
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
    },
    {
      title: 'Smart-Link (Triage Card)',
      description: 'Generate secure emergency link for hospitals',
      icon: Link,
      onClick: () => setShowSmartLinkGenerator(true),
      route: null
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
        <EmergencyCallButton emergencyNumber="7736502910" />
      </div>

      <div className="cards-grid">
        {emergencyFeatures.map((feature, index) => (
          <FeatureCard
            key={index}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
            route={feature.route}
            onClick={feature.onClick}
          />
        ))}
      </div>

      {showSmartLinkGenerator && (
        <SmartLinkGenerator onClose={() => setShowSmartLinkGenerator(false)} />
      )}
    </div>
  )
}

export default Emergency
