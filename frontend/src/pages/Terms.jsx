import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../styles/Legal.css'

const CONTACT_EMAIL = 'riteshkumar90359@gmail.com'

const Terms = () => {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <main className="legal-page">
            <article className="legal-card">
                <h1>Terms &amp; Conditions</h1>
                <p className="legal-updated">Last updated: 31 October 2026</p>

                <p>
                    By creating an account or using Community AI, you agree to these terms. If you
                    do not agree, please do not use the service.
                </p>

                <h2>The service</h2>
                <p>
                    Community AI is a free platform that helps you find information about
                    government schemes, education and local resources, and lets you talk with
                    other community members.
                </p>

                <h2>AI answers are guidance, not official advice</h2>
                <p>
                    Answers from the AI assistant can be incomplete, out of date or wrong. Always
                    confirm eligibility, deadlines and application steps on the official government
                    website or with the relevant office before you act. Community AI is not
                    affiliated with any government department.
                </p>

                <h2>Your account</h2>
                <ul>
                    <li>Give accurate information when you register.</li>
                    <li>Keep your password and OTPs private. You are responsible for activity on your account.</li>
                    <li>Tell us straight away if you think someone else has used your account.</li>
                </ul>

                <h2>Acceptable use</h2>
                <p>You agree not to:</p>
                <ul>
                    <li>Post content that is unlawful, abusive, hateful, misleading or that invades someone's privacy.</li>
                    <li>Share other people's personal details without their permission.</li>
                    <li>Send spam or advertising, or try to disrupt, overload or break into the service.</li>
                    <li>Use the service to impersonate anyone.</li>
                </ul>
                <p>
                    We may remove content or suspend accounts that break these rules.
                </p>

                <h2>Your content</h2>
                <p>
                    You keep ownership of what you post. By posting in the forum you allow us to
                    display it to other users of the service.
                </p>

                <h2>External links</h2>
                <p>
                    We link to government and third-party websites. We are not responsible for
                    their content or availability.
                </p>

                <h2>Availability and liability</h2>
                <p>
                    The service is provided "as is" without guarantees that it will always be
                    available or error-free. To the extent the law allows, we are not liable for
                    losses that result from relying on information from the service.
                </p>

                <h2>Privacy</h2>
                <p>
                    Our <Link to="/privacy">Privacy Policy</Link> explains how we handle your
                    personal information.
                </p>

                <h2>Changes and governing law</h2>
                <p>
                    We may update these terms and will change the date at the top of this page when
                    we do. These terms are governed by the laws of India.
                </p>

                <h2>Contact</h2>
                <p>
                    Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with any
                    questions about these terms.
                </p>
            </article>
        </main>
    )
}

export default Terms
