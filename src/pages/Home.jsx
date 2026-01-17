import { useNavigate } from 'react-router-dom'
import { AlertCircle, Heart, ChevronRight, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import '../styles/home.css'

/**
 * Home Page
 * Landing page with two main options: Emergency Mode and Health Check Mode
 */
function Home() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()

  const handleHealthClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/health' } })
    } else {
      navigate('/health')
    }
  }

  return (
    <div className="home-container">
      <div className="home-header">
        <h1 className="home-title">
          {isAuthenticated ? `Welcome back, ${user?.name?.split(' ')[0] || 'User'}!` : 'Welcome to Vitalis'}
        </h1>
        <p className="home-subtitle">Your Emergency & Health Assistant</p>
      </div>

      <div className="mode-selector">
        <div 
          className="mode-card emergency-mode"
          onClick={() => navigate('/emergency')}
        >
          <div className="mode-icon">
            <AlertCircle size={48} strokeWidth={1.5} />
          </div>
          <h2 className="mode-title">Emergency Mode</h2>
          <p className="mode-description">
            Quick access to life-saving guidance and emergency tools
          </p>
          <div className="mode-badge public-badge">🌍 No Login Required</div>
          <button className="mode-button emergency-button">
            Access Emergency Tools <ChevronRight size={18} />
          </button>
        </div>

        <div 
          className="mode-card health-mode"
          onClick={handleHealthClick}
        >
          <div className="mode-icon">
            <Heart size={48} strokeWidth={1.5} />
          </div>
          <h2 className="mode-title">Health Check Mode</h2>
          <p className="mode-description">
            Assess injuries and get health guidance for common situations
          </p>
          {!isAuthenticated && (
            <div className="mode-badge login-badge">
              <Lock size={14} /> Login Required
            </div>
          )}
          {isAuthenticated && (
            <div className="mode-badge authenticated-badge">✓ Logged In</div>
          )}
          <button className="mode-button health-button">
            Start Health Check <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home
