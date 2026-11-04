import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import {
    User, Mail, Lock, Phone, MapPin, AlertCircle, Loader, ArrowLeft, ArrowRight,
    Eye, EyeOff, Check, ShieldCheck, Sparkles
} from 'lucide-react'
import '../styles/Auth.css'
import '../styles/RegisterWizard.css'
import { trackOnce } from '../utils/analytics'
import { getPendingResult } from '../services/myData'
import { getScheme } from '../data/schemes'
import BrandMark from '../components/BrandMark'

const STEPS = [
    { id: 'about', title: 'About you', hint: 'So we know who to help' },
    { id: 'needs', title: 'Your needs', hint: 'So answers fit your life' },
    { id: 'secure', title: 'Password', hint: 'Last step, almost done!' },
]

const COMMUNITY_TYPES = [
    { value: 'student', emoji: '🎓', label: 'Student', perk: 'Scholarships & free courses' },
    { value: 'farmer', emoji: '🌾', label: 'Farmer', perk: 'PM-KISAN, crop insurance & subsidies' },
    { value: 'worker', emoji: '🛠️', label: 'Worker', perk: 'Jobs, skilling & labour welfare' },
    { value: 'business', emoji: '🏪', label: 'Small Business', perk: 'MUDRA loans & startup support' },
    { value: 'senior', emoji: '🧓', label: 'Senior Citizen', perk: 'Pensions & health cover' },
    { value: 'general', emoji: '🙋', label: 'Someone else', perk: 'All schemes & local services' },
]

const LANGUAGES = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'हिंदी' },
    { value: 'bn', label: 'বাংলা' },
    { value: 'te', label: 'తెలుగు' },
    { value: 'mr', label: 'मराठी' },
]

// What the landing page's "What do you need help with?" choice maps to.
const NEED_TO_COMMUNITY = {
    scholarships: 'student',
    farming: 'farmer',
    jobs: 'worker',
    business: 'business',
    health: 'general',
}

const DRAFT_KEY = 'register-draft'
const EMPTY_FORM = {
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    language: '',
    communityType: '',
    location: ''
}

const passwordStrength = (pw) => {
    let score = 0
    if (pw.length >= 6) score++
    if (pw.length >= 10) score++
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
    if (/\d/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    if (!pw) return { level: 0, label: '' }
    if (score <= 1) return { level: 1, label: 'Weak' }
    if (score <= 3) return { level: 2, label: 'Good' }
    return { level: 3, label: 'Strong' }
}

const errorText = (err) => {
    // FastAPI validation errors arrive as an array of objects.
    if (Array.isArray(err)) return err[0]?.msg || 'Please check your details and try again.'
    return typeof err === 'string' ? err : 'Registration failed. Please try again.'
}

const Register = () => {
    const { register } = useAuth()
    const { t } = useLanguage()
    const [searchParams] = useSearchParams()

    const [step, setStep] = useState(0)
    const [direction, setDirection] = useState(1)
    const [formData, setFormData] = useState(() => {
        // Restore a half-finished signup (never the passwords).
        let draft = {}
        try { draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY)) || {} } catch { /* ignore */ }
        const need = searchParams.get('need')
        return {
            ...EMPTY_FORM,
            ...draft,
            communityType: draft.communityType || NEED_TO_COMMUNITY[need] || '',
            password: '',
            confirmPassword: '',
        }
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [agreed, setAgreed] = useState(false)
    // Honeypot: hidden from people, but form-filling bots tend to fill it in.
    const [website, setWebsite] = useState('')
    const firstFieldRef = useRef(null)

    const next = searchParams.get('next')
    const applyScheme = next === 'apply' ? getScheme(searchParams.get('scheme') || '') : null
    const [pendingCount] = useState(() => getPendingResult()?.schemes?.length || 0)

    useEffect(() => {
        window.scrollTo(0, 0)
        trackOnce('signup_started', 'register_page', { source: next || (searchParams.get('need') ? 'landing_need' : 'direct') })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        const { password: _password, confirmPassword: _confirmPassword, ...safe } = formData
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(safe))
    }, [formData])

    useEffect(() => {
        // Move focus into the new step so keyboard users can keep typing.
        const id = setTimeout(() => firstFieldRef.current?.focus(), 320)
        return () => clearTimeout(id)
    }, [step])

    const update = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
        setError('')
    }

    const handleChange = (e) => update(e.target.name, e.target.value)

    const validateStep = (index) => {
        if (index === 0) {
            if (formData.name.trim().length < 2) return 'Please enter your full name'
            if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) return 'Please enter a valid email address'
            // Indian mobile number, optionally prefixed with +91 or 0
            const phoneDigits = formData.phone.replace(/[\s-]/g, '')
            if (!/^(\+91|0)?[6-9]\d{9}$/.test(phoneDigits)) return 'Please enter a valid 10-digit mobile number'
        }
        if (index === 1) {
            if (!formData.communityType) return 'Pick the option that describes you best'
            if (!formData.language) return 'Choose the language you are most comfortable in'
            if (formData.location.trim().length < 2) return 'Please enter your city or district'
        }
        if (index === 2) {
            if (formData.password.length < 6) return 'Password must be at least 6 characters'
            if (formData.password !== formData.confirmPassword) return 'Passwords do not match'
            if (!agreed) return 'Please accept the Terms and Privacy Policy to continue'
        }
        return ''
    }

    const goTo = (target) => {
        if (target > step) {
            const message = validateStep(step)
            if (message) {
                setError(message)
                return
            }
        }
        setError('')
        setDirection(target > step ? 1 : -1)
        setStep(target)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (step < STEPS.length - 1) {
            goTo(step + 1)
            return
        }
        if (website) return

        const message = validateStep(step)
        if (message) {
            setError(message)
            return
        }

        setLoading(true)
        const { confirmPassword: _confirmPassword, ...userData } = formData
        const result = await register({ ...userData, name: userData.name.trim(), email: userData.email.trim() })

        if (result.success) {
            sessionStorage.removeItem(DRAFT_KEY)
        } else {
            setError(errorText(result.error))
        }
        setLoading(false)
    }

    const progress = ((step + 1) / STEPS.length) * 100
    const strength = passwordStrength(formData.password)
    const selectedType = COMMUNITY_TYPES.find((c) => c.value === formData.communityType)
    const firstName = formData.name.trim().split(' ')[0]

    const slide = {
        enter: (dir) => ({ x: dir * 40, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir) => ({ x: dir * -40, opacity: 0 }),
    }

    return (
        <div className="auth-page">
            <Link to="/" className="back-to-home-btn">
                <ArrowLeft size={18} />
                <span>Back to Home</span>
            </Link>

            <div className="auth-container">
                <div className="auth-features wizard-aside">
                    <h3>{firstName ? `Welcome, ${firstName}! 👋` : 'Why Join Community AI?'}</h3>
                    <div className="feature-list">
                        <div className="feature-item">
                            <div className="feature-icon-wrapper">🎯</div>
                            <div className="feature-content">
                                <strong>{selectedType ? `Built for: ${selectedType.label}` : 'Access Government Schemes'}</strong>
                                <p>{selectedType ? selectedType.perk : 'Get personalized recommendations for schemes and benefits'}</p>
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
                    <div className="wizard-trust">
                        <ShieldCheck size={16} />
                        <span>100% free · No documents needed · Takes about a minute</span>
                    </div>
                </div>

                <div className="auth-card">
                    <div className="auth-header">
                        <BrandMark className="logo-icon" />
                        <h1>Join Community AI</h1>
                        <p>{STEPS[step].hint}</p>
                    </div>

                    {applyScheme && (
                        <p className="pending-note" role="status">
                            Create your free account to apply for <strong>{applyScheme.shortName}</strong>. You’ll come straight back to the scheme page with the official application link.
                        </p>
                    )}

                    {pendingCount > 0 && (
                        <p className="pending-note" role="status">
                            ✓ Your {pendingCount} matched {pendingCount === 1 ? 'scheme is' : 'schemes are'} kept on this device and will be saved to your account when you finish.
                        </p>
                    )}

                    {/* Progress */}
                    <div className="wizard-progress" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
                        <div className="wizard-progress-track">
                            <motion.div
                                className="wizard-progress-fill"
                                initial={false}
                                animate={{ width: `${progress}%` }}
                                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                            />
                        </div>
                        <ol className="wizard-steps">
                            {STEPS.map((s, i) => (
                                <li key={s.id}>
                                    <button
                                        type="button"
                                        className={`wizard-step ${i === step ? 'current' : ''} ${i < step ? 'done' : ''}`}
                                        onClick={() => i < step && goTo(i)}
                                        disabled={i > step}
                                        aria-current={i === step ? 'step' : undefined}
                                    >
                                        <span className="wizard-step-dot">
                                            {i < step ? <Check size={12} strokeWidth={3} /> : i + 1}
                                        </span>
                                        <span className="wizard-step-label">{s.title}</span>
                                    </button>
                                </li>
                            ))}
                        </ol>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form" noValidate>
                        {error && (
                            <motion.div
                                className="error-message"
                                role="alert"
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0, x: [0, -6, 6, -4, 4, 0] }}
                                transition={{ duration: 0.35 }}
                            >
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        <input
                            type="text"
                            name="website"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            tabIndex="-1"
                            autoComplete="off"
                            aria-hidden="true"
                            className="wizard-honeypot"
                        />

                        <div className="wizard-viewport">
                            <AnimatePresence mode="wait" custom={direction} initial={false}>
                                <motion.div
                                    key={step}
                                    custom={direction}
                                    variants={slide}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.22, ease: 'easeOut' }}
                                    className="wizard-panel"
                                >
                                    {step === 0 && (
                                        <>
                                            <div className="form-group">
                                                <label htmlFor="name" className="form-label">
                                                    <User size={16} />
                                                    Full Name
                                                </label>
                                                <input
                                                    ref={firstFieldRef}
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="form-input"
                                                    placeholder="Enter your full name"
                                                    autoComplete="name"
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
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="phone" className="form-label">
                                                    <Phone size={16} />
                                                    Mobile Number
                                                </label>
                                                <input
                                                    type="tel"
                                                    id="phone"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className="form-input"
                                                    placeholder="10-digit mobile number"
                                                    autoComplete="tel"
                                                    inputMode="tel"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {step === 1 && (
                                        <>
                                            <div className="form-group">
                                                <span className="form-label">I am a…</span>
                                                <div className="choice-grid" role="radiogroup" aria-label="I am a">
                                                    {COMMUNITY_TYPES.map((c, i) => (
                                                        <button
                                                            key={c.value}
                                                            ref={i === 0 ? firstFieldRef : undefined}
                                                            type="button"
                                                            role="radio"
                                                            aria-checked={formData.communityType === c.value}
                                                            className={`choice-card ${formData.communityType === c.value ? 'selected' : ''}`}
                                                            onClick={() => update('communityType', c.value)}
                                                        >
                                                            <span className="choice-emoji">{c.emoji}</span>
                                                            <span className="choice-label">{c.label}</span>
                                                            {formData.communityType === c.value && (
                                                                <motion.span
                                                                    className="choice-check"
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                >
                                                                    <Check size={12} strokeWidth={3} />
                                                                </motion.span>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <span className="form-label">Preferred language</span>
                                                <div className="chip-row" role="radiogroup" aria-label="Preferred language">
                                                    {LANGUAGES.map((l) => (
                                                        <button
                                                            key={l.value}
                                                            type="button"
                                                            role="radio"
                                                            aria-checked={formData.language === l.value}
                                                            className={`chip ${formData.language === l.value ? 'selected' : ''}`}
                                                            onClick={() => update('language', l.value)}
                                                        >
                                                            {l.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="location" className="form-label">
                                                    <MapPin size={16} />
                                                    City / District
                                                </label>
                                                <input
                                                    type="text"
                                                    id="location"
                                                    name="location"
                                                    value={formData.location}
                                                    onChange={handleChange}
                                                    className="form-input"
                                                    placeholder="e.g. Ranchi, Jharkhand"
                                                    autoComplete="address-level2"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {step === 2 && (
                                        <>
                                            <div className="form-group">
                                                <label htmlFor="password" className="form-label">
                                                    <Lock size={16} />
                                                    Create Password
                                                </label>
                                                <div className="password-input-wrapper">
                                                    <input
                                                        ref={firstFieldRef}
                                                        type={showPassword ? 'text' : 'password'}
                                                        id="password"
                                                        name="password"
                                                        value={formData.password}
                                                        onChange={handleChange}
                                                        className="form-input"
                                                        placeholder="At least 6 characters"
                                                        autoComplete="new-password"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="password-toggle-btn"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                                        tabIndex="-1"
                                                    >
                                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                                {formData.password && (
                                                    <div className={`strength strength-${strength.level}`} aria-live="polite">
                                                        <div className="strength-bars">
                                                            <span /><span /><span />
                                                        </div>
                                                        <span className="strength-label">{strength.label}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="confirmPassword" className="form-label">
                                                    <Lock size={16} />
                                                    Confirm Password
                                                </label>
                                                <div className="password-input-wrapper">
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        id="confirmPassword"
                                                        name="confirmPassword"
                                                        value={formData.confirmPassword}
                                                        onChange={handleChange}
                                                        className="form-input"
                                                        placeholder="Type it again"
                                                        autoComplete="new-password"
                                                    />
                                                    {formData.confirmPassword && formData.confirmPassword === formData.password && (
                                                        <span className="match-check" aria-label="Passwords match">
                                                            <Check size={16} strokeWidth={3} />
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                role="checkbox"
                                                aria-checked={agreed}
                                                className={`consent-row ${agreed ? 'checked' : ''}`}
                                                onClick={() => { setAgreed(!agreed); setError('') }}
                                            >
                                                <span className="consent-box">{agreed && <Check size={12} strokeWidth={3} />}</span>
                                                <span>
                                                    I agree to the <Link to="/terms" target="_blank" onClick={(e) => e.stopPropagation()}>Terms</Link> and{' '}
                                                    <Link to="/privacy" target="_blank" onClick={(e) => e.stopPropagation()}>Privacy Policy</Link>
                                                </span>
                                            </button>
                                        </>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <div className="wizard-actions">
                            {step > 0 && (
                                <button type="button" className="btn wizard-back" onClick={() => goTo(step - 1)} disabled={loading}>
                                    <ArrowLeft size={18} />
                                    Back
                                </button>
                            )}
                            <button type="submit" className="btn btn-primary btn-lg wizard-next" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader className="spinner" size={20} />
                                        Creating account...
                                    </>
                                ) : step < STEPS.length - 1 ? (
                                    <>
                                        Continue
                                        <ArrowRight size={18} />
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={18} />
                                        Create My Account
                                    </>
                                )}
                            </button>
                        </div>
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
