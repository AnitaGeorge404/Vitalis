import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

/**
 * FeatureCard Component
 * Reusable card component for displaying features
 * 
 * @param {string} title - Feature title
 * @param {string} description - Feature description
 * @param {Component} icon - Lucide React icon component
 * @param {string} route - Route to navigate to when clicked
 */
function FeatureCard({ title, description, icon: Icon, route }) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(route)
  }

  return (
    <div className="feature-card" onClick={handleClick}>
      <div className="card-icon">
        {Icon && <Icon size={32} strokeWidth={1.5} />}
      </div>
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-description">{description}</p>
      </div>
      <div className="card-arrow">
        <ChevronRight size={20} />
      </div>
    </div>
  )
}

export default FeatureCard
