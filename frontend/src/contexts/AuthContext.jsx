import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { syncPending, takePostAuthRedirect } from '../services/myData'
import { trackEvent } from '../utils/analytics'

// Exported so the build-time prerenderer can render public pages as a
// logged-out visitor (see entry-prerender.jsx).
export const AuthContext = createContext(null)

// FastAPI returns `detail` as a string, or as a list of validation errors.
const apiError = (error, fallback) => {
    const detail = error.response?.data?.detail
    if (Array.isArray(detail)) return detail[0]?.msg?.replace(/^Value error, /, '') || fallback
    return detail || error.response?.data?.message || fallback
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        // Check if user is logged in on mount
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')

        if (token && userData) {
            setUser(JSON.parse(userData))
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        }

        setLoading(false)
    }, [])

    // After any successful sign-in: upload progress the visitor made before
    // signing in (eligibility result, bookmarks), then record the event.
    // Never blocks for long: the dashboard opens even if the upload fails.
    const afterAuth = async (eventName, method) => {
        trackEvent(eventName, { method })
        try {
            await Promise.race([syncPending(), new Promise((resolve) => setTimeout(resolve, 4000))])
        } catch { /* kept on device, retried from the dashboard */ }
    }

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password })
            const { token, user: userData } = response.data

            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(userData))
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`

            setUser(userData)
            await afterAuth('login_completed', 'email')
            navigate(takePostAuthRedirect() || '/dashboard')

            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: apiError(error, 'Login failed')
            }
        }
    }

    const register = async (userData) => {
        try {
            const response = await api.post('/auth/register', userData)
            const { token, user: newUser } = response.data

            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(newUser))
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`

            setUser(newUser)
            await afterAuth('signup_completed', 'email')
            navigate(takePostAuthRedirect() || '/dashboard')

            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: apiError(error, 'Registration failed')
            }
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        delete api.defaults.headers.common['Authorization']
        setUser(null)
        navigate('/')
    }

    const googleLogin = async (credential) => {
        try {
            const response = await api.post('/auth/google-login', { credential })

            // Handle OTP requirement
            if (response.data.requires_otp) {
                return {
                    success: true,
                    requiresOtp: true,
                    email: response.data.email
                }
            }

            const { token, user: userData } = response.data

            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(userData))
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`

            setUser(userData)
            await afterAuth('login_completed', 'google')
            navigate(takePostAuthRedirect() || '/dashboard')

            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Google login failed'
            }
        }
    }

    const verifyGoogleOtp = async (email, otp) => {
        try {
            const response = await api.post('/auth/verify-google-otp', { email, otp })
            const { token, user: userData } = response.data

            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(userData))
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`

            setUser(userData)
            await afterAuth('login_completed', 'google')
            navigate(takePostAuthRedirect() || '/dashboard')

            return { success: true }
        } catch (error) {
            throw error; // Let the component handle the error
        }
    }

    const updateUser = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
    }

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        googleLogin,
        verifyGoogleOtp,
        updateUser,
        isAuthenticated: !!user
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}
