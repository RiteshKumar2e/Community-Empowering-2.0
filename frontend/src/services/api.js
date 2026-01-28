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
            // Check if this is a background tracking request
            const isTrackingRequest = error.config?.url?.includes('/tracking/') ||
                error.config?.url?.includes('/log/');

            if (!isTrackingRequest) {
                // Only clear session for critical failed requests
                console.warn('Session might be invalid, but NOT forcing logout as per user preference.');
                // We keep the token in localStorage and only let the user logout manually
                // unless it's a critical auth-required page refresh that will naturally 
                // prompt for login if data fails to load.
            } else {
                console.log('Background tracking failed (401), ignoring to prevent logout.');
            }
        }
        return Promise.reject(error)
    }
)

export default api
