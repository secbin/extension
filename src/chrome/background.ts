import { copyTextClipboard } from '../chrome/utils';
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
import { SettingsType } from '../contexts/AppContext';

/** Fired when the extension is first installed,
 *  when the extension is updated to a new version,
 *  and when Chrome is updated to a new version. */
chrome.runtime.onInstalled.addListener(async details => {
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

  // Fix #50: create context menus inside onInstalled so they are only created
  // once. Calling create() at the service-worker top level causes duplicate-id
  // errors on every subsequent SW restart, silently breaking the menus.
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'pasteBin',
      title: 'Share via PasteBin',
      contexts: ['selection'],
    });
    chrome.contextMenus.create({
      id: 'clipboardMenuItem',
      title: 'Encrypt to Clipboard',
      contexts: ['selection'],
    });
    chrome.contextMenus.create({
      id: 'decryptText',
      title: 'Decrypt Text',
      contexts: ['selection'],
    });
  });
});

chrome.runtime.onConnect.addListener(_port => {
  // reserved for future use
});

chrome.runtime.onStartup.addListener(() => {
  // reserved for future use
});

/** Sent to the event page just before it is unloaded. */
chrome.runtime.onSuspend.addListener(() => {
  // reserved for future use
});

chrome.contextMenus.onClicked.addListener(async clickData => {
  const text = clickData.selectionText;
  if (text === undefined || text === '') {
    alert('Please select some text');
    return;
  }

  if (clickData.menuItemId === 'pasteBin') {
    if (text.length > MAX_PASTEBIN_TEXT_LENGTH) {
      alert(
        'Can only post up to ' + MAX_PASTEBIN_TEXT_LENGTH + ' characters via right-click'
      );
      return;
    }

    const { api_key } = (await getSyncItemAsync(Storage.SETTINGS)) as SettingsType;
    const res = await encrypt(text);
    const link = await postPastebin(res.data, api_key);
    const history = {
      id: uuidv4(),
      pastebinlink: link,
      enc_text: res.data,
      enc_mode: res.mode,
      key_length: res.key_len,
      date: Date(),
    };
    addLocalItem(Storage.HISTORY, history);

    alert('Key: ' + res.key + '\nLink: ' + link);
    copyTextClipboard('Key: ' + res.key + '\nLink: ' + link);
  } else if (clickData.menuItemId === 'clipboardMenuItem') {
    if (text.length > MAX_ENC_TEXT_LENGTH) {
      alert('Can only encrypt up to ' + MAX_ENC_TEXT_LENGTH + ' characters');
      return;
    }
    const res = await encrypt(text);
    const mode = (await getSyncItemAsync(Storage.ENC_MODE)) as string;
    const len = (await getSyncItemAsync(Storage.KEY_LENGTH)) as number;

    const history = {
      id: uuidv4(),
      pastebinlink: '',
      enc_text: res.data,
      enc_mode: mode,
      key_length: len,
      date: Date(),
    };

    addLocalItem(Storage.HISTORY, history);

    alert('Key: ' + res.key + '\nCiphertext: ' + res.data);
    copyTextClipboard('Key: ' + res.key + '\nCiphertext: ' + res.data);
  } else if (clickData.menuItemId === 'decryptText') {
    // Fix #50: do not block ciphertext > MAX_PASTEBIN_TEXT_LENGTH — encrypted
    // text is legitimately larger than the plaintext limit.
    if (text.length > MAX_ENC_TEXT_LENGTH) {
      alert('Can only decrypt up to ' + MAX_ENC_TEXT_LENGTH + ' characters');
      return;
    }

    const key = prompt('Please enter your key');
    if (key === null) {
      return;
    } else if (text.includes('C_TXT')) {
      const res = decrypt(text, key);
      alert('Decrypted text: \n' + res);
    } else if (text.includes('pastebin')) {
      const pasteText = await getPastebin(text);
      const res = decrypt(pasteText, key);
      alert('Decrypted text: \n' + res);
    } else {
      alert('Could not decrypt: text does not appear to be a ciphertext or Pastebin link');
    }
  }
});
