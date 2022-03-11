import { copyTextClipboard } from "../chrome/utils";
import { encrypt, decrypt } from "../chrome/utils/crypto";
import { getItemAsync, addItem } from "../chrome/utils/storage";
import { Storage } from '../constants'
import { useHistory } from "react-router-dom";
import React, {useContext } from "react";
import { AppContext } from "../AppContext";

/** Fired when the extension is first installed,
 *  when the extension is updated to a new version,
 *  and when Chrome is updated to a new version. */
chrome.runtime.onInstalled.addListener((details) => {
    console.log('[background.js] onInstalled', details);
    //alert('[background.js] onInstalled');
});

chrome.runtime.onConnect.addListener((port) => {
    console.log('[background.js] onConnect', port)
   // alert('[background.js] onInstalled');
});

chrome.runtime.onStartup.addListener(() => {
    console.log('[background.js] onStartup')
   // alert('[background.js] onInstalled');
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
    console.log('[background.js] onSuspend')
   // alert('[background.js] onSuspend');
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

// Design choice: any encrption will return the cipher text and the key.
// if we replace clipboad with ciphertext/url, how should we return key?
        // 1. return key as alert();
        // 2. display key and ciphertext in popup window.


var pasteBinMenuItem = {
    "id": "pasteBin",
    "title": "Share via PasteBin", //name of menu
    "contexts": ['selection'] // what type of content menu appears on
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
    //let {push, goBack} = useHistory();
    //const { state, dispatch } = useContext(AppContext);
    let text = clickData.selectionText
    if(text === undefined){
        alert("Please select some text")
        return
    }

    if(clickData.menuItemId === "pasteBin"){
        alert("TODO not implemented")
        let res = await encrypt(text)
        console.log("ENC text", res)
        //setPostLink(res.data); // Use to replace text with link, but not errors as we push('/result')
        const history = {
            id: Math.floor(Math.random()),
            pastebinlink: "postLink", //Undefined, promise error
            enc_text: res.data,
            enc_mode: "state.settings.enc_mode",
            key_length: "state.settings.key_length",
            date: Date(),
        }
        addItem(Storage.HISTORY, history)

        // dispatch({
        //     type: Action.ENCRYPT_PASTEBIN,
        //     payload: {
        //         action: Action.ENCRYPT_PASTEBIN,
        //         plaintext: text,
        //         ciphertext: res.data,
        //         key: res.key
        //     },
        // })
        // console.log("STATE", state)
        // push('/result')
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

        // Not able to use react or state variables in background.js
        alert("Key: " + res.key + "\nCiphertext:" + res.data);
        copyTextClipboard(res.data);
    }
    else if (clickData.menuItemId === "decryptText"){
        let key = prompt("Please enter your key");
        if(key === null){
            return
        }else if(!text.includes("C_TXT")){
            alert("Invalid ciphertext")
        }
        let res = decrypt(text, key);
        alert("Decrypted text: \n" + res);
        console.log(res);
    }
})
