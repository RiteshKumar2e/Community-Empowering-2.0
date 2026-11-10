import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Mail, Send, CheckCircle2, AlertCircle } from 'lucide-react'
import api from '../services/api'
import { CONTACT_EMAIL } from '../config/contact'
import { useText } from '../i18n/appText'
import { trackEvent } from '../utils/analytics'
import '../styles/Legal.css'
import '../styles/Contact.css'

const TOPICS = ['general', 'correction', 'partnership', 'privacy']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Public contact page. Corrections to scheme pages arrive here with
// ?topic=correction&page=/schemes/<slug> from the "Report" link.
const Contact = () => {
    const t = useText()
    const [params] = useSearchParams()
    const fromTopic = params.get('topic')
    const fromPage = params.get('page')
    const [form, setForm] = useState({
        name: '',
        email: '',
        topic: TOPICS.includes(fromTopic) ? fromTopic : 'general',
        message: '',
        page: fromPage && fromPage.startsWith('/') ? fromPage : '',
        website: '', // honeypot, hidden from people
    })
    const [errors, setErrors] = useState({})
    const [status, setStatus] = useState('idle') // idle | sending | sent | error
    const [serverError, setServerError] = useState('')

    useEffect(() => { window.scrollTo(0, 0) }, [])

    const update = (field) => (e) => {
        setForm((f) => ({ ...f, [field]: e.target.value }))
        if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }))
    }

    const validate = () => {
        const er = {}
        if (form.name.trim().length < 2) er.name = t('c_err_name')
        if (!EMAIL_RE.test(form.email.trim())) er.email = t('c_err_email')
        if (form.message.trim().length < 10) er.message = t('c_err_message')
        if (form.message.length > 3000) er.message = t('c_err_long')
        return er
    }

    const submit = async (e) => {
        e.preventDefault()
        const er = validate()
        setErrors(er)
        if (Object.keys(er).length) {
            document.getElementById(`contact-${Object.keys(er)[0]}`)?.focus()
            return
        }
        setStatus('sending')
        setServerError('')
        try {
            await api.post('/contact', {
                name: form.name.trim(),
                email: form.email.trim(),
                topic: form.topic,
                message: form.message.trim(),
                page: form.page || null,
                website: form.website || null,
            })
            setStatus('sent')
            trackEvent('contact_submitted', { topic: form.topic })
        } catch (err) {
            setStatus('error')
            setServerError(err.response?.status === 429 ? t('c_err_rate') : t('c_err_server', { email: CONTACT_EMAIL }))
        }
    }

    const fieldProps = (field) => ({
        id: `contact-${field}`,
        value: form[field],
        onChange: update(field),
        'aria-invalid': errors[field] ? 'true' : undefined,
        'aria-describedby': errors[field] ? `contact-${field}-error` : undefined,
    })
    const errorFor = (field) => errors[field] && (
        <p className="field-error" id={`contact-${field}-error`} role="alert">{errors[field]}</p>
    )

    return (
        <main className="legal-page contact-page">
            <article className="legal-card">
                <h1>{t('c_title')}</h1>
                <p>{t('c_lead')}</p>
                <p className="contact-email">
                    <Mail size={18} aria-hidden="true" /> {t('c_email_label')}{' '}
                    <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                </p>
                <p className="muted">{t('c_not_gov')}</p>

                {status === 'sent' ? (
                    <div className="contact-success" role="status">
                        <CheckCircle2 size={22} aria-hidden="true" />
                        <div>
                            <h2>{t('c_sent_title')}</h2>
                            <p>{t('c_sent_text')}</p>
                            <Link to="/schemes">{t('c_back')}</Link>
                        </div>
                    </div>
                ) : (
                    <form className="contact-form" onSubmit={submit} noValidate>
                        <div className="form-row">
                            <label htmlFor="contact-name">{t('c_name')}</label>
                            <input type="text" autoComplete="name" maxLength={100} {...fieldProps('name')} />
                            {errorFor('name')}
                        </div>
                        <div className="form-row">
                            <label htmlFor="contact-email">{t('c_email')}</label>
                            <input type="email" autoComplete="email" maxLength={200} {...fieldProps('email')} />
                            {errorFor('email')}
                        </div>
                        <div className="form-row">
                            <label htmlFor="contact-topic">{t('c_topic')}</label>
                            <select {...fieldProps('topic')}>
                                {TOPICS.map((topic) => <option key={topic} value={topic}>{t(`c_topic_${topic}`)}</option>)}
                            </select>
                        </div>
                        {form.page && (
                            <p className="muted">{t('c_about_page')} <code>{form.page}</code></p>
                        )}
                        <div className="form-row">
                            <label htmlFor="contact-message">{t('c_message')}</label>
                            <textarea rows={6} maxLength={3000} {...fieldProps('message')} />
                            <p className="field-hint">{t('c_message_hint')}</p>
                            {errorFor('message')}
                        </div>
                        {/* Honeypot: off-screen and skipped by keyboard and screen readers. */}
                        <div className="contact-hp" aria-hidden="true">
                            <label htmlFor="contact-website">Website</label>
                            <input id="contact-website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={update('website')} />
                        </div>
                        {status === 'error' && (
                            <p className="form-error" role="alert"><AlertCircle size={16} aria-hidden="true" /> {serverError}</p>
                        )}
                        <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
                            <Send size={16} aria-hidden="true" /> {status === 'sending' ? t('c_sending') : t('c_send')}
                        </button>
                        <p className="field-hint">{t('c_privacy')} <Link to="/privacy">{t('c_privacy_link')}</Link>.</p>
                    </form>
                )}
            </article>
        </main>
    )
}

export default Contact
