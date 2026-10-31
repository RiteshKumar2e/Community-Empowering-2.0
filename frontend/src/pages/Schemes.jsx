import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Search, ListChecks, X } from 'lucide-react'
import { SCHEMES, CATEGORIES, getCategory, publishedCategories } from '../data/schemes'
import { SchemeCard, Disclaimer, Breadcrumbs } from '../components/SchemeBits'
import { trackEvent } from '../utils/analytics'
import NotFound from './NotFound'
import '../styles/Schemes.css'

// Public, no login needed.
// /schemes                    all schemes, with search and filters
// /schemes/category/:category a category hub (filter preset + intro)
const Schemes = () => {
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
            (!q || [s.name, s.shortName, s.summary, s.whoFor, s.state || ''].join(' ').toLowerCase().includes(q))
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
                    { label: 'Home', to: '/' },
                    { label: 'Government Schemes', to: '/schemes' },
                    ...(hub ? [{ label: hub.label }] : []),
                ]} />

                <header className="schemes-header">
                    <h1>{hub ? `Government Schemes for ${hub.label}` : 'Government Schemes in India'}</h1>
                    <p className="schemes-lead">
                        {hub
                            ? hub.intro
                            : 'Plain-language guides to central and Jharkhand government schemes: who can apply, what you get, which documents you need and where to apply officially.'}
                    </p>
                    <Link to="/eligibility" className="btn btn-primary eligibility-cta">
                        <ListChecks size={18} />
                        Not sure where to start? Check your eligibility
                    </Link>
                </header>

                <section className="schemes-controls" aria-label="Search and filter schemes">
                    <div className="schemes-search">
                        <Search size={18} aria-hidden="true" />
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => onSearch(e.target.value)}
                            placeholder="Search schemes, e.g. pension, scholarship, loan"
                            aria-label="Search schemes"
                        />
                        {query && (
                            <button type="button" onClick={() => setQuery('')} aria-label="Clear search">
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
                                All
                            </button>
                            {CATEGORIES.map((c) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    className={`filter-chip ${category === c.id ? 'active' : ''}`}
                                    onClick={() => onFilter('category', c.id, setCategory)}
                                    aria-pressed={category === c.id}
                                >
                                    {c.emoji} {c.label}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="filter-row" role="group" aria-label="Filter by government">
                        {[['all', 'Central & State'], ['central', 'Central Government'], ['state', 'Jharkhand Government']].map(([value, label]) => (
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
                    {results.length} {results.length === 1 ? 'scheme' : 'schemes'} found
                </p>

                {results.length > 0 ? (
                    <div className="scheme-grid">
                        {results.map((s) => <SchemeCard key={s.slug} scheme={s} />)}
                    </div>
                ) : (
                    <div className="schemes-empty">
                        <p>No schemes match your search yet.</p>
                        <button type="button" className="btn btn-primary" onClick={() => { setQuery(''); setCategory(categoryParam || 'all'); setLevel('all') }}>
                            Clear filters
                        </button>
                        <p className="schemes-empty-hint">
                            You can also search every government scheme on the official <a href="https://www.myscheme.gov.in/" target="_blank" rel="noopener noreferrer">myScheme portal</a>.
                        </p>
                    </div>
                )}

                <section className="hub-links" aria-labelledby="browse-by">
                    <h2 id="browse-by">{hub ? 'Schemes for other groups' : 'Browse schemes by who they help'}</h2>
                    <ul>
                        {publishedCategories().filter((c) => c.id !== hub?.id).map((c) => (
                            <li key={c.id}>
                                <Link to={`/schemes/category/${c.id}`}>{c.emoji} Schemes for {c.label}</Link>
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
