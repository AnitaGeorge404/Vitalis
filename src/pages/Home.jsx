import { useNavigate } from 'react-router-dom'
import '../styles/home.css'

/**
 * Home Page
 * Landing page with two main options: Emergency Mode and Health Check Mode
 */
function Home() {
  const navigate = useNavigate()

  return (
    <div className="home-container">
      <div className="home-header">
        <h1 className="home-title">Welcome to Vitalis</h1>
        <p className="home-subtitle">Your Emergency & Health Assistant</p>
      </div>

      <div className="mode-selector">
        <div 
          className="mode-card emergency-mode"
          onClick={() => navigate('/emergency')}
        >
          <div className="mode-icon">🚨</div>
          <h2 className="mode-title">Emergency Mode</h2>
          <p className="mode-description">
            Quick access to life-saving guidance and emergency tools
          </p>
          <button className="mode-button emergency-button">
            Access Emergency Tools →
          </button>
        </div>

        <div 
          className="mode-card health-mode"
          onClick={() => navigate('/health')}
        >
          <div className="mode-icon">🩺</div>
          <h2 className="mode-title">Health Check Mode</h2>
          <p className="mode-description">
            Assess injuries and get health guidance for common situations
          </p>
          <button className="mode-button health-button">
            Start Health Check →
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home
