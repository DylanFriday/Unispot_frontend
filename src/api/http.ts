import axios, { AxiosHeaders } from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000',
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (!token) {
    return config
  }

  const authHeader = `Bearer ${token}`
  const headers = AxiosHeaders.from(config.headers)
  headers.set('Authorization', authHeader)
  config.headers = headers
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('access_token')
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  }
)

export default http
