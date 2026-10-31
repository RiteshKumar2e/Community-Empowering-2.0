import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getRouteMeta } from '../seo/routes'

// Keeps <title>, description, canonical and robots in sync with the route.
// Public pages also get these tags in their prerendered HTML at build time
// (scripts/prerender.mjs); this keeps them right during client navigation.
const setTag = (selector, create, value) => {
    let el = document.head.querySelector(selector)
    if (value == null) {
        el?.remove()
        return
    }
    if (!el) {
        el = create()
        document.head.appendChild(el)
    }
    el.setAttribute(el.tagName === 'LINK' ? 'href' : 'content', value)
}

const PageMeta = () => {
    const { pathname } = useLocation()

    // GA4 page views come from the Google tag's history-change tracking
    // (see utils/analytics.js), so nothing is sent from here.
    useEffect(() => {
        const meta = getRouteMeta(pathname)
        document.title = meta.title
        setTag('meta[name="description"]', () => Object.assign(document.createElement('meta'), { name: 'description' }), meta.description)
        setTag('link[rel="canonical"]', () => Object.assign(document.createElement('link'), { rel: 'canonical' }), meta.canonical)
        setTag('meta[name="robots"]', () => Object.assign(document.createElement('meta'), { name: 'robots' }), meta.index ? null : 'noindex, follow')
    }, [pathname])

    return null
}

export default PageMeta
