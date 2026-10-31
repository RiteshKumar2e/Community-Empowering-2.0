import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BellRing, Plus, Trash2, Check, Info } from 'lucide-react'
import { SCHEMES, getScheme } from '../data/schemes'
import { formatDate } from './SchemeBits'
import { fetchReminders, createReminder, toggleReminder, deleteReminder } from '../services/myData'
import { trackEvent } from '../utils/analytics'

const todayISO = () => {
    const d = new Date()
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

const daysUntil = (iso) => Math.round((new Date(`${iso}T00:00:00`) - new Date(`${todayISO()}T00:00:00`)) / 86400000)

// Personal reminders: the user picks the date, so we never present it as an
// official deadline. Shown on the dashboard only (no emails or push).
const RemindersBlock = ({ savedSlugs = [] }) => {
    const [items, setItems] = useState([])
    const [status, setStatus] = useState('loading')
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState('')
    const [date, setDate] = useState('')
    const [scheme, setScheme] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        fetchReminders().then((r) => { setItems(r); setStatus('ready') }).catch(() => setStatus('error'))
    }, [])

    const options = [...savedSlugs.map(getScheme).filter(Boolean), ...SCHEMES.filter((s) => !savedSlugs.includes(s.slug))]

    const add = async (e) => {
        e.preventDefault()
        setError('')
        if (title.trim().length < 2) return setError('Give the reminder a short title')
        if (!date || date < todayISO()) return setError('Pick today or a future date')
        try {
            const created = await createReminder(title.trim(), date, scheme)
            setItems((list) => [...list, created].sort((a, b) => a.remindOn.localeCompare(b.remindOn)))
            trackEvent('reminder_created', { scheme: scheme || 'none' })
            setTitle(''); setDate(''); setScheme(''); setOpen(false)
        } catch (err) {
            setError(err.response?.data?.detail && typeof err.response.data.detail === 'string' ? err.response.data.detail : 'Could not save the reminder. Please try again.')
        }
    }

    const toggle = async (id) => {
        setItems((list) => list.map((r) => (r.id === id ? { ...r, done: !r.done } : r)))
        try { await toggleReminder(id) } catch { /* revert on next load */ }
    }

    const remove = async (id) => {
        setItems((list) => list.filter((r) => r.id !== id))
        try { await deleteReminder(id) } catch { /* ignore */ }
    }

    const upcoming = items.filter((r) => !r.done)
    const done = items.filter((r) => r.done)

    return (
        <div className="my-block">
            <div className="my-block-head">
                <h3><BellRing size={18} /> My reminders</h3>
                {status !== 'error' && (
                    <button type="button" className="my-add-btn" onClick={() => setOpen((o) => !o)}>
                        <Plus size={16} /> Add reminder
                    </button>
                )}
            </div>

            {open && (
                <form className="reminder-form" onSubmit={add}>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Collect income certificate" maxLength={120} aria-label="Reminder title" />
                    <input type="date" value={date} min={todayISO()} onChange={(e) => setDate(e.target.value)} aria-label="Reminder date" />
                    <select value={scheme} onChange={(e) => setScheme(e.target.value)} aria-label="Related scheme (optional)">
                        <option value="">No scheme</option>
                        {options.map((s) => <option key={s.slug} value={s.slug}>{s.shortName}</option>)}
                    </select>
                    <button type="submit" className="btn btn-primary">Save</button>
                    {error && <p className="field-error" role="alert">{error}</p>}
                </form>
            )}

            {status === 'loading' && <p className="muted">Loading reminders…</p>}
            {status === 'error' && <p className="muted">Reminders couldn’t be loaded right now.</p>}
            {status === 'ready' && items.length === 0 && !open && (
                <p className="muted">No reminders yet. Add one for things like collecting documents or applying before a date you found on the official portal.</p>
            )}

            {upcoming.length > 0 && (
                <ul className="reminder-list">
                    {upcoming.map((r) => {
                        const d = daysUntil(r.remindOn)
                        const s = r.schemeSlug && getScheme(r.schemeSlug)
                        return (
                            <li key={r.id} className={d <= 3 ? 'soon' : ''}>
                                <button type="button" className="reminder-check" onClick={() => toggle(r.id)} aria-label={`Mark "${r.title}" done`} />
                                <div className="reminder-text">
                                    <span className="reminder-title">{r.title}</span>
                                    <span className="muted">
                                        {formatDate(r.remindOn)} · {d === 0 ? 'today' : d === 1 ? 'tomorrow' : `in ${d} days`}
                                        {s && <> · <Link to={`/schemes/${s.slug}`}>{s.shortName}</Link></>}
                                    </span>
                                </div>
                                <button type="button" className="reminder-del" onClick={() => remove(r.id)} aria-label={`Delete "${r.title}"`}><Trash2 size={15} /></button>
                            </li>
                        )
                    })}
                </ul>
            )}

            {done.length > 0 && (
                <details className="reminder-done">
                    <summary>{done.length} done</summary>
                    <ul className="reminder-list">
                        {done.map((r) => (
                            <li key={r.id} className="done">
                                <button type="button" className="reminder-check checked" onClick={() => toggle(r.id)} aria-label={`Mark "${r.title}" not done`}><Check size={12} /></button>
                                <div className="reminder-text"><span className="reminder-title">{r.title}</span></div>
                                <button type="button" className="reminder-del" onClick={() => remove(r.id)} aria-label={`Delete "${r.title}"`}><Trash2 size={15} /></button>
                            </li>
                        ))}
                    </ul>
                </details>
            )}

            <p className="my-limit muted">
                <Info size={14} /> These are your own dates. Official deadlines change, so always confirm them on the scheme’s official portal.
            </p>
        </div>
    )
}

export default RemindersBlock
