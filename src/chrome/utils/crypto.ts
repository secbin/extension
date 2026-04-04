import forge from 'node-forge';
import { getSyncItemAsync } from './storage';
import { Storage } from '../../constants';

export async function encrypt(data: string, password?: string) {
  const mode = (await getSyncItemAsync(Storage.ENC_MODE)) as string;
  const len = (await getSyncItemAsync(Storage.KEY_LENGTH)) as number;

  // encrypt data
  const encRes = encryptText(data, mode, len, password);
  // encode data to string
  const cTXT = JSON.stringify(encRes.CipherData);

  return { data: cTXT, key: encRes.Key, mode: mode, key_len: len };
}

// Encrpts a string using the AES algorithm. Optional parameter: Password, AES Mode
function encryptText(
  text: string,
  mode: string,
  len: number,
  password?: string
) {
  // Note: a key size of 16 bytes will use AES-128, 24 => AES-192, 32 => AES-256
  let key = '';
  let salt = '';

  // If password, generate key from password and salt, otherwise use random key
  if (password) {
    salt = forge.random.getBytesSync(128);
    //function pbkdf2(password: string, salt: string, iterations: number, keySize: number):
    key = forge.pkcs5.pbkdf2(password, salt, 10000, len);
  } else {
    key = forge.random.getBytesSync(len);
  }

  // Encrypt the text
  let iv = forge.random.getBytesSync(16);
  const cipher = forge.cipher.createCipher(mode as forge.cipher.Algorithm, key);
  cipher.start({ iv: iv });
  cipher.update(forge.util.createBuffer(text));
  cipher.finish();

  // encode bytes to base64
  const cTXT = forge.util.encode64(cipher.output.data);
  let tag = '';
  if (mode === 'AES-GCM') {
    tag = forge.util.encode64(cipher.mode.tag.bytes().toString());
  }
  iv = forge.util.encode64(iv);
  key = forge.util.encode64(key);

  if (password) {
    salt = forge.util.encode64(salt);
    return {
      CipherData: {
        C_TXT: cTXT,
        IV: iv,
        Mode: mode,
        Tag: tag,
        Salt: salt,
        Length: len,
      },
      Key: password,
    };
  }
  return {
    CipherData: { C_TXT: cTXT, IV: iv, Mode: mode, Tag: tag },
    Key: key,
  };
}

export function decrypt(cData: string, key: string): string {
  const r = JSON.parse(cData);
  const pTXT = decryptText(r.C_TXT, key, r.IV, r.Tag, r.Mode, r.Salt, r.Length);
  return pTXT;
}

function decryptText(
  cTXT: string | null,
  key: string | null,
  iv: string | null,
  tag: string | null,
  mode: string | null,
  salt: string | null,
  len: string | null
): string {
  if (
    cTXT === null ||
    key === null ||
    iv === null ||
    tag === null ||
    mode === null
  ) {
    return 'Error';
  }
  // decode base64 to bytes
  cTXT = forge.util.decode64(cTXT);
  tag = forge.util.decode64(tag);
  iv = forge.util.decode64(iv);
  if (salt && len) {
    salt = forge.util.decode64(salt);
    const size = len as unknown as number;
    key = forge.pkcs5.pbkdf2(key, salt, 10000, size);
  } else {
    key = forge.util.decode64(key);
  }

  const decipher = forge.cipher.createDecipher(
    mode as forge.cipher.Algorithm,
    key
  );
  decipher.start({
    iv: iv,
    tag: new forge.util.ByteStringBuffer(tag),
  });

  decipher.update(forge.util.createBuffer(cTXT));
  decipher.finish();
  const decrypted = decipher.output.data;
  return decrypted;
}
