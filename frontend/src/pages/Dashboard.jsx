import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    MessageSquare, BookOpen, Search, TrendingUp, Award, Activity, ListChecks,
    FileText, ArrowRight, CheckCircle2, Circle, Sparkles, MapPin,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import CountUp from '../components/CountUp'
import MySchemesPanel from '../components/MySchemesPanel'
import EmailVerifyBanner from '../components/EmailVerifyBanner'
import '../styles/Dashboard.css'
import { useText } from '../i18n/appText'

const greetingKey = () => {
    const h = new Date().getHours()
    if (h < 12) return 'good_morning'
    if (h < 17) return 'good_afternoon'
    return 'good_evening'
}

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay },
})

const Dashboard = () => {
    const { user } = useAuth()
    const t = useText()
    const [stats, setStats] = useState({ queriesCount: 0, coursesEnrolled: 0, resourcesViewed: 0, achievementsEarned: 0 })
    const [recentActivity, setRecentActivity] = useState([])
    const [recommendations, setRecommendations] = useState([])
    const [mine, setMine] = useState({ saved: 0, results: 0 })

    useEffect(() => {
        // Each request is independent so one failing doesn't blank the others.
        api.get('/users/stats').then((r) => setStats(r.data)).catch(() => {})
        api.get('/users/activity').then((r) => setRecentActivity(Array.isArray(r.data) ? r.data : [])).catch(() => {})
        api.get('/ai/recommendations').then((r) => setRecommendations(Array.isArray(r.data) ? r.data : [])).catch(() => {})
    }, [])

    const firstName = (user?.name || '').split(' ')[0] || 'there'

    // "Your progress" is built only from real data on this account.
    const steps = [
        { done: true, label: t('step_account'), to: null },
        { done: mine.results > 0, label: t('step_eligibility'), to: '/eligibility' },
        { done: mine.saved > 0, label: t('step_save'), to: '/schemes' },
        { done: stats.queriesCount > 0, label: t('step_ai'), to: '/assistant' },
        ...(user?.emailVerified === false ? [{ done: false, label: t('step_email'), to: null }] : []),
    ]
    const doneCount = steps.filter((s) => s.done).length
    const progress = Math.round((doneCount / steps.length) * 100)
    const nextStep = steps.find((s) => !s.done)

    const statCards = [
        { icon: <MessageSquare size={22} />, value: stats.queriesCount, label: t('stat_ai'), tone: 'indigo' },
        { icon: <BookOpen size={22} />, value: stats.coursesEnrolled, label: t('stat_courses'), tone: 'green' },
        { icon: <Search size={22} />, value: stats.resourcesViewed, label: t('stat_resources'), tone: 'amber' },
        { icon: <Award size={22} />, value: stats.achievementsEarned, label: t('stat_achievements'), tone: 'violet' },
    ]

    const quickActions = [
        { icon: <ListChecks size={22} />, title: t('qa_elig'), description: t('qa_elig_d'), link: '/eligibility', tone: 'indigo' },
        { icon: <FileText size={22} />, title: t('qa_schemes'), description: t('qa_schemes_d'), link: '/schemes', tone: 'amber' },
        { icon: <MessageSquare size={22} />, title: t('qa_ai'), description: t('qa_ai_d'), link: '/assistant', tone: 'green' },
        { icon: <BookOpen size={22} />, title: t('qa_learning'), description: t('qa_learning_d'), link: '/learning', tone: 'violet' },
    ]

    return (
        <div className="dashboard-page">
            <div className="container">
                {/* Welcome hero */}
                <motion.section className="dash-hero" {...fadeUp()}>
                    <div className="dash-hero-glow" aria-hidden="true" />
                    <div className="dash-hero-main">
                        <p className="dash-hero-date">
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                        <h1>{t(greetingKey())}, {firstName}! 👋</h1>
                        <p className="dash-hero-sub">
                            {nextStep
                                ? t('next_step', { step: t.language === 'hi' ? nextStep.label : nextStep.label.toLowerCase() })
                                : t('all_set')}
                        </p>
                        <div className="dash-hero-tags">
                            {user?.communityType && <span className="dash-tag">{user.communityType}</span>}
                            {user?.location && <span className="dash-tag"><MapPin size={12} /> {user.location}</span>}
                        </div>
                        <div className="dash-hero-actions">
                            <Link to={nextStep?.to || '/schemes'} className="dash-btn-primary">
                                {nextStep?.to ? t('continue') : t('explore_schemes')} <ArrowRight size={18} />
                            </Link>
                            <Link to="/assistant" className="dash-btn-ghost">
                                <Sparkles size={16} /> {t('ask_ai')}
                            </Link>
                        </div>
                    </div>

                    <div className="dash-progress" aria-label={`Your progress: ${doneCount} of ${steps.length} steps done`}>
                        <div className="dash-ring" style={{ '--p': progress }}>
                            <span>{progress}%</span>
                        </div>
                        <ul>
                            {steps.map((s) => (
                                <li key={s.label} className={s.done ? 'done' : ''}>
                                    {s.done ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                                    {s.to && !s.done ? <Link to={s.to}>{s.label}</Link> : <span>{s.label}</span>}
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.section>

                <EmailVerifyBanner />

                {/* Stats */}
                <section className="dash-stats" aria-label="Your activity">
                    {statCards.map((s, i) => (
                        <motion.div key={s.label} className={`dash-stat tone-${s.tone}`} {...fadeUp(0.05 * i)}>
                            <div className="dash-stat-icon">{s.icon}</div>
                            <div>
                                <div className="dash-stat-value"><CountUp value={`${s.value}`} /></div>
                                <div className="dash-stat-label">{s.label}</div>
                            </div>
                        </motion.div>
                    ))}
                </section>

                {/* Quick actions */}
                <section className="dash-section" aria-labelledby="quick-actions">
                    <h2 id="quick-actions" className="dash-section-title">{t('quick_actions')}</h2>
                    <div className="dash-actions">
                        {quickActions.map((a) => (
                            <Link key={a.title} to={a.link} className={`dash-action tone-${a.tone}`}>
                                <div className="dash-action-icon">{a.icon}</div>
                                <div className="dash-action-text">
                                    <h3>{a.title}</h3>
                                    <p>{a.description}</p>
                                </div>
                                <ArrowRight size={18} className="dash-action-arrow" />
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Saved schemes, eligibility results, reminders, suggestions */}
                <MySchemesPanel
                    communityType={user?.communityType}
                    onLoaded={(saved, results) => setMine({ saved, results })}
                />

                {/* Recommendations + activity */}
                <div className="dash-two-col">
                    <section className="dash-card" aria-labelledby="recs">
                        <h2 id="recs" className="dash-card-title"><TrendingUp size={18} /> {t('recommended')}</h2>
                        {recommendations.length > 0 ? (
                            <div className="dash-recs">
                                {recommendations.map((item, index) => (
                                    <div key={index} className="dash-rec">
                                        <div className="dash-rec-icon">{item.icon}</div>
                                        <div>
                                            <h4>{item.title}</h4>
                                            <p>{item.description}</p>
                                            {item.category && <span className="dash-chip">{item.category}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="dash-empty">
                                <TrendingUp size={36} />
                                <p>{t('recs_empty')}</p>
                                <Link to="/eligibility" className="dash-btn-small">{t('qa_elig')}</Link>
                            </div>
                        )}
                    </section>

                    <section className="dash-card" aria-labelledby="activity">
                        <h2 id="activity" className="dash-card-title"><Activity size={18} /> {t('recent_activity')}</h2>
                        {recentActivity.length > 0 ? (
                            <ol className="dash-timeline">
                                {recentActivity.map((activity, index) => (
                                    <li key={index}>
                                        <p>{activity.description}</p>
                                        <span>{activity.timestamp}</span>
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <div className="dash-empty">
                                <Activity size={36} />
                                <p>{t('activity_empty')}</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
