import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../styles/Legal.css'
import { CONTACT_EMAIL } from '../config/contact'


const PrivacyPolicy = () => {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <main className="legal-page">
            <article className="legal-card">
                <h1>Privacy Policy</h1>
                <p className="legal-updated">Last updated: 31 October 2026</p>

                <p>
                    Community AI (&quot;we&quot;, &quot;us&quot;) helps people find government schemes, learning
                    resources and local help. This policy explains what information we collect,
                    why we collect it and the choices you have.
                </p>

                <h2>Information we collect</h2>
                <ul>
                    <li><strong>Account details:</strong> name, email address, phone number, location, preferred language and community type that you give us when you register.</li>
                    <li><strong>Google sign-in:</strong> if you sign in with Google, we receive your name, email address and profile picture from Google.</li>
                    <li><strong>Content you create:</strong> questions you ask the AI assistant, forum posts and replies, and feedback you submit.</li>
                    <li><strong>Usage information:</strong> login times and the pages and features you use, so we can show your activity and improve the service.</li>
                    <li><strong>Saved items (only if you have an account and choose to save them):</strong> schemes you bookmark, eligibility-check results and reminders you create. For eligibility results we store your age, gender, occupation, state, income band, tax-payer status and whether you have a daughter under 10. We never store your social category (caste).</li>
                    <li><strong>Eligibility checker without an account:</strong> your answers stay in your browser on your device and are not sent to us unless you create an account and save them.</li>
                </ul>

                <h2>How we use it</h2>
                <ul>
                    <li>To create and secure your account, including sending one-time passwords (OTPs) by email.</li>
                    <li>To answer your questions and recommend relevant schemes and resources.</li>
                    <li>To run the community forum and respond to your feedback.</li>
                    <li>To fix problems and improve the service.</li>
                </ul>
                <p>We do not sell your personal information.</p>

                <h2>Services that process your data</h2>
                <p>We share only what is needed with these providers:</p>
                <ul>
                    <li><strong>AI providers</strong> (Groq and Google Gemini) process the questions you send to the AI assistant.</li>
                    <li><strong>Email providers</strong> (Brevo, Resend) send OTPs and notifications.</li>
                    <li><strong>Google</strong> handles Google sign-in.</li>
                    <li><strong>Hosting and database providers</strong> store and serve the application and its data.</li>
                </ul>

                <h2>Cookies and local storage</h2>
                <p>
                    We store your login session, theme and language preference in your browser&apos;s
                    local storage. These are needed for the site to work. We use Google Analytics to
                    understand which pages are useful. Analytics cookies are only set after you click
                    “Accept” in the cookie banner; until then Google Analytics runs in a cookieless
                    mode and cannot recognise you across visits. We never send your name, email,
                    phone number or eligibility answers to analytics. You can change your choice by
                    clearing your browser&apos;s site data.
                </p>

                <h2>How long we keep data</h2>
                <p>
                    We keep your account information while your account is active. We keep your 10
                    most recent saved eligibility results. Login, password-reset and email-confirmation
                    codes expire within 30 minutes and are stored only in a scrambled (hashed) form.
                    When you delete your account, your data is removed from our database.
                </p>

                <h2>Your rights</h2>
                <p>
                    On your <Link to="/profile">profile page</Link> you can edit your details,
                    <strong> download a copy of your data</strong> (as a JSON file) and
                    <strong> permanently delete your account</strong> and everything linked to it. You can
                    also email us to ask for any of this, or to withdraw your consent.
                </p>

                <h2>Security</h2>
                <p>
                    Passwords are stored as one-way hashes and data is sent over HTTPS. No system
                    is perfectly secure, so please use a strong password and keep it private.
                </p>

                <h2>Children</h2>
                <p>
                    Community AI is not intended for children under 13. Users under 18 should use
                    it with a parent&apos;s or guardian&apos;s permission.
                </p>

                <h2>Changes</h2>
                <p>
                    We will update the date at the top of this page when this policy changes. For
                    significant changes we will let you know on the site or by email.
                </p>

                <h2>Contact</h2>
                <p>
                    Questions about privacy? Email{' '}
                    <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
                </p>
            </article>
        </main>
    )
}

export default PrivacyPolicy
