import { Link } from 'react-router-dom'
import { ArrowRight, ShieldAlert, Clock, ChevronRight } from 'lucide-react'
import { localizeScheme } from '../data/schemes'
import { useText } from '../i18n/appText'

export const formatDate = (iso) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

// Shown on every scheme page: Community AI is not a government website.
export const Disclaimer = () => {
    const t = useText()
    return (
        <aside className="scheme-disclaimer" role="note">
            <ShieldAlert size={18} aria-hidden="true" />
            <p>
                <strong>{t('disclaimer_strong')}</strong>{' '}{t('disclaimer_rest')}
            </p>
        </aside>
    )
}

export const ReviewStatus = ({ review }) => {
    const t = useText()
    return (
        <p className="scheme-review">
            <Clock size={14} aria-hidden="true" />
            {t('last_updated', { date: formatDate(review.lastUpdated) })}
            {/* "Verified" only when a named person checked the page; see data/schemes.js. */}
            {review.status === 'verified' && review.verifiedOn && review.reviewer ? (
                <span className="review-pill verified">{t('verified_by', { date: formatDate(review.verifiedOn), name: review.reviewer })}</span>
            ) : (
                <span className="review-pill pending">{t('not_verified')}</span>
            )}
        </p>
    )
}

export const Breadcrumbs = ({ items }) => (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
        <ol>
            {items.map((item, i) => (
                <li key={item.label}>
                    {item.to && i < items.length - 1 ? <Link to={item.to}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
                    {i < items.length - 1 && <ChevronRight size={14} aria-hidden="true" />}
                </li>
            ))}
        </ol>
    </nav>
)

export const SchemeCard = ({ scheme: base }) => {
    const t = useText()
    const scheme = localizeScheme(base, t.language)
    return (
        <Link to={`/schemes/${scheme.slug}`} className="scheme-card">
            <div className="scheme-card-top">
                <span className={`level-tag ${scheme.level}`}>{scheme.level === 'state' ? scheme.state : t('central')}</span>
            </div>
            <h3>{scheme.shortName}</h3>
            <p>{scheme.summary}</p>
            <span className="scheme-card-link">
                {t('card_link')} <ArrowRight size={16} aria-hidden="true" />
            </span>
        </Link>
    )
}
