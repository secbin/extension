/**
 * End-to-end tests for the Pastebin integration.
 *
 * These tests make real HTTP requests. They require:
 *   PASTEBIN_API_KEY=<your key>  in .env or the environment.
 *
 * Run with:
 *   npx vitest run src/lib/pastebin.e2e.test.ts
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { postPastebin, getPastebin, isValidDevKey } from './pastebin'
import { CORS_PROXY } from './constants'

const API_KEY = process.env.PASTEBIN_API_KEY ?? ''
const SKIP = !API_KEY

// Unique marker so we can verify the paste was actually stored
const TEST_CONTENT = `SecureBin e2e test — ${new Date().toISOString()}`

// ─── 1. Sanity: environment ───────────────────────────────────────────────────

describe('environment', () => {
  it('PASTEBIN_API_KEY is set in the environment', () => {
    expect(API_KEY, 'Set PASTEBIN_API_KEY in .env').toBeTruthy()
    expect(API_KEY.length).toBeGreaterThan(0)
  })

  it('CORS_PROXY uses the cloudflare-cors-anywhere ?<target-url> format', () => {
    // Format: https://proxy/?https://target.com  (NOT ?uri=)
    expect(CORS_PROXY).toContain('cors.securebin.workers.dev/?')
    expect(CORS_PROXY).not.toContain('?uri=')
  })
})

// ─── 2. Direct Pastebin (no proxy) ───────────────────────────────────────────
// Isolates whether the API key itself is valid before involving the proxy.

describe('Pastebin API — direct (no proxy)', { skip: SKIP }, () => {
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
    console.log('[direct userdetails]', text.slice(0, 120))

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
    console.log('[direct post]', text)

    expect(text).toMatch(/^https:\/\/pastebin\.com\//)
  }, 15_000)
})

// ─── 3. CORS proxy reachability ──────────────────────────────────────────────

describe('CORS proxy', () => {
  it('proxy is reachable and does not return an error page', async () => {
    // Hit the proxy info page (no ?uri target) — should return the usage text,
    // NOT a Cloudflare 1101 "Worker threw exception" page.
    const res = await fetch('https://cors.securebin.workers.dev/')
    const text = await res.text()
    console.log('[proxy info page]', text.slice(0, 120))

    expect(text).not.toContain('Worker threw exception')
    expect(text).not.toContain('<!DOCTYPE html>\n<!--[if lt IE')
  }, 15_000)

  it('proxy forwards a GET request correctly', async () => {
    // Use a known-stable public URL as the proxy target
    const target = 'https://pastebin.com/raw/0EHa8uAb' // Pastebin's own example paste
    const url = `${CORS_PROXY}${target}`
    console.log('[proxy GET url]', url)

    const res = await fetch(url)
    console.log('[proxy GET status]', res.status)
    expect(res.ok).toBe(true)
  }, 15_000)
})

// ─── 4. Full stack: postPastebin + getPastebin via proxy ─────────────────────

describe('postPastebin + getPastebin via CORS proxy', { skip: SKIP }, () => {
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
