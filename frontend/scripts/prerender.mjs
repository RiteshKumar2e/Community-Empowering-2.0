// Post-build step: turns the client-rendered SPA into crawlable pages.
//
//   1. Renders every public page to static HTML with its own <title>,
//      description, canonical, Open Graph tags and JSON-LD.
//   2. Writes app.html (noindex shell for signed-in routes) and 404.html.
//   3. Generates sitemap.xml from the same route list.
//
// Runs after `vite build` (client) and `vite build --ssr` (dist-prerender).
// In the browser the React app still mounts normally and replaces this HTML.
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { SCHEMES, getScheme, getCategory, publishedCategories, LAST_CONTENT_UPDATE } from '../src/data/schemes.js'
import { SITE_URL, SITE_NAME, getRouteMeta, indexablePaths, NOT_FOUND_META } from '../src/seo/routes.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const ssrDir = join(root, 'dist-prerender')

const { render, PAGE_SOURCES } = await import(pathToFileURL(join(ssrDir, 'entry-prerender.js')).href)
const template = readFileSync(join(dist, 'index.html'), 'utf8')
const manifest = JSON.parse(readFileSync(join(dist, '.vite', 'manifest.json'), 'utf8'))

if (!template.includes('<!--seo:start-->') || !template.includes('<!--app-html-->')) {
    throw new Error('index.html is missing the <!--seo:start--> or <!--app-html--> marker')
}

const esc = (s) => String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// CSS emitted for a page's lazy chunk (and anything it imports), so the
// prerendered markup is styled before JavaScript runs.
const cssFor = (source) => {
    const seen = new Set()
    const css = new Set()
    const walk = (key) => {
        if (!key || seen.has(key) || !manifest[key]) return
        seen.add(key)
        manifest[key].css?.forEach((c) => css.add(`/${c}`))
        manifest[key].imports?.forEach(walk)
    }
    walk(source)
    return [...css]
}

const jsonLd = (data) =>
    `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`

const ORGANIZATION = {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/logo.png`,
    email: 'riteshkumar90359@gmail.com',
    description: 'Independent platform explaining Indian government schemes, scholarships and learning resources in plain language. Not affiliated with any government.',
    sameAs: ['https://github.com/RiteshKumar2e/Community-Empowering-2.0'],
}

const breadcrumbs = (items) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name,
        item: `${SITE_URL}${path}`,
    })),
})

const headFor = (meta, { structuredData = [], css = [] } = {}) => [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}">`,
    meta.canonical ? `<link rel="canonical" href="${meta.canonical}">` : '',
    meta.index ? '' : '<meta name="robots" content="noindex, follow">',
    meta.canonical ? `<meta property="og:url" content="${meta.canonical}">` : '',
    `<meta property="og:title" content="${esc(meta.title)}">`,
    `<meta property="og:description" content="${esc(meta.description)}">`,
    `<meta name="twitter:title" content="${esc(meta.title)}">`,
    `<meta name="twitter:description" content="${esc(meta.description)}">`,
    ...css.map((href) => `<link rel="stylesheet" href="${href}">`),
    ...structuredData.map(jsonLd),
].filter(Boolean).join('\n  ')

// Plain links around prerendered content so crawlers (and visitors without
// JavaScript) can reach every public page. React replaces them on load.
const crawlNav = `<nav aria-label="Site" style="padding:12px 16px;border-bottom:1px solid #e6e8eb;font-family:Inter,system-ui,sans-serif">
  <a href="/" style="font-weight:700;margin-right:16px">${SITE_NAME}</a>
  <a href="/schemes" style="margin-right:12px">Government Schemes</a>
  <a href="/eligibility" style="margin-right:12px">Eligibility Checker</a>
  <a href="/login">Sign in</a>
</nav>`
const crawlFooter = `<footer style="padding:24px 16px;border-top:1px solid #e6e8eb;font-family:Inter,system-ui,sans-serif;font-size:14px">
  <p>${publishedCategories().map((c) => `<a href="/schemes/category/${c.id}">Schemes for ${esc(c.label)}</a>`).join(' · ')}</p>
  <p><a href="/about">About Community AI</a> · <a href="/editorial-policy">Editorial Policy</a> · <a href="/privacy">Privacy Policy</a> · <a href="/terms">Terms</a></p>
  <p>${SITE_NAME} is an independent information platform and is not affiliated with the Government of India or any state government.</p>
</footer>`

// The landing page component depends on auth state, so its crawlable
// version is written here from the same scheme data.
const homeBody = () => `<main style="max-width:960px;margin:0 auto;padding:32px 16px;font-family:Inter,system-ui,sans-serif">
  <h1>Find the government help you deserve, in your language</h1>
  <p>Community AI explains Indian government schemes in plain language: who can apply, what you get, which documents you need and where to apply officially. Ask questions to our AI assistant by text or voice.</p>
  <p><a href="/eligibility">Check which schemes you may be eligible for</a> · <a href="/schemes">Browse all scheme guides</a></p>
  <h2>Scheme guides</h2>
  <ul>${SCHEMES.map((s) => `<li><a href="/schemes/${s.slug}">${esc(s.shortName)}</a>: ${esc(s.summary)}</li>`).join('')}</ul>
  <h2>Schemes by who they help</h2>
  <ul>${publishedCategories().map((c) => `<li><a href="/schemes/category/${c.id}">Government schemes for ${esc(c.label)}</a></li>`).join('')}</ul>
</main>`

const pageSourceFor = (path) => {
    if (PAGE_SOURCES[path]) return PAGE_SOURCES[path]
    if (path.startsWith('/schemes/category/')) return PAGE_SOURCES['/schemes/category/:category']
    if (path.startsWith('/schemes/')) return PAGE_SOURCES['/schemes/:slug']
    return null
}

const structuredDataFor = (path, meta) => {
    if (path === '/') {
        return [{
            '@context': 'https://schema.org',
            '@graph': [
                { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, name: SITE_NAME, url: `${SITE_URL}/`, inLanguage: 'en-IN', publisher: { '@id': `${SITE_URL}/#organization` } },
                ORGANIZATION,
            ],
        }]
    }
    const scheme = path.startsWith('/schemes/') && getScheme(path.split('/')[2])
    if (scheme) {
        const category = getCategory(scheme.categories[0])
        return [
            breadcrumbs([['Home', '/'], ['Government Schemes', '/schemes'], [category.label, `/schemes/category/${category.id}`], [scheme.shortName, path]]),
            {
                '@context': 'https://schema.org',
                '@type': 'WebPage',
                name: meta.title,
                description: meta.description,
                url: meta.canonical,
                inLanguage: 'en-IN',
                dateModified: scheme.review.lastUpdated,
                isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: `${SITE_URL}/` },
                publisher: ORGANIZATION,
            },
        ]
    }
    const categoryId = path.startsWith('/schemes/category/') && path.split('/')[3]
    if (categoryId) {
        return [breadcrumbs([['Home', '/'], ['Government Schemes', '/schemes'], [getCategory(categoryId).label, path]])]
    }
    if (path === '/schemes') return [breadcrumbs([['Home', '/'], ['Government Schemes', '/schemes']])]
    if (path === '/eligibility') return [breadcrumbs([['Home', '/'], ['Government Schemes', '/schemes'], ['Eligibility Checker', '/eligibility']])]
    if (path === '/about') {
        return [{
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            name: meta.title,
            url: meta.canonical,
            inLanguage: 'en-IN',
            about: ORGANIZATION,
        }]
    }
    return []
}

const pageHtml = (head, body) =>
    template
        .replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, head)
        .replace('<!--app-html-->', body)

const writePage = (path, html) => {
    // /schemes/pm-kisan -> schemes/pm-kisan.html, served at the clean URL via
    // "cleanUrls" in vercel.json (and by `vite preview`).
    const file = path === '/' ? join(dist, 'index.html') : join(dist, `${path.slice(1)}.html`)
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, html)
}

// 1. Public pages
const paths = indexablePaths()
for (const path of paths) {
    const meta = getRouteMeta(path)
    const source = pageSourceFor(path)
    const main = path === '/' ? homeBody() : render(path)
    if (!main || main.length < 200) throw new Error(`Prerender produced no content for ${path}`)
    const head = headFor(meta, { structuredData: structuredDataFor(path, meta), css: source ? cssFor(source) : [] })
    writePage(path, pageHtml(head, `${crawlNav}${main}${crawlFooter}`))
}

// 2. Shell for signed-in app routes (noindex, no content), and the 404 page
writeFileSync(join(dist, 'app.html'), pageHtml(headFor({ ...getRouteMeta('/dashboard'), title: SITE_NAME }), ''))
writeFileSync(join(dist, '404.html'), pageHtml(headFor(NOT_FOUND_META), `${crawlNav}<main style="padding:48px 16px;font-family:Inter,system-ui,sans-serif"><h1>Page not found</h1><p>The page you are looking for does not exist. <a href="/schemes">Browse government schemes</a> or <a href="/">go to the home page</a>.</p></main>`))

// 3. Sitemap: only canonical, public, indexable URLs
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => {
    const m = getRouteMeta(p)
    return `  <url>
    <loc>${m.canonical}</loc>
    <lastmod>${m.lastmod || LAST_CONTENT_UPDATE}</lastmod>${m.changefreq ? `\n    <changefreq>${m.changefreq}</changefreq>` : ''}${m.priority != null ? `\n    <priority>${m.priority.toFixed(1)}</priority>` : ''}
  </url>`
}).join('\n')}
</urlset>
`
writeFileSync(join(dist, 'sitemap.xml'), sitemap)

// 4. llms.txt: a plain-text index of the public pages (https://llmstxt.org).
// Optional and not a ranking factor; generated from the same data so it can't
// drift out of date.
const llms = `# ${SITE_NAME}

> Independent platform that explains Indian government schemes, scholarships and learning resources in plain language, with links to the official portals. Not a government website. Scheme guides show when they were last updated and whether they have been verified against the latest official notification.

## Start here
- [Government schemes directory](${SITE_URL}/schemes): search and filter all scheme guides
- [Eligibility checker](${SITE_URL}/eligibility): 8 questions, no sign-up, suggests schemes worth checking
- [About](${SITE_URL}/about): who runs the site and how to contact us
- [Editorial policy](${SITE_URL}/editorial-policy): sources, review process and corrections

## Scheme guides
${SCHEMES.map((s) => `- [${s.name}](${SITE_URL}/schemes/${s.slug}): ${s.summary}`).join('\n')}

## Schemes by group
${publishedCategories().map((c) => `- [Government schemes for ${c.label}](${SITE_URL}/schemes/category/${c.id})`).join('\n')}

## Policies
- [Privacy policy](${SITE_URL}/privacy)
- [Terms](${SITE_URL}/terms)
`
writeFileSync(join(dist, 'llms.txt'), llms)

// Build-only artefacts should not be deployed.
rmSync(join(dist, '.vite'), { recursive: true, force: true })
if (existsSync(ssrDir)) rmSync(ssrDir, { recursive: true, force: true })

console.log(`prerender: ${paths.length} public pages + app.html + 404.html; sitemap.xml has ${paths.length} URLs; llms.txt written`)
