import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ArrowRight, MessageSquare, BookOpen, ListChecks, Library, Globe, CheckCircle, ArrowUp, Github, Linkedin, Mail, ShieldCheck, Search, FileCheck2, ExternalLink } from 'lucide-react'
import { SCHEMES, getScheme } from '../data/schemes'
import LandingHero from '../components/LandingHero'
import CountUp from '../components/CountUp'
import { SchemeCard } from '../components/SchemeBits'
import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion'
import '../styles/Landing.css'
import '../styles/LandingInteractive.css'
import '../styles/Schemes.css'
import { trackOnce } from '../utils/analytics'
import { useText } from '../i18n/appText'
import { CONTACT_EMAIL } from '../config/contact'
import BrandMark from '../components/BrandMark'

// Schemes shown on the homepage: one for each of the main groups people ask about.
const FEATURED = ['pm-kisan', 'ayushman-bharat-pm-jay', 'jharkhand-maiyan-samman-yojana', 'pm-mudra-yojana', 'post-matric-scholarship-sc-students', 'sukanya-samriddhi-yojana']

const Landing = () => {
    const { isAuthenticated } = useAuth()
    const t = useText()
    const [showScrollTop, setShowScrollTop] = useState(false)
    const [activeStep, setActiveStep] = useState(0)
    const [stepsTouched, setStepsTouched] = useState(false)
    const landingRef = useRef(null)
    const reduceMotion = useReducedMotion()
    const { scrollYProgress } = useScroll()
    const progressScale = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 })

    useEffect(() => {
        trackOnce('landing_page_view')
    }, [])

    // Fade sections in as they scroll into view.
    useEffect(() => {
        const root = landingRef.current
        if (!root || reduceMotion || !('IntersectionObserver' in window)) return
        const sections = root.querySelectorAll('section:not(.hero)')
        root.classList.add('reveal-ready')
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view')
                    observer.unobserve(entry.target)
                }
            })
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
        sections.forEach((s) => observer.observe(s))
        return () => observer.disconnect()
    }, [reduceMotion])

    // "How it works" walks through its steps on its own until clicked.
    useEffect(() => {
        if (stepsTouched || reduceMotion) return
        const id = setInterval(() => setActiveStep((s) => (s + 1) % 3), 3500)
        return () => clearInterval(id)
    }, [stepsTouched, reduceMotion])

    useEffect(() => {
        const handleScroll = () => setShowScrollTop(window.scrollY > 400)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Only numbers we can back up from the app's own data.
    const stats = [
        { value: `${SCHEMES.length}`, label: t('l_stat_guides') },
        { value: '200+', label: t('l_stat_resources') },
        { value: '300+', label: t('l_stat_learning') },
        { value: '11', label: t('l_stat_languages') },
    ]

    // Each card opens the page that does what it says.
    const features = [
        { icon: <BookOpen size={28} />, title: t('l_f_guides'), text: t('l_f_guides_text'), to: '/schemes' },
        { icon: <ListChecks size={28} />, title: t('l_f_check'), text: t('l_f_check_text'), to: '/eligibility' },
        { icon: <MessageSquare size={28} />, title: t('l_f_ai'), text: t('l_f_ai_text'), to: isAuthenticated ? '/assistant' : '/register' },
        { icon: <Library size={28} />, title: t('l_f_res'), text: t('l_f_res_text'), to: isAuthenticated ? '/resources' : '/register' },
    ]

    const steps = [
        { icon: <Search size={22} />, title: t('l_s1'), text: t('l_s1_text') },
        { icon: <FileCheck2 size={22} />, title: t('l_s2'), text: t('l_s2_text') },
        { icon: <ExternalLink size={22} />, title: t('l_s3'), text: t('l_s3_text') },
    ]

    return (
        <div className="landing" ref={landingRef}>
            <motion.div className="scroll-progress" style={{ scaleX: progressScale }} aria-hidden="true" />

            <LandingHero isAuthenticated={isAuthenticated} />

            <section className="stats-strip" aria-label={t('l_stats_label')}>
                <div className="container stats-strip-grid">
                    {stats.map((stat) => (
                        <div key={stat.label} className="stats-strip-item">
                            <div className="stats-strip-value"><CountUp value={stat.value} /></div>
                            <div className="stats-strip-label">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            <section id="schemes" className="featured-schemes" aria-labelledby="featured-heading">
                <div className="container">
                    <div className="section-header">
                        <h2 id="featured-heading">{t('l_featured')}</h2>
                        <p>{t('l_featured_sub')}</p>
                    </div>
                    <div className="scheme-grid">
                        {FEATURED.map((slug) => <SchemeCard key={slug} scheme={getScheme(slug)} />)}
                    </div>
                    <div className="section-cta">
                        <Link to="/schemes" className="btn btn-explore">
                            {t('l_all_schemes', { n: SCHEMES.length })} <ArrowRight size={18} aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </section>

            <section id="about" className="about-section">
                <div className="container">
                    <div className="about-grid">
                        <div className="about-content">
                            <h2>{t('l_about_title')}</h2>
                            <p className="about-lead">{t('l_about_lead')}</p>
                            <p>{t('l_about_p2')}</p>
                            <ul className="about-features">
                                {['l_about_b1', 'l_about_b2', 'l_about_b3', 'l_about_b4'].map((k) => (
                                    <li key={k} className="about-feature">
                                        <CheckCircle size={20} aria-hidden="true" />
                                        <span>{t(k)}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link to="/about" className="about-more">{t('l_about_more')} <ArrowRight size={16} aria-hidden="true" /></Link>
                        </div>
                        <aside className="about-visual" aria-labelledby="not-gov-heading">
                            <div className="about-stats-card">
                                <h3 id="not-gov-heading"><ShieldCheck size={20} aria-hidden="true" /> {t('l_not_gov_title')}</h3>
                                <p>{t('l_not_gov_p1')}</p>
                                <p>{t('l_not_gov_p2')}</p>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>

            <section id="features" className="features-section">
                <div className="container">
                    <div className="section-header">
                        <h2>{t('l_features')}</h2>
                        <p>{t('l_features_sub')}</p>
                    </div>
                    <div className="features-grid">
                        {features.map((f) => (
                            <Link key={f.title} to={f.to} className="feature-card">
                                <div className="feature-icon" aria-hidden="true">{f.icon}</div>
                                <h3>{f.title}</h3>
                                <p>{f.text}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section id="how-it-works" className="how-it-works">
                <div className="container">
                    <div className="section-header">
                        <h2>{t('l_how')}</h2>
                        <p>{t('l_how_sub')}</p>
                    </div>

                    <div className="steps-track" aria-hidden="true">
                        <motion.div
                            className="steps-track-fill"
                            initial={false}
                            animate={{ width: `${(activeStep / 2) * 100}%` }}
                            // Same speed as the step cards, so line and card change together.
                            transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
                        />
                    </div>

                    <div className="steps-grid">
                        {steps.map((s, i) => (
                            <button
                                key={s.title}
                                type="button"
                                className={`step-card interactive-step ${i === activeStep ? 'active' : ''} ${i < activeStep ? 'done' : ''}`}
                                onClick={() => { setStepsTouched(true); setActiveStep(i) }}
                                aria-pressed={i === activeStep}
                            >
                                <div className="step-number">{i < activeStep ? <CheckCircle size={20} aria-hidden="true" /> : i + 1}</div>
                                <div className="step-icon" aria-hidden="true">{s.icon}</div>
                                <h3>{s.title}</h3>
                                <p>{s.text}</p>
                            </button>
                        ))}
                    </div>

                    <div className="section-cta">
                        <Link to="/eligibility" className="btn btn-explore">
                            {t('l_how_cta')} <ArrowRight size={18} aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </section>

            <section id="team" className="team-section">
                <div className="container">
                    <div className="section-header">
                        <h2>{t('l_team')}</h2>
                        <p>{t('l_team_sub')}</p>
                    </div>

                    <div className="team-grid">
                        <div className="team-card premium-member-card">
                            <div className="member-avatar-wrapper">
                                <div className="member-avatar has-photo">
                                    <img src="/team/ritesh-kumar.webp" alt="Ritesh Kumar" width="96" height="96" loading="lazy" decoding="async" />
                                </div>
                            </div>
                            <h3 className="member-name">Ritesh Kumar</h3>
                            <p className="member-role">{t('l_role_lead')}</p>
                            <p className="member-bio">{t('l_bio_ritesh')}</p>
                            <div className="member-social">
                                <a href="https://www.linkedin.com/in/riteshkumar-tech" target="_blank" rel="noopener noreferrer" className="social-btn linkedin" aria-label="Ritesh Kumar on LinkedIn" title="LinkedIn">
                                    <Linkedin size={20} aria-hidden="true" />
                                </a>
                                <a href="https://github.com/RiteshKumar2e" target="_blank" rel="noopener noreferrer" className="social-btn github" aria-label="Ritesh Kumar on GitHub" title="GitHub">
                                    <Github size={20} aria-hidden="true" />
                                </a>
                                <a href="https://riteshkr.info/" target="_blank" rel="noopener noreferrer" className="social-btn portfolio" aria-label="Ritesh Kumar's portfolio website" title="Portfolio">
                                    <Globe size={20} aria-hidden="true" />
                                </a>
                            </div>
                        </div>

                        <div className="team-card premium-member-card">
                            <div className="member-avatar-wrapper">
                                <div className="member-avatar member-initial" aria-hidden="true">A</div>
                            </div>
                            <h3 className="member-name">Ankit</h3>
                            <p className="member-role">{t('l_role_colead')}</p>
                            <p className="member-bio">{t('l_bio_ankit')}</p>
                            <div className="member-social">
                                <a href="https://www.linkedin.com/in/dev-ankit29/" target="_blank" rel="noopener noreferrer" className="social-btn linkedin" aria-label="Ankit on LinkedIn" title="LinkedIn">
                                    <Linkedin size={20} aria-hidden="true" />
                                </a>
                                <a href="https://github.com/Ankitkr-ak007/" target="_blank" rel="noopener noreferrer" className="social-btn github" aria-label="Ankit on GitHub" title="GitHub">
                                    <Github size={20} aria-hidden="true" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="final-cta">
                <div className="container">
                    <div className="final-cta-card">
                        <div>
                            <h2>{t('l_cta_title')}</h2>
                            <p>{t('l_cta_text')}</p>
                        </div>
                        <Link to="/eligibility" className="btn final-cta-btn">
                            {t('l_cta_btn')} <ArrowRight size={20} aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </section>

            <footer id="contact" className="landing-footer">
                <div className="container">
                    <div className="footer-grid">
                        <div className="footer-column brand-column">
                            <div className="footer-brand-header">
                                <BrandMark className="logo-icon" />
                                <span className="logo-text">Community AI</span>
                            </div>
                            <h2 className="connect-title">{t('l_connect')}</h2>
                            <div className="footer-social-links">
                                <a href="https://github.com/RiteshKumar2e" target="_blank" rel="noopener noreferrer" className="social-icon-link" aria-label="GitHub">
                                    <Github size={24} aria-hidden="true" />
                                </a>
                                <a href="https://www.linkedin.com/in/riteshkumar-tech" target="_blank" rel="noopener noreferrer" className="social-icon-link" aria-label="LinkedIn">
                                    <Linkedin size={24} aria-hidden="true" />
                                </a>
                                <a href={`mailto:${CONTACT_EMAIL}`} className="social-icon-link" aria-label={t('l_email_us')}>
                                    <Mail size={24} aria-hidden="true" />
                                </a>
                            </div>
                        </div>

                        <nav className="footer-column" aria-label={t('l_f_schemes')}>
                            <h2>{t('l_f_schemes')}</h2>
                            <Link to="/schemes">{t('l_f_all')}</Link>
                            <Link to="/eligibility">{t('nav_eligibility')}</Link>
                            <Link to="/schemes/category/students">{t('l_f_students')}</Link>
                            <Link to="/schemes/category/farmers">{t('l_f_farmers')}</Link>
                            <Link to="/schemes/category/women">{t('l_f_women')}</Link>
                        </nav>

                        <nav className="footer-column" aria-label={t('l_f_about')}>
                            <h2>{t('l_f_about')}</h2>
                            <Link to="/about">{t('nav_about')}</Link>
                            <Link to="/editorial-policy">{t('l_f_editorial')}</Link>
                            <Link to="/contact">{t('nav_contact')}</Link>
                        </nav>

                        <nav className="footer-column" aria-label={t('l_f_legal')}>
                            <h2>{t('l_f_legal')}</h2>
                            <Link to="/privacy">{t('l_f_privacy')}</Link>
                            <Link to="/terms">{t('l_f_terms')}</Link>
                            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                        </nav>
                    </div>

                    <div className="footer-bottom">
                        <p className="footer-disclaimer">{t('l_footer_disclaimer')}</p>
                        <p>&copy; 2026 Community AI</p>
                    </div>
                </div>
            </footer>

            <button
                className={`scroll-to-top ${showScrollTop ? 'visible' : ''}`}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                aria-label={t('l_to_top')}
            >
                <ArrowUp size={24} aria-hidden="true" />
            </button>
        </div>
    )
}

export default Landing
