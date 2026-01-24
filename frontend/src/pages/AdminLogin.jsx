import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, AlertCircle, Loader, Shield } from 'lucide-react'
import '../styles/Auth.css'

const AdminLogin = () => {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        // Validate admin email
        if (formData.email !== 'riteshkumar90359@gmail.com') {
            setError('Unauthorized: Admin access only')
            return
        }

        if (!formData.email || !formData.password) {
            setError('Please fill in all fields')
            return
        }

        setLoading(true)

        try {
            await login(formData.email, formData.password)
            navigate('/admin')
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid credentials')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <div className="admin-badge">
                            <Shield size={32} />
                        </div>
                        <h1>Admin Login</h1>
                        <p>Authorized personnel only</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {error && (
                            <div className="error-message">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="email">
                                <Mail size={18} />
                                Admin Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="riteshkumar90359@gmail.com"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">
                                <Lock size={18} />
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-admin btn-lg btn-block"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader className="spinner" size={20} />
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    <Shield size={20} />
                                    Access Admin Panel
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p className="admin-notice">
                            <Shield size={16} />
                            This area is restricted to authorized administrators only
                        </p>
                    </div>
                </div>

                <div className="auth-features">
                    <div className="feature-item">
                        <Shield size={24} />
                        <div>
                            <h4>Secure Access</h4>
                            <p>Protected admin dashboard</p>
                        </div>
                    </div>
                    <div className="feature-item">
                        <AlertCircle size={24} />
                        <div>
                            <h4>Authorized Only</h4>
                            <p>Email verification required</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminLogin
