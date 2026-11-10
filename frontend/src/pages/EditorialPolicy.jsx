import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../styles/Legal.css'
import { CONTACT_EMAIL } from '../config/contact'
import { LAST_CONTENT_UPDATE } from '../data/schemes'

const formatDate = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

// How scheme guides are researched, checked, corrected and kept current.
// Describe only what we actually do: no claims of independent reviewers or
// official endorsement unless they exist.
const EditorialPolicy = () => {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <main className="legal-page">
            <article className="legal-card">
                <h1>Editorial Policy</h1>
                <p className="legal-updated">Last updated: {formatDate(LAST_CONTENT_UPDATE)}</p>

                <p>
                    Government schemes affect people’s money, health and education. Our rule for scheme guides is
                    simple: <strong>every fact must come from an official source</strong>, and anything we could not
                    confirm is marked as unconfirmed instead of guessed.
                </p>

                <h2>Who is responsible</h2>
                <p>
                    Community AI is an independent project. It is <strong>not a government website</strong> and is not
                    connected to any ministry, department or state government. We do not take applications and cannot
                    approve, reject or speed up a benefit.
                </p>
                <p>
                    Scheme guides are researched, written and updated by <strong>Ritesh Kumar</strong>, who is
                    responsible for what they say. We are a small team and do not yet have a separate, independent
                    reviewer. That is why scheme pages currently show “Not yet reviewed by a second person”. When a
                    named person checks a page against its sources, the page will show their name and the date.
                </p>

                <h2>Where information comes from</h2>
                <ul>
                    <li>Official scheme portals and ministry or department websites (usually ending in <code>.gov.in</code> or <code>.nic.in</code>).</li>
                    <li>Official notifications, scheme guidelines, gazette orders and Press Information Bureau (PIB) releases.</li>
                    <li>The Government of India’s myScheme portal, to cross-check eligibility rules.</li>
                </ul>
                <p>
                    News reports can tell us that something changed, but we only update a page after confirming the
                    change on an official source. Each scheme page lists the sources it was written from, so you can
                    check them yourself.
                </p>

                <h2>How a scheme page is written and checked</h2>
                <ol>
                    <li>We collect eligibility rules, benefits, required documents, application steps and helpline numbers from the official sources.</li>
                    <li>We rewrite them in plain language without changing what they mean.</li>
                    <li>We check each number on the page (amounts, ages, income limits, dates) against the source it came from.</li>
                    <li>If a rule varies by state, is unclear, or could not be confirmed, the page says so and points to the official portal.</li>
                    <li>Worked examples on a page are labelled as illustrations. They are not real people’s stories, and we do not publish testimonials.</li>
                    <li>We open every official link on the page to make sure it works and goes to the right government site.</li>
                </ol>

                <h2>What the labels on a scheme page mean</h2>
                <ul>
                    <li><strong>Last updated [date]</strong>: the date the page content was last checked or changed.</li>
                    <li><strong>Not yet reviewed by a second person</strong>: the page was written from official sources by the author but has not been checked by anyone else.</li>
                    <li><strong>Checked by [name] on [date]</strong>: a named person checked the whole page against its official sources on that date. We only show this label when that has actually happened.</li>
                </ul>

                <h2>How often pages are reviewed</h2>
                <p>
                    We aim to re-check every scheme page at least once every six months, and sooner when a change is
                    announced, for example in the Union Budget, a PIB release or a state cabinet decision.
                    Application windows and deadlines change often, so we link to the official portal for those
                    instead of stating fixed dates.
                </p>

                <h2>How we spot outdated information</h2>
                <ul>
                    <li>We watch PIB releases and the official portals of the schemes we cover.</li>
                    <li>Reports from readers through the “Report outdated or incorrect information” link on every scheme page.</li>
                    <li>Broken or moved official links found when we check the pages.</li>
                </ul>
                <p>
                    If we learn that a page may be wrong and cannot fix it right away, we add a note to the page
                    saying which detail is uncertain.
                </p>

                <h2>Corrections</h2>
                <p>
                    If you find something wrong or out of date, use the <Link to="/contact?topic=correction">contact form</Link>{' '}
                    (choose “Correction to a scheme page”) or email{' '}
                    <a href={`mailto:${CONTACT_EMAIL}?subject=Correction`}>{CONTACT_EMAIL}</a>. Please include the page
                    link and, if you can, the official source. We check every report against official sources. When
                    a page is corrected, its “Last updated” date changes.
                </p>

                <h2>Use of AI</h2>
                <p>
                    The AI assistant can explain schemes and answer questions, but it can make mistakes. Scheme
                    guides are written and checked by people, and AI output is never used as a source of facts for
                    them. Always confirm an AI answer on the official portal before acting on it.
                </p>

                <h2>Your safety</h2>
                <p>
                    We will never ask for your Aadhaar number, bank password, card details or OTP. Applying for
                    government schemes through official channels is free. Be careful of anyone who asks for money to
                    “guarantee” a benefit.
                </p>

                <p>
                    See also <Link to="/about">About us</Link>, our <Link to="/privacy">Privacy Policy</Link> and{' '}
                    <Link to="/terms">Terms</Link>.
                </p>
            </article>
        </main>
    )
}

export default EditorialPolicy
