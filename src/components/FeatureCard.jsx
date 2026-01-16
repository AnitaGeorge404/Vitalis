import { useNavigate } from 'react-router-dom'

/**
 * FeatureCard Component
 * Reusable card component for displaying features
 * 
 * @param {string} title - Feature title
 * @param {string} description - Feature description
 * @param {string} icon - Emoji or icon to display
 * @param {string} route - Route to navigate to when clicked
 */
function FeatureCard({ title, description, icon, route }) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(route)
  }

  return (
    <div className="feature-card" onClick={handleClick}>
      <div className="card-icon">{icon}</div>
      <h3 className="card-title">{title}</h3>
      <p className="card-description">{description}</p>
      <div className="card-arrow">→</div>
    </div>
  )
}

export default FeatureCard
