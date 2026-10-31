import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, RotateCcw, Lock, Sparkles, X, Check, BookmarkCheck } from 'lucide-react'
import { SCHEMES } from '../data/schemes'
import { SchemeCard, Disclaimer, Breadcrumbs } from '../components/SchemeBits'
import { trackEvent, trackOnce } from '../utils/analytics'
import { useAuth } from '../contexts/AuthContext'
import { stashPendingResult, saveEligibilityResult } from '../services/myData'
import '../styles/Schemes.css'

// Public, no login needed. Answers stay in this component's state only:
// nothing is sent to the server, and analytics only gets "started",
// "completed" and a result count.
const QUESTIONS = [
    { id: 'age', title: 'How old are you?', type: 'number' },
    {
        id: 'gender', title: 'You are…', options: [
            ['female', 'Woman'], ['male', 'Man'], ['other', 'Other / prefer not to say'],
        ],
    },
    {
        id: 'occupation', title: 'What describes you best right now?', options: [
            ['student', '🎓 Student'], ['farmer', '🌾 Farmer'], ['worker', '🛠️ Working (job or daily wage)'],
            ['business', '🏪 Running a business'], ['unemployed', '🔎 Looking for work'],
            ['homemaker', '🏠 Homemaker'], ['retired', '🧓 Retired'],
        ],
    },
    {
        id: 'state', title: 'Which state do you live in?', options: [
            ['Jharkhand', 'Jharkhand'], ['other', 'Another state'],
        ],
    },
    {
        id: 'taxPayer', title: 'Do you pay income tax?', options: [
            ['no', 'No'], ['yes', 'Yes'], ['unsure', 'Not sure'],
        ],
    },
    {
        id: 'category', title: 'Social category (optional)', hint: 'Some scholarships and loans are only for certain categories. You can skip this.', options: [
            ['sc', 'Scheduled Caste (SC)'], ['st', 'Scheduled Tribe (ST)'], ['other', 'Other / General / OBC'], ['skip', 'Prefer not to say'],
        ],
    },
    {
        id: 'income', title: 'Is your family’s total yearly income up to ₹2.5 lakh?', options: [
            ['below', 'Yes, up to ₹2.5 lakh'], ['above', 'No, more than that'], ['unsure', 'Not sure'],
        ],
    },
    {
        id: 'daughter', title: 'Do you have a daughter under 10 years old?', options: [
            ['yes', 'Yes'], ['no', 'No'],
        ],
    },
]

const reasonFor = (scheme, a) => {
    const m = scheme.match
    if (scheme.slug === 'ayushman-bharat-pm-jay') {
        return a.age >= 70
            ? 'You are 70 or older, so you are covered regardless of income.'
            : 'Depends on whether your family is in the PM-JAY list. Check on the official portal.'
    }
    const bits = []
    if (m.state) bits.push(`you live in ${m.state}`)
    if (m.gender === 'female') bits.push('it is for women')
    if (m.requires === 'sc') bits.push('it is for SC students')
    if (m.parentOfGirlUnder10) bits.push('you have a daughter under 10')
    if (m.minAge || m.maxAge) bits.push(`your age fits (${m.minAge || 0}${m.maxAge ? `–${m.maxAge}` : '+'})`)
    if (Array.isArray(m.occupations)) bits.push('it suits your work situation')
    let text = bits.length ? `Shown because ${bits.join(', ')}.` : 'Open to most people.'
    if (m.excludesTaxPayers && a.taxPayer === 'unsure') text += ' Not open to income-tax payers. Check this first.'
    return text
}

const matchSchemes = (a) => SCHEMES.filter((s) => {
    const m = s.match
    if (m.occupations !== 'any' && !m.occupations.includes(a.occupation)) return false
    if (m.minAge && a.age < m.minAge) return false
    if (m.maxAge && a.age > m.maxAge) return false
    if (m.gender && a.gender !== m.gender) return false
    if (m.state && a.state !== m.state) return false
    if (m.excludesTaxPayers && a.taxPayer === 'yes') return false
    if (m.requires === 'sc' && a.category !== 'sc') return false
    if (m.requires === 'woman-or-scst' && !(a.gender === 'female' || a.category === 'sc' || a.category === 'st')) return false
    if (m.excludesHighIncome && a.income === 'above') return false
    if (m.parentOfGirlUnder10 && a.daughter !== 'yes') return false
    return true
})

// Shown once a visitor has useful results. Dismissable, never blocks reading.
const SignupPrompt = ({ count, onDismiss }) => {
    useEffect(() => {
        trackEvent('signup_prompt_viewed', { source: 'eligibility_results' })
    }, [])
    return (
        <motion.aside
            className="signup-prompt"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            aria-labelledby="signup-prompt-title"
        >
            <button type="button" className="signup-prompt-close" onClick={onDismiss} aria-label="Dismiss">
                <X size={18} />
            </button>
            <h3 id="signup-prompt-title">Save these {count} schemes to your free account</h3>
            <ul>
                <li><Check size={16} /> Keep this personalised list and come back to it anytime</li>
                <li><Check size={16} /> Bookmark schemes and open official portals from your dashboard</li>
                <li><Check size={16} /> Ask our AI assistant follow-up questions about your situation</li>
            </ul>
            <p className="muted">Your results are kept on this device while you sign up. No Aadhaar or bank details needed.</p>
            <div className="signup-prompt-actions">
                <Link
                    to="/register?next=save-results"
                    className="btn btn-primary"
                >
                    Create a Free Account to Save My Results
                </Link>
                <Link to="/login?next=save-results" className="signup-prompt-login">I already have an account</Link>
            </div>
            <button type="button" className="signup-prompt-skip" onClick={onDismiss}>
                Not now, keep browsing
            </button>
        </motion.aside>
    )
}

const EligibilityChecker = () => {
    const { isAuthenticated } = useAuth()
    const [promptDismissed, setPromptDismissed] = useState(false)
    const [saveState, setSaveState] = useState('idle') // idle | saving | saved | error
    const [step, setStep] = useState(0)
    const [answers, setAnswers] = useState({})
    const [ageInput, setAgeInput] = useState('')
    const [ageError, setAgeError] = useState('')
    const [started, setStarted] = useState(false)

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    const done = step >= QUESTIONS.length
    const results = useMemo(() => (done ? matchSchemes(answers) : []), [done, answers])

    useEffect(() => {
        if (!done) return
        trackEvent('eligibility_check_completed', { results_count: results.length })
        // Keep the result on this device so it survives signup/login.
        if (!isAuthenticated && results.length > 0) stashPendingResult(answers, results.map((s) => s.slug))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [done])

    const saveToAccount = async () => {
        setSaveState('saving')
        try {
            await saveEligibilityResult(answers, results.map((s) => s.slug))
            setSaveState('saved')
            trackEvent('eligibility_result_saved', { results_count: results.length })
        } catch {
            setSaveState('error')
        }
    }

    const answer = (id, value) => {
        if (!started) {
            setStarted(true)
            trackEvent('eligibility_check_started')
        }
        setAnswers((prev) => ({ ...prev, [id]: value }))
        setStep((s) => s + 1)
    }

    const submitAge = (e) => {
        e.preventDefault()
        const age = parseInt(ageInput, 10)
        if (!age || age < 1 || age > 120) {
            setAgeError('Please enter your age in years')
            return
        }
        setAgeError('')
        answer('age', age)
    }

    const restart = () => {
        setSaveState('idle')
        setAnswers({})
        setAgeInput('')
        setStep(0)
    }

    const q = QUESTIONS[step]

    return (
        <main className="schemes-page eligibility-page">
            <div className="container narrow">
                <Breadcrumbs items={[
                    { label: 'Home', to: '/' },
                    { label: 'Government Schemes', to: '/schemes' },
                    { label: 'Eligibility Checker' },
                ]} />

                <header className="schemes-header">
                    <h1>Which government schemes may I be eligible for?</h1>
                    <p className="schemes-lead">
                        Answer {QUESTIONS.length} quick questions to see schemes worth checking. No sign-up, and we never ask for Aadhaar or bank details.
                    </p>
                    <p className="privacy-note"><Lock size={14} /> Your answers stay on this device unless you choose to save them to a free account.</p>
                </header>

                <div className="eligibility-card">
                    <div className="wizard-progress-track" aria-hidden="true">
                        <motion.div
                            className="wizard-progress-fill"
                            initial={false}
                            animate={{ width: `${(Math.min(step, QUESTIONS.length) / QUESTIONS.length) * 100}%` }}
                        />
                    </div>

                    <AnimatePresence mode="wait">
                        {!done ? (
                            <motion.div
                                key={q.id}
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                transition={{ duration: 0.2 }}
                                className="eligibility-question"
                            >
                                <p className="question-count">Question {step + 1} of {QUESTIONS.length}</p>
                                <h2>{q.title}</h2>
                                {q.hint && <p className="muted">{q.hint}</p>}

                                {q.type === 'number' ? (
                                    <form onSubmit={submitAge} className="age-form">
                                        <input
                                            type="number"
                                            inputMode="numeric"
                                            min="1"
                                            max="120"
                                            value={ageInput}
                                            onChange={(e) => setAgeInput(e.target.value)}
                                            placeholder="Age in years"
                                            aria-label="Your age in years"
                                        />
                                        <button type="submit" className="btn btn-primary">
                                            Next <ArrowRight size={16} />
                                        </button>
                                        {ageError && <p className="field-error" role="alert">{ageError}</p>}
                                    </form>
                                ) : (
                                    <div className="answer-grid">
                                        {q.options.map(([value, label]) => (
                                            <button
                                                key={value}
                                                type="button"
                                                className={`answer-btn ${answers[q.id] === value ? 'selected' : ''}`}
                                                onClick={() => answer(q.id, value)}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {step > 0 && (
                                    <button type="button" className="back-link" onClick={() => setStep((s) => s - 1)}>
                                        <ArrowLeft size={16} /> Back
                                    </button>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="eligibility-results"
                            >
                                <h2>
                                    <Sparkles size={20} />
                                    {results.length > 0
                                        ? `${results.length} ${results.length === 1 ? 'scheme' : 'schemes'} worth checking`
                                        : 'No matches in our guides yet'}
                                </h2>
                                <p className="muted">
                                    This is a starting point, not a decision. Final eligibility is decided by the department
                                    running each scheme, using the rules on its official portal.
                                </p>

                                {results.map((s, i) => (
                                    <div key={s.slug}>
                                        <div className="result-item">
                                            <SchemeCard scheme={s} />
                                            <p className="result-reason">{reasonFor(s, answers)}</p>
                                        </div>
                                        {/* After the first few results, so it is seen without scrolling to the end. */}
                                        {i === Math.min(2, results.length - 1) && !isAuthenticated && !promptDismissed && (
                                            <SignupPrompt count={results.length} onDismiss={() => setPromptDismissed(true)} />
                                        )}
                                    </div>
                                ))}

                                {results.length === 0 && (
                                    <p>
                                        Our guides cover {SCHEMES.length} schemes so far. Search all government schemes on the official{' '}
                                        <a href="https://www.myscheme.gov.in/" target="_blank" rel="noopener noreferrer">myScheme portal</a>, or{' '}
                                        <Link to="/schemes">browse our scheme guides</Link>.
                                    </p>
                                )}


                                <div className="results-actions">
                                    {isAuthenticated && results.length > 0 && (
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={saveToAccount}
                                            disabled={saveState === 'saving' || saveState === 'saved'}
                                        >
                                            <BookmarkCheck size={16} />
                                            {saveState === 'saved' ? 'Saved to your dashboard' : saveState === 'saving' ? 'Saving…' : 'Save these results'}
                                        </button>
                                    )}
                                    <button type="button" className="btn btn-secondary-outline" onClick={restart}>
                                        <RotateCcw size={16} /> Start again
                                    </button>
                                    <Link to="/schemes" className="btn btn-secondary-outline">
                                        Browse all schemes <ArrowRight size={16} />
                                    </Link>
                                </div>
                                {saveState === 'error' && (
                                    <p className="field-error" role="alert">We couldn’t save right now. Please try again.</p>
                                )}
                                {saveState === 'saved' && (
                                    <p className="privacy-note"><Check size={14} /> Saved. <Link to="/dashboard">Open your dashboard</Link></p>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <Disclaimer />
            </div>
        </main>
    )
}

export default EligibilityChecker
