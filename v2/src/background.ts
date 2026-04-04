import { StorageKey, EncryptionMode } from './lib/constants'

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

chrome.contextMenus.onClicked.addListener(async (info) => {
  const text = info.selectionText
  if (!text || info.menuItemId !== 'securebinOpen') return

  // Store the selected text so the popup can load it into the editor
  await chrome.storage.session.set({ pendingText: { text } })

  // Open the extension popup
  try {
    await chrome.action.openPopup()
  } catch {
    // openPopup() may fail if popup is already open — safe to ignore
  }
})
