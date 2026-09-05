import axios from 'axios'

const TOKEN_KEY = 'ewallet_token'
const USER_KEY = 'ewallet_user'

export const tokenStorage = {
  get: () => sessionStorage.getItem(TOKEN_KEY),
  set: (token) => sessionStorage.setItem(TOKEN_KEY, token),
  clear: () => {
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
  },
}

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
})

axiosInstance.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject({
        status: 0,
        message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
        errors: null,
      })
    }

    const { status, data } = error.response

    if (status === 401) {
      tokenStorage.clear()
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }

    return Promise.reject({
      status,
      message: data?.message || 'Terjadi kesalahan yang tidak terduga.',
      errors: data?.errors || null,
    })
  }
)

export default axiosInstance
