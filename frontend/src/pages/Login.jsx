import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { Mail, Lock, AlertCircle, Loader } from 'lucide-react'
import OTPModal from '../components/OTPModal'

import '../styles/Auth.css'

const Login = () => {
    const { login, googleLogin, verifyGoogleOtp } = useAuth()
    const { t } = useLanguage()

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [isOtpOpen, setIsOtpOpen] = useState(false)
    const [emailForOtp, setEmailForOtp] = useState('')

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
        setLoading(true)

        const result = await login(formData.email, formData.password)

        if (!result.success) {
            setError(result.error)
        }

        setLoading(false)
    }

    const handleGoogleSuccess = async (credentialResponse) => {
        setError('')
        setLoading(true)
        try {
            const result = await googleLogin(credentialResponse.credential)
            if (result.success) {
                if (result.requiresOtp) {
                    setEmailForOtp(result.email)
                    setIsOtpOpen(true)
                }
                // If not requiresOtp, AuthContext already handles navigation
            } else {
                setError(result.error)
            }
        } catch (err) {
            setError('An error occurred during Google login.')
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOtp = async (otp) => {
        await verifyGoogleOtp(emailForOtp, otp)
    }

    const handleGoogleError = () => {
        setError('Google sign-in failed. Please try again.')
    }

    return (
        <div className="auth-page">
            <div className="auth-container centered-container">

                <div className="auth-card">
                    <div className="auth-header">
                        <div className="logo-icon">🌟</div>
                        <h1>Welcome Back</h1>
                        <p>Sign in to access your community dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {error && (
                            <div className="error-message">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                <Mail size={16} />
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="your.email@example.com"
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                <Lock size={16} />
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={loading}
                            style={{ width: '100%' }}
                        >
                            {loading ? (
                                <>
                                    <Loader className="spinner" size={20} />
                                    Signing in...
                                </>
                            ) : (
                                t('login')
                            )}
                        </button>

                        <div className="auth-divider">
                            <span>OR</span>
                        </div>

                        <div className="google-login-wrapper">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                theme="outline"
                                size="large"
                                text="signin_with"
                                logo_alignment="center"
                                useOneTap={false}
                                auto_select={false}
                            />
                        </div>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Don't have an account?{' '}
                            <Link to="/register" className="auth-link">
                                {t('register')}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
            <OTPModal
                isOpen={isOtpOpen}
                onClose={() => setIsOtpOpen(false)}
                email={emailForOtp}
                onVerify={handleVerifyOtp}
                loading={loading}
            />
        </div>
    )
}

export default Login
