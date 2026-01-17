import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AlertCircle, Heart, LogIn, ArrowRight } from 'lucide-react'
import './Login.css'

/**
 * Login Page - Professional authentication with emergency bypass
 * CRITICAL: Does NOT block emergency access
 */
function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Get the page user was trying to access
  const from = location.state?.from || '/'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('') // Clear error on input
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(formData.email, formData.password)
      // Redirect to original destination or home
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEmergencyAccess = () => {
    // Direct navigation to emergency mode - NO AUTH REQUIRED
    navigate('/emergency')
  }

  return (
    <div className="login-container">
      <div className="login-content">
        {/* Logo/Branding */}
        <div className="login-header">
          <div className="login-logo">
            <Heart size={48} color="#10b981" />
          </div>
          <h1>Welcome to Vitalis</h1>
          <p className="login-subtitle">Your AI-Powered Health Companion</p>
        </div>

        {/* Emergency Access Banner - ALWAYS VISIBLE */}
        <div className="emergency-access-banner">
          <AlertCircle size={24} color="#dc2626" />
          <div className="emergency-text">
            <strong>In an Emergency?</strong>
            <p>No login required. Get immediate help now.</p>
          </div>
          <button 
            className="emergency-access-button"
            onClick={handleEmergencyAccess}
          >
            🚨 Emergency Access
            <ArrowRight size={20} />
          </button>
        </div>

        {/* Login Form */}
        <div className="login-card">
          <h2>Login to Your Account</h2>
          <p className="login-card-subtitle">
            Login helps personalize your experience and save your health data
          </p>

          {/* Show message if redirected from protected route */}
          {from !== '/' && (
            <div className="info-message">
              <AlertCircle size={20} />
              <span>Please login to access Health Check features</span>
            </div>
          )}

          {error && (
            <div className="error-message">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Login
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>Don't have an account? <Link to="/signup">Create one</Link></p>
            <p className="or-divider">or</p>
            <button 
              className="continue-without-login"
              onClick={() => navigate('/')}
            >
              Continue Without Login
            </button>
          </div>
        </div>

        {/* Benefits of Login */}
        <div className="login-benefits">
          <h3>Why Login?</h3>
          <ul>
            <li>✅ Save your health history and vitals</li>
            <li>✅ Track medications and prescriptions</li>
            <li>✅ Store emergency contacts securely</li>
            <li>✅ Access data across devices</li>
            <li>✅ Personalized health recommendations</li>
          </ul>
          <p className="benefits-note">
            <strong>Note:</strong> All emergency features work without login
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
