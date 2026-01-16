import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { User, MapPin, Activity, AlertTriangle, Clock } from 'lucide-react'
import './TriageCard.css'

/**
 * TriageCardView - Public read-only view of emergency triage information
 * Accessible via /triage/:token without authentication
 */
function TriageCardView() {
  const { token } = useParams()
  const [triageData, setTriageData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTriageData()
  }, [token])

  const fetchTriageData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5000/api/triage/${token}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to load triage card')
      }

      const result = await response.json()
      setTriageData(result.data)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Triage fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatTimestamp = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getLocationFlags = (location) => {
    const flags = []
    if (location.highTraffic) flags.push({ type: 'high-traffic', label: '🚦 High Traffic Area', icon: '🚦' })
    if (location.remoteArea) flags.push({ type: 'remote', label: '🏔️ Remote Location', icon: '🏔️' })
    if (location.industrialArea) flags.push({ type: 'industrial', label: '🏭 Industrial Area', icon: '🏭' })
    if (flags.length === 0) flags.push({ type: 'unknown', label: '📍 Location Unknown', icon: '📍' })
    return flags
  }

  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>⚠️ Unable to Load Triage Card</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  const { triage, symptoms, traumaEyeResult, location, patientInfo, createdAt } = triageData

  return (
    <div className="triage-card-container">
      <div className="triage-card">
        {/* Header */}
        <div className="triage-header">
          <h1>Emergency Triage Card</h1>
          <p className="subtitle">Digital Pre-Arrival Assessment</p>
          
          <div className={`triage-badge ${triage.level.toLowerCase()}`}>
            {triage.level}
          </div>
          
          <div className="triage-explanation">
            {triage.explanation}
          </div>
        </div>

        {/* Content */}
        <div className="triage-content">
          {/* Patient Info Section */}
          {patientInfo && (patientInfo.ageGroup || patientInfo.gender) && (
            <div className="triage-section">
              <h2>
                <User size={24} />
                Patient Context
              </h2>
              <div className="patient-info-grid">
                {patientInfo.ageGroup && (
                  <div className="info-item">
                    <div className="label">Age Group</div>
                    <div className="value">{patientInfo.ageGroup}</div>
                  </div>
                )}
                {patientInfo.gender && (
                  <div className="info-item">
                    <div className="label">Gender</div>
                    <div className="value">{patientInfo.gender}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Location Section */}
          {location && (
            <div className="triage-section">
              <h2>
                <MapPin size={24} />
                Location Context
              </h2>
              <div className="location-flags">
                {getLocationFlags(location).map((flag, index) => (
                  <div key={index} className={`location-flag ${flag.type}`}>
                    <span>{flag.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Symptoms Section */}
          {symptoms && symptoms.length > 0 && (
            <div className="triage-section">
              <h2>
                <Activity size={24} />
                Reported Symptoms
              </h2>
              <div className="symptoms-list">
                {symptoms.map((symptom, index) => (
                  <div key={index} className={`symptom-item ${symptom.severity}`}>
                    <span className="symptom-name">{symptom.name}</span>
                    <span className={`symptom-severity ${symptom.severity}`}>
                      {symptom.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trauma Eye Results Section */}
          {traumaEyeResult && (
            <div className="triage-section">
              <h2>
                <AlertTriangle size={24} />
                Injury Assessment (Trauma Eye)
              </h2>
              <div className="trauma-summary">
                <div className="trauma-detail">
                  <div className="label">Injury Type</div>
                  <div className="value">{traumaEyeResult.injury_type || 'N/A'}</div>
                </div>
                <div className="trauma-detail">
                  <div className="label">Body Part</div>
                  <div className="value">{traumaEyeResult.body_part || 'N/A'}</div>
                </div>
                <div className="trauma-detail">
                  <div className="label">Severity</div>
                  <div className="value">{traumaEyeResult.severity || 'N/A'}</div>
                </div>
                {traumaEyeResult.confidence && (
                  <div className="trauma-detail">
                    <div className="label">Confidence</div>
                    <div className="value">{traumaEyeResult.confidence}%</div>
                    <div className="confidence-bar">
                      <div 
                        className="confidence-fill" 
                        style={{ width: `${traumaEyeResult.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timestamp Section */}
          <div className="triage-section">
            <div className="timestamp">
              <Clock size={18} />
              <span>Generated: {formatTimestamp(createdAt)}</span>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="disclaimer">
            <div className="disclaimer-icon">⚕️</div>
            <p>
              <strong>Medical Disclaimer</strong>
              This is decision support information only — not a medical diagnosis. 
              All medical decisions should be made by qualified healthcare professionals 
              based on complete clinical assessment.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TriageCardView
