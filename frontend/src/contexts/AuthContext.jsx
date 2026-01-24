import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const AuthContext = createContext(null)

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

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password })
            const { token, user: userData } = response.data

            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(userData))
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`

            setUser(userData)
            navigate('/dashboard')

            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Login failed'
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
            navigate('/dashboard')

            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Registration failed'
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
            const { token, user: userData } = response.data

            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(userData))
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`

            setUser(userData)
            navigate('/dashboard')

            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Google login failed'
            }
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
        updateUser,
        isAuthenticated: !!user
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}
