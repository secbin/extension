import { StorageKey, EncryptionMode } from './lib/constants'

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

// Initialize defaults on install
chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.sync.get(StorageKey.SETTINGS)
  if (!data[StorageKey.SETTINGS]) {
    await chrome.storage.sync.set({
      [StorageKey.SETTINGS]: JSON.stringify({
        apiKey: 'MmU1OGNlMjcyMzllMzRhNzdjNWVmNjVkYmVhOGIyNGQ=',
        encMode: EncryptionMode.AES_GCM,
        keyLength: 16,
        theme: 'light',
        encryption: false,
        default_action: 'Post to Pastebin',
        page_timeout: 30,
      }),
    })
  }

  // Rebuild context menus on install/update to avoid duplicate registration errors
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'securebinOpen',
      title: 'Open in SecureBin',
      contexts: ['selection'],
    })
  })
})

// Also register context menu on startup (service worker restart)
chrome.runtime.onStartup.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'securebinOpen',
      title: 'Open in SecureBin',
      contexts: ['selection'],
    })
  })
})

// Dynamic popup switching: use injected panel on normal pages, popup on restricted pages
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId)
  await syncActionPopup(tabId, tab.url)
})

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (info.status === 'complete') await syncActionPopup(tabId, tab.url)
})

// Toggle injected panel when toolbar icon is clicked (non-restricted pages)
chrome.action.onClicked.addListener(tab => {
  if (tab.id) chrome.tabs.sendMessage(tab.id, { type: 'SB_TOGGLE' })
})

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const text = info.selectionText
  if (!text || info.menuItemId !== 'securebinOpen') return

  // Store the selected text — emoji and non-ASCII are supported by session storage
  // but we wrap in try-catch so a storage failure never prevents the panel from opening
  try {
    await chrome.storage.session.set({ pendingText: { text } })
  } catch {
    // If storage fails (e.g. quota), open the panel anyway without pre-filling
  }

  if (tab?.id && !isRestrictedUrl(tab.url)) {
    // Toggle injected panel and let it read pendingText on open
    chrome.tabs.sendMessage(tab.id, { type: 'SB_TOGGLE' })
  } else {
    // Fallback to popup on restricted pages
    try {
      await chrome.action.openPopup()
    } catch {
      // openPopup() may fail if popup is already open — safe to ignore
    }
  }
})
