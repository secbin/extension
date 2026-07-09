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

// AES-CBC omitted — no authentication tag, vulnerable to padding oracle attacks.
// The EncryptionMode.AES_CBC enum value is kept so existing CBC ciphertexts can
// still be decrypted, but it is not offered as an option for new encryptions.
export const ENCRYPTION_MODES = [
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

// Bundled Pastebin dev key, injected at build time from .env.local (see
// .env.example). The key is kept out of the committed source because the repo
// is public; a build without the env var ships no default key, and posting is
// disabled until the user configures their own key.
export const DEFAULT_API_KEY: string = import.meta.env.VITE_DEFAULT_PASTEBIN_API_KEY ?? ''

/** True when the user has configured their own key (not the bundled default). */
export function hasCustomApiKey(apiKey: string): boolean {
  return !!apiKey && apiKey !== DEFAULT_API_KEY
}

// Stored form of the API key in chrome.storage: base64 of the URI-encoded key
// so any character set round-trips.
export const encodeStoredApiKey = (key: string): string => btoa(encodeURIComponent(key))
export const decodeStoredApiKey = (stored: string): string => decodeURIComponent(atob(stored))

export const PASTEBIN_FORMATS = [
  { label: 'Plain Text', value: 'text' },
  { label: 'ActionScript', value: 'actionscript' },
  { label: 'ActionScript 3', value: 'actionscript3' },
  { label: 'Ada', value: 'ada' },
  { label: 'ANTLR4', value: 'antlr4' },
  { label: 'Apache Log', value: 'apache' },
  { label: 'Assembly (NASM)', value: 'asm' },
  { label: 'Bash', value: 'bash' },
  { label: 'C', value: 'c' },
  { label: 'C#', value: 'csharp' },
  { label: 'C++', value: 'cpp' },
  { label: 'CSS', value: 'css' },
  { label: 'Dart', value: 'dart' },
  { label: 'Diff', value: 'diff' },
  { label: 'Docker', value: 'docker' },
  { label: 'Elixir', value: 'elixir' },
  { label: 'Erlang', value: 'erlang' },
  { label: 'Go', value: 'go' },
  { label: 'Haskell', value: 'haskell' },
  { label: 'HTML', value: 'html5' },
  { label: 'Java', value: 'java' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'JSON', value: 'json' },
  { label: 'Kotlin', value: 'kotlin' },
  { label: 'Lua', value: 'lua' },
  { label: 'Markdown', value: 'markdown' },
  { label: 'MATLAB', value: 'matlab' },
  { label: 'MySQL', value: 'mysql' },
  { label: 'Nginx', value: 'nginx' },
  { label: 'Objective-C', value: 'objc' },
  { label: 'Pascal', value: 'pascal' },
  { label: 'Perl', value: 'perl' },
  { label: 'PHP', value: 'php' },
  { label: 'PowerShell', value: 'powershell' },
  { label: 'Python', value: 'python' },
  { label: 'R', value: 'r' },
  { label: 'Ruby', value: 'ruby' },
  { label: 'Rust', value: 'rust' },
  { label: 'Scala', value: 'scala' },
  { label: 'SQL', value: 'sql' },
  { label: 'Swift', value: 'swift' },
  { label: 'TOML', value: 'toml' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'VB.NET', value: 'vbnet' },
  { label: 'XML', value: 'xml' },
  { label: 'YAML', value: 'yaml' },
] as const

export const PASTEBIN_EXPIRY = [
  { label: 'Never', value: 'N' },
  { label: '10 Minutes', value: '10M' },
  { label: '1 Hour', value: '1H' },
  { label: '1 Day', value: '1D' },
  { label: '1 Week', value: '1W' },
  { label: '2 Weeks', value: '2W' },
  { label: '1 Month', value: '1M' },
  { label: '6 Months', value: '6M' },
  { label: '1 Year', value: '1Y' },
] as const

export type PastebinFormat = typeof PASTEBIN_FORMATS[number]['value']
export type PastebinExpiry = typeof PASTEBIN_EXPIRY[number]['value']

export const PASTE_PRIVACY = [
  { label: 'Public', value: '0' },
  { label: 'Unlisted', value: '1' },
  { label: 'Private', value: '2' },
] as const

export type PastePrivacy = typeof PASTE_PRIVACY[number]['value']
