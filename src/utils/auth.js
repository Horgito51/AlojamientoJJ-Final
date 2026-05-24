export const LOCAL_STORAGE_AUTH_KEY = 'alojamiento-auth'
export const AUTH_SESSION_EXPIRED_EVENT = 'alojamiento-auth-expired'

export const getStoredSession = () => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_AUTH_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export const clearStoredSession = () => {
  localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY)
}

export const isAuthenticated = () => Boolean(getStoredSession()?.token)
