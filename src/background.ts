import { StorageKey, EncryptionMode, DEFAULT_API_KEY, encodeStoredApiKey, decodeStoredApiKey } from './lib/constants'
import contentScript from './content/index.tsx?script'

// With activeTab (no "tabs" permission), tab.url is only readable in handlers
// fired by a user gesture on that tab — and is undefined on pages activeTab
// can't grant (chrome:// etc.), which is exactly the restricted set.
const RESTRICTED = /^(chrome:|chrome-extension:|about:|edge:|brave:)/

function isRestrictedUrl(url?: string) {
  return !url || RESTRICTED.test(url)
}

// The panel is injected on demand (activeTab + scripting) rather than declared
// as a <all_urls> content script. The crxjs loader finishes registering the
// panel's message listener slightly after executeScript resolves, so post-
// injection sends retry briefly.
async function sendToTab(tabId: number, message: unknown) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await chrome.tabs.sendMessage(tabId, message)
    } catch (e) {
      if (attempt >= 20) throw e
      await new Promise(r => setTimeout(r, 100))
    }
  }
}

/** Inject the panel into the tab if it isn't there yet. Throws where injection is impossible. */
async function ensurePanel(tabId: number) {
  try {
    await chrome.tabs.sendMessage(tabId, { type: 'SB_PING' })
    return
  } catch {
    await chrome.scripting.executeScript({ target: { tabId }, files: [contentScript] })
  }
}

/** Panel unavailable on this page — show the popup instead. */
async function openPopupFallback(tabId?: number) {
  try {
    if (tabId !== undefined) await chrome.action.setPopup({ tabId, popup: 'index.html' })
    await chrome.action.openPopup()
  } catch {
  } finally {
    // Reset so the next click re-evaluates instead of always opening the popup
    if (tabId !== undefined) {
      try { await chrome.action.setPopup({ tabId, popup: '' }) } catch {}
    }
  }
}

function registerContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id: 'securebinRoot', title: 'securebin', contexts: ['selection'] })
    chrome.contextMenus.create({ id: 'securebinOpen', title: 'Open in Editor', parentId: 'securebinRoot', contexts: ['selection'] })
    chrome.contextMenus.create({ id: 'securebinPost', title: 'Post to Pastebin', parentId: 'securebinRoot', contexts: ['selection'] })
  })
}

chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.sync.get(StorageKey.SETTINGS)
  if (!data[StorageKey.SETTINGS]) {
    await chrome.storage.sync.set({
      [StorageKey.SETTINGS]: JSON.stringify({
        apiKey: encodeStoredApiKey(DEFAULT_API_KEY),
        encMode: EncryptionMode.AES_GCM,
        keyLength: 16,
        theme: 'light',
        default_action: 'Post to Pastebin',
        page_timeout: 30,
      }),
    })
  }
  registerContextMenus()
})

chrome.runtime.onStartup.addListener(registerContextMenus)

chrome.action.onClicked.addListener(async tab => {
  if (!tab.id) return
  // Panel already injected — just toggle it
  try {
    await chrome.tabs.sendMessage(tab.id, { type: 'SB_TOGGLE' })
    return
  } catch {}
  if (!isRestrictedUrl(tab.url)) {
    try {
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: [contentScript] })
      await sendToTab(tab.id, { type: 'SB_OPEN' })
      return
    } catch {} // injection blocked (e.g. Chrome Web Store) — fall through
  }
  await openPopupFallback(tab.id)
})

// Fetch relay for the injected in-page panel. Content scripts are subject to
// the page's CORS policy (host permissions don't apply there), so the panel
// sends its Pastebin requests here; the service worker has host permission
// for pastebin.com and fetches it directly, CORS-exempt — no proxy involved.
// Only Pastebin URLs are relayed so this can't be used as a generic fetcher.
const RELAY_ALLOWED = /^https:\/\/pastebin\.com\//

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'SB_FETCH') return
  ;(async () => {
    try {
      if (typeof message.url !== 'string' || !RELAY_ALLOWED.test(message.url)) {
        throw new Error('Blocked non-Pastebin URL')
      }
      const response = await fetch(message.url, message.body !== undefined ? {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: message.body,
      } : undefined)
      sendResponse({ ok: response.ok, status: response.status, text: await response.text() })
    } catch (e) {
      // status 0 signals "the fetch itself failed" — pbFetch turns it into a throw
      sendResponse({ ok: false, status: 0, text: e instanceof Error ? e.message : 'Network error' })
    }
  })()
  return true // keep the message channel open for the async response
})

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const text = info.selectionText
  if (!text) return

  if (info.menuItemId === 'securebinOpen') {
    if (tab?.id && !isRestrictedUrl(tab.url)) {
      try {
        await ensurePanel(tab.id)
        // Injected mode: pass text directly in the message — content scripts cannot
        // read chrome.storage.session (MV3 restriction), so we avoid it entirely
        await sendToTab(tab.id, { type: 'SB_OPEN', pendingText: text })
        return
      } catch {} // injection blocked — fall through to the popup
    }
    // Popup mode: session storage IS available in extension pages
    try { await chrome.storage.session.set({ pendingText: { text } }) } catch {}
    await openPopupFallback(tab?.id)
    return
  }

  if (info.menuItemId === 'securebinPost') {
    let panelShown = false
    if (tab?.id && !isRestrictedUrl(tab.url)) {
      try {
        await ensurePanel(tab.id)
        // Show the panel immediately with a loading state so the user sees feedback
        await sendToTab(tab.id, { type: 'SB_OPEN', quickPostLoading: true })
        panelShown = true
      } catch {} // injection blocked — deliver the result to the popup instead
    }

    let apiKey = DEFAULT_API_KEY
    try {
      const data = await chrome.storage.sync.get(StorageKey.SETTINGS)
      if (data[StorageKey.SETTINGS]) {
        const s = JSON.parse(data[StorageKey.SETTINGS])
        if (s.apiKey) apiKey = decodeStoredApiKey(s.apiKey)
      }
    } catch {}

    let url: string | null = null
    let error: string | null = null
    try {
      const body = new URLSearchParams()
      body.append('api_dev_key', apiKey)
      body.append('api_paste_code', text)
      body.append('api_option', 'paste')
      const response = await fetch('https://pastebin.com/api/api_post.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      })
      const result = await response.text()
      if (!response.ok || result.startsWith('Bad API request') || result.startsWith('CLOUDFLARE')) {
        error = result.replace(/^Bad API request,?\s*/i, '') || 'Post failed'
      } else {
        url = result.trim()
      }
    } catch (e) {
      error = e instanceof Error ? e.message : 'Network error'
    }

    const payload = { url, error, text, timestamp: Date.now() }

    if (panelShown) {
      // Send result to the already-open panel
      chrome.tabs.sendMessage(tab!.id!, { type: 'SB_QUICK_POST_RESULT', payload })
    } else {
      try { await chrome.storage.session.set({ pendingQuickPost: payload }) } catch {}
      await openPopupFallback(tab?.id)
    }
  }
})
