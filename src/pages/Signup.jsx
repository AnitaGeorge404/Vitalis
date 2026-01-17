import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AlertCircle, Heart, CheckCircle, X, ArrowRight, Eye, EyeOff } from 'lucide-react'
import './Login.css'

/**
 * Signup Page - Full Implementation
 * Create new Vitalis account with validation
 */
function Signup() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: []
  })

  // Password strength calculator
  const calculatePasswordStrength = (password) => {
    let score = 0
    const feedback = []

    if (password.length >= 8) {
      score += 1
      feedback.push({ met: true, text: 'At least 8 characters' })
    } else {
      feedback.push({ met: false, text: 'At least 8 characters' })
    }

    if (/[A-Z]/.test(password)) {
      score += 1
      feedback.push({ met: true, text: 'Contains uppercase letter' })
    } else {
      feedback.push({ met: false, text: 'Contains uppercase letter' })
    }

    if (/[a-z]/.test(password)) {
      score += 1
      feedback.push({ met: true, text: 'Contains lowercase letter' })
    } else {
      feedback.push({ met: false, text: 'Contains lowercase letter' })
    }

    if (/[0-9]/.test(password)) {
      score += 1
      feedback.push({ met: true, text: 'Contains number' })
    } else {
      feedback.push({ met: false, text: 'Contains number' })
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1
      feedback.push({ met: true, text: 'Contains special character' })
    } else {
      feedback.push({ met: false, text: 'Contains special character' })
    }

    return { score, feedback }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    
    // Clear error for this field
    setErrors({ ...errors, [name]: '' })

    // Calculate password strength in real-time
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (passwordStrength.score < 3) {
      newErrors.password = 'Password is too weak. Please strengthen it.'
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Simulate account creation (in real app, this would call backend API)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Auto-login after successful signup
      await login(formData.email, formData.password)
      
      // Redirect to home with welcome message
      navigate('/', { state: { newUser: true } })
    } catch (err) {
      setErrors({ general: err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleEmergencyAccess = () => {
    navigate('/emergency')
  }

  const getStrengthColor = () => {
    if (passwordStrength.score < 2) return '#dc2626'
    if (passwordStrength.score < 4) return '#d97706'
    return '#059669'
  }

  const getStrengthText = () => {
    if (passwordStrength.score < 2) return 'Weak'
    if (passwordStrength.score < 4) return 'Medium'
    return 'Strong'
  }

  return (
    <div className="login-container">
      <div className="login-content">
        {/* Logo/Branding */}
        <div className="login-header">
          <div className="login-logo">
            <Heart size={48} color="#10b981" />
          </div>
          <h1>Join Vitalis</h1>
          <p className="login-subtitle">Create Your Health Account</p>
        </div>

        {/* Emergency Access Banner */}
        <div className="emergency-access-banner">
          <AlertCircle size={24} color="#dc2626" />
          <div className="emergency-text">
            <strong>In an Emergency?</strong>
            <p>Skip signup and get immediate help.</p>
          </div>
          <button 
            className="emergency-access-button"
            onClick={handleEmergencyAccess}
          >
            🚨 Emergency Access
            <ArrowRight size={20} />
          </button>
        </div>

        {/* Signup Form */}
        <div className="login-card">
          <h2>Create Account</h2>
          <p className="login-card-subtitle">
            Join thousands using Vitalis for better health
          </p>

          {errors.general && (
            <div className="error-message">
              <AlertCircle size={20} />
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            {/* Name Field */}
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                autoComplete="name"
              />
              {errors.name && (
                <span className="field-error">{errors.name}</span>
              )}
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                autoComplete="email"
              />
              {errors.email && (
                <span className="field-error">{errors.email}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <span className="field-error">{errors.password}</span>
              )}
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div 
                      className="strength-fill"
                      style={{ 
                        width: `${(passwordStrength.score / 5) * 100}%`,
                        backgroundColor: getStrengthColor()
                      }}
                    ></div>
                  </div>
                  <span 
                    className="strength-text"
                    style={{ color: getStrengthColor() }}
                  >
                    {getStrengthText()}
                  </span>
                </div>
              )}

              {/* Password Requirements */}
              {formData.password && (
                <div className="password-requirements">
                  {passwordStrength.feedback.map((item, index) => (
                    <div 
                      key={index} 
                      className={`requirement ${item.met ? 'met' : 'unmet'}`}
                    >
                      {item.met ? (
                        <CheckCircle size={16} color="#059669" />
                      ) : (
                        <X size={16} color="#dc2626" />
                      )}
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="field-error">{errors.confirmPassword}</span>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <div className="password-match">
                  <CheckCircle size={16} color="#059669" />
                  <span>Passwords match</span>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <Heart size={20} />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>Already have an account? <Link to="/login">Login</Link></p>
            <p className="or-divider">or</p>
            <button 
              className="continue-without-login"
              onClick={() => navigate('/')}
            >
              Continue Without Account
            </button>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="login-benefits">
          <h3>🔒 Your Privacy Matters</h3>
          <ul style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
            <li>✅ Your health data stays private and encrypted</li>
            <li>✅ We never share your information with third parties</li>
            <li>✅ You control your data - delete anytime</li>
            <li>✅ HIPAA-compliant security standards</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Signup
