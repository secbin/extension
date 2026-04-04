export enum StorageKey {
  SETTINGS = 'settings',
  HISTORY = 'history',
  DRAFT = 'draft',
}

export enum EncryptionMode {
  AES_CBC = 'AES-CBC',
  AES_CTR = 'AES-CTR',
  AES_GCM = 'AES-GCM',
}

export const KEY_LENGTHS = [
  { label: '128-bit', value: 16 },
  { label: '192-bit', value: 24 },
  { label: '256-bit', value: 32 },
] as const

export const ENCRYPTION_MODES = [
  { label: 'AES-CBC', value: EncryptionMode.AES_CBC },
  { label: 'AES-CTR', value: EncryptionMode.AES_CTR },
  { label: 'AES-GCM (Recommended)', value: EncryptionMode.AES_GCM },
] as const

// Pastebin API maximum paste size is 512 KB (524,288 bytes).
// For encrypted pastes, the AES-GCM ciphertext in base64 is ~4/3 of the binary size plus
// ~48 chars of prefix/IV/salt overhead, so the plaintext limit is ≈ 75% of the raw limit
// with a small buffer to guarantee the encoded output stays under 512 KB.
export const PASTEBIN_MAX_BYTES = 512 * 1024                          // 524,288 — Pastebin hard limit
export const MAX_PASTEBIN_TEXT_LENGTH = PASTEBIN_MAX_BYTES            // plain (unencrypted) paste
export const MAX_ENC_PASTEBIN_PLAINTEXT_LENGTH =
  Math.floor(PASTEBIN_MAX_BYTES * 0.75) - 256                         // ~392,960 chars — base64 + overhead buffer
export const MAX_ENC_TEXT_LENGTH = 512 * 1024                         // local encrypt / decrypt only (same ceiling)
export const PASTEBIN_API_KEY_LENGTH = 32
export const PASTEBIN_BASE_URL = 'pastebin.com'
export const CORS_PROXY = 'https://cors.securebin.workers.dev/?'
export const CIPHER_PREFIX = 'C_TXT'

export enum EditorAction {
  ENCRYPT = 'Encrypt',
  ENCRYPT_PASTEBIN = 'Encrypt to Pastebin',
  POST_PASTEBIN = 'Post to Pastebin',
  DECRYPT = 'Decrypt',
  DECRYPT_PASTEBIN = 'Decrypt from Pastebin',
  OPEN_PASTEBIN = 'Open from Pastebin',
  SAVE_DRAFT = 'Save Draft',
}

export const DEFAULT_API_KEY_HASH = 'MmU1OGNlMjcyMzllMzRhNzdjNWVmNjVkYmVhOGIyNGQ='
