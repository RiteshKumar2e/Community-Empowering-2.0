import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, RotateCcw, Lock, Sparkles, X, Check, BookmarkCheck, AlertTriangle, ExternalLink } from 'lucide-react'
import { SCHEMES } from '../data/schemes'
import { SchemeCard, Disclaimer, Breadcrumbs } from '../components/SchemeBits'
import { trackEvent } from '../utils/analytics'
import { useText } from '../i18n/appText'
import { useAuth } from '../contexts/AuthContext'
import { stashPendingResult, saveEligibilityResult } from '../services/myData'
import '../styles/Schemes.css'

// Public, no login needed. Answers stay in this component's state only:
// nothing is sent to the server, and analytics only gets "started",
// "completed" and a result count.
// Titles and option labels are i18n keys (see i18n/appText.js).
const QUESTIONS = [
    { id: 'age', title: 'q_age', type: 'number' },
    { id: 'gender', title: 'q_gender', options: [['female', 'o_female'], ['male', 'o_male'], ['other', 'o_other']] },
    {
        id: 'occupation', title: 'q_occupation', options: [
            ['student', 'o_student'], ['farmer', 'o_farmer'], ['worker', 'o_worker'], ['business', 'o_business'],
            ['unemployed', 'o_unemployed'], ['homemaker', 'o_homemaker'], ['retired', 'o_retired'],
        ],
    },
    // Only asked of farmers: PM-KISAN needs land recorded in the family's name.
    { id: 'land', title: 'q_land', when: (a) => a.occupation === 'farmer', options: [['yes', 'o_yes'], ['no', 'o_no'], ['unsure', 'o_unsure']] },
    { id: 'state', title: 'q_state', options: [['Jharkhand', 'o_jharkhand'], ['other', 'o_other_state']] },
    { id: 'taxPayer', title: 'q_tax', options: [['no', 'o_no'], ['yes', 'o_yes'], ['unsure', 'o_unsure']] },
    {
        id: 'category', title: 'q_category', hint: 'q_category_hint', options: [
            ['sc', 'o_sc'], ['st', 'o_st'], ['other', 'o_general'], ['skip', 'o_skip'],
        ],
    },
    { id: 'income', title: 'q_income', options: [['below', 'o_below'], ['above', 'o_above'], ['unsure', 'o_unsure']] },
    { id: 'daughter', title: 'q_daughter', options: [['yes', 'o_yes'], ['no', 'o_no']] },
]

// Checks one scheme's `match` rules (data/schemes.js) against the answers.
// Returns i18n keys: `why` (rules met), `check` (things to confirm) and
// `whyNot` (rules not met). A scheme fits when `whyNot` is empty.
export const evaluate = (scheme, a) => {
    const m = scheme.match
    const why = []
    const check = []
    const whyNot = []
    const range = `${m.minAge || 0}${m.maxAge ? `–${m.maxAge}` : '+'}`

    if (scheme.slug === 'ayushman-bharat-pm-jay') {
        if (a.age >= 70) why.push(['r_70'])
        else check.push(['c_pmjay_list'])
    }
    if (Array.isArray(m.occupations)) {
        if (m.occupations.includes(a.occupation)) why.push(['r_occ', { occ: `o_${a.occupation}` }])
        else whyNot.push(['n_occ', { list: m.occupations.map((o) => `o_${o}`) }])
    }
    if ((m.minAge && a.age < m.minAge) || (m.maxAge && a.age > m.maxAge)) whyNot.push(['n_age', { range }])
    else if (m.minAge || m.maxAge) why.push(['r_age', { range }])
    if (m.gender === 'female') {
        if (a.gender === 'female') why.push(['r_women'])
        else whyNot.push(['n_women'])
    }
    if (m.state) {
        if (a.state === m.state) why.push(['r_state', { state: m.state }])
        else whyNot.push(['n_state', { state: m.state }])
    }
    if (m.excludesTaxPayers) {
        if (a.taxPayer === 'yes') whyNot.push(['n_tax'])
        else if (a.taxPayer === 'unsure') check.push(['c_tax'])
        else why.push(['r_tax'])
    }
    if (m.requires === 'sc') {
        if (a.category === 'sc') why.push(['r_sc'])
        else whyNot.push(['n_sc'])
    }
    if (m.requires === 'woman-or-scst') {
        if (a.gender === 'female' || a.category === 'sc' || a.category === 'st') why.push(['r_woman_scst'])
        else whyNot.push(['n_woman_scst'])
    }
    if (m.excludesHighIncome) {
        if (a.income === 'above') whyNot.push(['n_income'])
        else if (a.income === 'unsure') check.push(['c_income'])
        else why.push(['r_income'])
    }
    if (m.parentOfGirlUnder10) {
        if (a.daughter === 'yes') why.push(['r_daughter'])
        else whyNot.push(['n_daughter'])
    }
    if (m.needsLand) {
        if (a.land === 'no') whyNot.push(['n_land'])
        else if (a.land === 'unsure') check.push(['c_land'])
        else if (a.land === 'yes') why.push(['r_land'])
    }
    return { fits: whyNot.length === 0, why, check, whyNot }
}

// Shown once a visitor has useful results. Dismissable, never blocks reading.
const SignupPrompt = ({ count, onDismiss }) => {
    const t = useText()
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
            <button type="button" className="signup-prompt-close" onClick={onDismiss} aria-label={t('dismiss')}>
                <X size={18} />
            </button>
            <h3 id="signup-prompt-title">{t('prompt_title', { n: count })}</h3>
            <ul>
                <li><Check size={16} /> {t('prompt_b1')}</li>
                <li><Check size={16} /> {t('prompt_b2')}</li>
                <li><Check size={16} /> {t('prompt_b3')}</li>
            </ul>
            <p className="muted">{t('prompt_note')}</p>
            <div className="signup-prompt-actions">
                <Link
                    to="/register?next=save-results"
                    className="btn btn-primary"
                >
                    {t('prompt_cta')}
                </Link>
                <Link to="/login?next=save-results" className="signup-prompt-login">{t('prompt_login')}</Link>
            </div>
            <button type="button" className="signup-prompt-skip" onClick={onDismiss}>
                {t('prompt_skip')}
            </button>
        </motion.aside>
    )
}

const EligibilityChecker = () => {
    const t = useText()
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

    const questions = QUESTIONS.filter((q) => !q.when || q.when(answers))
    const done = step >= questions.length
    const evaluated = useMemo(
        () => (done ? SCHEMES.map((s) => ({ scheme: s, ...evaluate(s, answers) })) : []),
        [done, answers],
    )
    const results = evaluated.filter((r) => r.fits).map((r) => r.scheme)
    const notShown = evaluated.filter((r) => !r.fits)
    // Renders a [key, vars] pair from evaluate(); option keys inside vars are
    // translated too, so "Meant for: Farmer, Student" reads right in Hindi.
    const say = ([key, vars = {}]) => t(key, {
        ...vars,
        ...(vars.occ ? { occ: t(vars.occ) } : {}),
        ...(vars.list ? { list: vars.list.map((k) => t(k)).join(', ') } : {}),
    })

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
            setAgeError(t('age_error'))
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

    const q = questions[step]

    return (
        <main className="schemes-page eligibility-page">
            <div className="container narrow">
                <Breadcrumbs items={[
                    { label: t('home'), to: '/' },
                    { label: t('gov_schemes'), to: '/schemes' },
                    { label: t('elig_checker') },
                ]} />

                <header className="schemes-header">
                    <h1>{t('elig_title')}</h1>
                    <p className="schemes-lead">
                        {t('elig_lead', { n: questions.length })}
                    </p>
                    <p className="privacy-note"><Lock size={14} /> {t('elig_privacy')}</p>
                </header>

                <div className="eligibility-card">
                    <div className="wizard-progress-track" aria-hidden="true">
                        <motion.div
                            className="wizard-progress-fill"
                            initial={false}
                            animate={{ width: `${(Math.min(step, questions.length) / questions.length) * 100}%` }}
                        />
                    </div>

                    <AnimatePresence mode="wait" initial={false}>
                        {!done ? (
                            <motion.div
                                key={q.id}
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                transition={{ duration: 0.2 }}
                                className="eligibility-question"
                            >
                                <p className="question-count">{t('question_n', { i: step + 1, n: questions.length })}</p>
                                <h2>{t(q.title)}</h2>
                                {q.hint && <p className="muted">{t(q.hint)}</p>}

                                {q.type === 'number' ? (
                                    <form onSubmit={submitAge} className="age-form">
                                        <input
                                            type="number"
                                            inputMode="numeric"
                                            min="1"
                                            max="120"
                                            value={ageInput}
                                            onChange={(e) => setAgeInput(e.target.value)}
                                            placeholder={t('age_placeholder')}
                                            aria-label="Your age in years"
                                        />
                                        <button type="submit" className="btn btn-primary">
                                            {t('next')} <ArrowRight size={16} />
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
                                                {t(label)}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {step > 0 && (
                                    <button type="button" className="back-link" onClick={() => setStep((s) => s - 1)}>
                                        <ArrowLeft size={16} /> {t('back')}
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
                                        ? t(results.length === 1 ? 'results_one' : 'results_many', { n: results.length })
                                        : t('no_results')}
                                </h2>
                                <p className="muted">
                                    {t('results_note')}
                                </p>

                                {results.map((s, i) => (
                                    <div key={s.slug}>
                                        <div className="result-item">
                                            <SchemeCard scheme={s} />
                                            {(() => {
                                                const ev = evaluate(s, answers)
                                                return (
                                                    <div className="result-why">
                                                        {ev.why.length > 0 && (
                                                            <ul className="why-list" aria-label={t('why_shown')}>
                                                                {ev.why.map((w) => <li key={w[0]}><Check size={14} aria-hidden="true" /> {say(w)}</li>)}
                                                            </ul>
                                                        )}
                                                        {ev.check.length > 0 && (
                                                            <ul className="check-first-list" aria-label={t('check_first')}>
                                                                {ev.check.map((c) => <li key={c[0]}><AlertTriangle size={14} aria-hidden="true" /> {say(c)}</li>)}
                                                            </ul>
                                                        )}
                                                        <a href={s.officialLinks[0].url} target="_blank" rel="noopener noreferrer" className="result-portal">
                                                            {t('visit_portal')} <ExternalLink size={14} aria-hidden="true" />
                                                        </a>
                                                    </div>
                                                )
                                            })()}
                                        </div>
                                        {/* After the first few results, so it is seen without scrolling to the end. */}
                                        {i === Math.min(2, results.length - 1) && !isAuthenticated && !promptDismissed && (
                                            <SignupPrompt count={results.length} onDismiss={() => setPromptDismissed(true)} />
                                        )}
                                    </div>
                                ))}

                                {notShown.length > 0 && (
                                    <details className="not-shown">
                                        <summary>{t('not_shown_title', { n: notShown.length })}</summary>
                                        <ul>
                                            {notShown.map((r) => (
                                                <li key={r.scheme.slug}>
                                                    <Link to={`/schemes/${r.scheme.slug}`}>{r.scheme.shortName}</Link>: {r.whyNot.map((w) => say(w)).join(' ')}
                                                </li>
                                            ))}
                                        </ul>
                                    </details>
                                )}

                                {results.length === 0 && (
                                    <p>
                                        {t('no_results_text', { n: SCHEMES.length })}{' '}
                                        <a href="https://www.myscheme.gov.in/" target="_blank" rel="noopener noreferrer">{t('myscheme_portal')}</a>,{' '}
                                        <Link to="/schemes">{t('or_browse')}</Link>.
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
                                            {saveState === 'saved' ? t('saved_results') : saveState === 'saving' ? t('saving') : t('save_results')}
                                        </button>
                                    )}
                                    <button type="button" className="btn btn-secondary-outline" onClick={restart}>
                                        <RotateCcw size={16} /> {t('start_again')}
                                    </button>
                                    <Link to="/schemes" className="btn btn-secondary-outline">
                                        {t('browse_all')} <ArrowRight size={16} />
                                    </Link>
                                </div>
                                {saveState === 'error' && (
                                    <p className="field-error" role="alert">{t('save_results_error')}</p>
                                )}
                                {saveState === 'saved' && (
                                    <p className="privacy-note"><Check size={14} /> {t('saved_open')} <Link to="/dashboard">{t('open_dashboard')}</Link></p>
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
