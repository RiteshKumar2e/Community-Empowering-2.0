import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Search, ListChecks, X } from 'lucide-react'
import { SCHEMES, CATEGORIES, getCategory, publishedCategories, categoryLabel } from '../data/schemes'
import { SchemeCard, Disclaimer, Breadcrumbs } from '../components/SchemeBits'
import { trackEvent } from '../utils/analytics'
import { useText } from '../i18n/appText'
import NotFound from './NotFound'
import '../styles/Schemes.css'

// Public, no login needed.
// /schemes                    all schemes, with search and filters
// /schemes/category/:category a category hub (filter preset + intro)
const Schemes = () => {
    const t = useText()
    const { category: categoryParam } = useParams()
    const hub = categoryParam ? getCategory(categoryParam) : null
    const [query, setQuery] = useState('')
    const [category, setCategory] = useState(categoryParam || 'all')
    const [level, setLevel] = useState('all')
    const searchTimer = useRef(null)

    useEffect(() => {
        window.scrollTo(0, 0)
        setCategory(categoryParam || 'all')
    }, [categoryParam])

    const results = useMemo(() => {
        const q = query.trim().toLowerCase()
        return SCHEMES.filter((s) =>
            (category === 'all' || s.categories.includes(category)) &&
            (level === 'all' || s.level === level) &&
            (!q || [s.name, s.shortName, s.summary, s.whoFor, s.state || '', s.hi?.summary || '', s.hi?.whoFor || ''].join(' ').toLowerCase().includes(q))
        )
    }, [query, category, level])

    if (categoryParam && (!hub || !publishedCategories().includes(hub))) return <NotFound />

    const onSearch = (value) => {
        setQuery(value)
        clearTimeout(searchTimer.current)
        if (value.trim().length >= 3) {
            searchTimer.current = setTimeout(() => trackEvent('scheme_search', { search_term: value.trim().slice(0, 60) }), 900)
        }
    }

    const onFilter = (type, value, setter) => {
        setter(value)
        trackEvent('scheme_filter_used', { filter_type: type, value })
    }

    return (
        <main className="schemes-page">
            <div className="container">
                <Breadcrumbs items={[
                    { label: t('home'), to: '/' },
                    { label: t('gov_schemes'), to: '/schemes' },
                    ...(hub ? [{ label: categoryLabel(hub, t.language) }] : []),
                ]} />

                <header className="schemes-header">
                    <h1>{hub ? t('schemes_for', { label: categoryLabel(hub, t.language) }) : t('schemes_title')}</h1>
                    <p className="schemes-lead">
                        {hub
                            ? ((t.language === 'hi' && hub.introHi) || hub.intro)
                            : t('schemes_lead')}
                    </p>
                    <Link to="/eligibility" className="btn btn-primary eligibility-cta">
                        <ListChecks size={18} />
                        {t('not_sure_cta')}
                    </Link>
                </header>

                <section className="schemes-controls" aria-label="Search and filter schemes">
                    <div className="schemes-search">
                        <Search size={18} aria-hidden="true" />
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => onSearch(e.target.value)}
                            placeholder={t('search_placeholder')}
                            aria-label={t('search_label')}
                        />
                        {query && (
                            <button type="button" onClick={() => setQuery('')} aria-label={t('clear_search')}>
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {!hub && (
                        <div className="filter-row" role="group" aria-label="Filter by category">
                            <button
                                type="button"
                                className={`filter-chip ${category === 'all' ? 'active' : ''}`}
                                onClick={() => onFilter('category', 'all', setCategory)}
                                aria-pressed={category === 'all'}
                            >
                                {t('all')}
                            </button>
                            {CATEGORIES.map((c) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    className={`filter-chip ${category === c.id ? 'active' : ''}`}
                                    onClick={() => onFilter('category', c.id, setCategory)}
                                    aria-pressed={category === c.id}
                                >
                                    {categoryLabel(c, t.language)}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="filter-row" role="group" aria-label="Filter by government">
                        {[['all', t('central_state')], ['central', t('central_gov')], ['state', t('jharkhand_gov')]].map(([value, label]) => (
                            <button
                                key={value}
                                type="button"
                                className={`filter-chip small ${level === value ? 'active' : ''}`}
                                onClick={() => onFilter('level', value, setLevel)}
                                aria-pressed={level === value}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </section>

                <p className="results-count" aria-live="polite">
                    {t(results.length === 1 ? 'found_one' : 'found_many', { n: results.length })}
                </p>

                {results.length > 0 ? (
                    <div className="scheme-grid">
                        {results.map((s) => <SchemeCard key={s.slug} scheme={s} />)}
                    </div>
                ) : (
                    <div className="schemes-empty">
                        <p>{t('no_match')}</p>
                        <button type="button" className="btn btn-primary" onClick={() => { setQuery(''); setCategory(categoryParam || 'all'); setLevel('all') }}>
                            {t('clear_filters')}
                        </button>
                        <p className="schemes-empty-hint">
                            {t('myscheme_hint')} <a href="https://www.myscheme.gov.in/" target="_blank" rel="noopener noreferrer">{t('myscheme_portal')}</a>.
                        </p>
                    </div>
                )}

                <section className="hub-links" aria-labelledby="browse-by">
                    <h2 id="browse-by">{hub ? t('other_groups') : t('browse_by')}</h2>
                    <ul>
                        {publishedCategories().filter((c) => c.id !== hub?.id).map((c) => (
                            <li key={c.id}>
                                <Link to={`/schemes/category/${c.id}`}>{t('schemes_for_short', { label: categoryLabel(c, t.language) })}</Link>
                            </li>
                        ))}
                    </ul>
                </section>

                <Disclaimer />
            </div>
        </main>
    )
}

export default Schemes
