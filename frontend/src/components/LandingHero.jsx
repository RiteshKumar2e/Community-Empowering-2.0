import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { HERO_PHOTOS } from '../data/heroPhotos'
import { ArrowRight, ShieldCheck, Languages, BadgeIndianRupee, GraduationCap, Sprout, Briefcase, Store, HeartPulse } from 'lucide-react'
import { useText } from '../i18n/appText'


const PHOTO_INTERVAL_MS = 7000

// "What do you need help with?" links straight to the matching scheme guides.
const NEEDS = [
    { label: 'h_need_scholar', icon: GraduationCap, to: '/schemes/category/students' },
    { label: 'h_need_farm', icon: Sprout, to: '/schemes/category/farmers' },
    { label: 'h_need_jobs', icon: Briefcase, to: '/schemes/category/employment' },
    { label: 'h_need_business', icon: Store, to: '/schemes/category/business' },
    { label: 'h_need_health', icon: HeartPulse, to: '/schemes/category/health-insurance' },
]

const LandingHero = ({ isAuthenticated }) => {
    const reduceMotion = useReducedMotion()
    const t = useText()

    // Background photos: the first loads with the page. Each later photo is
    // downloaded one step ahead of when it is shown, so a visitor who leaves
    // early never downloads all of them. They change only when motion is
    // allowed and the tab is visible.
    const [photo, setPhoto] = useState(0)
    const [loaded, setLoaded] = useState(1) // photos 0..loaded-1 are in the page
    useEffect(() => {
        if (reduceMotion) return undefined
        const ready = () => setLoaded((n) => Math.max(n, 2))
        if (document.readyState === 'complete') ready()
        else window.addEventListener('load', ready, { once: true })
        return () => window.removeEventListener('load', ready)
    }, [reduceMotion])
    useEffect(() => {
        if (loaded < 2 || reduceMotion) return undefined
        const id = setInterval(() => {
            if (document.hidden) return
            setPhoto((n) => {
                const next = (n + 1) % HERO_PHOTOS.length
                setLoaded((l) => Math.min(HERO_PHOTOS.length, Math.max(l, next + 2)))
                return next
            })
        }, PHOTO_INTERVAL_MS)
        return () => clearInterval(id)
    }, [loaded >= 2, reduceMotion]) // eslint-disable-line react-hooks/exhaustive-deps -- restart only when rotation becomes possible

    // Visitors start with the free eligibility check (no sign-up); the account
    // prompt appears only after they have useful results.
    const ctaTo = isAuthenticated ? '/assistant' : '/eligibility'
    const ctaLabel = isAuthenticated ? t('h_cta_ai') : t('h_cta')

    return (
        <section id="home" className="hero hero-interactive hero-has-photos">
            <div className="hero-photos" aria-hidden="true">
                {HERO_PHOTOS.map((p, i) => i < loaded && (
                    <img key={p.src} src={p.src} alt="" className={i === photo ? 'active' : ''} decoding="async" />
                ))}
            </div>
            <div className="container hero-grid">
                <motion.div
                    className="hero-copy"
                    // No fade-in: the prerendered HTML must be readable before JavaScript runs.
                    initial={false}
                >
                    <h1 className="hero-title">
                        {t('h_title_a')}<span className="hero-highlight">{t('h_title_b')}</span>{t('h_title_c')}
                    </h1>

                    <p className="hero-subtitle">
                        {t('h_subtitle')}
                    </p>

                    <p className="hero-question" id="hero-needs-label">{t('h_question')}</p>
                    <nav className="need-chips" aria-labelledby="hero-needs-label">
                        {NEEDS.map((n) => (
                            <Link key={n.to} to={n.to} className="need-chip">
                                <n.icon size={16} aria-hidden="true" />
                                {t(n.label)}
                            </Link>
                        ))}
                    </nav>

                    <div className="hero-actions">
                        <motion.div whileTap={{ scale: 0.98 }}>
                            <Link to={ctaTo} className="btn btn-explore hero-cta">
                                {ctaLabel}
                                <ArrowRight size={20} className="hero-cta-arrow" aria-hidden="true" />
                            </Link>
                        </motion.div>
                        <Link to="/schemes" className="hero-secondary-link">
                            {t('h_browse')}
                        </Link>
                    </div>

                    <ul className="hero-trust">
                        <li><BadgeIndianRupee size={16} aria-hidden="true" /> {t('h_trust_free')}</li>
                        <li><Languages size={16} aria-hidden="true" /> {t('h_trust_lang')}</li>
                        <li><ShieldCheck size={16} aria-hidden="true" /> {t('h_trust_nosignup')}</li>
                    </ul>
                </motion.div>
            </div>
        </section>
    )
}

export default LandingHero
