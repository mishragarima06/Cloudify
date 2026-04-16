import React, { createContext, useContext, useState } from 'react'
import axios from 'axios'

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('cf_token'))
  const [user, setUser]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('cf_user')) } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    // Check if user data exists in localStorage on app load
    const storedToken = localStorage.getItem('cf_token')
    const storedUser = localStorage.getItem('cf_user')
    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser))
        setToken(storedToken)
      } catch (e) {
        localStorage.removeItem('cf_user')
        localStorage.removeItem('cf_token')
      }
    }
    setLoading(false)
  }, [])

  axios.interceptors.request.use(cfg => {
    const t = localStorage.getItem('cf_token')
    if (t) cfg.headers.Authorization = `Bearer ${t}`
    return cfg
  })

  const login = (tok, userData) => {
    localStorage.setItem('cf_token', tok)
    localStorage.setItem('cf_user', JSON.stringify(userData))
    setToken(tok)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('cf_token')
    localStorage.removeItem('cf_user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuth: !!token, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
