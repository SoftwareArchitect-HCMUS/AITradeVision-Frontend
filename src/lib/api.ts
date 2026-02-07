import axios from 'axios'
import { getAuthToken } from '@/store/useAuthStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname
      const isAuthPage = currentPath === '/login' || currentPath === '/register'
      
      if (!isAuthPage) {
        import('@/store/useAuthStore').then(({ useAuthStore }) => {
          useAuthStore.getState().clearAuth()
          window.location.href = '/login'
        })
      }
    }
    return Promise.reject(error)
  }
)

export const setAuthHeader = (token?: string) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

export default api
