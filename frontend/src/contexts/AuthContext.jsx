import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { syncPending, takePostAuthRedirect, setPostAuthRedirect } from '../services/myData'
import { trackEvent } from '../utils/analytics'
import { isIdleExpired } from '../utils/idleSession'

// Exported so the build-time prerenderer can render public pages as a
// logged-out visitor (see entry-prerender.jsx).
export const AuthContext = createContext(null)

// FastAPI returns `detail` as a string, or as a list of validation errors.
const apiError = (error, fallback) => {
    const detail = error.response?.data?.detail
    if (Array.isArray(detail)) return detail[0]?.msg?.replace(/^Value error, /, '') || fallback
    return detail || error.response?.data?.message || fallback
}

const PRIVATE_PREFIXES = ['/dashboard', '/assistant', '/resources', '/learning', '/profile', '/feedback', '/forum', '/admin']
const isPrivatePath = (path) => PRIVATE_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))

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

        if (token && userData && isIdleExpired()) {
            // Came back after 30+ minutes away (browser closed, or tab reloaded).
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            const path = window.location.pathname
            if (isPrivatePath(path)) {
                try { sessionStorage.setItem('session-expired', 'idle') } catch { /* ignore */ }
                setPostAuthRedirect(path)
            }
        } else if (token && userData) {
            setUser(JSON.parse(userData))
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        }

        setLoading(false)
    }, [])

    // api.js fires "auth:expired" when the server rejects the saved token.
    // Clear the dead session; on a signed-in-only page, send the user to log
    // in and bring them back afterwards. Public pages just carry on signed out.
    useEffect(() => {
        const onExpired = (event) => {
            if (!localStorage.getItem('token')) return // already handled
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            delete api.defaults.headers.common['Authorization']
            setUser(null)
            const path = window.location.pathname
            if (isPrivatePath(path)) {
                try { sessionStorage.setItem('session-expired', event.detail?.reason === 'idle' ? 'idle' : '1') } catch { /* ignore */ }
                setPostAuthRedirect(path)
                navigate('/login', { replace: true })
            }
        }
        window.addEventListener('auth:expired', onExpired)
        return () => window.removeEventListener('auth:expired', onExpired)
    }, [navigate])

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

            loggedOutRef.current = false
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

            loggedOutRef.current = false
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

    // Set during logout so ProtectedRoute sends the user home instead of to
    // /login while the page they were on re-renders without a user.
    const loggedOutRef = useRef(false)

    const logout = () => {
        loggedOutRef.current = true
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        delete api.defaults.headers.common['Authorization']
        setUser(null)
        navigate('/')
        // Only needed for the redirect right after logout; later visits to a
        // protected page while signed out should go to /login as usual.
        setTimeout(() => { loggedOutRef.current = false }, 1500)
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

            loggedOutRef.current = false
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

    // Errors are not caught here: OTPModal shows the server's message.
    const verifyGoogleOtp = async (email, otp) => {
        const response = await api.post('/auth/verify-google-otp', { email, otp })
        const { token, user: userData } = response.data

        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`

        setUser(userData)
        await afterAuth('login_completed', 'google')
        navigate(takePostAuthRedirect() || '/dashboard')

        return { success: true }
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
        isAuthenticated: !!user,
        justLoggedOut: loggedOutRef.current
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}
