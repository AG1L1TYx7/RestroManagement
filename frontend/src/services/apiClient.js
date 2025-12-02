import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    if (status === 401) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
    }
    return Promise.reject(error)
  },
)

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('accessToken', token)
  } else {
    localStorage.removeItem('accessToken')
  }
}
