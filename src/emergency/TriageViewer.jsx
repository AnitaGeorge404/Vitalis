import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AlertCircle, Clock, User, MapPin, Activity, ArrowLeft } from 'lucide-react'
import './TriageViewer.css'

/**
 * TriageViewer - Displays triage information from generated Smart-Link
 */
function TriageViewer() {
  const { linkId } = useParams()
  const navigate = useNavigate()
  const [triageData, setTriageData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTriageData()
  }, [linkId])

  const loadTriageData = () => {
    try {
      // Retrieve data from localStorage
      const storedData = localStorage.getItem(`vitalis-link-${linkId}`)
      
      if (!storedData) {
        setError('Invalid or expired link. This Smart-Link may have been deleted or does not exist.')
        setLoading(false)
        return
      }

      const data = JSON.parse(storedData)

      // Check if link has expired
      const expirationDate = new Date(data.expiresAt)
      const now = new Date()

      if (now > expirationDate) {
        setError('This Smart-Link has expired. Links are valid for 24 hours from creation.')
        // Clean up expired link
        localStorage.removeItem(`vitalis-link-${linkId}`)
        setLoading(false)
        return
      }

      setTriageData(data)
      setLoading(false)
    } catch (err) {
      console.error('Error loading triage data:', err)
      setError('Failed to load triage information. The link may be corrupted.')
      setLoading(false)
    }
  }

  const formatDate = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeRemaining = (expiresAt) => {
    const now = new Date()
    const expiration = new Date(expiresAt)
    const diff = expiration - now
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  if (loading) {
    return (
      <div className="triage-viewer-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading triage information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="triage-viewer-container">
        <div className="error-container">
          <AlertCircle size={64} color="#ef4444" />
          <h2>Unable to Load Smart-Link</h2>
          <p>{error}</p>
          <button className="back-button" onClick={() => navigate('/emergency')}>
            <ArrowLeft size={20} />
            Return to Emergency
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="triage-viewer-container">
      <div className="triage-content">
        {/* Header */}
        <div className="triage-header">
          <button className="back-button-small" onClick={() => navigate('/emergency')}>
            <ArrowLeft size={20} />
          </button>
          <h1>🏥 Emergency Triage Information</h1>
        </div>

        {/* Triage Level Badge */}
        <div className={`triage-level-card ${triageData.triage.level.toLowerCase()}`}>
          <div className="triage-level-badge">
            {triageData.triage.level}
          </div>
          <p className="triage-explanation">{triageData.triage.explanation}</p>
        </div>

        {/* Link Info */}
        <div className="info-card">
          <h3>📋 Link Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <Clock size={20} />
              <div>
                <strong>Created:</strong>
                <span>{formatDate(triageData.createdAt)}</span>
              </div>
            </div>
            <div className="info-item">
              <Clock size={20} />
              <div>
                <strong>Expires:</strong>
                <span>{formatDate(triageData.expiresAt)} ({getTimeRemaining(triageData.expiresAt)} remaining)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Information */}
        {(triageData.patientInfo.ageGroup || triageData.patientInfo.gender) && (
          <div className="info-card">
            <h3><User size={20} /> Patient Context</h3>
            <div className="info-grid">
              {triageData.patientInfo.ageGroup && (
                <div className="info-item">
                  <strong>Age Group:</strong>
                  <span>{triageData.patientInfo.ageGroup}</span>
                </div>
              )}
              {triageData.patientInfo.gender && (
                <div className="info-item">
                  <strong>Gender:</strong>
                  <span>{triageData.patientInfo.gender}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Symptoms */}
        {triageData.symptoms && triageData.symptoms.length > 0 && (
          <div className="info-card">
            <h3><Activity size={20} /> Reported Symptoms</h3>
            <div className="symptoms-display">
              {triageData.symptoms.map((symptom, index) => (
                <div key={index} className={`symptom-badge ${symptom.severity}`}>
                  <span className="symptom-name">{symptom.name}</span>
                  <span className="symptom-severity">{symptom.severity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trauma Eye Data */}
        {triageData.traumaEyeResult && (
          <div className="info-card trauma-card">
            <h3>🔍 Trauma Assessment Data</h3>
            <div className="trauma-details">
              <div className="trauma-item">
                <strong>Injury Type:</strong>
                <span>{triageData.traumaEyeResult.injury_type}</span>
              </div>
              <div className="trauma-item">
                <strong>Severity:</strong>
                <span className={`severity-badge ${triageData.traumaEyeResult.severity}`}>
                  {triageData.traumaEyeResult.severity}
                </span>
              </div>
              <div className="trauma-item">
                <strong>Body Part:</strong>
                <span>{triageData.traumaEyeResult.body_part}</span>
              </div>
              {triageData.traumaEyeResult.notes && (
                <div className="trauma-item full-width">
                  <strong>Notes:</strong>
                  <span>{triageData.traumaEyeResult.notes}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Location Context */}
        {(triageData.location.highTraffic || triageData.location.remoteArea || triageData.location.industrialArea) && (
          <div className="info-card">
            <h3><MapPin size={20} /> Location Context</h3>
            <div className="location-tags">
              {triageData.location.highTraffic && (
                <span className="location-tag">🚦 High Traffic Area</span>
              )}
              {triageData.location.remoteArea && (
                <span className="location-tag">🏔️ Remote / Low Access Area</span>
              )}
              {triageData.location.industrialArea && (
                <span className="location-tag">🏭 Industrial Area</span>
              )}
            </div>
          </div>
        )}

        {/* Emergency Actions */}
        <div className="action-card">
          <h3>🚨 Recommended Actions</h3>
          {triageData.triage.level === 'CRITICAL' && (
            <div className="action-content critical">
              <p><strong>CALL 911 IMMEDIATELY</strong></p>
              <p>This is a life-threatening emergency requiring immediate medical intervention.</p>
              <button className="emergency-call-button" onClick={() => window.location.href = 'tel:911'}>
                📞 Call 911 Now
              </button>
            </div>
          )}
          {triageData.triage.level === 'URGENT' && (
            <div className="action-content urgent">
              <p><strong>Seek Medical Attention Soon</strong></p>
              <p>Visit an urgent care facility or emergency room within 2-4 hours.</p>
              <button className="urgent-button" onClick={() => navigate('/emergency')}>
                🏥 Find Nearest Facility
              </button>
            </div>
          )}
          {triageData.triage.level === 'MODERATE' && (
            <div className="action-content moderate">
              <p><strong>Schedule Medical Appointment</strong></p>
              <p>Consult with a healthcare provider within 24 hours.</p>
            </div>
          )}
          {triageData.triage.level === 'LOW' && (
            <div className="action-content low">
              <p><strong>Monitor and Self-Care</strong></p>
              <p>Monitor symptoms and seek medical advice if condition worsens.</p>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="disclaimer-card">
          <AlertCircle size={20} />
          <p>
            <strong>Medical Disclaimer:</strong> This triage assessment is for informational purposes only 
            and does not constitute medical advice. Always consult with qualified healthcare professionals 
            for medical emergencies and health concerns.
          </p>
        </div>
      </div>
    </div>
  )
}

export default TriageViewer
