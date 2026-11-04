import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ArrowRight, Bot, ShieldCheck, Languages, BadgeIndianRupee, GraduationCap, Sprout, Briefcase, Store, HeartPulse } from 'lucide-react'

// Each "need" drives the live demo chat and is passed to /register?need=… so
// the signup wizard can pre-select the matching community type.
const NEEDS = [
    {
        id: 'scholarships',
        icon: GraduationCap,
        label: 'Scholarships',
        question: "I'm in class 12 and my family earns under ₹2.5 lakh a year. Is there any scholarship for me?",
        answer: "Yes! You may qualify for the Post-Matric Scholarship and several schemes on the National Scholarship Portal (scholarships.gov.in). I can list the ones for your state and the documents you'll need.",
    },
    {
        id: 'farming',
        icon: Sprout,
        label: 'Farming help',
        question: 'Mujhe kheti ke liye sarkari madad chahiye.',
        answer: 'PM-KISAN yojana mein saal ke ₹6,000 seedhe aapke bank khate mein aate hain. Fasal kharab hone par PM Fasal Bima Yojana madad karti hai. Kya main aavedan ke steps bataun?',
    },
    {
        id: 'jobs',
        icon: Briefcase,
        label: 'Jobs & skills',
        question: 'How can I learn a skill and find a job near my town?',
        answer: 'Skill India Digital has free courses with certificates, and PMKVY training centres offer placement support. Tell me your district and I will find the nearest centres.',
    },
    {
        id: 'business',
        icon: Store,
        label: 'Start a business',
        question: 'I want a loan to open a small shop. Where do I start?',
        answer: 'PM MUDRA Yojana gives collateral-free loans: Shishu loans up to ₹50,000 to start, and Kishore and Tarun loans as you grow. I can walk you through applying at your bank.',
    },
    {
        id: 'health',
        icon: HeartPulse,
        label: 'Health cover',
        question: 'Is there free hospital treatment for my parents?',
        answer: 'Ayushman Bharat PM-JAY covers up to ₹5 lakh per family per year for hospital care, and every senior citizen aged 70+ is now covered regardless of income. Let me check if your family is eligible.',
    },
]

const AUTO_CYCLE_MS = 9000

const LandingHero = ({ isAuthenticated }) => {
    const reduceMotion = useReducedMotion()
    const [active, setActive] = useState(0)
    const [userPicked, setUserPicked] = useState(false)
    const [phase, setPhase] = useState('asking') // asking -> typing -> answering -> done
    const [typed, setTyped] = useState('')
    const timers = useRef([])

    const need = NEEDS[active]

    // Play the question → "typing…" → streamed answer sequence for the active need.
    useEffect(() => {
        timers.current.forEach(clearTimeout)
        timers.current = []

        if (reduceMotion) {
            setPhase('done')
            setTyped(need.answer)
            return
        }

        setPhase('asking')
        setTyped('')
        timers.current.push(setTimeout(() => setPhase('typing'), 700))
        timers.current.push(setTimeout(() => {
            setPhase('answering')
            let i = 0
            const tick = () => {
                i += 2
                setTyped(need.answer.slice(0, i))
                if (i < need.answer.length) {
                    timers.current.push(setTimeout(tick, 18))
                } else {
                    setPhase('done')
                }
            }
            tick()
        }, 1900))

        return () => timers.current.forEach(clearTimeout)
    }, [active, need.answer, reduceMotion])

    // Keep cycling through examples until the visitor picks one themselves.
    // Timed from the topic change so it matches the progress bar under the chip.
    useEffect(() => {
        if (userPicked || reduceMotion) return
        const id = setTimeout(() => setActive((a) => (a + 1) % NEEDS.length), AUTO_CYCLE_MS)
        return () => clearTimeout(id)
    }, [active, userPicked, reduceMotion])

    const pick = (index) => {
        setUserPicked(true)
        setActive(index)
    }

    // Visitors start with the free eligibility check (no sign-up); the account
    // prompt appears only after they have useful results.
    const ctaTo = isAuthenticated ? '/assistant' : '/eligibility'
    const ctaLabel = isAuthenticated ? 'Ask the AI Assistant' : 'Check My Scheme Eligibility — Free'
    const askTo = isAuthenticated ? '/assistant' : `/register?need=${need.id}`

    return (
        <section id="home" className="hero hero-interactive">
            <div className="container hero-grid">
                <motion.div
                    className="hero-copy"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="hero-title">
                        Find the government help <span className="hero-highlight">you deserve</span>, in your language
                    </h1>

                    <p className="hero-subtitle">
                        Ask about schemes, scholarships, jobs or health cover and get a clear answer
                        in seconds, by text or voice.
                    </p>

                    <p className="hero-question" id="hero-needs-label">What do you need help with?</p>
                    <div className="need-chips" role="tablist" aria-labelledby="hero-needs-label">
                        {NEEDS.map((n, i) => (
                            <button
                                key={n.id}
                                type="button"
                                role="tab"
                                aria-selected={i === active}
                                className={`need-chip ${i === active ? 'active' : ''}`}
                                onClick={() => pick(i)}
                            >
                                <n.icon size={16} aria-hidden="true" />
                                {n.label}
                                {i === active && !userPicked && !reduceMotion && (
                                    <motion.span
                                        key={`bar-${active}`}
                                        className="need-chip-timer"
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ duration: AUTO_CYCLE_MS / 1000, ease: 'linear' }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="hero-actions">
                        <motion.div whileTap={{ scale: 0.98 }}>
                            <Link to={ctaTo} className="btn btn-explore hero-cta">
                                {ctaLabel}
                                <ArrowRight size={20} className="hero-cta-arrow" />
                            </Link>
                        </motion.div>
                        <Link to="/schemes" className="hero-secondary-link">
                            Browse Government Schemes
                        </Link>
                    </div>

                    <ul className="hero-trust">
                        <li><BadgeIndianRupee size={16} /> 100% free</li>
                        <li><Languages size={16} /> 5+ languages</li>
                        <li><ShieldCheck size={16} /> No sign-up needed to check</li>
                    </ul>
                </motion.div>

                <motion.div
                    className="hero-demo"
                    initial={{ opacity: 0, y: 24, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    aria-live="polite"
                >
                    <div className="demo-header">
                        <div className="demo-avatar"><Bot size={18} /></div>
                        <div>
                            <div className="demo-name">Community AI Assistant</div>
                            <div className="demo-status"><span className="demo-dot" /> Online</div>
                        </div>
                    </div>

                    <div className="demo-body">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={need.id}
                                className="demo-thread"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <motion.div
                                    className="demo-bubble demo-user"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    {need.question}
                                </motion.div>

                                {phase === 'typing' && (
                                    <motion.div
                                        className="demo-bubble demo-bot demo-typing"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        aria-label="Assistant is typing"
                                    >
                                        <span /><span /><span />
                                    </motion.div>
                                )}

                                {(phase === 'answering' || phase === 'done') && (
                                    <div className="demo-bubble demo-bot">
                                        {typed}
                                        {phase === 'answering' && <span className="demo-caret" />}
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <Link to={askTo} className="demo-input">
                        <span>{isAuthenticated ? 'Ask your own question…' : 'Sign up free to ask your own question…'}</span>
                        <span className="demo-send"><ArrowRight size={16} /></span>
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}

export default LandingHero
