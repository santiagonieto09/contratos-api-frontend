import axios from 'axios'

let navigateToLogin: (() => void) | null = null

export function setNavigateToLogin(fn: () => void) {
  navigateToLogin = fn
}

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/login')) {
      sessionStorage.removeItem('token')
      navigateToLogin?.()
    }
    return Promise.reject(error)
  }
)

export default api
