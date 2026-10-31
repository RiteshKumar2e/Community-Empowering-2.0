import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ExternalLink, CheckCircle2, XCircle, FileText, ListOrdered, CalendarDays, Phone, AlertTriangle, Flag, ListChecks, Bookmark, BookmarkCheck, Lock } from 'lucide-react'
import { getScheme, getCategory, relatedSchemes } from '../data/schemes'
import { SchemeCard, Disclaimer, ReviewStatus, Breadcrumbs } from '../components/SchemeBits'
import { trackEvent } from '../utils/analytics'
import { useText } from '../i18n/appText'
import { useAuth } from '../contexts/AuthContext'
import { fetchSavedSchemes, saveScheme, unsaveScheme, stashPendingSave, rememberViewed, setPostAuthRedirect } from '../services/myData'
import NotFound from './NotFound'
import '../styles/Schemes.css'

const CONTACT_EMAIL = 'riteshkumar90359@gmail.com'

const Section = ({ id, icon, title, children }) => (
    <section className="scheme-section" aria-labelledby={id}>
        <h2 id={id}>{icon}{title}</h2>
        {children}
    </section>
)

// Public, no login needed: every scheme detail is readable by anyone.
const SchemeDetail = () => {
    const t = useText()
    const { slug } = useParams()
    const scheme = getScheme(slug)
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()
    const [saved, setSaved] = useState(false)
    const [saveBusy, setSaveBusy] = useState(false)
    const [saveError, setSaveError] = useState('')

    useEffect(() => {
        window.scrollTo(0, 0)
        if (!scheme) return
        trackEvent('scheme_detail_view', { scheme: scheme.slug })
        rememberViewed(scheme.slug)
    }, [slug]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!isAuthenticated || !scheme) return
        fetchSavedSchemes()
            .then((list) => setSaved(list.some((s) => s.slug === scheme.slug)))
            .catch(() => { /* button still works; state just starts unsaved */ })
    }, [isAuthenticated, slug]) // eslint-disable-line react-hooks/exhaustive-deps

    const toggleSave = async () => {
        setSaveError('')
        if (!isAuthenticated) {
            // Remember the bookmark on this device; it is saved after signup.
            stashPendingSave(scheme.slug)
            setPostAuthRedirect(`/schemes/${scheme.slug}`)
            navigate('/register?next=save-scheme')
            return
        }
        setSaveBusy(true)
        try {
            if (saved) {
                await unsaveScheme(scheme.slug)
                setSaved(false)
            } else {
                await saveScheme(scheme.slug)
                setSaved(true)
                trackEvent('scheme_saved', { scheme: scheme.slug, source: 'scheme_page' })
            }
        } catch {
            setSaveError(t('save_error'))
        } finally {
            setSaveBusy(false)
        }
    }

    if (!scheme) return <NotFound />

    const primaryCategory = getCategory(scheme.categories[0])
    const related = relatedSchemes(scheme)
    const reportHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Correction: ${scheme.shortName}`)}&body=${encodeURIComponent(`Page: https://communityai.co.in/schemes/${scheme.slug}\n\nWhat is wrong or out of date:\n\nOfficial source (link):\n`)}`

    const officialClick = (url) => trackEvent('official_link_clicked', { scheme: scheme.slug, link_url: url })

    // Applying needs a free account: logged-out visitors sign up first and are
    // then brought straight back to this page, where the portal link is active.
    const signUpToApply = () => {
        setPostAuthRedirect(`/schemes/${scheme.slug}`)
        navigate(`/register?next=apply&scheme=${scheme.slug}`)
    }

    return (
        <main className="schemes-page scheme-detail">
            <div className="container narrow">
                <Breadcrumbs items={[
                    { label: t('home'), to: '/' },
                    { label: t('gov_schemes'), to: '/schemes' },
                    { label: primaryCategory.label, to: `/schemes/category/${primaryCategory.id}` },
                    { label: scheme.shortName },
                ]} />

                <header className="scheme-hero">
                    <div className="scheme-card-top">
                        <span className={`level-tag ${scheme.level}`}>{scheme.level === 'state' ? t('state_gov', { state: scheme.state }) : t('central_gov')}</span>
                    </div>
                    <h1>{scheme.name}</h1>
                    <p className="scheme-summary">{scheme.summary}</p>
                    <p className="scheme-authority">{t('run_by', { who: scheme.authority })}</p>
                    <ReviewStatus review={scheme.review} />

                    <div className="scheme-hero-actions">
                        {isAuthenticated ? (
                            scheme.officialLinks.slice(0, 1).map((l) => (
                                <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" onClick={() => officialClick(l.url)}>
                                    {t('apply_official')} <ExternalLink size={16} />
                                </a>
                            ))
                        ) : (
                            <button type="button" className="btn btn-primary" onClick={signUpToApply}>
                                <Lock size={16} /> {t('signup_to_apply')}
                            </button>
                        )}
                        <button type="button" className="btn btn-secondary-outline" onClick={toggleSave} disabled={saveBusy} aria-pressed={saved}>
                            {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                            {saved ? t('saved_dashboard') : isAuthenticated ? t('save_scheme') : t('save_scheme_free')}
                        </button>
                        <Link to="/eligibility" className="btn btn-secondary-outline">
                            <ListChecks size={16} /> {t('check_more')}
                        </Link>
                    </div>
                    {saveError && <p className="field-error" role="alert">{saveError}</p>}
                </header>

                <nav className="scheme-toc" aria-label="On this page">
                    <a href="#who">{t('toc_who')}</a>
                    <a href="#benefits">{t('toc_benefits')}</a>
                    <a href="#documents">{t('toc_documents')}</a>
                    <a href="#apply">{t('toc_apply')}</a>
                    <a href="#sources">{t('toc_links')}</a>
                </nav>

                <Section id="who" icon={<CheckCircle2 size={20} />} title={t('who_can_apply')}>
                    <p>{scheme.whoFor}</p>
                    <ul className="check-list">
                        {scheme.eligibility.map((e) => <li key={e}>{e}</li>)}
                    </ul>
                    {scheme.exclusions.length > 0 && (
                        <>
                            <h3><XCircle size={18} /> {t('not_eligible')}</h3>
                            <ul className="cross-list">
                                {scheme.exclusions.map((e) => <li key={e}>{e}</li>)}
                            </ul>
                        </>
                    )}
                </Section>

                <Section id="benefits" icon={<span aria-hidden="true">₹</span>} title={t('benefits')}>
                    <ul>
                        {scheme.benefits.map((b) => <li key={b}>{b}</li>)}
                    </ul>
                </Section>

                <Section id="documents" icon={<FileText size={20} />} title={t('documents')}>
                    <ul className="doc-list">
                        {scheme.documents.map((d) => <li key={d}>{d}</li>)}
                    </ul>
                    <p className="muted">{t('documents_note')}</p>
                </Section>

                <Section id="apply" icon={<ListOrdered size={20} />} title={t('how_to_apply')}>
                    <ol className="steps-list">
                        {scheme.howToApply.map((s) => <li key={s}>{s}</li>)}
                    </ol>
                    <p className="deadline"><CalendarDays size={16} /> <span><strong>{t('when_to_apply')}</strong> {scheme.deadlines}</span></p>
                    {scheme.helpline && <p className="deadline"><Phone size={16} /> <span>{scheme.helpline}</span></p>}
                </Section>

                {scheme.mistakes.length > 0 && (
                    <Section id="mistakes" icon={<AlertTriangle size={20} />} title={t('mistakes')}>
                        <ul>
                            {scheme.mistakes.map((m) => <li key={m}>{m}</li>)}
                        </ul>
                    </Section>
                )}

                {scheme.faqs.length > 0 && (
                    <Section id="faq" icon={<span aria-hidden="true">?</span>} title={t('faq')}>
                        {scheme.faqs.map((f) => (
                            <details key={f.q} className="faq">
                                <summary>{f.q}</summary>
                                <p>{f.a}</p>
                            </details>
                        ))}
                    </Section>
                )}

                <Section id="sources" icon={<ExternalLink size={20} />} title={t('official_links')}>
                    <ul className="source-list">
                        {scheme.officialLinks.map((l) => (
                            <li key={l.url}>
                                {isAuthenticated ? (
                                    <a href={l.url} target="_blank" rel="noopener noreferrer" onClick={() => officialClick(l.url)}>
                                        {l.label}
                                    </a>
                                ) : (
                                    <span>{l.label}</span>
                                )}{' '}
                                <span className="muted">({new URL(l.url).hostname})</span>
                            </li>
                        ))}
                    </ul>
                    {!isAuthenticated && (
                        <p className="apply-gate-note">
                            <Lock size={14} /> <button type="button" onClick={signUpToApply}>{t('gate_note_btn')}</button> {t('gate_note_rest')}
                        </p>
                    )}
                    <p className="muted">
                        {t('summary_note')}{' '}
                        <Link to="/editorial-policy">{t('editorial_policy')}</Link>.
                    </p>
                    <a className="report-link" href={reportHref} onClick={() => trackEvent('scheme_report_issue_clicked', { scheme: scheme.slug })}>
                        <Flag size={16} /> {t('report')}
                    </a>
                </Section>

                <Disclaimer />

                {related.length > 0 && (
                    <section className="related" aria-labelledby="related-heading">
                        <h2 id="related-heading">{t('related')}</h2>
                        <div className="scheme-grid">
                            {related.map((s) => <SchemeCard key={s.slug} scheme={s} />)}
                        </div>
                    </section>
                )}
            </div>
        </main>
    )
}

export default SchemeDetail
