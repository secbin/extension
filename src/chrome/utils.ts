import forge from 'node-forge';

export const getCurrentTabUrl = (callback: (url: string | undefined) => void): void => {
    const queryInfo = {active: true, lastFocusedWindow: true};

    chrome.tabs && chrome.tabs.query(queryInfo, tabs => {
        callback(tabs[0].url);
    });
}

export const getCurrentTabUId = (callback: (url: number | undefined) => void): void => {
    const queryInfo = {active: true, lastFocusedWindow: true};

    chrome.tabs && chrome.tabs.query(queryInfo, tabs => {
        callback(tabs[0].id);
    });
}

// Encrpts a string using the AES algorithm. Optional parameter: Password, AES Mode
export function encryptText(text: string, password?: string, mode?: forge.cipher.Algorithm){
    // password is used to generate key, if none gen random
    if (password === undefined) {
    password = forge.random.getBytesSync(48).toString();
    }
    
    // if not mode is specified, use AES-GCM
    if(mode === undefined) {
        mode = "AES-GCM"
    }

    // generate key from password
    let salt = forge.random.getBytesSync(128);
    let key = forge.pkcs5.pbkdf2(password, salt, 10000, 32);

    // set IV
    let iv = forge.random.getBytesSync(16);

    // Encrypt the text
    let cipher = forge.cipher.createCipher(mode, key);
    cipher.start({ iv: iv });
    cipher.update(forge.util.createBuffer(text));
    cipher.finish();

    let tag = cipher.mode.tag;
    let cTXT = forge.util.encode64(cipher.output.data);

    return {CipherTXT: cTXT, IV: iv, Key: key, Tag: tag}
};

export function decryptText(cTXT: string, key: string, iv:string, tag:forge.util.ByteStringBuffer, mode?: forge.cipher.Algorithm): string{
    // if not mode is specified, use AES-GCM
    if(mode === undefined) {
        mode = "AES-GCM"
    }

    let decipher = forge.cipher.createDecipher(mode, key);
    decipher.start({
      iv: iv,
      tag: tag // TODO: add some kind of tag verification for other modes like AES-CBC and AES-CTR
    });
    decipher.update(forge.util.createBuffer(forge.util.decode64(cTXT)));
    decipher.finish();
    let decrypted = decipher.output.data;
    return decrypted;
};

// Encapsulates encryptText object into a single single string which is shared to pastebin
export function wrapCipherTXT(cTXT: string, iv:string, tag:string, mode: string): string {
    return `secureBin&iv=${iv}&mode=${mode}&tag=${tag}&cTXT=${cTXT}`; //stored in url param format
};

// parses string in url param format 'secureBin&iv=${iv}&mode=${mode}&tag=${tag}&cTXT=${cTXT}'
export function ParseCipherTXT(cipherTag: string){
    var cp = new URLSearchParams(cipherTag);
    return {CipherTXT: cp.get("cTXT"), IV: cp.get("iv"), Mode: cp.get("mode"), Tag: cp.get("tag")};
};