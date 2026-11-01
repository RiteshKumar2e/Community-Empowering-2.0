// Google's sign-in script is only used on /login (see pages/Login.jsx), so it
// isn't loaded on every page. To keep the "Sign in with Google" button from
// appearing late, start downloading it as soon as a visit to /login looks
// likely (hovering or tapping a "Sign In" link) or the Login page code loads.
// The browser then reuses the downloaded file when the button renders.
const GSI_SCRIPT = 'https://accounts.google.com/gsi/client'
let warmedUp = false

export const warmUpGoogleSignIn = () => {
    if (warmedUp || typeof document === 'undefined') return
    warmedUp = true
    const preconnect = document.createElement('link')
    preconnect.rel = 'preconnect'
    preconnect.href = 'https://accounts.google.com'
    const preload = document.createElement('link')
    preload.rel = 'preload'
    preload.as = 'script'
    preload.href = GSI_SCRIPT
    document.head.append(preconnect, preload)
}
