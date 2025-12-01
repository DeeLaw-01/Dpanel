import axios from 'axios'
import useUserStore from '@/store/userStore'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add a request interceptor for authentication
api.interceptors.request.use(
  config => {
    // Don't add auth token for login and registration endpoints
    const isAuthEndpoint =
      config.url?.includes('/login') ||
      config.url?.includes('/register') ||
      config.url?.includes('/otp') ||
      config.url?.includes('/refresh-token')

    // Only add the Authorization header if:
    // 1. We have a token, AND
    // 2. The endpoint is not an auth endpoint
    const token = useUserStore.getState().token
    if (token && !isAuthEndpoint) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  error => Promise.reject(error)
)

// Flag to prevent multiple refresh attempts
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: any) => void
  reject: (error: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })

  failedQueue = []
}

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // Only handle 401 errors for routes that should be authenticated
    // We don't want to refresh tokens when they're trying to log in
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest.url.includes('/login') &&
      !originalRequest.url.includes('/register') &&
      !originalRequest.url.includes('/otp') &&
      !originalRequest.url.includes('/refresh-token') &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch(err => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      const { refreshToken, setTokens, logout } = useUserStore.getState()

      if (!refreshToken) {
        // No refresh token available, logout user
        logout()
        processQueue(error, null)
        isRefreshing = false
        return Promise.reject(error)
      }

      try {
        // Attempt to refresh the token
        const response = await axios.post(`${baseURL}/auth/refresh-token`, {
          refreshToken
        })

        const { token: newAccessToken, refreshToken: newRefreshToken } =
          response.data

        // Update tokens in store
        setTokens(newAccessToken, newRefreshToken)

        // Update the authorization header for the original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        // Process the queue with the new token
        processQueue(null, newAccessToken)

        isRefreshing = false

        // Retry the original request
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, logout user
        processQueue(refreshError, null)
        isRefreshing = false
        logout()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
