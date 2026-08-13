import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: API_URL,
})

// Attach the JWT token (if we have one) to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Helper to check if a JWT token is expired on the client side
export const isTokenExpired = (token) => {
  if (!token || token === 'demo-jwt-token') return false
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return true
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    const { exp } = JSON.parse(jsonPayload)
    if (!exp) return false
    return Date.now() >= exp * 1000
  } catch (e) {
    return true
  }
}

// If the token is invalid/expired, log the user out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login-json', data),
  refreshToken: () => api.post('/api/auth/refresh'),
}


export const userAPI = {
  getMe: () => api.get('/api/users/me'),
  updateMe: (data) => api.put('/api/users/me', data),
}

export const chatAPI = {
  sendMessage: (data) => api.post('/api/chat/send', data),
  listConversations: () => api.get('/api/chat/conversations'),
  getHistory: (conversationId) => api.get(`/api/chat/history/${conversationId}`),
  deleteConversation: (conversationId) => api.delete(`/api/chat/conversations/${conversationId}`),
}

export const widgetsAPI = {
  getWeather: (city = 'Bangalore') => api.get('/api/widgets/weather', { params: { city } }),
  getAnalytics: () => api.get('/api/widgets/analytics'),
  getShortcuts: () => api.get('/api/widgets/shortcuts'),
  getSuggestions: () => api.get('/api/widgets/suggestions'),
}

export const agreementAPI = {
  getTerms: () => api.get('/api/agreement/terms'),
  getStatus: () => api.get('/api/agreement/status'),
  acceptTerms: (agreed = true) => api.post('/api/agreement/accept', { agreed }),
}

export default api

