import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../styles/Legal.css'

const CONTACT_EMAIL = 'riteshkumar90359@gmail.com'

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
                    Community AI ("we", "us") helps people find government schemes, learning
                    resources and local help. This policy explains what information we collect,
                    why we collect it and the choices you have.
                </p>

                <h2>Information we collect</h2>
                <ul>
                    <li><strong>Account details:</strong> name, email address, phone number, location, preferred language and community type that you give us when you register.</li>
                    <li><strong>Google sign-in:</strong> if you sign in with Google, we receive your name, email address and profile picture from Google.</li>
                    <li><strong>Content you create:</strong> questions you ask the AI assistant, forum posts and replies, and feedback you submit.</li>
                    <li><strong>Usage information:</strong> login times and the pages and features you use, so we can show your activity and improve the service.</li>
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
                    We store your login session, theme and language preference in your browser's
                    local storage. These are needed for the site to work. If we enable analytics,
                    it only runs after you accept it in the cookie banner, and you can change that
                    choice by clearing your browser's site data.
                </p>

                <h2>How long we keep data</h2>
                <p>
                    We keep your account information while your account is active. OTPs expire
                    after 10 minutes. You can ask us to delete your account and the data linked to
                    it at any time.
                </p>

                <h2>Your rights</h2>
                <p>
                    You can ask to see, correct or delete your personal information, or withdraw
                    your consent, by emailing us. You can update most account details yourself on
                    your <Link to="/profile">profile page</Link>.
                </p>

                <h2>Security</h2>
                <p>
                    Passwords are stored as one-way hashes and data is sent over HTTPS. No system
                    is perfectly secure, so please use a strong password and keep it private.
                </p>

                <h2>Children</h2>
                <p>
                    Community AI is not intended for children under 13. Users under 18 should use
                    it with a parent's or guardian's permission.
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
