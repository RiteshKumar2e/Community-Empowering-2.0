import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CONSENT_KEY, grantAnalyticsConsent } from '../utils/analytics'
import '../styles/CookieConsent.css'

const CookieConsent = () => {
    const [visible, setVisible] = useState(() => !localStorage.getItem(CONSENT_KEY))

    if (!visible) return null

    const choose = (value) => {
        localStorage.setItem(CONSENT_KEY, value)
        setVisible(false)
        if (value === 'accepted') grantAnalyticsConsent()
    }

    return (
        <div className="cookie-consent" role="dialog" aria-live="polite" aria-label="Cookie consent">
            <p>
                We use essential browser storage to keep you signed in, and optional analytics
                to improve the site. See our <Link to="/privacy">Privacy Policy</Link>.
            </p>
            <div className="cookie-consent-actions">
                <button type="button" className="cookie-btn cookie-btn-secondary" onClick={() => choose('declined')}>
                    Decline
                </button>
                <button type="button" className="cookie-btn cookie-btn-primary" onClick={() => choose('accepted')}>
                    Accept
                </button>
            </div>
        </div>
    )
}

export default CookieConsent
