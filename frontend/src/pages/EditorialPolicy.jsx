import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../styles/Legal.css'

const CONTACT_EMAIL = 'riteshkumar90359@gmail.com'

const EditorialPolicy = () => {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <main className="legal-page">
            <article className="legal-card">
                <h1>Editorial Policy</h1>
                <p className="legal-updated">Last updated: 31 October 2026</p>

                <p>
                    Government schemes affect people’s money, health and education, so we hold our scheme guides
                    to a simple standard: <strong>every fact should be traceable to an official source</strong>, and
                    anything we could not confirm is clearly marked.
                </p>

                <h2>Who we are</h2>
                <p>
                    Community AI is an independent information platform built by a small team in India. We are{' '}
                    <strong>not a government website</strong> and are not affiliated with any ministry, department or
                    state government. We do not process applications and cannot approve or speed up benefits.
                </p>

                <h2>Where our information comes from</h2>
                <ul>
                    <li>Official scheme portals and ministry or department websites (usually ending in <code>.gov.in</code> or <code>.nic.in</code>).</li>
                    <li>Official notifications, gazette orders, scheme guidelines and Press Information Bureau releases.</li>
                    <li>The Government of India’s myScheme portal for cross-checking eligibility.</li>
                </ul>
                <p>
                    News reports may alert us to a change, but we confirm it on an official source before updating a
                    page. Every scheme page links to the official portal so you can check for yourself.
                </p>

                <h2>How we write and review a scheme page</h2>
                <ol>
                    <li>We collect the eligibility rules, benefits, documents and application steps from official sources.</li>
                    <li>We rewrite them in plain language without changing their meaning.</li>
                    <li>Where a detail is unclear, varies by state, or could not be confirmed, we say “check the official guidelines” instead of guessing.</li>
                    <li>A reviewer checks the page against the official source. Each page shows its review status and the date it was last updated.</li>
                </ol>

                <h2>What the review labels mean</h2>
                <ul>
                    <li><strong>Verified against official source on [date]</strong>: a reviewer checked every section against the official portal or notification on that date.</li>
                    <li><strong>Not yet verified against the latest official notification</strong>: the page was compiled from official portals and public information but has not completed a full review. Treat it as a guide and confirm details on the official portal.</li>
                </ul>

                <h2>Keeping pages up to date</h2>
                <p>
                    Benefit amounts, age limits and deadlines change. We re-check pages when a change is announced and
                    aim to review every scheme page at least every six months. Time-sensitive details such as
                    application windows are linked to the official portal rather than stated as fixed dates.
                </p>

                <h2>Use of AI</h2>
                <p>
                    Our AI assistant can explain schemes and answer questions, but AI can make mistakes. Scheme guide
                    pages are written and reviewed by people, and AI is never treated as a source of facts. Always
                    confirm AI answers on the official portal.
                </p>

                <h2>Corrections</h2>
                <p>
                    If you find something wrong or out of date, email{' '}
                    <a href={`mailto:${CONTACT_EMAIL}?subject=Correction`}>{CONTACT_EMAIL}</a> with the page link and,
                    if possible, the official source. Every scheme page also has a “Report outdated or incorrect
                    information” link. When we fix a page, we update its date.
                </p>

                <h2>Your safety</h2>
                <p>
                    We will never ask for your Aadhaar number, bank password, card details or OTP. Applying for
                    government schemes through official channels is free. Be careful of anyone who asks for money to
                    “guarantee” a benefit.
                </p>

                <p>
                    See also our <Link to="/privacy">Privacy Policy</Link> and <Link to="/terms">Terms</Link>.
                </p>
            </article>
        </main>
    )
}

export default EditorialPolicy
