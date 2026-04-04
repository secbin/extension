import { CORS_PROXY } from './constants'

// Build a proxied URL using the cloudflare-cors-anywhere format:
// https://cors.securebin.workers.dev/?https://target.com/path
// The target URL is the raw query string — no ?uri= key, no encoding.
function proxied(target: string): string {
  return `${CORS_PROXY}${target}`
}

const PASTEBIN_API = 'https://pastebin.com/api/api_post.php'

export async function postPastebin(content: string, apiKey: string): Promise<string> {
  if (!apiKey) {
    throw new Error('Pastebin API key is not configured')
  }

  const body = new URLSearchParams()
  body.append('api_dev_key', apiKey)
  body.append('api_paste_code', content)
  body.append('api_option', 'paste')

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
