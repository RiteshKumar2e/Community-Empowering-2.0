import { useEffect, useState } from 'react'
import { Users, UserPlus, Activity, Repeat, Bookmark, ListChecks, Info } from 'lucide-react'
import api from '../services/api'
import { getScheme } from '../data/schemes'
import '../styles/AdminGrowth.css'

const PERIODS = [7, 30, 90]

const Tile = ({ icon, label, value, note }) => (
    <div className="growth-tile">
        <div className="growth-tile-label">{icon}{label}</div>
        <div className="growth-tile-value">{value}</div>
        {note && <div className="growth-tile-note">{note}</div>}
    </div>
)

// Registrations per day: one series, so no legend; the heading names it.
// Each bar has a hover/focus tooltip, and the same numbers are in a table.
const RegistrationsChart = ({ series }) => {
    const [hover, setHover] = useState(null)
    const max = Math.max(1, ...series.map((d) => d.count))
    const total = series.reduce((sum, d) => sum + d.count, 0)
    if (total === 0) {
        return <p className="growth-empty">No new accounts in this period yet.</p>
    }
    const fmt = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    return (
        <figure className="growth-chart">
            <div className="growth-bars" role="img" aria-label={`New accounts per day, ${total} in total`} onMouseLeave={() => setHover(null)}>
                {series.map((d, i) => (
                    <button
                        key={d.date}
                        type="button"
                        className="growth-bar-hit"
                        onMouseEnter={() => setHover(i)}
                        onFocus={() => setHover(i)}
                        onBlur={() => setHover(null)}
                        aria-label={`${fmt(d.date)}: ${d.count} new ${d.count === 1 ? 'account' : 'accounts'}`}
                    >
                        <span className="growth-bar" style={{ height: `${d.count ? Math.max(4, (d.count / max) * 100) : 0}%` }} />
                    </button>
                ))}
                {hover !== null && (
                    <div className="growth-tooltip" style={{ left: `${((hover + 0.5) / series.length) * 100}%` }}>
                        <strong>{series[hover].count}</strong> new {series[hover].count === 1 ? 'account' : 'accounts'}
                        <span>{fmt(series[hover].date)}</span>
                    </div>
                )}
            </div>
            <div className="growth-axis">
                <span>{fmt(series[0].date)}</span>
                <span>max {max}/day</span>
                <span>{fmt(series[series.length - 1].date)}</span>
            </div>
            <details className="growth-table">
                <summary>Show as table</summary>
                <table>
                    <thead><tr><th scope="col">Date</th><th scope="col">New accounts</th></tr></thead>
                    <tbody>
                        {series.filter((d) => d.count > 0).map((d) => (
                            <tr key={d.date}><td>{fmt(d.date)}</td><td>{d.count}</td></tr>
                        ))}
                    </tbody>
                </table>
            </details>
        </figure>
    )
}

// Admin-only (the API checks admin rights; this tab is just the view).
const AdminGrowthPanel = () => {
    const [days, setDays] = useState(30)
    const [data, setData] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        let alive = true
        setError('')
        api.get(`/admin/growth?days=${days}`)
            .then((res) => alive && setData(res.data))
            .catch((err) => alive && setError(err.response?.status === 403 ? 'Admin access required.' : 'Could not load growth data.'))
        return () => { alive = false }
    }, [days])

    if (error) return <p className="field-error" role="alert">{error}</p>
    if (!data) return <p className="growth-empty">Loading…</p>

    const { accounts, engagement } = data
    const pct = (a, b) => (b ? `${Math.round((a / b) * 100)}%` : '–')

    return (
        <section className="growth-panel" aria-labelledby="growth-title">
            <div className="growth-head">
                <h2 id="growth-title">Growth &amp; retention</h2>
                <div className="growth-periods" role="group" aria-label="Period">
                    {PERIODS.map((p) => (
                        <button key={p} type="button" className={p === days ? 'active' : ''} aria-pressed={p === days} onClick={() => setDays(p)}>
                            Last {p} days
                        </button>
                    ))}
                </div>
            </div>

            <p className="growth-source"><Info size={14} /> Registered accounts from this app’s database. These are not website visitors.</p>

            <div className="growth-tiles">
                <Tile icon={<Users size={16} />} label="Registered accounts" value={accounts.total} note="All time" />
                <Tile icon={<UserPlus size={16} />} label="New accounts" value={accounts.newInPeriod} note={`Last ${days} days`} />
                <Tile icon={<Activity size={16} />} label="Active accounts" value={engagement.activeInPeriod} note={`Last ${days} days · ${pct(engagement.activeInPeriod, accounts.total)} of all`} />
                <Tile icon={<Repeat size={16} />} label="Returning accounts" value={engagement.returningAccounts} note={`${pct(engagement.returningAccounts, accounts.total)} of all · all time`} />
                <Tile icon={<Bookmark size={16} />} label="Saved schemes" value={engagement.savedSchemesTotal} note={`by ${engagement.accountsWithSavedSchemes} ${engagement.accountsWithSavedSchemes === 1 ? 'account' : 'accounts'}`} />
                <Tile icon={<ListChecks size={16} />} label="Saved eligibility results" value={engagement.eligibilityResultsSaved} note="All time" />
                <Tile icon={<UserPlus size={16} />} label="New accounts activated" value={pct(engagement.newAccountsActivated, accounts.newInPeriod)} note={`${engagement.newAccountsActivated} of ${accounts.newInPeriod} saved something`} />
            </div>

            <h3 className="growth-subtitle">New accounts per day</h3>
            <RegistrationsChart series={accounts.registrationsByDay} />

            <div className="growth-columns">
                <div>
                    <h3 className="growth-subtitle">New accounts by month</h3>
                    {accounts.registrationsByMonth.length === 0 ? (
                        <p className="growth-empty">No accounts in the last 12 months.</p>
                    ) : (
                        <table className="growth-simple-table">
                            <tbody>
                                {accounts.registrationsByMonth.map((m) => (
                                    <tr key={m.month}><td>{new Date(`${m.month}-01T00:00:00`).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</td><td>{m.count}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                <div>
                    <h3 className="growth-subtitle">Most saved schemes</h3>
                    {engagement.topSavedSchemes.length === 0 ? (
                        <p className="growth-empty">No schemes saved yet. This fills up as signed-in users bookmark schemes.</p>
                    ) : (
                        <table className="growth-simple-table">
                            <tbody>
                                {engagement.topSavedSchemes.map((s) => (
                                    <tr key={s.slug}><td>{getScheme(s.slug)?.shortName || s.slug}</td><td>{s.count}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <div className="growth-definitions">
                <h3 className="growth-subtitle">How these are counted</h3>
                <ul>
                    <li><strong>Active:</strong> {engagement.activeRule}</li>
                    <li><strong>Returning:</strong> {engagement.returningRule}</li>
                    <li><strong>Activated:</strong> {engagement.activationRule}</li>
                    <li><strong>Not in this database:</strong> {data.notInDatabase} Open GA4 › Reports › Engagement › Events to see <code>eligibility_check_completed</code>, <code>signup_prompt_viewed</code>, <code>signup_started</code> and <code>signup_completed</code>, and compare them. GA counts will differ from account counts.</li>
                </ul>
            </div>
        </section>
    )
}

export default AdminGrowthPanel
