import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [credentials, setCredentials] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('adminCredentials')
    if (saved) {
      setCredentials(saved)
      verifyCredentials(saved)
    } else {
      setLoading(false)
    }
  }, [])

  const verifyCredentials = async (creds) => {
    try {
      const res = await authAPI.verify(creds)
      setIsAdmin(res.valid)
      if (!res.valid) {
        localStorage.removeItem('adminCredentials')
        setCredentials(null)
      }
    } catch {
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    const res = await authAPI.login(username, password)
    if (res.success) {
      const creds = btoa(`${username}:${password}`)
      setCredentials(creds)
      setIsAdmin(true)
      localStorage.setItem('adminCredentials', creds)
    }
    return res
  }

  const logout = () => {
    setIsAdmin(false)
    setCredentials(null)
    localStorage.removeItem('adminCredentials')
  }

  const getAuthHeaders = () => {
    if (!credentials) return {}
    return { Authorization: `Basic ${credentials}` }
  }

  return (
    <AuthContext.Provider value={{ isAdmin, loading, login, logout, getAuthHeaders }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
