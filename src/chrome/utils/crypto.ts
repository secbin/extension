import forge from 'node-forge';
import { getItem, Storage} from "./storage";

export function encrypt(pTXT: string, password?: string): string{
    let mode: forge.cipher.Algorithm = 'AES-GCM'

    getItem(Storage.ENC_MODE, (data) => {
        mode = data[Storage.ENC_MODE] || "AES-GCM"
    })

    const encRes = encryptText(pTXT, password, mode)
    const cTXT = encodeC_TXT(encRes.C_TXT, encRes.IV, encRes.Tag, mode)

    return cTXT
}

export function decrypt(cTXT: string, key: string): string{
    let decode = decodeC_TXT(cTXT)
    let pTXT = decryptText(decode.C_TXT, decode.IV, decode.Tag, key, decode.Mode)
    return pTXT
}


// Encrpts a string using the AES algorithm. Optional parameter: Password, AES Mode
export function encryptText(text: string, password?: string, mode?: string){
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
    
    let cipher = forge.cipher.createCipher(mode as forge.cipher.Algorithm, key);
    cipher.start({ iv: iv });
    cipher.update(forge.util.createBuffer(text));
    cipher.finish();

    let tag = cipher.mode.tag;
    let cTXT = forge.util.encode64(cipher.output.data);

    return {C_TXT: cTXT, IV: iv, Key: key, Tag: tag.toString()}
};

export function decryptText(cTXT: string|null, key: string|null, iv:string|null, tag:string|null, mode: string|null): string{
    if(cTXT === null || key === null || iv === null || tag === null || mode === null) {
        return "Error"
    }

    let decipher = forge.cipher.createDecipher(mode as forge.cipher.Algorithm, key);
    decipher.start({
      iv: iv,
      tag: new forge.util.ByteStringBuffer(tag)
    });
    decipher.update(forge.util.createBuffer(forge.util.decode64(cTXT)));
    decipher.finish();
    let decrypted = decipher.output.data;
    return decrypted;
};

// Encapsulates encryptText object into a single single string which is shared to pastebin
export function encodeC_TXT(cTXT: string, iv:string, tag:string, mode: string): string {
    return `secureBin&iv=${iv}&mode=${mode}&tag=${tag}&cTXT=${cTXT}`; //stored in url param format
};

// parses string in url param format 'secureBin&iv=${iv}&mode=${mode}&tag=${tag}&cTXT=${cTXT}'
export function decodeC_TXT(cipherTag: string){
    var cp = new URLSearchParams(cipherTag);
    return {C_TXT: cp.get("cTXT"), IV: cp.get("iv"), Mode: cp.get("mode"), Tag: cp.get("tag")};
};
