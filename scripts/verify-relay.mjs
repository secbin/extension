/**
 * Live verification of the on-demand panel injection + SB_FETCH background
 * relay — the path the injected in-page panel uses for all Pastebin traffic
 * (content scripts can't fetch cross-origin themselves; see pbFetch in
 * src/lib/pastebin.ts).
 *
 * Loads the built extension (dist/) into Chrome for Testing, then:
 *   1. direct fetch from an extension page  → CORS-exempt via host_permissions
 *   2. panel injection via chrome.scripting.executeScript from the service
 *      worker into a pastebin.com tab (host permission; in real use activeTab
 *      grants the same on whatever tab the user clicks) — and confirms
 *      injection FAILS on a non-permitted site, proving the minimal footprint
 *   3. SB_FETCH GET from the real content-script world
 *   4. SB_FETCH POST round-trip to the Pastebin API from that world
 *      (with PASTEBIN_API_KEY set: posts a real paste and fetches it back;
 *       without: expects Pastebin's "invalid api_dev_key" error, which still
 *       proves the relay reached the API and returned its response)
 *   5. SB_FETCH to a non-Pastebin URL → must be blocked
 *
 * Requires:
 *   npm run build                                  (dist/ must exist)
 *   CHROME_PATH=<path to Chrome for Testing binary>
 *     (branded Chrome ≥137 ignores --load-extension; install one with
 *      npx @puppeteer/browsers install chrome@stable)
 * Run:
 *   npm run test:relay
 */
import puppeteer from 'puppeteer-core'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist')
const CHROME = process.env.CHROME_PATH
const API_KEY = process.env.PASTEBIN_API_KEY ?? ''

if (!CHROME || !fs.existsSync(CHROME)) {
  console.error('Set CHROME_PATH to a Chrome for Testing binary (npx @puppeteer/browsers install chrome@stable)')
  process.exit(1)
}
if (!fs.existsSync(path.join(DIST, 'manifest.json'))) {
  console.error(`No build at ${DIST} — run \`npm run build\` first`)
  process.exit(1)
}

// The crxjs ?script loader the service worker injects on demand
const loaderFile = fs.readdirSync(path.join(DIST, 'assets')).find(f => f.includes('-loader-'))
if (!loaderFile) {
  console.error('No content-script loader found in dist/assets — did the build change?')
  process.exit(1)
}
const LOADER = `assets/${loaderFile}`

let failures = 0
function check(name, ok, detail = '') {
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`)
  if (!ok) failures++
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: [
    `--disable-extensions-except=${DIST}`,
    `--load-extension=${DIST}`,
    '--no-first-run',
  ],
})

try {
  // ── Extension service worker must come up ─────────────────────────────────
  const swTarget = await browser.waitForTarget(
    t => t.type() === 'service_worker' && t.url().startsWith('chrome-extension://'),
    { timeout: 20_000 },
  )
  const extId = new URL(swTarget.url()).host
  check('service worker running', true, extId)
  const sw = await swTarget.worker()

  // ── 1. Direct fetch from an extension page (popup path) ──────────────────
  const popup = await browser.newPage()
  await popup.goto(`chrome-extension://${extId}/index.html`, { waitUntil: 'domcontentloaded' })
  const direct = await popup.evaluate(async () => {
    const body = new URLSearchParams({ api_dev_key: 'relay-verify-dummy', api_option: 'userdetails' })
    const r = await fetch('https://pastebin.com/api/api_post.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
    return { status: r.status, text: (await r.text()).slice(0, 100) }
  })
  check(
    'extension page fetches pastebin.com directly (no CORS error)',
    direct.text.includes('invalid api_dev_key'),
    `HTTP ${direct.status}: ${direct.text}`,
  )

  // ── 2. On-demand injection from the service worker ───────────────────────
  // One permitted tab (pastebin.com — covered by host_permissions, like an
  // activeTab grant in real use) and one non-permitted tab (example.com).
  const page = await browser.newPage()
  const cdp = await page.createCDPSession()
  const contexts = []
  cdp.on('Runtime.executionContextCreated', e => contexts.push(e.context))
  await cdp.send('Runtime.enable')
  await page.goto('https://pastebin.com/robots.txt', { waitUntil: 'networkidle2' })

  const other = await browser.newPage()
  await other.goto('https://example.com', { waitUntil: 'networkidle2' })

  const injection = await sw.evaluate(async (loader) => {
    const tabs = await chrome.tabs.query({})
    const injected = []
    const blocked = []
    for (const t of tabs) {
      try {
        await chrome.scripting.executeScript({ target: { tabId: t.id }, files: [loader] })
        injected.push(t.id)
      } catch (e) {
        blocked.push(String(e?.message ?? e).slice(0, 60))
      }
    }
    return { injected, blocked, total: tabs.length }
  }, LOADER)
  check(
    'panel injects into the permitted tab only',
    injection.injected.length === 1,
    `injected into ${injection.injected.length} of ${injection.total} tabs`,
  )
  check(
    'injection is refused on non-permitted sites (no <all_urls> anymore)',
    injection.blocked.some(m => /permission|cannot|access/i.test(m)),
    injection.blocked[0] ?? 'no blocked tabs',
  )

  // ── Find the injected content-script world ────────────────────────────────
  let csContext = null
  for (let attempt = 0; attempt < 40 && !csContext; attempt++) {
    for (const ctx of contexts.filter(c => !c.auxData?.isDefault)) {
      try {
        const { result } = await cdp.send('Runtime.evaluate', {
          expression: 'window.__SECUREBIN_INJECTED__ === true',
          contextId: ctx.id,
          returnByValue: true,
        })
        if (result.value === true) { csContext = ctx; break }
      } catch { /* context gone — keep looking */ }
    }
    if (!csContext) await new Promise(r => setTimeout(r, 250))
  }
  check('content-script world live after injection', !!csContext)
  if (!csContext) throw new Error('content-script world not found')

  const relay = async (msg) => {
    const { result, exceptionDetails } = await cdp.send('Runtime.evaluate', {
      expression: `chrome.runtime.sendMessage(${JSON.stringify(msg)})`,
      contextId: csContext.id,
      awaitPromise: true,
      returnByValue: true,
    })
    if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? 'evaluate failed')
    return result.value
  }

  // ── 3. Relay GET from the content-script world ────────────────────────────
  const got = await relay({ type: 'SB_FETCH', url: 'https://pastebin.com/robots.txt' })
  check(
    'relay GET returns a pastebin.com response',
    got && typeof got.status === 'number' && got.status !== 0 && typeof got.text === 'string',
    got ? `HTTP ${got.status}, ${got.text.length} bytes` : 'no response',
  )

  // ── 4. Relay POST round-trip to the Pastebin API ──────────────────────────
  if (API_KEY) {
    const marker = `securebin relay verification — ${new Date().toISOString()}`
    const postBody = new URLSearchParams({
      api_dev_key: API_KEY, api_paste_code: marker, api_option: 'paste', api_paste_private: '1',
    }).toString()
    const posted = await relay({ type: 'SB_FETCH', url: 'https://pastebin.com/api/api_post.php', body: postBody })
    const postedUrl = posted?.text?.trim() ?? ''
    check('relay POST posts a real paste', /^https:\/\/pastebin\.com\//.test(postedUrl), postedUrl || posted?.text?.slice(0, 80))

    if (/^https:\/\/pastebin\.com\//.test(postedUrl)) {
      const key = postedUrl.split('/').pop()
      const fetched = await relay({ type: 'SB_FETCH', url: `https://pastebin.com/raw/${key}` })
      check('relay GET fetches the paste back verbatim', fetched?.text?.trim() === marker, `HTTP ${fetched?.status}`)
    }
  } else {
    const posted = await relay({
      type: 'SB_FETCH',
      url: 'https://pastebin.com/api/api_post.php',
      body: new URLSearchParams({ api_dev_key: 'relay-verify-dummy', api_option: 'userdetails' }).toString(),
    })
    check(
      'relay POST reaches the Pastebin API (no key set — expecting its error reply)',
      posted?.text?.includes('invalid api_dev_key'),
      `HTTP ${posted?.status}: ${posted?.text?.slice(0, 80)}`,
    )
  }

  // ── 5. Non-Pastebin URLs must be refused ──────────────────────────────────
  const blocked = await relay({ type: 'SB_FETCH', url: 'https://example.com/' })
  check(
    'relay blocks non-Pastebin URLs',
    blocked?.ok === false && blocked?.status === 0 && /Blocked/.test(blocked?.text ?? ''),
    blocked?.text,
  )
} finally {
  await browser.close()
}

console.log(failures === 0 ? '\nAll relay checks passed.' : `\n${failures} check(s) FAILED`)
process.exit(failures === 0 ? 0 : 1)
