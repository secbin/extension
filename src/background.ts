import { StorageKey, EncryptionMode, DEFAULT_API_KEY, encodeStoredApiKey, decodeStoredApiKey } from './lib/constants'

const RESTRICTED = /^(chrome:|chrome-extension:|about:|edge:|brave:)/

function isRestrictedUrl(url?: string) {
  return !url || RESTRICTED.test(url)
}

async function syncActionPopup(tabId: number, url?: string) {
  await chrome.action.setPopup({
    tabId,
    popup: isRestrictedUrl(url) ? 'index.html' : '',
  })
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

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId)
  await syncActionPopup(tabId, tab.url)
})

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (info.status === 'complete') await syncActionPopup(tabId, tab.url)
})

chrome.action.onClicked.addListener(tab => {
  if (tab.id) chrome.tabs.sendMessage(tab.id, { type: 'SB_TOGGLE' })
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
      // Injected mode: pass text directly in the message — content scripts cannot
      // read chrome.storage.session (MV3 restriction), so we avoid it entirely
      chrome.tabs.sendMessage(tab.id, { type: 'SB_OPEN', pendingText: text })
    } else {
      // Popup mode: session storage IS available in extension pages
      try { await chrome.storage.session.set({ pendingText: { text } }) } catch {}
      try { await chrome.action.openPopup() } catch {}
    }
    return
  }

  if (info.menuItemId === 'securebinPost') {
    const isInjectable = tab?.id && !isRestrictedUrl(tab.url)

    if (isInjectable) {
      // Show the panel immediately with a loading state so the user sees feedback
      chrome.tabs.sendMessage(tab.id!, { type: 'SB_OPEN', quickPostLoading: true })
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

    if (isInjectable) {
      // Send result to the already-open panel
      chrome.tabs.sendMessage(tab.id!, { type: 'SB_QUICK_POST_RESULT', payload })
    } else {
      try { await chrome.storage.session.set({ pendingQuickPost: payload }) } catch {}
      try { await chrome.action.openPopup() } catch {}
    }
  }
})
