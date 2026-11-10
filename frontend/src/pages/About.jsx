import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SCHEMES } from '../data/schemes'
import { HERO_PHOTOS } from '../data/heroPhotos'
import '../styles/Legal.css'
import { CONTACT_EMAIL } from '../config/contact'


// Public "who we are" page: purpose, team, what the platform does and does not
// do, how to contact us and how corrections work.
const About = () => {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <main className="legal-page">
            <article className="legal-card">
                <h1>About Community AI</h1>
                <p className="legal-updated">Independent information platform · India</p>

                <p>
                    Community AI helps people in India find government schemes, scholarships, free learning
                    resources and local help, and understand them in plain language. You can read{' '}
                    <Link to="/schemes">scheme guides</Link>, run the free{' '}
                    <Link to="/eligibility">eligibility checker</Link> without signing up, and ask our AI assistant
                    questions in your own language.
                </p>

                <h2>What we offer</h2>
                <ul>
                    <li><strong>{SCHEMES.length} detailed scheme guides</strong> covering eligibility, benefits, documents, application steps and official links, each with a review status and last-updated date.</li>
                    <li><strong>An eligibility checker</strong> that suggests schemes worth checking from a few non-sensitive answers. It never asks for Aadhaar, bank details or OTPs.</li>
                    <li><strong>A directory of 200+ government resources</strong> and <strong>300+ free learning platforms</strong> for signed-in users.</li>
                    <li><strong>An AI assistant</strong> that answers in 11 Indian languages, plus a community forum.</li>
                    <li><strong>Hindi versions</strong> of the main pages and the most-used scheme guides. Use the EN / हिंदी switch at the top of the page.</li>
                </ul>

                <h2>What we are not</h2>
                <p>
                    Community AI is <strong>not a government website</strong> and is not affiliated with any ministry,
                    department or state government. We can’t process applications, approve benefits or speed them up.
                    Final eligibility is always decided by the department that runs a scheme, so please confirm
                    details on the official portal linked from every guide. We never charge for anything. Every scheme page
                    names its official portal and lists its sources; opening the portal from our pages needs a free account.
                </p>

                <h2>Who builds it</h2>
                <ul>
                    <li><strong>Ritesh Kumar</strong>, project lead (<a href="https://github.com/RiteshKumar2e" target="_blank" rel="noopener noreferrer">GitHub</a>, <a href="https://www.linkedin.com/in/riteshkumar-tech" target="_blank" rel="noopener noreferrer">LinkedIn</a>, <a href="https://riteshkr.info/" target="_blank" rel="noopener noreferrer">Portfolio</a>)</li>
                    <li><strong>Ankit</strong>, project co-lead (<a href="https://github.com/Ankitkr-ak007/" target="_blank" rel="noopener noreferrer">GitHub</a>, <a href="https://www.linkedin.com/in/dev-ankit29/" target="_blank" rel="noopener noreferrer">LinkedIn</a>)</li>
                </ul>

                <h2>How we handle information</h2>
                <p>
                    Scheme guides are compiled from official government portals and notifications and rewritten in
                    plain language. Anything we could not confirm is marked “check the official guidelines”. AI is
                    used to answer questions in chat, but it is never treated as a source of facts for the guides. Our{' '}
                    <Link to="/editorial-policy">editorial policy</Link> explains how pages are researched, reviewed
                    and corrected.
                </p>

                <h2>Contact and corrections</h2>
                <p>
                    Use our <Link to="/contact">contact form</Link> or email{' '}
                    <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. If something on a scheme page is
                    wrong or out of date, use the “Report outdated or incorrect information” link on that page, or
                    write to us with the page link and, if possible, the official source.
                </p>

                {/* CC BY / CC BY-SA licences require credit, so keep this; collapsed to stay out of the way. */}
                <details className="photo-credits">
                    <summary>Homepage photo credits ({HERO_PHOTOS.length} photos, Wikimedia Commons)</summary>
                    <ul>
                        {HERO_PHOTOS.map((p) => (
                            <li key={p.src}>
                                <a href={p.page} target="_blank" rel="noopener noreferrer">Photo</a> by {p.author},{' '}
                                <a href={p.licenseUrl} target="_blank" rel="noopener noreferrer license">{p.license}</a>
                                {' '}(resized and darkened)
                            </li>
                        ))}
                    </ul>
                </details>

                <p>
                    See also our <Link to="/privacy">Privacy Policy</Link> and <Link to="/terms">Terms</Link>.
                </p>
            </article>
        </main>
    )
}

export default About
