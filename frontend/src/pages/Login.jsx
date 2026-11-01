import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { Mail, Lock, AlertCircle, Loader, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import OTPModal from '../components/OTPModal'
import { getPendingResult } from '../services/myData'

import '../styles/Auth.css'
import { warmUpGoogleSignIn } from '../utils/googleSignIn'

// Google OAuth Client ID. This is a public identifier (it ships in every
// sign-in request), not a secret, so a fallback here is safe.
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "951248037202-s3mqg1q79rgodj93skft5r253rd3mkfd.apps.googleusercontent.com"

// Runs as soon as this page's code is downloaded, before it renders.
warmUpGoogleSignIn()

// Same size and look as Google's large outline button. Sits underneath the
// real button and stays visible until Google's iframe paints over it, so the
// spot is never empty while the script loads.
const GoogleButtonPlaceholder = ({ width }) => (
    <div className="google-btn-placeholder" style={{ width }} aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
        <span>Sign in with Google</span>
    </div>
)

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
    const [showPassword, setShowPassword] = useState(false)
    const [pendingCount] = useState(() => getPendingResult()?.schemes?.length || 0)
    // Set by AuthContext when a saved session stopped being valid.
    const [sessionExpired] = useState(() => {
        try {
            const v = sessionStorage.getItem('session-expired') === '1'
            sessionStorage.removeItem('session-expired')
            return v
        } catch { return false }
    })
    // Google renders its button at a fixed pixel width (200–400), so fit it to
    // the card on small phones instead of letting it overflow.
    const [googleBtnWidth] = useState(() => Math.max(200, Math.min(320, window.innerWidth - 80)))

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

    // Memoised: <GoogleLogin> re-runs google.accounts.id.initialize() whenever
    // its callback props change identity. Without this they were rebuilt on
    // every keystroke in the email/password fields, which is the repeated
    // "google.accounts.id.initialize() is called multiple times" console warning.
    const handleGoogleSuccess = useCallback(async (credentialResponse) => {
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
    }, [googleLogin])

    const handleVerifyOtp = useCallback(async (otp) => {
        await verifyGoogleOtp(emailForOtp, otp)
    }, [verifyGoogleOtp, emailForOtp])

    const handleGoogleError = useCallback(() => {
        setError('Google sign-in failed. Please try again.')
    }, [])

    return (
        <div className="auth-page">
            <Link to="/" className="back-to-home-btn">
                <ArrowLeft size={18} />
                <span>Back to Home</span>
            </Link>

            <div className="auth-container centered-container">

                <div className="auth-card">
                    <div className="auth-header">
                        <div className="logo-icon">🌟</div>
                        <h1>Welcome Back</h1>
                        <p>Sign in to access your community dashboard</p>
                    </div>

                    {sessionExpired && (
                        <p className="session-note" role="status">
                            Your session has expired. Please sign in again.
                        </p>
                    )}

                    {pendingCount > 0 && (
                        <p className="pending-note" role="status">
                            ✓ Sign in to save your {pendingCount} matched {pendingCount === 1 ? 'scheme' : 'schemes'} to your account.
                        </p>
                    )}

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
                                autoFocus
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                <Lock size={16} />
                                Password
                            </label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex="-1"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
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
                            <GoogleButtonPlaceholder width={googleBtnWidth} />
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                theme="outline"
                                size="large"
                                text="signin_with"
                                width={String(googleBtnWidth)}
                                logo_alignment="center"
                                useOneTap={false}
                                auto_select={false}
                                // FedCM: Chrome shows Google's account chooser as its own
                                // browser dialog instead of a popup window, so Google's
                                // "Cross-Origin-Opener-Policy ... would block" console
                                // messages don't appear. Browsers without FedCM use the popup.
                                use_fedcm_for_button={true}
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
            </div >
            <OTPModal
                isOpen={isOtpOpen}
                onClose={() => setIsOtpOpen(false)}
                email={emailForOtp}
                onVerify={handleVerifyOtp}
                loading={loading}
            />
        </div >
    )
}

// Google's sign-in script loads only here, on the page with the Google button.
// Loaded app-wide it ran on every page and, for visitors signed in to Google,
// logged "Cross-Origin-Opener-Policy policy would block the window.postMessage
// call" in the console.
const LoginPage = () => (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <Login />
    </GoogleOAuthProvider>
)

export default LoginPage
