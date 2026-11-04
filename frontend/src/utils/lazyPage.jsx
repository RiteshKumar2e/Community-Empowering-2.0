import { lazy } from 'react'

const RELOAD_KEY = 'chunk-reload-at'
const RELOAD_WINDOW_MS = 30000

// Shown only if the page still can't load after the automatic reload.
const ReloadNotice = () => (
    <div role="alert" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <p>This page could not be loaded. A new version of the site may be available.</p>
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
            Reload page
        </button>
    </div>
)

// Each deploy renames the page files, so a tab opened before the deploy asks for
// a file that no longer exists and the import fails with "Failed to fetch
// dynamically imported module". Reloading picks up the new version. The
// timestamp keeps a genuinely missing file from causing a reload loop.
export const lazyPage = (load) => lazy(() => load().catch((error) => {
    let lastReload = 0
    try { lastReload = Number(sessionStorage.getItem(RELOAD_KEY)) || 0 } catch { /* storage blocked */ }

    if (Date.now() - lastReload > RELOAD_WINDOW_MS) {
        try { sessionStorage.setItem(RELOAD_KEY, String(Date.now())) } catch { /* storage blocked */ }
        window.location.reload()
        return new Promise(() => {}) // keep the loading state until the page reloads
    }

    console.error('Page failed to load after reloading:', error)
    return { default: ReloadNotice }
}))
