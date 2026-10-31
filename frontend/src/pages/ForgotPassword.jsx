import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, KeyRound, AlertCircle, Loader, ArrowLeft, CheckCircle2 } from 'lucide-react'
import api from '../services/api'
import '../styles/Auth.css'

const errorText = (error, fallback) => {
    const detail = error.response?.data?.detail
    if (Array.isArray(detail)) return detail[0]?.msg?.replace(/^Value error, /, '') || fallback
    return detail || fallback
}

// Two steps: request a 6-digit code by email, then set a new password with it.
// The request step always shows the same message, whether or not the email has
// an account, so this page can't be used to find out who is registered.
const ForgotPassword = () => {
    const navigate = useNavigate()
    const [step, setStep] = useState('request') // request | reset | done
    const [email, setEmail] = useState('')
    const [code, setCode] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [info, setInfo] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    const requestCode = async (e) => {
        e.preventDefault()
        setError('')
        if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
            setError('Please enter a valid email address')
            return
        }
        setLoading(true)
        try {
            const res = await api.post('/auth/forgot-password', { email: email.trim() })
            setInfo(res.data.message)
            setStep('reset')
        } catch (err) {
            setError(errorText(err, 'Could not send the code. Please try again.'))
        } finally {
            setLoading(false)
        }
    }

    const resetPassword = async (e) => {
        e.preventDefault()
        setError('')
        if (!/^\d{6}$/.test(code.trim())) return setError('Enter the 6-digit code from the email')
        if (password.length < 6) return setError('Password must be at least 6 characters')
        if (password !== confirm) return setError('Passwords do not match')
        setLoading(true)
        try {
            await api.post('/auth/reset-password', { email: email.trim(), code: code.trim(), new_password: password })
            setStep('done')
        } catch (err) {
            setError(errorText(err, 'Could not reset the password. Please try again.'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <Link to="/login" className="back-to-home-btn">
                <ArrowLeft size={18} />
                <span>Back to Sign In</span>
            </Link>

            <div className="auth-container centered-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <div className="logo-icon">🔑</div>
                        <h1>{step === 'done' ? 'Password changed' : 'Reset your password'}</h1>
                        <p>
                            {step === 'request' && 'Enter your account email and we will send you a 6-digit code.'}
                            {step === 'reset' && info}
                            {step === 'done' && 'You can now sign in with your new password.'}
                        </p>
                    </div>

                    {error && (
                        <div className="error-message" role="alert">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    {step === 'request' && (
                        <form onSubmit={requestCode} className="auth-form" noValidate>
                            <div className="form-group">
                                <label htmlFor="email" className="form-label"><Mail size={16} /> Email Address</label>
                                <input id="email" type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="your.email@example.com" />
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                                {loading ? <><Loader className="spinner" size={20} /> Sending…</> : 'Send reset code'}
                            </button>
                        </form>
                    )}

                    {step === 'reset' && (
                        <form onSubmit={resetPassword} className="auth-form" noValidate>
                            <div className="form-group">
                                <label htmlFor="code" className="form-label"><KeyRound size={16} /> 6-digit code</label>
                                <input id="code" inputMode="numeric" maxLength={6} className="form-input" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} autoComplete="one-time-code" placeholder="123456" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password" className="form-label"><Lock size={16} /> New password</label>
                                <input id="password" type="password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="At least 6 characters" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirm" className="form-label"><Lock size={16} /> Confirm new password</label>
                                <input id="confirm" type="password" className="form-input" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" placeholder="Type it again" />
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                                {loading ? <><Loader className="spinner" size={20} /> Saving…</> : 'Set new password'}
                            </button>
                            <button type="button" className="auth-link-button" onClick={() => { setStep('request'); setCode(''); setError('') }}>
                                Didn’t get the code? Send it again
                            </button>
                        </form>
                    )}

                    {step === 'done' && (
                        <div className="auth-form">
                            <p className="reset-success"><CheckCircle2 size={18} /> Your password has been updated.</p>
                            <button type="button" className="btn btn-primary btn-lg" onClick={() => navigate('/login')}>Go to Sign In</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword
