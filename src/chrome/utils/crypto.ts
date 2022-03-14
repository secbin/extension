import forge from 'node-forge';
import { getSyncItemAsync } from "./storage";
import { Storage } from "../../constants"

export async function encrypt(data: string){
    let mode = await getSyncItemAsync(Storage.ENC_MODE) as string
    let len = await getSyncItemAsync(Storage.KEY_LENGTH) as number

    // encrypt data
    const encRes = encryptText(data, mode, len)
    // encode data to string
    const cTXT = JSON.stringify(encRes.CipherData);
    
    return {data: cTXT, key: encRes.Key, mode:mode, key_len: len}
}

// Encrpts a string using the AES algorithm. Optional parameter: Password, AES Mode
function encryptText(text: string, mode: string, len: number){
    // Note: a key size of 16 bytes will use AES-128, 24 => AES-192, 32 => AES-256
    let key = forge.random.getBytesSync(len);
    let iv = forge.random.getBytesSync(16);

    // Encrypt the text
    let cipher = forge.cipher.createCipher(mode as forge.cipher.Algorithm, key);
    cipher.start({ iv: iv });
    cipher.update(forge.util.createBuffer(text));
    cipher.finish();

    // encode bytes to base64
    let cTXT = forge.util.encode64(cipher.output.data);
    let tag = ""
    if (mode === "AES-GCM"){
        tag = forge.util.encode64(cipher.mode.tag.bytes().toString());
    }
    iv = forge.util.encode64(iv);
    key = forge.util.encode64(key)

    return {CipherData: 
            {C_TXT: cTXT, IV: iv, Mode: mode, Tag: tag},
             Key: key}
};

export function decrypt(cData: string, key: string): string{
    let r = JSON.parse(cData)
    let pTXT = decryptText(r.C_TXT, key, r.IV, r.Tag, r.Mode)
    return pTXT
}

function decryptText(cTXT: string|null, key: string|null, iv:string|null, tag:string|null, mode: string|null): string{
    if(cTXT === null || key === null || iv === null || tag === null || mode === null) {
        return "Error"
    }
    // decode base64 to bytes
    cTXT = forge.util.decode64(cTXT);
    tag = forge.util.decode64(tag);
    iv = forge.util.decode64(iv);
    key = forge.util.decode64(key)
    
    let decipher = forge.cipher.createDecipher(mode as forge.cipher.Algorithm, key);
    decipher.start({
      iv: iv,
     tag: new forge.util.ByteStringBuffer(tag)
    });

    decipher.update(forge.util.createBuffer(cTXT));
    decipher.finish();
    let decrypted = decipher.output.data;
    return decrypted;
};
