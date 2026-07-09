// All Pastebin traffic goes straight to pastebin.com — no proxy. Extension
// contexts (popup, service worker) are exempt from CORS for hosts listed in
// host_permissions, so they fetch directly. The injected in-page panel runs
// in the content-script world, where the page's CORS policy applies and host
// permissions do not, so it relays requests to the background service worker
// (SB_FETCH in background.ts) which performs the same direct fetch.

interface PbResponse {
  ok: boolean
  status: number
  text: string
}

function isInjectedContext(): boolean {
  return typeof window !== 'undefined' && (window as any).__SECUREBIN_INJECTED__ === true
}

async function pbFetch(url: string, body?: URLSearchParams): Promise<PbResponse> {
  if (isInjectedContext()) {
    const res: PbResponse | undefined = await chrome.runtime.sendMessage({
      type: 'SB_FETCH',
      url,
      body: body?.toString(),
    })
    if (!res) throw new Error('No response from the securebin background service')
    // status 0 = the background fetch itself failed (network error) — mirror
    // the direct path, where fetch() rejects instead of resolving
    if (res.status === 0) throw new Error(res.text || 'Network error')
    return res
  }
  const response = await fetch(url, body ? {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  } : undefined)
  return { ok: response.ok, status: response.status, text: await response.text() }
}

const PASTEBIN_API = 'https://pastebin.com/api/api_post.php'

export async function postPastebin(
  content: string,
  apiKey: string,
  options?: { title?: string; format?: string; expiry?: string; privacy?: string }
): Promise<string> {
  if (!apiKey) {
    throw new Error('Pastebin API key is not configured')
  }

  const body = new URLSearchParams()
  body.append('api_dev_key', apiKey)
  body.append('api_paste_code', content)
  body.append('api_option', 'paste')
  if (options?.title) body.append('api_paste_name', options.title)
  if (options?.format) body.append('api_paste_format', options.format)
  if (options?.expiry) body.append('api_paste_expire_date', options.expiry)
  if (options?.privacy !== undefined) body.append('api_paste_private', options.privacy)

  const { ok, status, text } = await pbFetch(PASTEBIN_API, body)

  // A non-2xx status carries an HTML error page — don't surface that as the
  // error message. Pastebin API errors come back as HTTP 200 with a short
  // "Bad API request..." body, which is worth showing verbatim.
  if (!ok) {
    throw new Error(`Pastebin request failed (HTTP ${status})`)
  }
  if (text.startsWith('Bad API request') || text.startsWith('CLOUDFLARE')) {
    throw new Error(text)
  }

  return text
}

export async function getPastebin(link: string): Promise<string> {
  const parts = link.trim().split('/')
  const id = parts[parts.length - 1] || parts[parts.length - 2]

  const { ok, status, text } = await pbFetch(`https://pastebin.com/raw/${id}`)

  if (!ok) {
    throw new Error(
      status === 404
        ? 'Paste not found — it may have expired or been removed'
        : `Could not fetch paste (HTTP ${status})`,
    )
  }
  if (text.startsWith('Bad API request') || text.startsWith('CLOUDFLARE')) {
    throw new Error(text)
  }

  return text
}

/** Fetch paste content with session cache so repeat views are instant. */
export async function getCachedPasteContent(key: string, url: string): Promise<string> {
  const cacheKey = `paste_${key}`
  try {
    const cached = await chrome.storage.session.get(cacheKey)
    if (cached[cacheKey]) return cached[cacheKey]
  } catch { /* session storage unavailable — fall through */ }
  const content = await getPastebin(url)
  try { chrome.storage.session.set({ [cacheKey]: content }) } catch { /* best-effort */ }
  return content
}

/** Format byte count to human-readable string (e.g. "2.4 KB") */
export function formatBytes(bytes: string | number): string {
  const n = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes
  if (isNaN(n) || n === 0) return '0 B'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(n < 10240 ? 1 : 0)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

export async function isValidDevKey(apiKey: string): Promise<boolean> {
  const body = new URLSearchParams()
  body.append('api_dev_key', apiKey)
  body.append('api_option', 'userdetails')

  try {
    const { text } = await pbFetch(PASTEBIN_API, body)
    // A valid dev key returns "Bad API request, invalid api_user_key" (user key missing).
    // An invalid dev key returns "Bad API request, invalid api_dev_key".
    return !text.includes('invalid api_dev_key')
  } catch {
    return false
  }
}

const PASTEBIN_LOGIN = 'https://pastebin.com/api/api_login.php'

export interface PasteItem {
  key: string
  date: string
  title: string
  size: string
  expireDate: string
  privacy: string
  formatLong: string
  formatShort: string
  url: string
  hits: string
}

export interface UserDetails {
  username: string
  formatShort: string
  expiration: string
  avatarUrl: string
  private: string
  website: string
  email: string
  location: string
  accountType: string
}

/** Login with Pastebin username + password → returns api_user_key */
export async function loginPastebin(apiKey: string, username: string, password: string): Promise<string> {
  const body = new URLSearchParams()
  body.append('api_dev_key', apiKey)
  body.append('api_user_name', username)
  body.append('api_user_password', password)

  const { ok, text } = await pbFetch(PASTEBIN_LOGIN, body)
  if (!ok || text.startsWith('Bad API request')) throw new Error(text)
  return text.trim()
}

/** Delete a paste owned by the logged-in user */
export async function deletePastebin(apiKey: string, userKey: string, pasteKey: string): Promise<void> {
  const body = new URLSearchParams()
  body.append('api_dev_key', apiKey)
  body.append('api_user_key', userKey)
  body.append('api_paste_key', pasteKey)
  body.append('api_option', 'delete')

  const { ok, text } = await pbFetch(PASTEBIN_API, body)
  if (!ok || text.startsWith('Bad API request')) throw new Error(text)
}

/** List the logged-in user's pastes (max 1000) */
export async function listPastes(apiKey: string, userKey: string, limit = 50): Promise<PasteItem[]> {
  const body = new URLSearchParams()
  body.append('api_dev_key', apiKey)
  body.append('api_user_key', userKey)
  body.append('api_option', 'list')
  body.append('api_results_limit', String(Math.min(limit, 1000)))

  const { ok, text } = await pbFetch(PASTEBIN_API, body)
  if (!ok || text.startsWith('Bad API request')) throw new Error(text)
  // No pastes returns "No pastes found."
  if (text.trim() === 'No pastes found.') return []
  return parseXmlPasteList(text)
}

/** Get details for the logged-in user */
export async function getUserDetails(apiKey: string, userKey: string): Promise<UserDetails> {
  const body = new URLSearchParams()
  body.append('api_dev_key', apiKey)
  body.append('api_user_key', userKey)
  body.append('api_option', 'userdetails')

  const { ok, text } = await pbFetch(PASTEBIN_API, body)
  if (!ok || text.startsWith('Bad API request')) throw new Error(text)
  return parseXmlUserDetails(text)
}

/** Extract paste key from a Pastebin URL or bare key */
export function extractPasteKey(urlOrKey: string): string {
  const parts = urlOrKey.trim().replace(/\/$/, '').split('/')
  return parts[parts.length - 1]
}

// ─── XML parsers ────────────────────────────────────────────────────────────

function getXmlVal(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}>([^<]*)<\\/${tag}>`))
  return m ? (m[1] ?? m[2] ?? '') : ''
}

function parseXmlPasteList(xml: string): PasteItem[] {
  const items: PasteItem[] = []
  const pasteBlocks = xml.split('<paste>').slice(1)
  for (const block of pasteBlocks) {
    items.push({
      key: getXmlVal(block, 'paste_key'),
      date: getXmlVal(block, 'paste_date'),
      title: getXmlVal(block, 'paste_title') || 'Untitled',
      size: getXmlVal(block, 'paste_size'),
      expireDate: getXmlVal(block, 'paste_expire_date'),
      privacy: getXmlVal(block, 'paste_private'),
      formatLong: getXmlVal(block, 'paste_format_long'),
      formatShort: getXmlVal(block, 'paste_format_short'),
      url: getXmlVal(block, 'paste_url'),
      hits: getXmlVal(block, 'paste_hits'),
    })
  }
  return items
}

function parseXmlUserDetails(xml: string): UserDetails {
  return {
    username: getXmlVal(xml, 'user_name'),
    formatShort: getXmlVal(xml, 'user_format_short'),
    expiration: getXmlVal(xml, 'user_expiration'),
    avatarUrl: getXmlVal(xml, 'user_avatar_url'),
    private: getXmlVal(xml, 'user_private'),
    website: getXmlVal(xml, 'user_website'),
    email: getXmlVal(xml, 'user_email'),
    location: getXmlVal(xml, 'user_location'),
    accountType: getXmlVal(xml, 'user_account_type'),
  }
}
