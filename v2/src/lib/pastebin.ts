import { CORS_PROXY } from './constants'

// Build a proxied URL using the cloudflare-cors-anywhere format:
// https://cors.securebin.workers.dev/?https://target.com/path
// The target URL is the raw query string — no ?uri= key, no encoding.
function proxied(target: string): string {
  return `${CORS_PROXY}${target}`
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

  const response = await fetch(proxied(PASTEBIN_API), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  const text = await response.text()

  // Pastebin always returns HTTP 200 even for errors — detect by body content
  if (!response.ok || text.startsWith('Bad API request') || text.startsWith('CLOUDFLARE')) {
    throw new Error(text)
  }

  return text
}

export async function getPastebin(link: string): Promise<string> {
  const parts = link.trim().split('/')
  const id = parts[parts.length - 1] || parts[parts.length - 2]

  const response = await fetch(proxied(`https://pastebin.com/raw/${id}`))
  const text = await response.text()

  if (!response.ok || text.startsWith('Bad API request') || text.startsWith('CLOUDFLARE')) {
    throw new Error(text)
  }

  return text
}

export async function isValidDevKey(apiKey: string): Promise<boolean> {
  const body = new URLSearchParams()
  body.append('api_dev_key', apiKey)
  body.append('api_option', 'userdetails')

  try {
    const response = await fetch(proxied(PASTEBIN_API), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
    // A valid dev key returns "Bad API request, invalid api_user_key" (user key missing).
    // An invalid dev key returns "Bad API request, invalid api_dev_key".
    const text = await response.text()
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

  const response = await fetch(proxied(PASTEBIN_LOGIN), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  const text = await response.text()
  if (!response.ok || text.startsWith('Bad API request')) throw new Error(text)
  return text.trim()
}

/** Delete a paste owned by the logged-in user */
export async function deletePastebin(apiKey: string, userKey: string, pasteKey: string): Promise<void> {
  const body = new URLSearchParams()
  body.append('api_dev_key', apiKey)
  body.append('api_user_key', userKey)
  body.append('api_paste_key', pasteKey)
  body.append('api_option', 'delete')

  const response = await fetch(proxied(PASTEBIN_API), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  const text = await response.text()
  if (!response.ok || text.startsWith('Bad API request')) throw new Error(text)
}

/** List the logged-in user's pastes (max 1000) */
export async function listPastes(apiKey: string, userKey: string, limit = 50): Promise<PasteItem[]> {
  const body = new URLSearchParams()
  body.append('api_dev_key', apiKey)
  body.append('api_user_key', userKey)
  body.append('api_option', 'list')
  body.append('api_results_limit', String(Math.min(limit, 1000)))

  const response = await fetch(proxied(PASTEBIN_API), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  const text = await response.text()
  if (!response.ok || text.startsWith('Bad API request')) throw new Error(text)
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

  const response = await fetch(proxied(PASTEBIN_API), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  const text = await response.text()
  if (!response.ok || text.startsWith('Bad API request')) throw new Error(text)
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
