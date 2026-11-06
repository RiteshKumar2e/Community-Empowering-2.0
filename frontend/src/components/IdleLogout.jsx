import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { idleForMs, isIdleExpired, markActive } from '../utils/idleSession'

const ACTIVITY_EVENTS = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'scroll', 'touchstart']
const CHECK_EVERY_MS = 15000
const SAVE_EVERY_MS = 10000

// Logs a signed-in user out after 30 minutes without activity in any tab.
// Times are compared with the clock rather than a single long timer, because
// browsers pause timers in background tabs and while a laptop sleeps.
const IdleLogout = () => {
    const { isAuthenticated } = useAuth()

    useEffect(() => {
        if (!isAuthenticated) return undefined
        markActive()

        const expire = () => window.dispatchEvent(new CustomEvent('auth:expired', { detail: { reason: 'idle' } }))
        const check = () => { if (isIdleExpired()) expire() }
        // Checked first: moving the mouse after a long break must not count as
        // activity that rescues the expired session.
        const onActivity = () => {
            if (isIdleExpired()) expire()
            else if (idleForMs() >= SAVE_EVERY_MS) markActive()
        }
        // Signed out in another tab: this tab must not stay signed in on screen.
        const onStorage = (e) => {
            if (e.key === 'token' && !e.newValue) window.location.reload()
        }

        const timer = setInterval(check, CHECK_EVERY_MS)
        ACTIVITY_EVENTS.forEach((name) => window.addEventListener(name, onActivity, { passive: true }))
        document.addEventListener('visibilitychange', check)
        window.addEventListener('focus', check)
        window.addEventListener('storage', onStorage)
        return () => {
            clearInterval(timer)
            ACTIVITY_EVENTS.forEach((name) => window.removeEventListener(name, onActivity))
            document.removeEventListener('visibilitychange', check)
            window.removeEventListener('focus', check)
            window.removeEventListener('storage', onStorage)
        }
    }, [isAuthenticated])

    return null
}

export default IdleLogout
