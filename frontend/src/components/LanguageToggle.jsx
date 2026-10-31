import { useLanguage } from '../contexts/LanguageContext'
import '../styles/LanguageToggle.css'

// English / Hindi switch. Uses the app's existing LanguageContext, so pages
// that call t() (and the new pages via useText()) switch together.
const LanguageToggle = ({ className = '' }) => {
    const { language, changeLanguage } = useLanguage()
    const isHindi = language === 'hi'
    return (
        <div className={`lang-toggle ${className}`} role="group" aria-label="Language">
            <button type="button" className={!isHindi ? 'active' : ''} aria-pressed={!isHindi} onClick={() => changeLanguage('en')} lang="en">
                EN
            </button>
            <button type="button" className={isHindi ? 'active' : ''} aria-pressed={isHindi} onClick={() => changeLanguage('hi')} lang="hi">
                हिं
            </button>
        </div>
    )
}

export default LanguageToggle
