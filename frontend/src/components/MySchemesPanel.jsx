import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, ListChecks, History, Sparkles, ExternalLink, Trash2, Info } from 'lucide-react'
import { SCHEMES, getScheme, relatedSchemes } from '../data/schemes'
import { SchemeCard, formatDate } from './SchemeBits'
import { trackEvent } from '../utils/analytics'
import {
    syncPending, takeSyncNotice, fetchSavedSchemes, fetchEligibilityResults, unsaveScheme, getRecentlyViewed,
} from '../services/myData'
import '../styles/Schemes.css'
import '../styles/MySchemes.css'

const COMMUNITY_TO_CATEGORY = {
    student: 'students', farmer: 'farmers', worker: 'employment', business: 'business', senior: 'senior-citizens',
}

// Personal "My schemes" area on the dashboard. Everything here comes from the
// signed-in user's own records (/api/me/*), except "recently viewed", which is
// kept on this device only.
const MySchemesPanel = ({ communityType }) => {
    const [saved, setSaved] = useState([])
    const [results, setResults] = useState([])
    const [status, setStatus] = useState('loading') // loading | ready | error
    const [notice, setNotice] = useState('')
    const recent = getRecentlyViewed().map(getScheme).filter(Boolean)

    const load = async () => {
        const [s, r] = await Promise.all([fetchSavedSchemes(), fetchEligibilityResults()])
        setSaved(s)
        setResults(r)
    }

    useEffect(() => {
        let alive = true
        ;(async () => {
            // Retry anything kept on the device from before signing in.
            await syncPending()
            const synced = takeSyncNotice()
            if (alive && synced) {
                setNotice(synced.result
                    ? 'Your eligibility results from before you signed up are now saved here.'
                    : `${synced.schemes} saved ${synced.schemes === 1 ? 'scheme was' : 'schemes were'} added to your account.`)
            }
            try {
                await load()
                if (alive) setStatus('ready')
            } catch {
                if (alive) setStatus('error')
            }
        })()
        return () => { alive = false }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const remove = async (slug) => {
        setSaved((list) => list.filter((s) => s.slug !== slug))
        try { await unsaveScheme(slug) } catch { load().catch(() => {}) }
    }

    const savedSchemes = saved.map((s) => ({ ...s, scheme: getScheme(s.slug) })).filter((s) => s.scheme)
    const latest = results[0]
    const latestSchemes = latest ? latest.schemes.map(getScheme).filter(Boolean) : []

    // Suggestions: related to what they saved or matched, else their community type.
    const known = new Set([...savedSchemes.map((s) => s.slug), ...latestSchemes.map((s) => s.slug)])
    let suggestions = [...savedSchemes.map((s) => s.scheme), ...latestSchemes]
        .flatMap((s) => relatedSchemes(s, 3))
        .filter((s, i, arr) => !known.has(s.slug) && arr.findIndex((x) => x.slug === s.slug) === i)
    if (suggestions.length === 0) {
        const cat = COMMUNITY_TO_CATEGORY[communityType]
        suggestions = SCHEMES.filter((s) => !known.has(s.slug) && (!cat || s.categories.includes(cat)))
    }
    suggestions = suggestions.slice(0, 3)

    if (status === 'loading') {
        return <section className="my-schemes"><p className="muted">Loading your schemes…</p></section>
    }

    return (
        <section className="my-schemes" aria-labelledby="my-schemes-title">
            <div className="my-schemes-head">
                <h2 id="my-schemes-title">My schemes</h2>
                <Link to="/eligibility" className="btn btn-primary"><ListChecks size={16} /> New eligibility check</Link>
            </div>

            {notice && <p className="my-notice" role="status">✓ {notice}</p>}
            {status === 'error' && <p className="field-error" role="alert">We couldn’t load your saved schemes. Please refresh the page.</p>}

            <div className="my-block">
                <h3><Bookmark size={18} /> Saved schemes</h3>
                {savedSchemes.length === 0 ? (
                    <p className="muted">
                        Nothing saved yet. Open any <Link to="/schemes">scheme guide</Link> and tap “Save this scheme”.
                    </p>
                ) : (
                    <ul className="saved-list">
                        {savedSchemes.map(({ slug, savedAt, scheme }) => (
                            <li key={slug}>
                                <div>
                                    <Link to={`/schemes/${slug}`} className="saved-name">{scheme.shortName}</Link>
                                    <span className="muted"> · saved {savedAt ? formatDate(savedAt.slice(0, 10)) : ''} · guide updated {formatDate(scheme.review.lastUpdated)}</span>
                                </div>
                                <div className="saved-actions">
                                    <a
                                        href={scheme.officialLinks[0].url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => trackEvent('official_link_clicked', { scheme: slug, link_url: scheme.officialLinks[0].url, source: 'dashboard' })}
                                    >
                                        Official portal <ExternalLink size={14} />
                                    </a>
                                    <button type="button" onClick={() => remove(slug)} aria-label={`Remove ${scheme.shortName}`}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="my-block">
                <h3><ListChecks size={18} /> Latest eligibility result</h3>
                {latest ? (
                    <>
                        <p className="muted">
                            Checked on {formatDate(latest.createdAt.slice(0, 10))}: {latestSchemes.length} {latestSchemes.length === 1 ? 'scheme' : 'schemes'} worth checking.
                            Results are a guide only; final eligibility is decided by the department running each scheme.
                        </p>
                        <div className="chip-links">
                            {latestSchemes.map((s) => <Link key={s.slug} to={`/schemes/${s.slug}`}>{s.shortName}</Link>)}
                        </div>
                    </>
                ) : (
                    <p className="muted">No saved results yet. <Link to="/eligibility">Run the free eligibility check</Link> and save the results.</p>
                )}
            </div>

            {recent.length > 0 && (
                <div className="my-block">
                    <h3><History size={18} /> Recently viewed on this device</h3>
                    <div className="chip-links">
                        {recent.map((s) => <Link key={s.slug} to={`/schemes/${s.slug}`}>{s.shortName}</Link>)}
                    </div>
                </div>
            )}

            {suggestions.length > 0 && (
                <div className="my-block">
                    <h3><Sparkles size={18} /> You may also want to look at</h3>
                    <div className="scheme-grid">
                        {suggestions.map((s) => <SchemeCard key={s.slug} scheme={s} />)}
                    </div>
                </div>
            )}

            <p className="my-limit muted">
                <Info size={14} /> Deadline reminders aren’t available yet: we only show application dates once they are
                verified on the official portal, and most schemes here are open all year. Always check the portal for dates.
            </p>
        </section>
    )
}

export default MySchemesPanel
