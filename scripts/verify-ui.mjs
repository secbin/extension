/**
 * Live UI verification of the injected panel flows that regressed with
 * on-demand injection (2.0.3) and the decrypt UX:
 *
 *   1. Quick-post: fresh injection + immediate SB_OPEN{quickPostLoading} must
 *      show the branded "Posting to Pastebin…" loading screen (the event used
 *      to be dispatched before React mounted and was lost), and the fake
 *      result message must land on the result page.
 *   2. Open in Editor: fresh injection + immediate SB_OPEN{pendingText} must
 *      put the text in the editor (same race).
 *   3. Decrypt: pasting a ciphertext must flip the action button to
 *      "Decrypt"; confirming the passkey must open the decrypted-content view
 *      with the plaintext.
 *   4. Paste link (needs PASTEBIN_API_KEY): pasting a pastebin.com link must
 *      default the button to "Open Paste"; opening an encrypted paste must
 *      hand off to the passkey prompt and land on the decrypted view; opening
 *      a plain paste must load its content into the editor.
 *
 * Requires:
 *   npm run build
 *   CHROME_PATH=<Chrome for Testing binary> (branded Chrome ≥137 ignores
 *     --load-extension; npx @puppeteer/browsers install chrome@stable)
 * Optional:
 *   PASTEBIN_API_KEY=<key> to run the live paste-link checks (posts two
 *     unlisted pastes)
 *   UI_SHOTS_DIR=<dir> to save screenshots of each verified state
 * Run:
 *   npm run test:ui
 */
import puppeteer from 'puppeteer-core'
import { webcrypto } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist')
const CHROME = process.env.CHROME_PATH
const SHOTS = process.env.UI_SHOTS_DIR ?? ''
const API_KEY = process.env.PASTEBIN_API_KEY ?? ''

if (!CHROME || !fs.existsSync(CHROME)) {
  console.error('Set CHROME_PATH to a Chrome for Testing binary (npx @puppeteer/browsers install chrome@stable)')
  process.exit(1)
}
if (!fs.existsSync(path.join(DIST, 'manifest.json'))) {
  console.error(`No build at ${DIST} — run \`npm run build\` first`)
  process.exit(1)
}
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true })

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

/** securebin-compatible password ciphertext (PBKDF2-SHA256 → AES-GCM). */
async function makeCiphertext(plaintext, passkey) {
  const enc = new TextEncoder()
  const salt = webcrypto.getRandomValues(new Uint8Array(16))
  const iv = webcrypto.getRandomValues(new Uint8Array(12))
  const material = await webcrypto.subtle.importKey('raw', enc.encode(passkey), 'PBKDF2', false, ['deriveKey'])
  const key = await webcrypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 10000, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 128 },
    true,
    ['encrypt'],
  )
  const out = new Uint8Array(await webcrypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plaintext)))
  const b64 = u8 => Buffer.from(u8).toString('base64')
  return JSON.stringify({
    C_TXT: b64(out.slice(0, -16)),
    IV: b64(iv),
    Mode: 'AES-GCM',
    Tag: b64(out.slice(-16)),
    Salt: b64(salt),
    Length: 16,
  })
}

// Runs inside the PAGE main world. The shadow root is open, so the panel DOM
// is reachable; events dispatched here bubble to the React listeners that the
// content script attached in its isolated world (the DOM is shared).
const pageHelpers = `
  window.__sb = {
    root() { return document.getElementById('securebin-root')?.shadowRoot ?? null },
    text() {
      const root = this.root()
      if (!root) return ''
      const values = [...root.querySelectorAll('input, textarea')].map(el => el.value).join('\\n')
      return root.textContent + '\\n' + values
    },
    async waitForText(needle, timeoutMs = 6000) {
      const start = Date.now()
      while (Date.now() - start < timeoutMs) {
        if (this.text().includes(needle)) return true
        await new Promise(r => setTimeout(r, 100))
      }
      return false
    },
    buttons() { return [...(this.root()?.querySelectorAll('button') ?? [])] },
    clickButton(label) {
      const b = this.buttons().find(b => b.textContent.trim() === label)
      if (!b) return false
      b.click()
      return true
    },
    setInput(placeholderPart, value) {
      const input = [...(this.root()?.querySelectorAll('input') ?? [])]
        .find(i => (i.placeholder ?? '').includes(placeholderPart))
      if (!input) return false
      const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
      set.call(input, value)
      input.dispatchEvent(new Event('input', { bubbles: true }))
      return true
    },
    setTextarea(value) {
      const ta = this.root()?.querySelector('textarea')
      if (!ta) return false
      const set = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set
      set.call(ta, value)
      ta.dispatchEvent(new Event('input', { bubbles: true }))
      return true
    },
    actionLabel() {
      // Primary ActionBar button = the rounded-left half of the split button
      const b = this.buttons().find(b => b.className.includes('rounded-l-full'))
      return b ? b.textContent.trim() : ''
    },
    async waitActionLabel(label, timeoutMs = 4000) {
      const start = Date.now()
      while (Date.now() - start < timeoutMs) {
        if (this.actionLabel() === label) return true
        await new Promise(r => setTimeout(r, 100))
      }
      return this.actionLabel()
    },
    clickAction() {
      const b = this.buttons().find(b => b.className.includes('rounded-l-full'))
      if (!b) return false
      b.click()
      return true
    },
  }
`

async function shot(page, name) {
  if (!SHOTS) return
  await page.screenshot({ path: path.join(SHOTS, `${name}.png`), clip: { x: 820, y: 0, width: 460, height: 640 } })
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  defaultViewport: { width: 1280, height: 800 },
  args: [
    `--disable-extensions-except=${DIST}`,
    `--load-extension=${DIST}`,
    '--no-first-run',
  ],
})

try {
  const swTarget = await browser.waitForTarget(
    t => t.type() === 'service_worker' && t.url().startsWith('chrome-extension://'),
    { timeout: 20_000 },
  )
  check('service worker running', true, new URL(swTarget.url()).host)
  const sw = await swTarget.worker()

  // Mirrors background.ts: inject, then retry sendMessage until the content
  // script's listener is up — exactly the timing a real context-menu click gets.
  const injectAndSend = (tabUrl, message) => sw.evaluate(async (url, msg, loader) => {
    const tabs = await chrome.tabs.query({})
    const tab = tabs.find(t => t.url === url)
    if (!tab) return { error: `tab not found: ${url}` }
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: [loader] })
    for (let attempt = 0; ; attempt++) {
      try { return { response: await chrome.tabs.sendMessage(tab.id, msg) ?? null } }
      catch (e) {
        if (attempt >= 20) return { error: String(e?.message ?? e) }
        await new Promise(r => setTimeout(r, 100))
      }
    }
  }, tabUrl, message, LOADER)

  const sendToTab = (tabUrl, message) => sw.evaluate(async (url, msg) => {
    const tabs = await chrome.tabs.query({})
    const tab = tabs.find(t => t.url === url)
    if (!tab) return { error: `tab not found: ${url}` }
    try { return { response: await chrome.tabs.sendMessage(tab.id, msg) ?? null } }
    catch (e) { return { error: String(e?.message ?? e) } }
  }, tabUrl, message)

  // ── 1. Quick-post: loading screen must appear on a fresh injection ────────
  const page = await browser.newPage()
  await page.goto('https://pastebin.com/robots.txt', { waitUntil: 'networkidle2' })
  await page.evaluate(pageHelpers)

  const qp = await injectAndSend('https://pastebin.com/robots.txt', { type: 'SB_OPEN', quickPostLoading: true })
  check('quick-post SB_OPEN delivered to fresh injection', !qp.error, qp.error)

  const loadingShown = await page.evaluate(() => window.__sb.waitForText('Posting to Pastebin'))
  await shot(page, '1-quick-post-loading')
  check('branded loading screen visible (event survived the mount race)', loadingShown)

  const fakeUrl = 'https://pastebin.com/FAKEQP01'
  await sendToTab('https://pastebin.com/robots.txt', {
    type: 'SB_QUICK_POST_RESULT',
    payload: { url: fakeUrl, error: null, text: 'quick post body', timestamp: 0 },
  })
  const resultShown = await page.evaluate(u => window.__sb.waitForText(u), fakeUrl)
  await shot(page, '2-quick-post-result')
  check('quick-post result lands on the result page', resultShown)

  // ── 2. Open in Editor: pending text must survive a fresh injection ────────
  const page2 = await browser.newPage()
  await page2.goto('https://pastebin.com/', { waitUntil: 'networkidle2' })
  await page2.evaluate(pageHelpers)

  // Prose that MENTIONS pastebin.com — must open as plain text, not as a
  // paste link (regression: loose detection flipped the action to Open Paste)
  const marker = 'context menu selection 8814 — mentioning pastebin.com in a note'
  const st = await injectAndSend('https://pastebin.com/', { type: 'SB_OPEN', pendingText: marker })
  check('set-text SB_OPEN delivered to fresh injection', !st.error, st.error)
  const textShown = await page2.evaluate(async m => {
    const ok = await window.__sb.waitForText(m)
    return ok && (window.__sb.root()?.querySelector('textarea')?.value ?? '').includes(m)
  }, marker)
  await shot(page2, '3-open-in-editor')
  check('pending text appears in the editor (event survived the mount race)', textShown)

  const proseLabel = await page2.evaluate(() => window.__sb.waitActionLabel('Post to Pastebin'))
  check(
    'prose mentioning pastebin.com opens as plain text, not Open Paste',
    proseLabel === true,
    proseLabel === true ? '' : `label: "${proseLabel}"`,
  )

  // ── 3. Decrypt flow: paste ciphertext → Decrypt button → decrypted view ───
  const secret = 'attack at dawn — securebin ui verification'
  const passkey = 'ui-verify-passkey'
  const ciphertext = await makeCiphertext(secret, passkey)

  const typed = await page2.evaluate(ct => window.__sb.setTextarea(ct), ciphertext)
  check('ciphertext entered in the editor', typed)

  const flipped = await page2.evaluate(async () => {
    const start = Date.now()
    while (Date.now() - start < 4000) {
      if (window.__sb.actionLabel() === 'Decrypt') return true
      await new Promise(r => setTimeout(r, 100))
    }
    return window.__sb.actionLabel()
  })
  await shot(page2, '4-decrypt-detected')
  check('action button flips to Decrypt on ciphertext paste', flipped === true, flipped === true ? '' : `label: "${flipped}"`)

  const decryptClicked = await page2.evaluate(() => {
    const b = window.__sb.buttons().find(b => b.className.includes('rounded-l-full'))
    if (!b) return false
    b.click()
    return true
  })
  check('Decrypt button clicked', decryptClicked)

  const dialogShown = await page2.evaluate(() => window.__sb.waitForText('Decryption Key'))
  check('passkey dialog opens', dialogShown)

  const keyEntered = await page2.evaluate(k => window.__sb.setInput('decryption key', k), passkey)
  check('passkey entered', keyEntered)
  await page2.evaluate(() => {
    // The dialog's confirm button (label "Decrypt") lives in the portal target
    const buttons = window.__sb.buttons().filter(b => b.textContent.trim() === 'Decrypt')
    buttons[buttons.length - 1]?.click()
  })

  const decryptedShown = await page2.evaluate(async s => {
    const ok = await window.__sb.waitForText('Decrypted successfully')
    return ok && window.__sb.text().includes(s)
  }, secret)
  await shot(page2, '5-decrypted-view')
  check('decrypted-content view shows the plaintext', decryptedShown)

  const notPersisted = await page2.evaluate(() => window.__sb.text().includes('never saved to history'))
  check('view states decrypted content is not saved to history', notPersisted)

  // Closing the panel must drop the decrypted content — reopening shows the
  // editor (with the ciphertext draft), never the plaintext
  await sendToTab('https://pastebin.com/', { type: 'SB_TOGGLE' })  // hide
  await sendToTab('https://pastebin.com/', { type: 'SB_TOGGLE' })  // show again
  const droppedOnClose = await page2.evaluate(async s => {
    const start = Date.now()
    while (Date.now() - start < 4000) {
      const t = window.__sb.text()
      if (!t.includes('Decrypted successfully') && !t.includes(s)) return true
      await new Promise(r => setTimeout(r, 100))
    }
    return false
  }, secret)
  await shot(page2, '5b-reopen-after-close')
  check('closing the panel drops the decrypted content', droppedOnClose)

  // Decrypt again for the Open in Editor round-trip
  await page2.evaluate(() => {
    const b = window.__sb.buttons().find(b => b.className.includes('rounded-l-full'))
    b?.click()
  })
  await page2.evaluate(() => window.__sb.waitForText('Decryption Key'))
  await page2.evaluate(k => window.__sb.setInput('decryption key', k), passkey)
  await page2.evaluate(() => {
    const buttons = window.__sb.buttons().filter(b => b.textContent.trim() === 'Decrypt')
    buttons[buttons.length - 1]?.click()
  })
  const redecrypted = await page2.evaluate(() => window.__sb.waitForText('Decrypted successfully'))
  check('re-decrypting after reopen works', redecrypted)

  // Open in Editor from the decrypted view round-trips the plaintext
  await page2.evaluate(() => window.__sb.clickButton('Open in Editor'))
  const roundTripped = await page2.evaluate(async s => {
    const start = Date.now()
    while (Date.now() - start < 4000) {
      const ta = window.__sb.root()?.querySelector('textarea')
      if (ta && ta.value.includes(s)) return true
      await new Promise(r => setTimeout(r, 100))
    }
    return false
  }, secret)
  await shot(page2, '6-open-in-editor-roundtrip')
  check('Open in Editor loads the plaintext back into the editor', roundTripped)

  // ── 4. Encrypt Only → history result → Decrypt → decrypted view ───────────
  // Covers the Result-page Decrypt button, which must load the ciphertext AND
  // open the passkey prompt (it used to fire an event before the editor
  // mounted, dropping the request entirely).
  const histPass = 'history-verify-pass'
  await page2.evaluate(() => {
    // Open the action dropdown (rounded-right half of the split button)
    window.__sb.buttons().find(b => b.className.includes('rounded-r-full'))?.click()
  })
  const encryptOnly = await page2.evaluate(async () => {
    const start = Date.now()
    while (Date.now() - start < 4000) {
      if (window.__sb.clickButton('Encrypt Only')) return true
      await new Promise(r => setTimeout(r, 100))
    }
    return false
  })
  check('Encrypt Only picked from the dropdown', encryptOnly)

  const encDialog = await page2.evaluate(() => window.__sb.waitForText('Encryption Passkey'))
  check('encryption passkey dialog opens', encDialog)
  await page2.evaluate(k => window.__sb.setInput('passkey', k), histPass)
  await page2.evaluate(() => {
    const buttons = window.__sb.buttons().filter(b => b.textContent.trim() === 'Encrypt')
    buttons[buttons.length - 1]?.click()
  })
  const onResult = await page2.evaluate(() => window.__sb.waitForText('Ciphertext'))
  check('encryption lands on the result page', onResult)

  const shareLinkGone = await page2.evaluate(() => !window.__sb.text().includes('Copy Share Link'))
  check('share link not offered for local-only encryption (no pastebin link)', shareLinkGone)

  await page2.evaluate(() => window.__sb.clickButton('Decrypt'))
  const resultDecryptDialog = await page2.evaluate(() => window.__sb.waitForText('Decryption Key'))
  await shot(page2, '6b-history-decrypt-dialog')
  check('Decrypt on a history item opens the passkey prompt', resultDecryptDialog)

  await page2.evaluate(k => window.__sb.setInput('decryption key', k), histPass)
  await page2.evaluate(() => {
    const buttons = window.__sb.buttons().filter(b => b.textContent.trim() === 'Decrypt')
    buttons[buttons.length - 1]?.click()
  })
  const historyDecrypted = await page2.evaluate(async s => {
    const ok = await window.__sb.waitForText('Decrypted successfully')
    return ok && window.__sb.text().includes(s)
  }, secret)
  await shot(page2, '6c-history-decrypted')
  check('history item decrypts to the decrypted view', historyDecrypted)

  // Back to the editor for the sections below
  await page2.evaluate(() => window.__sb.clickButton('Open in Editor'))
  await page2.evaluate(async () => {
    const start = Date.now()
    while (Date.now() - start < 4000) {
      if (window.__sb.root()?.querySelector('textarea')) return
      await new Promise(r => setTimeout(r, 100))
    }
  })

  // ── 5. Paste link → Open Paste → auto-decrypt handoff (needs API key) ─────
  if (API_KEY) {
    const postViaSW = (code) => sw.evaluate(async (apiKey, pasteCode) => {
      const body = new URLSearchParams({
        api_dev_key: apiKey, api_paste_code: pasteCode, api_option: 'paste', api_paste_private: '1',
      })
      const r = await fetch('https://pastebin.com/api/api_post.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      })
      return (await r.text()).trim()
    }, API_KEY, code)
    const isPasteUrl = u => /^https:\/\/pastebin\.com\//.test(u)

    // Encrypted paste: link → Open Paste → passkey prompt → decrypted view
    const linkSecret = 'link secret — securebin ui verification'
    const linkPass = 'link-verify-pass'
    const encUrl = await postViaSW(await makeCiphertext(linkSecret, linkPass))
    check('encrypted paste posted for the link test', isPasteUrl(encUrl), encUrl.slice(0, 80))

    if (isPasteUrl(encUrl)) {
      await page2.evaluate(u => window.__sb.setTextarea(u), encUrl)
      const openLabel = await page2.evaluate(() => window.__sb.waitActionLabel('Open Paste'))
      check('pasted link defaults the button to Open Paste', openLabel === true, openLabel === true ? '' : `label: "${openLabel}"`)

      await page2.evaluate(() => window.__sb.clickAction())
      const autoDialog = await page2.evaluate(() => window.__sb.waitForText('Decryption Key', 10000))
      await shot(page2, '7-open-link-auto-decrypt')
      check('opening an encrypted paste auto-opens the passkey prompt', autoDialog)

      await page2.evaluate(k => window.__sb.setInput('decryption key', k), linkPass)
      await page2.evaluate(() => {
        const buttons = window.__sb.buttons().filter(b => b.textContent.trim() === 'Decrypt')
        buttons[buttons.length - 1]?.click()
      })
      const linkDecrypted = await page2.evaluate(async s => {
        const ok = await window.__sb.waitForText('Decrypted successfully')
        return ok && window.__sb.text().includes(s)
      }, linkSecret)
      await shot(page2, '8-link-decrypted')
      check('link → open → decrypt lands on the decrypted view', linkDecrypted)
      // Back to the editor for the plain-paste check
      await page2.evaluate(() => window.__sb.clickButton('Open in Editor'))
    }

    // Plain paste: link → Open Paste → content loads into the editor
    const plainBody = 'plain paste body 4471'
    const plainUrl = await postViaSW(plainBody)
    check('plain paste posted for the link test', isPasteUrl(plainUrl), plainUrl.slice(0, 80))

    if (isPasteUrl(plainUrl)) {
      await page2.evaluate(u => window.__sb.setTextarea(u), plainUrl)
      await page2.evaluate(() => window.__sb.waitActionLabel('Open Paste'))
      await page2.evaluate(() => window.__sb.clickAction())
      const opened = await page2.evaluate(async b => {
        const start = Date.now()
        while (Date.now() - start < 10000) {
          const ta = window.__sb.root()?.querySelector('textarea')
          if (ta && ta.value.trim() === b) return true
          await new Promise(r => setTimeout(r, 100))
        }
        return false
      }, plainBody)
      await shot(page2, '9-open-plain-paste')
      check('opening a plain paste loads its content into the editor', opened)
    }

  } else {
    console.log('⏭  PASTEBIN_API_KEY not set — skipping the live paste-link checks')
  }

  // ── 6. Copy Share Link → securebin.org viewer URL (offline via seeded history)
  await sw.evaluate(async (encText) => {
    await chrome.storage.local.set({
      history: [{
        id: 'sharetest1',
        action: 'Encrypt to Pastebin',
        pastebinLink: 'https://pastebin.com/SHARE123',
        key: 'share-verify-pass',
        encText,
        encMode: 'AES-GCM',
        keyLength: 16,
        date: Date.now(),
        title: 'Share Test 8814',
        format: 'text',
        privacy: '1',
        expiry: 'N',
      }],
    })
  }, ciphertext)

  const page3 = await browser.newPage()
  await page3.goto('https://pastebin.com/doc_api', { waitUntil: 'networkidle2' })
  await page3.evaluate(pageHelpers)
  const sl = await injectAndSend('https://pastebin.com/doc_api', { type: 'SB_OPEN' })
  check('panel opens for the share-link flow', !sl.error, sl.error)

  await page3.evaluate(async () => {
    const start = Date.now()
    while (Date.now() - start < 4000) {
      const nav = window.__sb.buttons().find(b => b.title === 'Pastes')
      if (nav) { nav.click(); return }
      await new Promise(r => setTimeout(r, 100))
    }
  })
  // History rows are labeled by their pastebin link
  const historyShown = await page3.evaluate(() => window.__sb.waitForText('SHARE123'))
  check('seeded history item appears', historyShown)

  await page3.evaluate(() => {
    const leaf = [...(window.__sb.root()?.querySelectorAll('*') ?? [])]
      .reverse()
      .find(el => el.childElementCount === 0 && (el.textContent ?? '').includes('SHARE123'))
    leaf?.click()
  })
  const shareBtnShown = await page3.evaluate(() => window.__sb.waitForText('Copy Share Link'))
  check('result page offers Copy Share Link', shareBtnShown)

  try {
    await browser.defaultBrowserContext().overridePermissions('https://pastebin.com', ['clipboard-read', 'clipboard-write', 'clipboard-sanitized-write'])
  } catch {
    await browser.defaultBrowserContext().overridePermissions('https://pastebin.com', ['clipboard-read', 'clipboard-write'])
  }
  await page3.bringToFront()
  await page3.evaluate(() => window.__sb.clickButton('Copy Share Link'))
  await new Promise(r => setTimeout(r, 400))
  const copied = await page3.evaluate(() => navigator.clipboard.readText().catch(() => ''))
  await shot(page3, '10-share-link')
  check(
    'share link is the securebin.org viewer URL with the key in the fragment',
    copied === 'https://securebin.org/SHARE123#key=share-verify-pass',
    copied || 'clipboard empty',
  )
} finally {
  await browser.close()
}

console.log(failures === 0 ? '\nAll UI checks passed.' : `\n${failures} check(s) FAILED`)
process.exit(failures === 0 ? 0 : 1)
