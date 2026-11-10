import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
    ExternalLink, CheckCircle2, XCircle, FileText, ListOrdered, CalendarDays, Phone, AlertTriangle, Flag,
    ListChecks, Bookmark, BookmarkCheck, IndianRupee, HelpCircle, Lightbulb, BookOpen, Info, UserPlus,
} from 'lucide-react'
import { getScheme, getCategory, relatedSchemes, localizeScheme, categoryLabel } from '../data/schemes'
import { SchemeCard, ReviewStatus, Breadcrumbs } from '../components/SchemeBits'
import { trackEvent } from '../utils/analytics'
import { useText } from '../i18n/appText'
import { useAuth } from '../contexts/AuthContext'
import { fetchSavedSchemes, saveScheme, unsaveScheme, stashPendingSave, rememberViewed, setPostAuthRedirect } from '../services/myData'
import NotFound from './NotFound'
import '../styles/Schemes.css'

// Icons are decorative: the heading text alone is what screen readers read.
const Section = ({ id, Icon, title, children }) => (
    <section className="scheme-section" aria-labelledby={id}>
        <h2 id={id}><Icon size={20} aria-hidden="true" focusable="false" />{title}</h2>
        {children}
    </section>
)

const hostOf = (url) => new URL(url).hostname.replace(/^www\./, '')

// Public, no login needed: every scheme detail and every official link is
// open to anyone. Only saving a scheme to a personal list needs an account.
const SchemeDetail = () => {
    const t = useText()
    const { slug } = useParams()
    const base = getScheme(slug)
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()
    const [saved, setSaved] = useState(false)
    const [saveBusy, setSaveBusy] = useState(false)
    const [saveError, setSaveError] = useState('')

    useEffect(() => {
        window.scrollTo(0, 0)
        if (!base) return
        trackEvent('scheme_detail_view', { scheme: base.slug })
        rememberViewed(base.slug)
    }, [slug]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!isAuthenticated || !base) return
        fetchSavedSchemes()
            .then((list) => setSaved(list.some((s) => s.slug === base.slug)))
            .catch(() => { /* button still works; state just starts unsaved */ })
    }, [isAuthenticated, slug]) // eslint-disable-line react-hooks/exhaustive-deps

    if (!base) return <NotFound />
    const scheme = localizeScheme(base, t.language)

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

    const primaryCategory = getCategory(scheme.categories[0])
    const related = relatedSchemes(scheme)
    const portal = scheme.officialLinks[0]
    const officialClick = (url) => trackEvent('official_link_clicked', { scheme: scheme.slug, link_url: url })
    const reportTo = `/contact?topic=correction&page=${encodeURIComponent(`/schemes/${scheme.slug}`)}`

    return (
        <main className="schemes-page scheme-detail">
            <div className="container narrow">
                <Breadcrumbs items={[
                    { label: t('home'), to: '/' },
                    { label: t('gov_schemes'), to: '/schemes' },
                    { label: categoryLabel(primaryCategory, t.language), to: `/schemes/category/${primaryCategory.id}` },
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
                    {t.language === 'hi' && !scheme.isHindi && (
                        <p className="english-only-note" role="note"><Info size={14} aria-hidden="true" /> {t('english_only_scheme')}</p>
                    )}

                    <div className="scheme-hero-actions">
                        <a href={portal.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" onClick={() => officialClick(portal.url)}>
                            {t('visit_portal')} <ExternalLink size={16} aria-hidden="true" />
                        </a>
                        <button type="button" className="btn btn-secondary-outline" onClick={toggleSave} disabled={saveBusy} aria-pressed={saved}>
                            {saved ? <BookmarkCheck size={16} aria-hidden="true" /> : <Bookmark size={16} aria-hidden="true" />}
                            {saved ? t('saved_dashboard') : isAuthenticated ? t('save_scheme') : t('save_scheme_free')}
                        </button>
                        <Link to="/eligibility" className="btn btn-secondary-outline">
                            <ListChecks size={16} aria-hidden="true" /> {t('check_more')}
                        </Link>
                    </div>
                    <p className="portal-note">{t('portal_note', { host: hostOf(portal.url) })}</p>
                    {/* Optional: the portal link above never needs an account. */}
                    {!isAuthenticated && (
                        <aside className="register-prompt" aria-labelledby="register-prompt-title">
                            <UserPlus size={20} aria-hidden="true" />
                            <div>
                                <p id="register-prompt-title" className="register-prompt-title">{t('reg_prompt_title')}</p>
                                <p>{t('reg_prompt_text')}</p>
                                <div className="register-prompt-actions">
                                    <Link
                                        to="/register?next=scheme"
                                        className="btn btn-primary"
                                        onClick={() => { setPostAuthRedirect(`/schemes/${scheme.slug}`); trackEvent('register_prompt_clicked', { scheme: scheme.slug }) }}
                                    >
                                        {t('reg_prompt_btn')}
                                    </Link>
                                    <Link to="/login" className="register-prompt-login" onClick={() => setPostAuthRedirect(`/schemes/${scheme.slug}`)}>
                                        {t('reg_prompt_login')}
                                    </Link>
                                </div>
                            </div>
                        </aside>
                    )}
                    {saveError && <p className="field-error" role="alert">{saveError}</p>}
                </header>

                <nav className="scheme-toc" aria-label={t('on_this_page')}>
                    <a href="#who">{t('toc_who')}</a>
                    <a href="#benefits">{t('toc_benefits')}</a>
                    <a href="#documents">{t('toc_documents')}</a>
                    <a href="#apply">{t('toc_apply')}</a>
                    {scheme.rejections?.length > 0 && <a href="#problems">{t('toc_problems')}</a>}
                    {scheme.faqs.length > 0 && <a href="#faq">{t('faq')}</a>}
                    <a href="#sources">{t('toc_links')}</a>
                </nav>

                {scheme.intro && <p className="scheme-intro">{scheme.intro}</p>}

                <Section id="who" Icon={CheckCircle2} title={t('who_can_apply')}>
                    <p>{scheme.whoFor}</p>
                    <ul className="check-list">
                        {scheme.eligibility.map((e) => <li key={e}>{e}</li>)}
                    </ul>
                    {scheme.exclusions.length > 0 && (
                        <>
                            <h3><XCircle size={18} aria-hidden="true" /> {t('not_eligible')}</h3>
                            <ul className="cross-list">
                                {scheme.exclusions.map((e) => <li key={e}>{e}</li>)}
                            </ul>
                        </>
                    )}
                </Section>

                <Section id="benefits" Icon={IndianRupee} title={t('benefits')}>
                    <ul>
                        {scheme.benefits.map((b) => <li key={b}>{b}</li>)}
                    </ul>
                </Section>

                {scheme.example && (
                    <aside className="scheme-example" aria-labelledby="example-heading">
                        <h2 id="example-heading"><Lightbulb size={18} aria-hidden="true" /> {t('example_title')}</h2>
                        <p>{scheme.example}</p>
                        <p className="example-note">{t('example_note')}</p>
                    </aside>
                )}

                <Section id="documents" Icon={FileText} title={t('documents')}>
                    <ul className="doc-list">
                        {scheme.documents.map((d) => <li key={d}>{d}</li>)}
                    </ul>
                    <p className="muted">{t('documents_note')}</p>
                </Section>

                <Section id="apply" Icon={ListOrdered} title={t('how_to_apply')}>
                    <ol className="steps-list">
                        {scheme.howToApply.map((s) => <li key={s}>{s}</li>)}
                    </ol>
                    <p className="deadline"><CalendarDays size={16} aria-hidden="true" /> <span><strong>{t('when_to_apply')}</strong> {scheme.deadlines}</span></p>
                    {scheme.helpline && <p className="deadline"><Phone size={16} aria-hidden="true" /> <span><strong>{t('helpline')}:</strong> {scheme.helpline}</span></p>}
                    <p>
                        <a href={portal.url} target="_blank" rel="noopener noreferrer" className="portal-link" onClick={() => officialClick(portal.url)}>
                            {t('visit_portal')} ({hostOf(portal.url)}) <ExternalLink size={14} aria-hidden="true" />
                        </a>
                    </p>
                </Section>

                {scheme.rejections?.length > 0 && (
                    <Section id="problems" Icon={AlertTriangle} title={t('rejections')}>
                        <dl className="problem-list">
                            {scheme.rejections.map((r) => (
                                <div key={r.problem} className="problem-item">
                                    <dt>{r.problem}</dt>
                                    <dd><span className="sr-only">{t('what_to_do')}: </span>{r.fix}</dd>
                                </div>
                            ))}
                        </dl>
                    </Section>
                )}

                {scheme.faqs.length > 0 && (
                    <Section id="faq" Icon={HelpCircle} title={t('faq')}>
                        {scheme.faqs.map((f) => (
                            <details key={f.q} className="faq">
                                <summary>{f.q}</summary>
                                <p>{f.a}</p>
                            </details>
                        ))}
                    </Section>
                )}

                <Section id="sources" Icon={BookOpen} title={t('official_links')}>
                    <ul className="source-list">
                        {scheme.officialLinks.map((l) => (
                            <li key={l.url}>
                                <a href={l.url} target="_blank" rel="noopener noreferrer" onClick={() => officialClick(l.url)}>
                                    {l.label} <ExternalLink size={13} aria-hidden="true" />
                                </a>{' '}
                                <span className="muted">({hostOf(l.url)})</span>
                            </li>
                        ))}
                    </ul>
                    {scheme.sources?.length > 0 && (
                        <>
                            <h3>{t('sources')}</h3>
                            <ul className="source-list">
                                {scheme.sources.map((l) => (
                                    <li key={l.url}>
                                        <a href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a>{' '}
                                        <span className="muted">({hostOf(l.url)})</span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    <p className="muted about-page-note">
                        {t('page_note')} <Link to="/editorial-policy">{t('read_policy')}</Link>.
                    </p>
                    <Link className="report-link" to={reportTo} onClick={() => trackEvent('scheme_report_issue_clicked', { scheme: scheme.slug })}>
                        <Flag size={16} aria-hidden="true" /> {t('report')}
                    </Link>
                </Section>

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
