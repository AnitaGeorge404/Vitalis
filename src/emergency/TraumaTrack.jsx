import { useState, useRef } from 'react'
import { Camera, Upload, AlertCircle, CheckCircle, XCircle, Phone, Link } from 'lucide-react'
import SmartLinkGenerator from './SmartLinkGenerator'
import './TraumaTrack.css'

function TraumaTrack() {
  const [capturedImage, setCapturedImage] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [error, setError] = useState(null)
  const [showSmartLinkGenerator, setShowSmartLinkGenerator] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = (file) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, etc.)')
      return
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setError('Image file is too large. Please select an image under 10MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setCapturedImage(e.target.result)
      setError(null)
      setAnalysisResult(null)
    }
    reader.onerror = () => {
      setError('Failed to read image file. Please try again.')
    }
    reader.readAsDataURL(file)
  }

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const analyzeWound = async () => {
    if (!capturedImage) return

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:5000/api/analyze-wound', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: capturedImage,
        }),
      })

      const result = await response.json()

      if (result.error) {
        setError(result.message || 'Analysis failed')
        setAnalysisResult(null)
      } else {
        setAnalysisResult(result)
      }
    } catch (err) {
      console.error('Analysis error:', err)
      setError('Failed to analyze wound. Please check your connection and try again.')
      setAnalysisResult(null)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleRetake = () => {
    setCapturedImage(null)
    setAnalysisResult(null)
    setError(null)
  }

  const handleEmergencyCall = () => {
    window.location.href = 'tel:911'
  }

  const getRiskColor = (risk) => {
    switch (risk?.toUpperCase()) {
      case 'CRITICAL':
        return '#dc2626'
      case 'HIGH':
        return '#ea580c'
      case 'MODERATE':
        return '#f59e0b'
      case 'LOW':
        return '#10b981'
      default:
        return '#6b7280'
    }
  }

  const getRiskIcon = (risk) => {
    switch (risk?.toUpperCase()) {
      case 'CRITICAL':
      case 'HIGH':
        return <XCircle size={24} />
      case 'MODERATE':
        return <AlertCircle size={24} />
      case 'LOW':
        return <CheckCircle size={24} />
      default:
        return <AlertCircle size={24} />
    }
  }

  return (
    <div className="trauma-track-container">
      <div className="trauma-header">
        <h1>Trauma Eye - Wound Analysis System</h1>
        <p>Emergency wound assessment and monitoring</p>
      </div>

      {!capturedImage ? (
        <div className="capture-section">
          <h2>Capture or Upload Wound Image</h2>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />

          <div className="upload-area">
            <Camera size={48} />
            <p>Take a photo or upload an image</p>
            <div className="button-group">
              <button 
                onClick={() => {
                  fileInputRef.current?.setAttribute('capture', 'environment')
                  openFileDialog()
                }}
                className="btn btn-primary"
              >
                <Camera size={20} />
                Take Photo
              </button>
              <button onClick={openFileDialog} className="btn btn-secondary">
                <Upload size={20} />
                Upload Image
              </button>
            </div>
          </div>

          <div className="info-box">
            <AlertCircle size={20} />
            <div>
              <strong>Important:</strong>
              <ul>
                <li>Ensure good lighting for accurate analysis</li>
                <li>Keep camera steady and focused</li>
                <li>Image should clearly show the wound</li>
                <li>For severe injuries, call 911 immediately</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="analysis-section">
          <div className="image-preview">
            <img src={capturedImage} alt="Captured wound" />
          </div>

          {!analysisResult && !isAnalyzing && (
            <div className="action-buttons">
              <button onClick={analyzeWound} className="btn btn-primary btn-large">
                Analyze Wound
              </button>
              <button onClick={handleRetake} className="btn btn-secondary">
                Retake Photo
              </button>
            </div>
          )}

          {isAnalyzing && (
            <div className="analyzing-indicator">
              <div className="spinner"></div>
              <p>Analyzing wound... Please wait</p>
            </div>
          )}

          {error && (
            <div className="error-box">
              <XCircle size={20} />
              <p>{error}</p>
            </div>
          )}

          {analysisResult && (
            <div className="results-container">
              <div 
                className="risk-badge" 
                style={{ backgroundColor: getRiskColor(analysisResult.risk) }}
              >
                {getRiskIcon(analysisResult.risk)}
                <span>Risk Level: {analysisResult.risk || 'Unknown'}</span>
              </div>

              {analysisResult.requires_immediate_care && (
                <div className="emergency-alert">
                  <AlertCircle size={24} />
                  <div>
                    <strong>Immediate Medical Attention Required</strong>
                    <p>This wound requires professional medical care</p>
                    <button onClick={handleEmergencyCall} className="btn btn-emergency">
                      <Phone size={20} />
                      Call 911
                    </button>
                  </div>
                </div>
              )}

              <div className="analysis-details">
                <h3>Analysis Details</h3>
                
                {analysisResult.wound_characteristics && (
                  <div className="detail-section">
                    <h4>Wound Characteristics</h4>
                    <ul>
                      {Object.entries(analysisResult.wound_characteristics).map(([key, value]) => (
                        <li key={key}>
                          <strong>{key.replace(/_/g, ' ')}:</strong> {value}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysisResult.treatment_recommendations && (
                  <div className="detail-section">
                    <h4>Treatment Recommendations</h4>
                    <ol>
                      {analysisResult.treatment_recommendations.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {analysisResult.warning_signs && (
                  <div className="detail-section warning-signs">
                    <h4>Warning Signs to Watch For</h4>
                    <ul>
                      {analysisResult.warning_signs.map((sign, index) => (
                        <li key={index}>
                          <AlertCircle size={16} />
                          {sign}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="action-buttons">
                <button onClick={handleRetake} className="btn btn-secondary">
                  Analyze Another Wound
                </button>
                {(analysisResult.risk === 'MODERATE' || analysisResult.risk === 'HIGH' || analysisResult.risk === 'CRITICAL') && (
                  <button 
                    onClick={() => setShowSmartLinkGenerator(true)} 
                    className="btn btn-primary"
                    style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                  >
                    <Link size={20} />
                    Generate Smart-Link for Hospital
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="disclaimer">
        <AlertCircle size={16} />
        <p>
          <strong>Medical Disclaimer:</strong> This tool provides general wound assessment guidance only.
          It is NOT a substitute for professional medical diagnosis or treatment.
          Always seek immediate medical attention for serious injuries.
        </p>
      </div>

      {showSmartLinkGenerator && (
        <SmartLinkGenerator 
          onClose={() => setShowSmartLinkGenerator(false)}
          traumaEyeData={analysisResult ? {
            injury_type: analysisResult.wound_characteristics?.type || 'Injury',
            body_part: analysisResult.wound_characteristics?.location || 'Unknown',
            severity: analysisResult.risk || 'Unknown',
            confidence: analysisResult.confidence || 75
          } : null}
        />
      )}
    </div>
  )
}

export default TraumaTrack
