import Navbar from './Navbar'

/**
 * Layout Component
 * Wraps all pages with a consistent navbar and container
 */
function Layout({ children }) {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

export default Layout
