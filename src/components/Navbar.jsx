import { Link, useLocation } from 'react-router-dom'

/**
 * Navbar Component
 * Provides navigation across the app with active route highlighting
 */
function Navbar() {
  const location = useLocation()
  
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <span className="brand-icon">🏥</span>
          Vitalis
        </Link>
        
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/emergency" 
            className={`nav-link ${location.pathname.startsWith('/emergency') ? 'active' : ''}`}
          >
            🚨 Emergency
          </Link>
          <Link 
            to="/health" 
            className={`nav-link ${location.pathname.startsWith('/health') ? 'active' : ''}`}
          >
            🩺 Health Check
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
