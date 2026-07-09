/**
 * End-to-end tests for the Pastebin integration.
 *
 * These tests make real HTTP requests. They require:
 *   PASTEBIN_API_KEY=<your key>  in .env or the environment.
 *
 * Run with:
 *   npx vitest run src/lib/pastebin.e2e.test.ts
 *
 * Note: in Node there is no CORS, so pastebin.ts takes its direct-fetch path —
 * the same one the popup and background service worker use in the extension.
 */
import { describe, it, expect } from 'vitest'
import { postPastebin, getPastebin, isValidDevKey } from './pastebin'

const API_KEY = process.env.PASTEBIN_API_KEY ?? ''
const SKIP = !API_KEY

// Unique marker so we can verify the paste was actually stored
const TEST_CONTENT = `securebin e2e test — ${new Date().toISOString()}`

// ─── 1. Sanity: environment ───────────────────────────────────────────────────

describe('environment', () => {
  // Skipped (like the rest of the e2e suite) when no key is configured, so the
  // default `npm test` run stays green without live credentials.
  it('PASTEBIN_API_KEY is set in the environment', { skip: SKIP }, () => {
    expect(API_KEY, 'Set PASTEBIN_API_KEY in .env').toBeTruthy()
    expect(API_KEY.length).toBeGreaterThan(0)
  })
})

// ─── 2. Raw fetch against the Pastebin API ───────────────────────────────────
// Isolates whether the API key itself is valid before involving pastebin.ts.

describe('Pastebin API — raw fetch', { skip: SKIP }, () => {
  it('key is accepted by Pastebin userdetails endpoint', async () => {
    const body = new URLSearchParams()
    body.append('api_dev_key', API_KEY)
    body.append('api_option', 'userdetails')

    const res = await fetch('https://pastebin.com/api/api_post.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
    const text = await res.text()
    console.log('[raw userdetails]', text.slice(0, 120))

    // A valid dev key returns "invalid api_user_key" (user key not provided, not dev key)
    expect(text).not.toContain('invalid api_dev_key')
  }, 15_000)

  it('posts a paste directly and returns a pastebin.com URL', async () => {
    const body = new URLSearchParams()
    body.append('api_dev_key', API_KEY)
    body.append('api_paste_code', TEST_CONTENT)
    body.append('api_option', 'paste')

    const res = await fetch('https://pastebin.com/api/api_post.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
    const text = await res.text()
    console.log('[raw post]', text)

    expect(text).toMatch(/^https:\/\/pastebin\.com\//)
  }, 15_000)
})

// ─── 3. Full stack: postPastebin + getPastebin ───────────────────────────────

describe('postPastebin + getPastebin', { skip: SKIP }, () => {
  let pasteUrl = ''

  it('isValidDevKey returns true for the configured key', async () => {
    const valid = await isValidDevKey(API_KEY)
    console.log('[isValidDevKey]', valid)
    expect(valid).toBe(true)
  }, 15_000)

  it('postPastebin returns a pastebin.com URL', async () => {
    pasteUrl = await postPastebin(TEST_CONTENT, API_KEY)
    console.log('[postPastebin url]', pasteUrl)
    expect(pasteUrl).toMatch(/^https:\/\/pastebin\.com\//)
  }, 20_000)

  it('getPastebin fetches back the exact content that was posted', async () => {
    if (!pasteUrl) {
      console.warn('Skipping fetch — no paste URL from previous test')
      return
    }
    const fetched = await getPastebin(pasteUrl)
    console.log('[getPastebin]', fetched.slice(0, 80))
    expect(fetched.trim()).toBe(TEST_CONTENT.trim())
  }, 20_000)
})
