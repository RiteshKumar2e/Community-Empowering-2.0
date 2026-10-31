// Regression test for the post-login redirect allowlist (open-redirect defence).
//   node scripts/check-redirects.mjs
import { readFileSync } from 'node:fs'

// Pull the function out of myData.js so this script doesn't need the browser-only imports.
const src = readFileSync(new URL('../src/services/myData.js', import.meta.url), 'utf8')
const body = src.match(/export const isSafeInternalPath = ([\s\S]*?\n\s*!path\.startsWith\('\/\/'\))/)[1]
const isSafeInternalPath = eval(body) // eslint-disable-line no-eval

const BS = String.fromCharCode(92) // backslash
const cases = [
    ['/schemes/pm-kisan', true],
    ['/dashboard', true],
    ['/schemes?x=1#apply', true],
    ['//evil.com', false],
    [`/${BS}evil.com`, false],
    [`/${BS}/evil.com`, false],
    ['https://evil.com', false],
    ['javascript:alert(1)', false],
    ['/a\nb', false],
    ['/%0d%0aSet-Cookie:x', false],
    ['', false],
    [null, false],
]

let failed = 0
for (const [input, expected] of cases) {
    if (isSafeInternalPath(input) !== expected) {
        failed++
        console.error('FAIL', JSON.stringify(input), 'expected', expected)
    }
}
if (failed) process.exit(1)
console.log(`redirect allowlist: ${cases.length} cases passed`)
