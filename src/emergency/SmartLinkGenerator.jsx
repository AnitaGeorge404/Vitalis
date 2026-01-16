import { useState } from 'react'
import { X, Link as LinkIcon, Copy, Check, AlertCircle } from 'lucide-react'
import './SmartLinkGenerator.css'

/**
 * SmartLinkGenerator - Modal component for generating emergency triage links
 * Can be used standalone or with pre-populated trauma eye data
 */
function SmartLinkGenerator({ onClose, traumaEyeData = null }) {
  const [patientInfo, setPatientInfo] = useState({
    ageGroup: '',
    gender: ''
  })

  const [symptoms, setSymptoms] = useState([])
  const [symptomInput, setSymptomInput] = useState({ name: '', severity: 'moderate' })

  const [location, setLocation] = useState({
    highTraffic: false,
    remoteArea: false,
    industrialArea: false
  })

  const [generatedLink, setGeneratedLink] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  const commonSymptoms = [
    'Chest Pain', 'Difficulty Breathing', 'Severe Bleeding', 'Head Injury',
    'Abdominal Pain', 'Broken Bone', 'Burns', 'Dizziness',
    'Severe Pain', 'Loss of Consciousness', 'Nausea/Vomiting'
  ]

  const addSymptom = (symptomName = null) => {
    const name = symptomName || symptomInput.name.trim()
    if (!name) return

    if (!symptoms.find(s => s.name.toLowerCase() === name.toLowerCase())) {
      setSymptoms([...symptoms, { 
        name, 
        severity: symptomInput.severity 
      }])
      setSymptomInput({ name: '', severity: 'moderate' })
    }
  }

  const removeSymptom = (index) => {
    setSymptoms(symptoms.filter((_, i) => i !== index))
  }

  const generateSmartLink = async () => {
    try {
      setLoading(true)
      setError(null)

      // Generate triage level based on symptoms and data
      const triageResult = calculateTriageLevel()

      // Generate unique link ID
      const linkId = generateLinkId()

      // Create expiration time (24 hours from now)
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24)

      // Store data in localStorage for retrieval
      const linkData = {
        symptoms,
        traumaEyeResult: traumaEyeData,
        location,
        patientInfo,
        triage: triageResult,
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString()
      }

      localStorage.setItem(`vitalis-link-${linkId}`, JSON.stringify(linkData))

      // Generate full URL
      const fullUrl = `${window.location.origin}/emergency/triage/${linkId}`

      const result = {
        linkId,
        fullUrl,
        triage: triageResult,
        expiresAt: expiresAt.toISOString()
      }

      setGeneratedLink(result)
    } catch (err) {
      setError(err.message)
      console.error('Smart-Link generation error:', err)
    } finally {
      setLoading(false)
    }
  }

  const calculateTriageLevel = () => {
    // Determine triage level based on symptoms severity
    const hasHighSeverity = symptoms.some(s => s.severity === 'high')
    const hasCriticalSymptoms = symptoms.some(s => 
      ['Chest Pain', 'Difficulty Breathing', 'Severe Bleeding', 'Loss of Consciousness', 'Head Injury'].includes(s.name)
    )
    const hasTraumaCritical = traumaEyeData?.severity === 'critical' || traumaEyeData?.severity === 'severe'

    if (hasTraumaCritical || hasCriticalSymptoms || (hasHighSeverity && symptoms.length >= 2)) {
      return {
        level: 'CRITICAL',
        explanation: '🚨 Immediate medical attention required. Call 911 or go to ER immediately.',
        color: '#dc2626'
      }
    } else if (hasHighSeverity || symptoms.length >= 3 || traumaEyeData?.severity === 'moderate') {
      return {
        level: 'URGENT',
        explanation: '⚠️ Seek medical attention within 2-4 hours. Visit urgent care or ER.',
        color: '#f59e0b'
      }
    } else if (symptoms.length >= 1) {
      return {
        level: 'MODERATE',
        explanation: '💛 Medical attention recommended within 24 hours. Schedule doctor visit.',
        color: '#eab308'
      }
    } else {
      return {
        level: 'LOW',
        explanation: '✅ Monitor symptoms. Seek medical advice if condition worsens.',
        color: '#16a34a'
      }
    }
  }

  const generateLinkId = () => {
    // Generate random 8-character alphanumeric ID
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const copyToClipboard = () => {
    if (generatedLink?.fullUrl) {
      navigator.clipboard.writeText(generatedLink.fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatExpirationTime = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="smart-link-modal-overlay" onClick={onClose}>
      <div className="smart-link-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <LinkIcon size={24} />
            <h2>Generate Smart-Link</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          {!generatedLink ? (
            <>
              {/* Trauma Eye Data Preview (if provided) */}
              {traumaEyeData && (
                <div className="trauma-preview">
                  <h3>🔍 Trauma Eye Data Included</h3>
                  <div className="trauma-preview-grid">
                    <span><strong>Injury:</strong> {traumaEyeData.injury_type}</span>
                    <span><strong>Severity:</strong> {traumaEyeData.severity}</span>
                    <span><strong>Body Part:</strong> {traumaEyeData.body_part}</span>
                  </div>
                </div>
              )}

              {/* Patient Info Section */}
              <div className="form-section">
                <h3>👤 Patient Context</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Age Group</label>
                    <select 
                      value={patientInfo.ageGroup}
                      onChange={(e) => setPatientInfo({ ...patientInfo, ageGroup: e.target.value })}
                    >
                      <option value="">Select age group</option>
                      <option value="0-17">0-17</option>
                      <option value="18-35">18-35</option>
                      <option value="36-50">36-50</option>
                      <option value="51-65">51-65</option>
                      <option value="65+">65+</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Gender (Optional)</label>
                    <select 
                      value={patientInfo.gender}
                      onChange={(e) => setPatientInfo({ ...patientInfo, gender: e.target.value })}
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Symptoms Section */}
              <div className="form-section">
                <h3>📋 Symptoms</h3>
                
                {/* Quick add common symptoms */}
                <div className="quick-symptoms">
                  {commonSymptoms.map((symptom) => (
                    <button
                      key={symptom}
                      className="quick-symptom-btn"
                      onClick={() => addSymptom(symptom)}
                      disabled={symptoms.find(s => s.name === symptom)}
                    >
                      + {symptom}
                    </button>
                  ))}
                </div>

                {/* Custom symptom input */}
                <div className="symptom-input-row">
                  <input
                    type="text"
                    placeholder="Or enter custom symptom..."
                    value={symptomInput.name}
                    onChange={(e) => setSymptomInput({ ...symptomInput, name: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && addSymptom()}
                  />
                  <select
                    value={symptomInput.severity}
                    onChange={(e) => setSymptomInput({ ...symptomInput, severity: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                  </select>
                  <button onClick={() => addSymptom()} disabled={!symptomInput.name.trim()}>
                    Add
                  </button>
                </div>

                {/* Added symptoms list */}
                {symptoms.length > 0 && (
                  <div className="symptoms-list-preview">
                    {symptoms.map((symptom, index) => (
                      <div key={index} className={`symptom-tag ${symptom.severity}`}>
                        <span>{symptom.name}</span>
                        <button onClick={() => removeSymptom(index)}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Location Section */}
              <div className="form-section">
                <h3>📍 Location Context</h3>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={location.highTraffic}
                      onChange={(e) => setLocation({ ...location, highTraffic: e.target.checked })}
                    />
                    <span>🚦 High Traffic Area</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={location.remoteArea}
                      onChange={(e) => setLocation({ ...location, remoteArea: e.target.checked })}
                    />
                    <span>🏔️ Remote / Low Access Area</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={location.industrialArea}
                      onChange={(e) => setLocation({ ...location, industrialArea: e.target.checked })}
                    />
                    <span>🏭 Industrial Area</span>
                  </label>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="error-banner">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              {/* Generate Button */}
              <button 
                className="generate-button"
                onClick={generateSmartLink}
                disabled={loading}
              >
                {loading ? 'Generating...' : '🔗 Generate Smart-Link'}
              </button>
            </>
          ) : (
            /* Generated Link Display */
            <div className="generated-link-display">
              <div className="success-icon">✅</div>
              <h3>Smart-Link Generated!</h3>
              
              <div className={`triage-badge-preview ${generatedLink.triage.level.toLowerCase()}`}>
                {generatedLink.triage.level}
              </div>
              
              <p className="triage-explanation-preview">
                {generatedLink.triage.explanation}
              </p>

              <div className="link-box">
                <input
                  type="text"
                  value={generatedLink.fullUrl}
                  readOnly
                  className="link-input"
                />
                <button 
                  className={`copy-button ${copied ? 'copied' : ''}`}
                  onClick={copyToClipboard}
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div className="link-info">
                <p>⏱️ <strong>Expires:</strong> {formatExpirationTime(generatedLink.expiresAt)}</p>
                <p>🔒 <strong>Security:</strong> Read-only, no authentication required</p>
              </div>

              <button className="new-link-button" onClick={() => setGeneratedLink(null)}>
                Generate Another Link
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SmartLinkGenerator
