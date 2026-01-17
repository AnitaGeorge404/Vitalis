import { createContext, useContext, useState, useEffect } from 'react'

/**
 * AuthContext - Manages authentication state across the app
 * - Provides isAuthenticated status
 * - Handles login/logout
 * - Persists auth state in localStorage
 * - Does NOT block emergency access
 */

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check for existing auth on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem('vitalis-auth')
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth)
        setIsAuthenticated(true)
        setUser(authData.user)
      } catch (error) {
        console.error('Failed to parse auth data:', error)
        localStorage.removeItem('vitalis-auth')
      }
    }
    setLoading(false)
  }, [])

  const login = (email, password) => {
    // Mock authentication - In production, this would call a real API
    // For hackathon, we accept any non-empty credentials
    if (!email || !password) {
      throw new Error('Email and password are required')
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address')
    }

    // Mock user data
    const userData = {
      id: Date.now().toString(),
      email: email,
      name: email.split('@')[0],
      createdAt: new Date().toISOString()
    }

    // Store auth state
    const authData = {
      user: userData,
      timestamp: new Date().toISOString()
    }

    localStorage.setItem('vitalis-auth', JSON.stringify(authData))
    setIsAuthenticated(true)
    setUser(userData)

    return userData
  }

  const logout = () => {
    localStorage.removeItem('vitalis-auth')
    setIsAuthenticated(false)
    setUser(null)
  }

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
