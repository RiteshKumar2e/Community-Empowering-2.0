// Google Analytics 4 (G-E62VV5FB9M).
//
// The Google tag itself is in index.html, so Google's tag checker can see it.
// Consent Mode keeps analytics cookies off ("denied") until the visitor clicks
// Accept on the cookie banner; grantAnalyticsConsent() switches it on.
//
// Page views: GA4 "Enhanced measurement" (on by default) records a page_view
// on every client-side route change, so we do NOT send page_view manually.
// Keep "Page changes based on browser history events" enabled in
// GA4 Admin > Data streams > Enhanced measurement.
export const CONSENT_KEY = 'cookie-consent' // 'accepted' | 'declined'

export const hasAnalyticsConsent = () => localStorage.getItem(CONSENT_KEY) === 'accepted'

export const grantAnalyticsConsent = () => {
    window.gtag?.('consent', 'update', { analytics_storage: 'granted' })
}

// Product events. Never pass personal data (name, phone, email, exact age,
// income, caste, eligibility answers) in params.
//   scheme_search                { search_term }   typed query, debounced
//   scheme_filter_used           { filter_type, value }
//   eligibility_check_started
//   eligibility_check_completed  { results_count }
//   official_link_clicked        { scheme, link_url }
//   scheme_report_issue_clicked  { scheme }
export const trackEvent = (name, params = {}) => {
    window.gtag?.('event', name, params)
}

// Fire an event at most once per browser session for a given key (e.g. a
// landing view or "signup started"), so re-renders and back-navigation don't
// inflate counts.
export const trackOnce = (name, key = name, params = {}) => {
    try {
        const storageKey = `ga-once:${name}:${key}`
        if (sessionStorage.getItem(storageKey)) return
        sessionStorage.setItem(storageKey, '1')
    } catch { /* storage unavailable: send anyway */ }
    trackEvent(name, params)
}

// Full event list (GA4 > Admin > Events). No personal data in any params.
//   landing_page_view            once per session
//   scheme_detail_view           { scheme }
//   signup_prompt_viewed         { source }
//   signup_started               { source }      once per session
//   signup_completed             { method }
//   login_completed              { method }
//   scheme_saved                 { scheme, source }
//   eligibility_result_saved     { results_count }
