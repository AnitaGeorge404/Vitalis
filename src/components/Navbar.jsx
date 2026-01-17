import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, AlertCircle, Heart, Activity, User, LogOut, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

/**
 * Navbar Component
 * Provides navigation across the app with active route highlighting
 */
function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLogout = () => {
    logout()
    setShowDropdown(false)
    navigate('/')
  }
  
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

          {/* Auth Section */}
          {isAuthenticated ? (
            <div className="user-menu">
              <button 
                className="user-button"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <User size={18} />
                {user?.name || 'User'}
              </button>
              {showDropdown && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <p className="user-email">{user?.email}</p>
                  </div>
                  <button onClick={handleLogout} className="dropdown-item logout-item">
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="nav-link login-link">
              <LogIn size={18} />
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
