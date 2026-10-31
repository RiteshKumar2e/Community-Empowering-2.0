// Signed-in user data (saved schemes, saved eligibility results) plus the
// "keep my progress while I sign up" helpers.
//
// Before signup, a visitor's latest eligibility result and any schemes they
// tried to save are kept in localStorage on their device only. After login
// or registration, syncPending() uploads them to their account and clears them.
import api from './api'
import { trackEvent } from '../utils/analytics'

const PENDING_RESULT = 'pending-eligibility-result'
const PENDING_SAVES = 'pending-saved-schemes'
const RECENTLY_VIEWED = 'recently-viewed-schemes'
const SYNC_NOTICE = 'pending-sync-notice'

const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}
const write = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* storage full or blocked */ }
}

// Social category is never kept: it is only used on screen to match schemes.
const SAFE_ANSWER_KEYS = ['age', 'gender', 'occupation', 'state', 'taxPayer', 'income', 'daughter']
export const safeAnswers = (answers) =>
    Object.fromEntries(SAFE_ANSWER_KEYS.filter((k) => answers[k] !== undefined).map((k) => [k, answers[k]]))

export const stashPendingResult = (answers, schemes) =>
    write(PENDING_RESULT, { answers: safeAnswers(answers), schemes, at: Date.now() })
export const getPendingResult = () => read(PENDING_RESULT, null)

export const stashPendingSave = (slug) => {
    const list = read(PENDING_SAVES, [])
    if (!list.includes(slug)) write(PENDING_SAVES, [...list, slug].slice(-20))
}
export const getPendingSaves = () => read(PENDING_SAVES, [])

// Uploads anything the visitor did before signing in. Items are only cleared
// after the server accepts them, so a failed request loses nothing.
export const syncPending = async () => {
    const synced = { result: false, schemes: 0 }
    const pending = getPendingResult()
    if (pending) {
        try {
            await api.post('/me/eligibility-results', { answers: pending.answers, schemes: pending.schemes })
            localStorage.removeItem(PENDING_RESULT)
            synced.result = true
            trackEvent('eligibility_result_saved', { results_count: pending.schemes.length, source: 'after_signup' })
        } catch { /* keep for next time */ }
    }
    const saves = getPendingSaves()
    const remaining = []
    for (const slug of saves) {
        try {
            await api.post('/me/saved-schemes', { slug })
            synced.schemes += 1
            trackEvent('scheme_saved', { scheme: slug, source: 'after_signup' })
        } catch {
            remaining.push(slug)
        }
    }
    if (saves.length) {
        if (remaining.length) write(PENDING_SAVES, remaining)
        else localStorage.removeItem(PENDING_SAVES)
    }
    if (synced.result || synced.schemes) {
        try { sessionStorage.setItem(SYNC_NOTICE, JSON.stringify(synced)) } catch { /* ignore */ }
    }
    return synced
}

// One-time "we saved your progress" message for the dashboard.
export const takeSyncNotice = () => {
    try {
        const value = JSON.parse(sessionStorage.getItem(SYNC_NOTICE))
        sessionStorage.removeItem(SYNC_NOTICE)
        return value
    } catch { return null }
}

export const fetchSavedSchemes = () => api.get('/me/saved-schemes').then((r) => r.data)
export const saveScheme = (slug) => api.post('/me/saved-schemes', { slug }).then((r) => r.data)
export const unsaveScheme = (slug) => api.delete(`/me/saved-schemes/${slug}`).then((r) => r.data)
export const fetchEligibilityResults = () => api.get('/me/eligibility-results').then((r) => r.data)
export const saveEligibilityResult = (answers, schemes) =>
    api.post('/me/eligibility-results', { answers: safeAnswers(answers), schemes }).then((r) => r.data)

// Recently viewed scheme guides: device-only, never sent to the server.
export const rememberViewed = (slug) => {
    const list = read(RECENTLY_VIEWED, []).filter((s) => s !== slug)
    write(RECENTLY_VIEWED, [slug, ...list].slice(0, 6))
}
export const getRecentlyViewed = () => read(RECENTLY_VIEWED, [])

// Where to send the user after they sign up / sign in (e.g. back to the scheme
// they wanted to apply for). Only same-site paths are accepted.
const POST_AUTH_REDIRECT = 'post-auth-redirect'
export const setPostAuthRedirect = (path) => {
    try { sessionStorage.setItem(POST_AUTH_REDIRECT, path) } catch { /* ignore */ }
}
export const takePostAuthRedirect = () => {
    try {
        const path = sessionStorage.getItem(POST_AUTH_REDIRECT)
        sessionStorage.removeItem(POST_AUTH_REDIRECT)
        return path && path.startsWith('/') && !path.startsWith('//') ? path : null
    } catch { return null }
}

// Reminders: dates the user sets for themselves.
export const fetchReminders = () => api.get('/me/reminders').then((r) => r.data)
export const createReminder = (title, remindOn, schemeSlug) =>
    api.post('/me/reminders', { title, remindOn, schemeSlug: schemeSlug || null }).then((r) => r.data)
export const toggleReminder = (id) => api.patch(`/me/reminders/${id}`).then((r) => r.data)
export const deleteReminder = (id) => api.delete(`/me/reminders/${id}`).then((r) => r.data)

// Email verification
export const sendVerificationCode = () => api.post('/auth/email/send-verification').then((r) => r.data)
export const verifyEmailCode = (code) => api.post('/auth/email/verify', { code }).then((r) => r.data)

// Account data
export const exportMyData = () => api.get('/me/export').then((r) => r.data)
export const deleteMyAccount = () => api.delete('/me/account', { data: { confirm: 'DELETE' } }).then((r) => r.data)
