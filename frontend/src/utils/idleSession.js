// Signed-in users are logged out after this long with no activity. The last
// activity time lives in localStorage so that every open tab shares it and it
// survives closing the browser.
export const IDLE_LIMIT_MS = 30 * 60 * 1000
const LAST_ACTIVITY_KEY = 'last-activity'

export const markActive = () => {
    try { localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now())) } catch { /* storage blocked */ }
}

export const idleForMs = () => {
    try {
        const last = Number(localStorage.getItem(LAST_ACTIVITY_KEY))
        return last ? Date.now() - last : 0 // no record yet: count as active
    } catch { return 0 }
}

export const isIdleExpired = () => idleForMs() >= IDLE_LIMIT_MS
