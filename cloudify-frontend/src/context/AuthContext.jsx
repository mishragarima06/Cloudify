import React, { createContext, useContext, useState } from 'react'
import axios from 'axios'

axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('cf_token'))
  const [user, setUser]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('cf_user')) } catch { return null }
  })

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
    <AuthContext.Provider value={{ token, user, login, logout, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
