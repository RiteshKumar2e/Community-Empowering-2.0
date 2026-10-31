import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

const SYNCED_KEY = 'language-synced-for'

// Applies the "Preferred language" from the user's account (chosen at signup
// or in Profile) to the site. Runs only when the account or that preference
// changes, so a later EN/हिं toggle by the user is not undone on every visit.
// Site text exists in English and Hindi; for other languages the AI
// assistant's greeting and voice use the language and the rest stays English.
const UserLanguageSync = () => {
    const { user } = useAuth()
    const { language, changeLanguage, availableLanguages } = useLanguage()

    useEffect(() => {
        const preferred = user?.language
        if (!preferred || !availableLanguages.includes(preferred)) return
        const key = `${user.id}:${preferred}`
        let synced = null
        try { synced = localStorage.getItem(SYNCED_KEY) } catch { /* storage unavailable */ }
        if (synced === key) return
        try { localStorage.setItem(SYNCED_KEY, key) } catch { /* storage unavailable */ }
        if (preferred !== language) changeLanguage(preferred)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, user?.language])

    return null
}

export default UserLanguageSync
