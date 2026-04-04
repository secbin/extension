import { EncryptionMode } from './constants'

export interface CipherData {
  C_TXT: string
  IV: string
  Mode: string
  Tag: string
  Salt?: string
  Length?: number
}

export interface EncryptResult {
  cipherData: string
  key: string
  mode: string
  keyLength: number
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer as ArrayBuffer
}

function getWebCryptoAlgorithm(mode: EncryptionMode): string {
  switch (mode) {
    case EncryptionMode.AES_GCM: return 'AES-GCM'
    case EncryptionMode.AES_CBC: return 'AES-CBC'
    case EncryptionMode.AES_CTR: return 'AES-CTR'
  }
}

function getKeyBits(keyLength: number): number {
  return keyLength * 8
}

async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array,
  keyLength: number,
  algorithm: string,
): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: 10000, hash: 'SHA-256' },
    keyMaterial,
    { name: algorithm, length: getKeyBits(keyLength) },
    true,
    ['encrypt', 'decrypt'],
  )
}

export async function encrypt(
  plaintext: string,
  mode: EncryptionMode,
  keyLength: number,
  password?: string,
): Promise<EncryptResult> {
  const algorithm = getWebCryptoAlgorithm(mode)
  const iv = crypto.getRandomValues(new Uint8Array(mode === EncryptionMode.AES_GCM ? 12 : 16))
  const enc = new TextEncoder()
  const data = enc.encode(plaintext)

  let cryptoKey: CryptoKey
  let exportedKey = ''
  let salt: Uint8Array | undefined

  if (password) {
    salt = crypto.getRandomValues(new Uint8Array(16))
    cryptoKey = await deriveKeyFromPassword(password, salt, keyLength, algorithm)
    exportedKey = password
  } else {
    cryptoKey = await crypto.subtle.generateKey(
      { name: algorithm, length: getKeyBits(keyLength) },
      true,
      ['encrypt', 'decrypt'],
    )
    const rawKey = await crypto.subtle.exportKey('raw', cryptoKey)
    exportedKey = arrayBufferToBase64(rawKey)
  }

  let encryptParams: AlgorithmIdentifier
  if (mode === EncryptionMode.AES_GCM) {
    encryptParams = { name: 'AES-GCM', iv } as AesGcmParams
  } else if (mode === EncryptionMode.AES_CTR) {
    encryptParams = { name: 'AES-CTR', counter: iv, length: 64 } as AesCtrParams
  } else {
    encryptParams = { name: 'AES-CBC', iv } as AesCbcParams
  }

  const encrypted = await crypto.subtle.encrypt(encryptParams, cryptoKey, data)

  let ciphertext: string
  let tag = ''

  if (mode === EncryptionMode.AES_GCM) {
    // GCM appends 16-byte tag to ciphertext
    const encBytes = new Uint8Array(encrypted)
    const cipherBytes = encBytes.slice(0, encBytes.length - 16)
    const tagBytes = encBytes.slice(encBytes.length - 16)
    ciphertext = arrayBufferToBase64(cipherBytes.buffer as ArrayBuffer)
    tag = arrayBufferToBase64(tagBytes.buffer as ArrayBuffer)
  } else {
    ciphertext = arrayBufferToBase64(encrypted)
  }

  const cipherData: CipherData = {
    C_TXT: ciphertext,
    IV: arrayBufferToBase64(iv.buffer as ArrayBuffer),
    Mode: mode,
    Tag: tag,
    ...(salt ? { Salt: arrayBufferToBase64(salt.buffer as ArrayBuffer), Length: keyLength } : {}),
  }

  return {
    cipherData: JSON.stringify(cipherData),
    key: exportedKey,
    mode,
    keyLength,
  }
}

export async function decrypt(cipherDataStr: string, key: string): Promise<string> {
  const data: CipherData = JSON.parse(cipherDataStr)
  const mode = data.Mode as EncryptionMode
  const algorithm = getWebCryptoAlgorithm(mode)
  const iv = new Uint8Array(base64ToArrayBuffer(data.IV))

  let cryptoKey: CryptoKey

  if (data.Salt && data.Length) {
    const salt = new Uint8Array(base64ToArrayBuffer(data.Salt))
    cryptoKey = await deriveKeyFromPassword(key, salt, data.Length, algorithm)
  } else {
    const rawKey = base64ToArrayBuffer(key)
    cryptoKey = await crypto.subtle.importKey(
      'raw',
      rawKey,
      { name: algorithm, length: rawKey.byteLength * 8 },
      false,
      ['decrypt'],
    )
  }

  let cipherBytes: Uint8Array

  if (mode === EncryptionMode.AES_GCM) {
    // Reconstruct ciphertext + tag
    const ct = new Uint8Array(base64ToArrayBuffer(data.C_TXT))
    const tag = new Uint8Array(base64ToArrayBuffer(data.Tag))
    cipherBytes = new Uint8Array(ct.length + tag.length)
    cipherBytes.set(ct)
    cipherBytes.set(tag, ct.length)
  } else {
    cipherBytes = new Uint8Array(base64ToArrayBuffer(data.C_TXT))
  }

  let decryptParams: AlgorithmIdentifier
  if (mode === EncryptionMode.AES_GCM) {
    decryptParams = { name: 'AES-GCM', iv } as AesGcmParams
  } else if (mode === EncryptionMode.AES_CTR) {
    decryptParams = { name: 'AES-CTR', counter: iv, length: 64 } as AesCtrParams
  } else {
    decryptParams = { name: 'AES-CBC', iv } as AesCbcParams
  }

  const decrypted = await crypto.subtle.decrypt(decryptParams, cryptoKey, cipherBytes as ArrayBufferView<ArrayBuffer>)
  return new TextDecoder().decode(decrypted)
}

export function generatePasskey(length = 20): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*_+-='
  const values = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(values, (v) => charset[v % charset.length]).join('')
}
