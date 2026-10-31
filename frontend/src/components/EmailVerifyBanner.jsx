import { useState } from 'react'
import { MailCheck, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { sendVerificationCode, verifyEmailCode } from '../services/myData'
import { trackEvent } from '../utils/analytics'

const errorText = (err, fallback) => {
    const detail = err.response?.data?.detail
    if (Array.isArray(detail)) return 'Enter the 6-digit code from the email'
    return detail || fallback
}

// Shown on the dashboard until an email/password account confirms its email.
// Soft check: nothing is blocked, it just asks. Only shown when the server
// has said the email is NOT verified (older sessions without the flag skip it).
const EmailVerifyBanner = () => {
    const { user, updateUser } = useAuth()
    const [code, setCode] = useState('')
    const [msg, setMsg] = useState('')
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)
    const [hidden, setHidden] = useState(false)

    if (!user || user.emailVerified !== false || hidden) return null

    const verify = async (e) => {
        e.preventDefault()
        setError('')
        if (!/^\d{6}$/.test(code)) return setError('Enter the 6-digit code from the email')
        setBusy(true)
        try {
            await verifyEmailCode(code)
            updateUser({ ...user, emailVerified: true })
            trackEvent('email_verified')
        } catch (err) {
            setError(errorText(err, 'Could not verify. Please try again.'))
        } finally {
            setBusy(false)
        }
    }

    const resend = async () => {
        setError('')
        setMsg('')
        try {
            const res = await sendVerificationCode()
            if (res.alreadyVerified) updateUser({ ...user, emailVerified: true })
            else setMsg('New code sent. Check your inbox (and spam folder).')
        } catch (err) {
            setError(errorText(err, 'Could not send a new code. Try again in a minute.'))
        }
    }

    return (
        <section className="verify-banner" aria-labelledby="verify-title">
            <div className="verify-icon"><MailCheck size={22} /></div>
            <div className="verify-body">
                <h2 id="verify-title">Confirm your email</h2>
                <p>We sent a 6-digit code to <strong>{user.email}</strong>. Confirming helps you recover your account if you forget your password.</p>
                <form onSubmit={verify} className="verify-form">
                    <input
                        inputMode="numeric"
                        maxLength={6}
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="6-digit code"
                        aria-label="Verification code"
                        autoComplete="one-time-code"
                    />
                    <button type="submit" className="verify-btn" disabled={busy}>{busy ? 'Checking…' : 'Verify'}</button>
                    <button type="button" className="verify-link" onClick={resend}>Send a new code</button>
                </form>
                {msg && <p className="verify-msg" role="status">{msg}</p>}
                {error && <p className="verify-error" role="alert">{error}</p>}
            </div>
            <button type="button" className="verify-close" onClick={() => setHidden(true)} aria-label="Hide for now">
                <X size={18} />
            </button>
        </section>
    )
}

export default EmailVerifyBanner
