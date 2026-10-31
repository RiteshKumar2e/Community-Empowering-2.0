// SEO regression checks against the production build (run `npm run build` first).
//   npm run test:seo
// Exits non-zero if any check fails.
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SITE_URL, indexablePaths, APP_ONLY_ROUTES } from '../src/seo/routes.js'

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const failures = []
const check = (ok, message) => { if (!ok) failures.push(message) }

const fileFor = (path) => (path === '/' ? join(dist, 'index.html') : join(dist, `${path.slice(1)}.html`))
const pick = (html, re) => (html.match(re) || [])[1]

// 1. Every indexable page exists with unique, correct metadata and real content.
const titles = new Map()
const descriptions = new Map()
for (const path of indexablePaths()) {
    const file = fileFor(path)
    if (!existsSync(file)) { failures.push(`${path}: no prerendered file`); continue }
    const html = readFileSync(file, 'utf8')
    const title = pick(html, /<title>([^<]*)<\/title>/)
    const description = pick(html, /<meta name="description" content="([^"]*)"/)
    const canonical = pick(html, /<link rel="canonical" href="([^"]*)"/)
    const expected = `${SITE_URL}${path === '/' ? '/' : path}`

    check(title && title.length <= 110, `${path}: missing or overlong <title>`)
    check(description && description.length >= 50 && description.length <= 170, `${path}: description missing or not 50–170 chars`)
    check(canonical === expected, `${path}: canonical is ${canonical}, expected ${expected}`)
    check(!/name="robots" content="[^"]*noindex/.test(html), `${path}: indexable page has noindex`)
    check((html.match(/<h1[\s>]/g) || []).length === 1, `${path}: should have exactly one <h1>`)
    const text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ')
    check(text.replace(/\s+/g, ' ').length > 600, `${path}: too little text content without JavaScript`)
    for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
        try { JSON.parse(json) } catch { failures.push(`${path}: invalid JSON-LD`) }
    }
    if (titles.has(title)) failures.push(`${path}: duplicate title with ${titles.get(title)}`)
    if (descriptions.has(description)) failures.push(`${path}: duplicate description with ${descriptions.get(description)}`)
    titles.set(title, path)
    descriptions.set(description, path)
}

// 2. Sitemap lists exactly the indexable pages and nothing private.
const sitemap = readFileSync(join(dist, 'sitemap.xml'), 'utf8')
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
const expectedLocs = indexablePaths().map((p) => `${SITE_URL}${p === '/' ? '/' : p}`)
check(locs.length === expectedLocs.length && expectedLocs.every((l) => locs.includes(l)), 'sitemap.xml does not match the indexable page list')
for (const route of APP_ONLY_ROUTES) {
    check(!locs.includes(`${SITE_URL}${route}`), `sitemap.xml must not list private route ${route}`)
}

// 3. Private shell and 404 are noindex and contain no prerendered content.
for (const name of ['app.html', '404.html']) {
    const html = readFileSync(join(dist, name), 'utf8')
    check(/name="robots" content="noindex/.test(html), `${name}: missing noindex`)
    check(!/rel="canonical"/.test(html), `${name}: must not have a canonical`)
}
check(/<div id="root"><\/div>/.test(readFileSync(join(dist, 'app.html'), 'utf8')), 'app.html must have an empty #root')

// 4. robots.txt points at the sitemap and doesn't block public pages.
const robots = readFileSync(join(dist, 'robots.txt'), 'utf8')
check(robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`), 'robots.txt: missing Sitemap line')
for (const path of indexablePaths()) {
    const blocked = [...robots.matchAll(/^Disallow:\s*(\S+)/gm)].some(([, rule]) => path === rule || path.startsWith(rule.endsWith('/') ? rule : `${rule}/`))
    check(!blocked, `robots.txt blocks public page ${path}`)
}

// 5. vercel.json sends every private route to the noindex shell.
const vercel = JSON.parse(readFileSync(join(dist, '..', 'vercel.json'), 'utf8'))
const appRewrite = new RegExp(`^${vercel.rewrites.find((r) => r.destination === '/app').source}$`)
for (const route of APP_ONLY_ROUTES) check(appRewrite.test(route), `vercel.json: ${route} is not rewritten to /app`)
for (const path of indexablePaths()) check(!appRewrite.test(path), `vercel.json: public page ${path} is rewritten to app.html`)

// 6. Every internal link in the prerendered pages points at a page that exists
//    (a prerendered file, an app route, or a static file in dist).
const appRoutes = new Set(APP_ONLY_ROUTES)
const resolves = (href) => {
    const path = href.split('#')[0].split('?')[0].replace(/\/+$/, '') || '/'
    if (path === '/' || appRoutes.has(path)) return true
    return existsSync(join(dist, `${path.slice(1)}.html`)) || existsSync(join(dist, path.slice(1)))
}
let linksChecked = 0
for (const path of [...indexablePaths(), '/404']) {
    const file = path === '/404' ? join(dist, '404.html') : fileFor(path)
    if (!existsSync(file)) continue
    const html = readFileSync(file, 'utf8')
    for (const [, href] of html.matchAll(/<a[^>]+href="(\/[^"]*)"/g)) {
        linksChecked++
        if (!resolves(href)) failures.push(`${path}: broken internal link ${href}`)
    }
}

// 7. llms.txt exists and only lists canonical public URLs.
const llmsFile = join(dist, 'llms.txt')
if (!existsSync(llmsFile)) failures.push('llms.txt missing')
else {
    const urls = [...readFileSync(llmsFile, 'utf8').matchAll(/\]\((https:\/\/[^)]+)\)/g)].map((m) => m[1])
    for (const u of urls) check(expectedLocs.includes(u), `llms.txt lists a non-sitemap URL: ${u}`)
}

if (failures.length) {
    console.error(`SEO checks failed (${failures.length}):\n - ${failures.join('\n - ')}`)
    process.exit(1)
}
console.log(`SEO checks passed: ${indexablePaths().length} indexable pages, ${linksChecked} internal links, sitemap, robots.txt, llms.txt, app.html, 404.html, vercel.json`)
