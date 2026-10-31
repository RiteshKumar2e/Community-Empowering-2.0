// Build-time renderer for public pages (used by scripts/prerender.mjs).
// Renders only the page component, not the app shell (navbar, auth, chatbot),
// because those depend on the browser and the signed-in user. That also
// guarantees no user-specific data can end up in the static HTML.
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import { Routes, Route } from 'react-router-dom'
import { AuthContext } from './contexts/AuthContext'
import Schemes from './pages/Schemes'
import SchemeDetail from './pages/SchemeDetail'
import EligibilityChecker from './pages/EligibilityChecker'
import EditorialPolicy from './pages/EditorialPolicy'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Terms from './pages/Terms'

// Source file of each page, used to look up its CSS in the Vite manifest.
export const PAGE_SOURCES = {
    '/schemes': 'src/pages/Schemes.jsx',
    '/schemes/category/:category': 'src/pages/Schemes.jsx',
    '/schemes/:slug': 'src/pages/SchemeDetail.jsx',
    '/eligibility': 'src/pages/EligibilityChecker.jsx',
    '/editorial-policy': 'src/pages/EditorialPolicy.jsx',
    '/privacy': 'src/pages/PrivacyPolicy.jsx',
    '/terms': 'src/pages/Terms.jsx',
}

export const render = (url) =>
    renderToString(
        <StaticRouter location={url}>
            {/* Always rendered as a logged-out visitor: no user data in static HTML. */}
            <AuthContext.Provider value={{ user: null, isAuthenticated: false }}>
            <Routes>
                <Route path="/schemes" element={<Schemes />} />
                <Route path="/schemes/category/:category" element={<Schemes />} />
                <Route path="/schemes/:slug" element={<SchemeDetail />} />
                <Route path="/eligibility" element={<EligibilityChecker />} />
                <Route path="/editorial-policy" element={<EditorialPolicy />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<Terms />} />
            </Routes>
            </AuthContext.Provider>
        </StaticRouter>
    )
