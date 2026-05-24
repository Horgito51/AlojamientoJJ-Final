import { useState, useContext, createContext, useCallback, useEffect } from 'react'
import { AUTH_SESSION_EXPIRED_EVENT, LOCAL_STORAGE_AUTH_KEY } from '../utils/auth'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_AUTH_KEY)
    return stored ? JSON.parse(stored) : null
  })

  const login = useCallback((authData) => {
    setAuth(authData)
    localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(authData))
  }, [])

  const logout = useCallback(() => {
    setAuth(null)
    localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY)
  }, [])

  useEffect(() => {
    const handleExpiredSession = () => {
      setAuth(null)
      localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY)
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleExpiredSession)
    return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleExpiredSession)
  }, [])

  const isAuthenticated = useCallback(() => {
    return auth?.token ? true : false
  }, [auth])

  const getUserRoles = useCallback(() => {
    const rawRoles = auth?.roles ?? auth?.Roles
    if (!rawRoles) return []
    // Manejar tanto array simple como objeto con $values de .NET
    const roles = Array.isArray(rawRoles) ? rawRoles : rawRoles?.$values || []
    return roles.map(r => String(r.nombreRol || r).toUpperCase())
  }, [auth])

  const hasRole = useCallback((roleName) => {
    const roles = getUserRoles()
    const search = String(roleName).toUpperCase()
    return roles.includes(search)
  }, [getUserRoles])

  return (
    <AuthContext.Provider value={{ auth, login, logout, isAuthenticated, hasRole, getUserRoles }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider')
  }
  return context
}
