import axios from 'axios'
import { AUTH_SESSION_EXPIRED_EVENT, LOCAL_STORAGE_AUTH_KEY } from '../utils/auth'

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_MIDDLEWARE_BASE_URL ||
  ''
).replace(/\/+$/, '')

console.log('[API Config] Base URL:', API_BASE_URL)

const isAuthEndpoint = (url = '') => url.includes('/auth/')
const isInternalEndpoint = (url = '') => /(^|\/)api\/v\d+\/internal\//i.test(url)
const normalizeApiUrl = (url = '') => {
  if (typeof url !== 'string') return url
  return /^api\//i.test(url) ? `/${url}` : url
}
const getStoredRoles = () => {
  const stored = localStorage.getItem(LOCAL_STORAGE_AUTH_KEY)
  if (!stored) return []

  try {
    const session = JSON.parse(stored)
    const rawRoles = session?.roles ?? session?.Roles ?? session?.user?.roles ?? session?.user?.Roles ?? []
    const roles = Array.isArray(rawRoles) ? rawRoles : rawRoles?.$values || []
    return roles.map((role) => String(role?.nombreRol || role).toUpperCase())
  } catch {
    return []
  }
}

const isClientOnlySession = () => {
  const roles = getStoredRoles()
  if (!roles.includes('CLIENTE')) return false
  return !roles.some((role) => ['ADMINISTRADOR', 'ADMIN', 'RECEPCIONISTA', 'OPERATIVO', 'DESK_SERVICE'].includes(role))
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
  timeout: 30000, // Aumentado a 30s para mejor manejo de red lenta
  withCredentials: false, // Deshabilitado CORS con credenciales
})

// Interceptor para adjuntar el token en cada request
api.interceptors.request.use((config) => {
  config.url = normalizeApiUrl(config.url)
  console.log('[API Request]', config.method.toUpperCase(), config.url)
  
  if (isAuthEndpoint(config.url)) return config

  const method = String(config.method || 'get').toLowerCase()
  if (['post', 'put', 'patch'].includes(method)) {
    config.headers['Content-Type'] = 'application/json'
  }

  if (isInternalEndpoint(config.url) && isClientOnlySession()) {
    return Promise.reject({
      isClientInternalAccessBlocked: true,
      config,
      message: `Flujo publico bloqueado: se intento llamar ${config.url}`,
    })
  }

  const stored = localStorage.getItem(LOCAL_STORAGE_AUTH_KEY)
  if (stored) {
    try {
      const { token } = JSON.parse(stored)
      if (token) config.headers.Authorization = `Bearer ${token}`
    } catch {
      // token malformado, ignorar
    }
  }
  return config
})

// Interceptor de respuesta para manejar errores
api.interceptors.response.use(
  (response) => {
    console.log('[API Response]', response.status, response.config.url)
    return response
  },
  (error) => {
    console.error('[API Error]', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      message: error.message,
      code: error.code,
    })
    
    if (error.response?.status === 401) {
      localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY)
      if (!isAuthEndpoint(error.config?.url)) {
        window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT))
      }
    }
    
    return Promise.reject(error)
  },
)

export { API_BASE_URL }
export default api
