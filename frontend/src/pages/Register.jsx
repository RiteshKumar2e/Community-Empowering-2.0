import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { User, Mail, Lock, Phone, MapPin, AlertCircle, Loader, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import '../styles/Auth.css'

const Register = () => {
    const { register } = useAuth()
    const { t } = useLanguage()

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        language: '',
        communityType: '',
        location: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)

        const { confirmPassword, ...userData } = formData
        const result = await register(userData)

        if (!result.success) {
            setError(result.error)
        }

        setLoading(false)
    }

    return (
        <div className="auth-page">
            <Link to="/" className="back-to-home-btn">
                <ArrowLeft size={18} />
                <span>Back to Home</span>
            </Link>

            <div className="auth-container">
                <div className="auth-features">
                    <h3>Why Join Community AI?</h3>
                    <div className="feature-list">
                        <div className="feature-item">
                            <div className="feature-icon-wrapper">🎯</div>
                            <div className="feature-content">
                                <strong>Access Government Schemes</strong>
                                <p>Get personalized recommendations for schemes and benefits</p>
                            </div>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon-wrapper">📚</div>
                            <div className="feature-content">
                                <strong>Learn & Grow</strong>
                                <p>Access educational resources and skill development courses</p>
                            </div>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon-wrapper">🗣️</div>
                            <div className="feature-content">
                                <strong>Your Language</strong>
                                <p>Interact in your preferred local language with voice support</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="auth-card">
                    <div className="auth-header">
                        <div className="logo-icon">🌟</div>
                        <h1>Join Community AI</h1>
                        <p>Create your account to get started</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {error && (
                            <div className="error-message">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="name" className="form-label">
                                <User size={16} />
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Enter your full name"
                                autoComplete="name"
                                autoFocus
                                required
                            />
                        </div>

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
                            <label htmlFor="phone" className="form-label">
                                <Phone size={16} />
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Enter your phone number"
                                autoComplete="tel"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="location" className="form-label">
                                <MapPin size={16} />
                                Location
                            </label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="City, State"
                                autoComplete="address-level2"
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="language" className="form-label">
                                    Select your language
                                </label>
                                <select
                                    id="language"
                                    name="language"
                                    value={formData.language}
                                    onChange={handleChange}
                                    className="form-select"
                                    required
                                >
                                    <option value="" disabled>Select your language</option>
                                    <option value="en">English</option>
                                    <option value="hi">हिंदी (Hindi)</option>
                                    <option value="bn">বাংলা (Bengali)</option>
                                    <option value="te">తెలుగు (Telugu)</option>
                                    <option value="mr">मराठी (Marathi)</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="communityType" className="form-label">
                                    Enter community type
                                </label>
                                <select
                                    id="communityType"
                                    name="communityType"
                                    value={formData.communityType}
                                    onChange={handleChange}
                                    className="form-select"
                                    required
                                >
                                    <option value="" disabled>Enter community type</option>
                                    <option value="general">General</option>
                                    <option value="student">Student</option>
                                    <option value="farmer">Farmer</option>
                                    <option value="worker">Worker</option>
                                    <option value="business">Small Business</option>
                                    <option value="senior">Senior Citizen</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" title="password" className="form-label">
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
                                    placeholder="Create a strong password"
                                    autoComplete="new-password"
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
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">
                                <Lock size={16} />
                                Confirm Password
                            </label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Confirm your password"
                                    autoComplete="new-password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    tabIndex="-1"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
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
                                    Creating account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Already have an account?{' '}
                            <Link to="/login" className="auth-link">
                                {t('login')}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register
