import { Link, useLocation } from 'react-router-dom'
import { Home, AlertCircle, Heart, Activity } from 'lucide-react'

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
          <Activity size={24} strokeWidth={2} />
          Vitalis
        </Link>
        
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            <Home size={18} />
            Home
          </Link>
          <Link 
            to="/emergency" 
            className={`nav-link ${location.pathname.startsWith('/emergency') ? 'active' : ''}`}
          >
            <AlertCircle size={18} />
            Emergency
          </Link>
          <Link 
            to="/health" 
            className={`nav-link ${location.pathname.startsWith('/health') ? 'active' : ''}`}
          >
            <Heart size={18} />
            Health Check
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
