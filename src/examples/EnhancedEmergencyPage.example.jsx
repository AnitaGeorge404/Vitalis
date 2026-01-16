/**
 * EXAMPLE: Enhanced Emergency Page
 * 
 * Shows how to add value-adding features to the Emergency mode landing page
 */

import { useState } from 'react';
import FeatureCard from '../components/FeatureCard';
import EmergencyCallButton from '../components/EmergencyCallButton';
import EmergencyNotes from '../components/EmergencyNotes';
import SafetyBanner from '../components/SafetyBanner';
import OfflineIndicator from '../components/OfflineIndicator';
import '../styles/cards.css';

function EnhancedEmergencyPage() {
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
      icon: '🔥',
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
      description: 'Real-time emergency guidance chatbot',
      icon: '🤖',
      route: '/emergency/chatbot'
    },
    {
      title: 'Emergency Voice Guidance',
      description: 'Hands-free voice-guided emergency assistance',
      icon: '🎤',
      route: '/emergency/voice-guidance'
    }
  ];

  return (
    <div className="page-container">
      {/* Emergency banner */}
      <SafetyBanner variant="emergency" />

      <div className="page-header emergency-header" style={{ marginTop: '1rem' }}>
        <h1 className="page-title">🚨 Emergency Mode</h1>
        <p className="page-subtitle">
          Quick access to life-saving tools and guidance
        </p>
      </div>

      {/* One-tap emergency call section */}
      <div style={{ marginBottom: '2rem' }}>
        <EmergencyCallButton emergencyNumber="911" />
      </div>

      {/* Emergency notes accessible from landing page */}
      <div style={{ marginBottom: '2rem' }}>
        <EmergencyNotes sessionId="emergency_main" />
      </div>

      {/* Feature cards grid */}
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

      {/* Offline indicator */}
      <OfflineIndicator 
        offlineFeatures={[
          'CPR Coach',
          'Emergency Timer',
          'Emergency Notes',
          'Burn Help',
          'Trauma Track'
        ]}
      />
    </div>
  );
}

export default EnhancedEmergencyPage;
