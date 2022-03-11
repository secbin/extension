import { copyTextClipboard } from "../chrome/utils";
import { encrypt, decrypt } from "../chrome/utils/crypto";
import {postPastebin, getPastebin} from "../chrome/utils/pastebin";
import { getItemAsync, addItem } from "../chrome/utils/storage";
import { Storage } from '../constants'

/** Fired when the extension is first installed,
 *  when the extension is updated to a new version,
 *  and when Chrome is updated to a new version. */
chrome.runtime.onInstalled.addListener(async (details) => {
    console.log('onInstall, checking for settings, else set defaults', details);
    let mode = await getItemAsync(Storage.ENC_MODE) as string
    if (mode === undefined) {
        console.log("Mode = ", mode);
        addItem(Storage.ENC_MODE, "AES-CBC")
    }

    let len = await getItemAsync(Storage.KEY_LENGTH) as number
    if (len === undefined) {
        console.log("Key_Len = ", 128);
        addItem(Storage.KEY_LENGTH, 16)
    }

    let theme = await getItemAsync(Storage.THEME) as number
    if (theme === undefined) {
        console.log("Theme = ", "Light");
        addItem(Storage.THEME, false)
    }
    //console.log(mode, len, theme);
});

chrome.runtime.onConnect.addListener((port) => {
    //console.log('[background.js] onConnect', port)
});

chrome.runtime.onStartup.addListener(() => {
   // console.log('[background.js] onStartup')
});

/**
 *  Sent to the event page just before it is unloaded.
 *  This gives the extension opportunity to do some clean up.
 *  Note that since the page is unloading,
 *  any asynchronous operations started while handling this event
 *  are not guaranteed to complete.
 *  If more activity for the event page occurs before it gets
 *  unloaded the onSuspendCanceled event will
 *  be sent and the page won't be unloaded. */
chrome.runtime.onSuspend.addListener(() => {
   // console.log('[background.js] onSuspend')
});


// storage changed
// chrome.storage.onChanged.addListener(function (changes, namespace) {
//     for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
//       console.log(
//         `Storage key "${key}" in namespace "${namespace}" changed.`,
//         `Old value was "${oldValue}", new value is "${newValue}".`
//       );
//     }
//   });

var pasteBinMenuItem = {
    "id": "pasteBin",
    "title": "Share via PasteBin",
    "contexts": ['selection']
}

var clipboardMenuItem = {
    "id": "clipboardMenuItem",
    "title": "Encrypt to Clipboard",
    "contexts": ['selection']
}
var decryptMenuItem = {
    "id": "decryptText",
    "title": "Decrypt Text",
    "contexts": ['selection']
}


chrome.contextMenus.create(pasteBinMenuItem);
chrome.contextMenus.create(clipboardMenuItem);
chrome.contextMenus.create(decryptMenuItem);

chrome.contextMenus.onClicked.addListener( async (clickData) => {
    let text = clickData.selectionText
    if(text === undefined){
        alert("Please select some text")
        return
    }

    if(clickData.menuItemId === "pasteBin"){
        let res = await encrypt(text)
        console.log("ENC text", res)
        let link = await postPastebin(res.data)
        const history = {
            id: Math.floor(Math.random()),
            pastebinlink: link,
            enc_text: res.data,
            enc_mode: "state.settings.enc_mode",
            key_length: "state.settings.key_length",
            date: Date(),
        }
        addItem(Storage.HISTORY, history)

        alert("Key: " + res.key + "\nLink:" + link);
        copyTextClipboard("Key: " + res.key + "\nLink:" + link);
    }
    else if(clickData.menuItemId === "clipboardMenuItem"){
        let res = await encrypt(text)
        let mode = await getItemAsync(Storage.ENC_MODE) as string
        let len = await getItemAsync(Storage.KEY_LENGTH) as number
        console.log("ENC text", res.data)

        const history = {
            id: Math.floor(Math.random()),
            pastebinlink: "",
            enc_text: res.data,
            enc_mode: mode,
            key_length: len,
            date: Date(),
        }

        console.log("ENC text", history)
        addItem(Storage.HISTORY, history)

        alert("Key: " + res.key + "\nCiphertext:" + res.data);
        copyTextClipboard("Key: " + res.key + "\nCiphertext:" + res.data);
    }
    else if (clickData.menuItemId === "decryptText"){
        let key = prompt("Please enter your key");
        if(key === null){
            return
        }else if(text.includes("C_TXT")){
            let res = decrypt(text, key);
            alert("Decrypted text: \n" + res);
            console.log(res);
        }else if(text.includes("pastebin")){
            let link = text
            text = await getPastebin(link)
            let res = decrypt(text, key);
            alert("Decrypted text: \n" + res);
            console.log(res);
        }else{
            console.log("Invalid Text");
        }
    }
})
