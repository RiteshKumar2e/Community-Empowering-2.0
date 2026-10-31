// Google Analytics 4, loaded only after the visitor accepts the cookie banner.
// Set VITE_GA_MEASUREMENT_ID (e.g. G-XXXXXXXXXX) in .env / Vercel to enable it;
// without it every function here is a no-op.

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID
export const CONSENT_KEY = 'cookie-consent' // 'accepted' | 'declined'

let loaded = false

export const hasAnalyticsConsent = () => localStorage.getItem(CONSENT_KEY) === 'accepted'

export const loadAnalytics = () => {
    if (loaded || !GA_ID || !hasAnalyticsConsent()) return
    loaded = true

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
    document.head.appendChild(script)

    window.dataLayer = window.dataLayer || []
    window.gtag = function gtag() { window.dataLayer.push(arguments) }
    window.gtag('js', new Date())
    // Page views are sent manually from trackPageView because this is a SPA.
    window.gtag('config', GA_ID, { send_page_view: false, anonymize_ip: true })
}

export const trackPageView = (path, title) => {
    if (!loaded || !window.gtag) return
    window.gtag('event', 'page_view', { page_path: path, page_title: title })
}
