import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const url = error.config?.url || ''
            // /auth/* 401s are expected answers (wrong password, wrong OTP), and
            // background tracking calls must never sign anyone out.
            const isAuthCall = url.includes('/auth/')
            const isTrackingRequest = url.includes('/tracking/') || url.includes('/log/')
            const sentToken = Boolean(error.config?.headers?.Authorization)

            if (sentToken && !isAuthCall && !isTrackingRequest) {
                // The server no longer accepts this login token (expired, or the
                // signing key changed). Staying "signed in" would just make every
                // page fail, so AuthContext clears the session and asks the user
                // to sign in again.
                window.dispatchEvent(new Event('auth:expired'))
            }
        }
        return Promise.reject(error)
    }
)

export default api
