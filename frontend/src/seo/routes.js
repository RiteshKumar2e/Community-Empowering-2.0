// Per-route SEO metadata shared by the browser (components/PageMeta.jsx) and
// the build-time prerenderer (scripts/prerender.mjs). Plain data only.
import { SCHEMES, getScheme, getCategory, publishedCategories, schemesInCategory } from '../data/schemes.js'

export const SITE_URL = 'https://communityai.co.in'
export const SITE_NAME = 'Community AI'
export const DEFAULT_DESCRIPTION =
    'Find Indian government schemes you may be eligible for: eligibility, benefits, documents and how to apply, explained in plain language with links to official portals.'

const STATIC = {
    '/': {
        title: `${SITE_NAME} – Government Schemes, Scholarships & Benefits Explained`,
        description: DEFAULT_DESCRIPTION,
        index: true,
        changefreq: 'weekly',
        priority: 1.0,
    },
    '/schemes': {
        title: `Government Schemes in India: Eligibility, Benefits & How to Apply | ${SITE_NAME}`,
        description: 'Central and Jharkhand government schemes for students, farmers, women, seniors and small businesses: eligibility, benefits, documents and official links.',
        index: true,
        changefreq: 'weekly',
        priority: 0.9,
    },
    '/eligibility': {
        title: `Government Scheme Eligibility Checker | ${SITE_NAME}`,
        description: 'Answer a few questions about your age, work and state to see which government schemes may be relevant to you. Free, no sign-up, no Aadhaar needed.',
        index: true,
        changefreq: 'monthly',
        priority: 0.8,
    },
    '/editorial-policy': {
        title: `Editorial Policy & How We Verify Scheme Information | ${SITE_NAME}`,
        description: 'How Community AI researches, verifies, updates and corrects government scheme information, and how to report an error.',
        index: true,
        changefreq: 'yearly',
        priority: 0.4,
    },
    '/privacy': {
        title: `Privacy Policy | ${SITE_NAME}`,
        description: 'How Community AI collects, uses and protects your personal information.',
        index: true,
        changefreq: 'yearly',
        priority: 0.2,
    },
    '/terms': {
        title: `Terms & Conditions | ${SITE_NAME}`,
        description: 'The terms that apply when you use Community AI, including how to use our scheme guides and AI assistant responsibly.',
        index: true,
        changefreq: 'yearly',
        priority: 0.2,
    },
    // App screens: useful to users, not to search engines.
    '/login': { title: `Sign In | ${SITE_NAME}`, index: false },
    '/register': { title: `Create a Free Account | ${SITE_NAME}`, index: false },
    '/forgot-password': { title: `Reset Your Password | ${SITE_NAME}`, index: false },
    '/admin-login': { title: `Admin Sign In | ${SITE_NAME}`, index: false },
    '/dashboard': { title: `Dashboard | ${SITE_NAME}`, index: false },
    '/assistant': { title: `AI Assistant | ${SITE_NAME}`, index: false },
    '/resources': { title: `Resources | ${SITE_NAME}`, index: false },
    '/learning': { title: `Learning Hub | ${SITE_NAME}`, index: false },
    '/profile': { title: `My Profile | ${SITE_NAME}`, index: false },
    '/feedback': { title: `Feedback | ${SITE_NAME}`, index: false },
    '/forum': { title: `Community Forum | ${SITE_NAME}`, index: false },
    '/admin': { title: `Admin Dashboard | ${SITE_NAME}`, index: false },
}

// Routes that exist only inside the app (served from app.html with noindex).
export const APP_ONLY_ROUTES = Object.entries(STATIC)
    .filter(([, meta]) => !meta.index)
    .map(([path]) => path)

export const NOT_FOUND_META = {
    title: `Page Not Found | ${SITE_NAME}`,
    description: DEFAULT_DESCRIPTION,
    index: false,
}

const trimDescription = (text, max = 158) =>
    text.length <= max ? text : `${text.slice(0, text.lastIndexOf(' ', max - 1))}…`

export const schemeMeta = (scheme) => ({
    title: `${scheme.shortName}: Eligibility, Benefits, Documents & How to Apply | ${SITE_NAME}`,
    description: trimDescription(scheme.summary),
    index: true,
    changefreq: 'monthly',
    priority: 0.8,
    lastmod: scheme.review.lastUpdated,
})

export const categoryMeta = (category) => ({
    title: `Government Schemes for ${category.label} | ${SITE_NAME}`,
    description: trimDescription(`${category.intro} See ${schemesInCategory(category.id).length} schemes with eligibility, benefits and official links.`),
    index: true,
    changefreq: 'monthly',
    priority: 0.7,
})

// Returns { title, description, index, canonical, ... } for any pathname.
export const getRouteMeta = (pathname) => {
    const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname

    let meta = STATIC[path]
    if (!meta) {
        const categoryMatch = path.match(/^\/schemes\/category\/([a-z0-9-]+)$/)
        const schemeMatch = path.match(/^\/schemes\/([a-z0-9-]+)$/)
        if (categoryMatch) {
            const category = getCategory(categoryMatch[1])
            if (category && publishedCategories().includes(category)) meta = categoryMeta(category)
        } else if (schemeMatch) {
            const scheme = getScheme(schemeMatch[1])
            if (scheme) meta = schemeMeta(scheme)
        }
    }
    meta = meta || NOT_FOUND_META

    return {
        ...meta,
        description: meta.description || DEFAULT_DESCRIPTION,
        canonical: meta.index ? `${SITE_URL}${path === '/' ? '/' : path}` : null,
    }
}

// Every indexable URL: used for sitemap.xml and the prerendered pages.
export const indexablePaths = () => [
    ...Object.entries(STATIC).filter(([, m]) => m.index).map(([p]) => p),
    ...publishedCategories().map((c) => `/schemes/category/${c.id}`),
    ...SCHEMES.map((s) => `/schemes/${s.slug}`),
]
