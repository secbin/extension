import forge from 'node-forge';
import { getItem, Storage} from "./storage";

export function encrypt(data: string){
    // Get mode from storage
    let mode: forge.cipher.Algorithm = 'AES-GCM'
    getItem(Storage.ENC_MODE, (data) => {
        mode = data[Storage.ENC_MODE] || "AES-GCM"
    })
    
    // encrypt data
    const encRes = encryptText(data, mode)
    // encode data to string
    const cTXT = JSON.stringify(encRes.CipherData);
    
    return {data: cTXT, key: encRes.Key}
}

// Encrpts a string using the AES algorithm. Optional parameter: Password, AES Mode
function encryptText(text: string, mode?: string){
    // password is used to generate key, if none gen random
    let password = forge.random.getBytesSync(48).toString();
    
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

    // encode bytes to base64
    let cTXT = forge.util.encode64(cipher.output.data);
    let tag = forge.util.encode64(cipher.mode.tag.bytes().toString());
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
