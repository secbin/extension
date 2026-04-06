import { encrypt, decrypt } from '../chrome/utils/crypto';
import { postPastebin, getPastebin } from '../chrome/utils/pastebin';
import {
  getSyncItemAsync,
  addLocalItem,
  setSyncItem,
} from '../chrome/utils/storage';
import {
  Storage,
  MAX_PASTEBIN_TEXT_LENGTH,
  MAX_ENC_TEXT_LENGTH,
} from '../constants';
import { v4 as uuidv4 } from 'uuid';
import { SettingsType, HistoryType } from '../contexts/AppContext';

/** Fired when the extension is first installed,
 *  when the extension is updated to a new version,
 *  and when Chrome is updated to a new version. */
chrome.runtime.onInstalled.addListener(async details => {
  console.log('onInstall, checking for settings, else set defaults', details);
  const mode = (await getSyncItemAsync(Storage.ENC_MODE)) as string;
  if (mode === undefined) {
    setSyncItem(Storage.ENC_MODE, 'AES-GCM');
  }

  const len = (await getSyncItemAsync(Storage.KEY_LENGTH)) as number;
  if (len === undefined) {
    setSyncItem(Storage.KEY_LENGTH, 16);
  }

  const theme = (await getSyncItemAsync(Storage.THEME)) as number;
  if (theme === undefined) {
    setSyncItem(Storage.THEME, false);
  }
});

chrome.runtime.onConnect.addListener(() => {
  // connection established
});

chrome.runtime.onStartup.addListener(() => {
  // startup
});

chrome.runtime.onSuspend.addListener(() => {
  // cleanup
});

// On restricted pages (chrome://, extension pages, etc.) the content script
// cannot inject, so fall back to the traditional popup for those tabs.
function isRestrictedUrl(url: string | undefined): boolean {
  if (!url) return true;
  return !url.startsWith('http://') && !url.startsWith('https://');
}

async function syncActionPopup(tabId: number, url?: string): Promise<void> {
  const popup = isRestrictedUrl(url) ? 'index.html' : '';
  await chrome.action.setPopup({ tabId, popup }).catch(() => {});
}

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId).catch(() => null);
  await syncActionPopup(tabId, tab?.url);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url !== undefined || changeInfo.status === 'complete') {
    await syncActionPopup(tabId, tab.url);
  }
});

// Toggle the injected panel when the extension icon is clicked (normal pages only)
chrome.action.onClicked.addListener(async tab => {
  if (tab.id !== undefined) {
    await chrome.tabs
      .sendMessage(tab.id, { type: 'SB_TOGGLE' })
      .catch(() => {});
  }
});

async function getActiveTabId(): Promise<number | undefined> {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  return tab?.id;
}

/** Send a history item to the injected panel and navigate to the result page. */
async function showResult(tabId: number, item: HistoryType): Promise<void> {
  await chrome.tabs
    .sendMessage(tabId, { type: 'SB_SHOW_RESULT', item })
    .catch(err => console.error('[SecureBin] showResult failed:', err));
}

const pasteBinMenuItem: chrome.contextMenus.CreateProperties = {
  id: 'pasteBin',
  title: 'Share via PasteBin',
  contexts: ['selection'],
};

const clipboardMenuItem: chrome.contextMenus.CreateProperties = {
  id: 'clipboardMenuItem',
  title: 'Encrypt to Clipboard',
  contexts: ['selection'],
};

const decryptMenuItem: chrome.contextMenus.CreateProperties = {
  id: 'decryptText',
  title: 'Decrypt Text',
  contexts: ['selection'],
};

chrome.contextMenus.create(pasteBinMenuItem);
chrome.contextMenus.create(clipboardMenuItem);
chrome.contextMenus.create(decryptMenuItem);

chrome.contextMenus.onClicked.addListener(async clickData => {
  let text = clickData.selectionText;
  const tabId = await getActiveTabId();

  if (text === undefined) {
    return;
  }

  if (clickData.menuItemId === 'pasteBin') {
    if (text.length > MAX_PASTEBIN_TEXT_LENGTH) {
      return;
    }

    const raw = (await getSyncItemAsync(Storage.SETTINGS)) as string;
    const settings: SettingsType | null = raw ? JSON.parse(raw) : null;
    const api_key = settings?.api_key ?? '';
    const encryption = settings?.encryption ?? true;

    if (encryption) {
      const res = await encrypt(text);
      const link = await postPastebin(res.data, api_key);
      const history: HistoryType = {
        id: uuidv4(),
        pastebinlink: link,
        key: res.key,
        enc_text: res.data,
        enc_mode: res.mode,
        key_length: res.key_len,
        date: new Date().getTime(),
      };
      addLocalItem(Storage.HISTORY, history);
      if (tabId !== undefined) {
        await showResult(tabId, history);
      }
    } else {
      const link = await postPastebin(text, api_key);
      const history: HistoryType = {
        id: uuidv4(),
        pastebinlink: link,
        key: null,
        enc_text: text,
        enc_mode: null,
        key_length: null,
        date: new Date().getTime(),
      };
      addLocalItem(Storage.HISTORY, history);
      if (tabId !== undefined) {
        await showResult(tabId, history);
      }
    }
  } else if (clickData.menuItemId === 'clipboardMenuItem') {
    if (text.length > MAX_ENC_TEXT_LENGTH) {
      return;
    }

    const res = await encrypt(text);

    // Copy to clipboard via scripting
    if (tabId !== undefined) {
      const copyText = `Key: ${res.key}\nCiphertext: ${res.data}`;
      await chrome.scripting
        .executeScript({
          target: { tabId },
          func: (t: string) => {
            navigator.clipboard.writeText(t).catch(() => {});
          },
          args: [copyText],
        })
        .catch(() => {});
    }

    const history: HistoryType = {
      id: uuidv4(),
      pastebinlink: '',
      key: res.key,
      enc_text: res.data,
      enc_mode: res.mode,
      key_length: res.key_len,
      date: new Date().getTime(),
    };
    addLocalItem(Storage.HISTORY, history);
    if (tabId !== undefined) {
      await showResult(tabId, history);
    }
  } else if (clickData.menuItemId === 'decryptText') {
    if (text.length > MAX_ENC_TEXT_LENGTH) {
      return;
    }

    if (text.includes('pastebin')) {
      const link = text;
      text = await getPastebin(link);
      const res = decrypt(text, '');
      const history: HistoryType = {
        id: uuidv4(),
        pastebinlink: link,
        key: null,
        enc_text: res,
        enc_mode: null,
        key_length: null,
        date: new Date().getTime(),
      };
      addLocalItem(Storage.HISTORY, history);
      if (tabId !== undefined) {
        await showResult(tabId, history);
      }
    } else if (text.includes('C_TXT')) {
      // Ciphertext requires a key — open the panel so user can decrypt in the editor
      if (tabId !== undefined) {
        await chrome.tabs
          .sendMessage(tabId, { type: 'SB_TOGGLE' })
          .catch(() => {});
      }
    }
  }
});
