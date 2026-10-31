import { Link } from 'react-router-dom'
import { ArrowRight, ShieldAlert, Clock, ChevronRight } from 'lucide-react'
import { getCategory } from '../data/schemes'

export const formatDate = (iso) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

// Shown on every scheme page: Community AI is not a government website.
export const Disclaimer = () => (
    <aside className="scheme-disclaimer" role="note">
        <ShieldAlert size={18} />
        <p>
            <strong>Community AI is an independent information platform, not a government website.</strong>{' '}
            Rules, amounts and deadlines change. Always confirm on the official portal before you apply.
            We never ask for your Aadhaar number, bank password or OTP.
        </p>
    </aside>
)

export const ReviewStatus = ({ review }) => (
    <p className="scheme-review">
        <Clock size={14} />
        Last updated {formatDate(review.lastUpdated)}
        {review.status === 'verified' && review.verifiedOn ? (
            <span className="review-pill verified">Verified against official source on {formatDate(review.verifiedOn)}</span>
        ) : (
            <span className="review-pill pending">Not yet verified against the latest official notification</span>
        )}
    </p>
)

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

export const SchemeCard = ({ scheme }) => (
    <Link to={`/schemes/${scheme.slug}`} className="scheme-card">
        <div className="scheme-card-top">
            <span className={`level-tag ${scheme.level}`}>{scheme.level === 'state' ? scheme.state : 'Central'}</span>
            {scheme.categories.slice(0, 2).map((c) => (
                <span key={c} className="cat-tag">{getCategory(c)?.emoji} {getCategory(c)?.label}</span>
            ))}
        </div>
        <h3>{scheme.shortName}</h3>
        <p>{scheme.summary}</p>
        <span className="scheme-card-link">
            Eligibility &amp; how to apply <ArrowRight size={16} />
        </span>
    </Link>
)
