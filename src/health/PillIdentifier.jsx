import { useState, useRef } from 'react'
import { Camera, Upload, X, AlertCircle, Info, Pill } from 'lucide-react'
import './PillIdentifier.css'

/**
 * Pill Identifier
 * Helps identify pills by shape, color, imprint, and image
 */
function PillIdentifier() {
  const [uploadedImage, setUploadedImage] = useState(null)
  const [formData, setFormData] = useState({
    shape: '',
    color: '',
    imprint: '',
    size: ''
  })
  const [results, setResults] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const fileInputRef = useRef(null)

  const pillShapes = [
    'Round', 'Oval', 'Capsule', 'Oblong', 'Square', 
    'Rectangle', 'Diamond', 'Pentagon', 'Hexagon', 'Triangle'
  ]

  const pillColors = [
    'White', 'Yellow', 'Orange', 'Pink', 'Red', 
    'Purple', 'Blue', 'Green', 'Brown', 'Gray', 
    'Black', 'Beige', 'Multicolor'
  ]

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadedImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const clearImage = () => {
    setUploadedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleIdentify = () => {
    setIsSearching(true)
    
    // Simulate API call to pill identification service
    setTimeout(() => {
      setResults({
        matches: [
          {
            name: 'Acetaminophen 500mg',
            brand: 'Tylenol',
            generic: 'Acetaminophen',
            imprint: 'TYLENOL 500',
            shape: formData.shape || 'Capsule',
            color: formData.color || 'White',
            uses: 'Pain relief and fever reduction',
            strength: '500mg',
            image: '/pill-sample.png'
          },
          {
            name: 'Ibuprofen 200mg',
            brand: 'Advil',
            generic: 'Ibuprofen',
            imprint: 'I-2',
            shape: formData.shape || 'Round',
            color: formData.color || 'White',
            uses: 'Pain relief, anti-inflammatory',
            strength: '200mg',
            image: '/pill-sample.png'
          }
        ],
        confidence: 'high'
      })
      setIsSearching(false)
    }, 2000)
  }

  const resetSearch = () => {
    setFormData({
      shape: '',
      color: '',
      imprint: '',
      size: ''
    })
    setUploadedImage(null)
    setResults(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="pill-identifier-container">
      <div className="pill-header">
        <div className="header-icon">
          <Pill size={40} />
        </div>
        <div>
          <h1>💊 Pill Identifier</h1>
          <p className="subtitle">Identify pills by appearance, imprint, or photo</p>
        </div>
      </div>

      <div className="disclaimer-box">
        <AlertCircle size={20} />
        <div>
          <strong>Important:</strong> This tool provides general information only. 
          Always consult a healthcare professional or pharmacist for medication advice. 
          If you're unsure about any medication, contact your doctor or local pharmacy.
        </div>
      </div>

      <div className="pill-content">
        {/* Image Upload Section */}
        <div className="upload-section">
          <h2>📸 Upload Pill Image (Optional)</h2>
          <p className="section-subtitle">Take a clear photo of the pill for better identification</p>
          
          <div className="upload-area">
            {uploadedImage ? (
              <div className="image-preview">
                <img src={uploadedImage} alt="Uploaded pill" />
                <button className="remove-image-btn" onClick={clearImage}>
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="upload-placeholder" onClick={() => fileInputRef.current?.click()}>
                <Camera size={48} />
                <p>Click to upload or take photo</p>
                <span className="upload-hint">Supports: JPG, PNG, HEIC</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </div>

          {!uploadedImage && (
            <button className="upload-btn" onClick={() => fileInputRef.current?.click()}>
              <Upload size={20} />
              Choose File
            </button>
          )}
        </div>

        {/* Manual Input Section */}
        <div className="manual-input-section">
          <h2>🔍 Pill Characteristics</h2>
          <p className="section-subtitle">Enter details visible on the pill</p>

          <div className="input-grid">
            <div className="input-group">
              <label>Shape</label>
              <select 
                value={formData.shape}
                onChange={(e) => handleInputChange('shape', e.target.value)}
              >
                <option value="">Select shape</option>
                {pillShapes.map(shape => (
                  <option key={shape} value={shape}>{shape}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Color</label>
              <select 
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
              >
                <option value="">Select color</option>
                {pillColors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>

            <div className="input-group full-width">
              <label>Imprint/Text on Pill</label>
              <input
                type="text"
                placeholder="e.g., 'TYLENOL 500' or 'L544'"
                value={formData.imprint}
                onChange={(e) => handleInputChange('imprint', e.target.value)}
              />
              <span className="input-hint">Any letters, numbers, or symbols on the pill</span>
            </div>

            <div className="input-group">
              <label>Approximate Size</label>
              <select 
                value={formData.size}
                onChange={(e) => handleInputChange('size', e.target.value)}
              >
                <option value="">Select size</option>
                <option value="tiny">Tiny (3-5mm)</option>
                <option value="small">Small (5-8mm)</option>
                <option value="medium">Medium (8-12mm)</option>
                <option value="large">Large (12-18mm)</option>
                <option value="xlarge">Extra Large (18mm+)</option>
              </select>
            </div>
          </div>

          <div className="action-buttons">
            <button 
              className="identify-btn" 
              onClick={handleIdentify}
              disabled={isSearching || (!uploadedImage && !formData.shape && !formData.color && !formData.imprint)}
            >
              {isSearching ? (
                <>
                  <div className="spinner-small"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Pill size={20} />
                  Identify Pill
                </>
              )}
            </button>
            <button className="reset-btn" onClick={resetSearch}>
              Clear All
            </button>
          </div>
        </div>

        {/* Results Section */}
        {results && (
          <div className="results-section">
            <h2>🎯 Possible Matches</h2>
            <div className="confidence-badge">
              Confidence: <span className={`confidence-${results.confidence}`}>
                {results.confidence.toUpperCase()}
              </span>
            </div>

            <div className="results-grid">
              {results.matches.map((match, index) => (
                <div key={index} className="result-card">
                  <div className="result-header">
                    <div className="pill-visual">
                      <div className={`pill-icon ${match.color.toLowerCase()}`}>
                        <Pill size={32} />
                      </div>
                    </div>
                    <div>
                      <h3>{match.brand}</h3>
                      <p className="generic-name">{match.generic}</p>
                    </div>
                  </div>

                  <div className="result-details">
                    <div className="detail-row">
                      <span className="label">Strength:</span>
                      <span className="value">{match.strength}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Shape:</span>
                      <span className="value">{match.shape}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Color:</span>
                      <span className="value">{match.color}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Imprint:</span>
                      <span className="value">{match.imprint}</span>
                    </div>
                  </div>

                  <div className="usage-info">
                    <Info size={16} />
                    <strong>Common Uses:</strong> {match.uses}
                  </div>

                  <div className="result-actions">
                    <button className="detail-btn">View Full Details</button>
                    <button className="save-btn">Save Result</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="results-disclaimer">
              <AlertCircle size={18} />
              <p>
                <strong>Verification Required:</strong> These are possible matches based on visual characteristics. 
                Always verify with a pharmacist or the medication label. Never take medication without proper identification.
              </p>
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className="tips-section">
          <h3>💡 Tips for Better Identification</h3>
          <ul>
            <li>✓ Take photo in good lighting against a plain background</li>
            <li>✓ Include any visible text, numbers, or logos on the pill</li>
            <li>✓ Note the pill's shape, color, and approximate size</li>
            <li>✓ Check both sides of the pill if there's different imprints</li>
            <li>✓ If split/broken, note the original shape before breaking</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default PillIdentifier
