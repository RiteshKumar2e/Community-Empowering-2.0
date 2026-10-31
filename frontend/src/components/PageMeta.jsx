import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { loadAnalytics, trackPageView } from '../utils/analytics'

const SITE = 'Community AI'
const DEFAULT_DESCRIPTION =
    'Find government schemes, scholarships, learning resources and local help with Community AI, a free AI assistant that answers in your language.'

// Per-route <title> and meta description. Unknown paths fall through to the 404 entry.
const PAGES = {
    '/': { title: `${SITE} – Government Schemes, Education & Resources in Your Language` },
    '/login': { title: `Sign In | ${SITE}`, description: 'Sign in to Community AI to ask questions, track schemes and join the community forum.' },
    '/register': { title: `Create a Free Account | ${SITE}`, description: 'Create a free Community AI account to get personalised help with government schemes, education and local resources.' },
    '/admin-login': { title: `Admin Sign In | ${SITE}` },
    '/dashboard': { title: `Dashboard | ${SITE}` },
    '/assistant': { title: `AI Assistant | ${SITE}` },
    '/resources': { title: `Resources | ${SITE}` },
    '/learning': { title: `Learning Hub | ${SITE}` },
    '/profile': { title: `My Profile | ${SITE}` },
    '/feedback': { title: `Feedback | ${SITE}` },
    '/forum': { title: `Community Forum | ${SITE}` },
    '/admin': { title: `Admin Dashboard | ${SITE}` },
    '/privacy': { title: `Privacy Policy | ${SITE}`, description: 'How Community AI collects, uses and protects your personal information.' },
    '/terms': { title: `Terms & Conditions | ${SITE}`, description: 'The terms that apply when you use Community AI.' },
}
const NOT_FOUND = { title: `Page Not Found | ${SITE}` }

const PageMeta = () => {
    const { pathname } = useLocation()

    useEffect(() => {
        loadAnalytics()
    }, [])

    useEffect(() => {
        const page = PAGES[pathname] || NOT_FOUND
        document.title = page.title
        document
            .querySelector('meta[name="description"]')
            ?.setAttribute('content', page.description || DEFAULT_DESCRIPTION)
        trackPageView(pathname, page.title)
    }, [pathname])

    return null
}

export default PageMeta
