import { describe, it, expect } from 'vitest'
import {
  detectAction,
  getMaxLength,
  isWithinLimit,
  isEncryptionAction,
} from './editor-utils'
import {
  EditorAction,
  PASTEBIN_MAX_BYTES,
  MAX_PASTEBIN_TEXT_LENGTH,
  MAX_ENC_PASTEBIN_PLAINTEXT_LENGTH,
  MAX_ENC_TEXT_LENGTH,
} from './constants'

// ---------------------------------------------------------------------------
// isEncryptionAction
// ---------------------------------------------------------------------------

describe('isEncryptionAction', () => {
  it('returns true for ENCRYPT', () => {
    expect(isEncryptionAction(EditorAction.ENCRYPT)).toBe(true)
  })
  it('returns true for ENCRYPT_PASTEBIN', () => {
    expect(isEncryptionAction(EditorAction.ENCRYPT_PASTEBIN)).toBe(true)
  })
  it('returns false for POST_PASTEBIN', () => {
    expect(isEncryptionAction(EditorAction.POST_PASTEBIN)).toBe(false)
  })
  it('returns false for SAVE_DRAFT', () => {
    expect(isEncryptionAction(EditorAction.SAVE_DRAFT)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Char limit constants
// ---------------------------------------------------------------------------

describe('Pastebin char limit constants', () => {
  it('PASTEBIN_MAX_BYTES is exactly 512 KB', () => {
    expect(PASTEBIN_MAX_BYTES).toBe(512 * 1024)
  })

  it('MAX_PASTEBIN_TEXT_LENGTH equals the 512 KB limit', () => {
    expect(MAX_PASTEBIN_TEXT_LENGTH).toBe(PASTEBIN_MAX_BYTES)
  })

  it('MAX_ENC_PASTEBIN_PLAINTEXT_LENGTH is smaller than MAX_PASTEBIN_TEXT_LENGTH', () => {
    expect(MAX_ENC_PASTEBIN_PLAINTEXT_LENGTH).toBeLessThan(MAX_PASTEBIN_TEXT_LENGTH)
  })

  it('MAX_ENC_PASTEBIN_PLAINTEXT_LENGTH leaves room for base64 + overhead (output < 512 KB)', () => {
    const n = MAX_ENC_PASTEBIN_PLAINTEXT_LENGTH
    const estimatedCiphertext = Math.ceil((n + 16) / 3) * 4 + 48
    expect(estimatedCiphertext).toBeLessThan(PASTEBIN_MAX_BYTES)
  })

  it('MAX_ENC_TEXT_LENGTH equals 512 KB', () => {
    expect(MAX_ENC_TEXT_LENGTH).toBe(512 * 1024)
  })
})

// ---------------------------------------------------------------------------
// getMaxLength
// ---------------------------------------------------------------------------

describe('getMaxLength', () => {
  it('returns the plain paste limit for POST_PASTEBIN', () => {
    expect(getMaxLength(EditorAction.POST_PASTEBIN)).toBe(MAX_PASTEBIN_TEXT_LENGTH)
  })

  it('returns the encrypted plaintext limit for ENCRYPT_PASTEBIN', () => {
    expect(getMaxLength(EditorAction.ENCRYPT_PASTEBIN)).toBe(MAX_ENC_PASTEBIN_PLAINTEXT_LENGTH)
  })

  it('returns the local limit for ENCRYPT', () => {
    expect(getMaxLength(EditorAction.ENCRYPT)).toBe(MAX_ENC_TEXT_LENGTH)
  })

  it('returns the local limit for DECRYPT', () => {
    expect(getMaxLength(EditorAction.DECRYPT)).toBe(MAX_ENC_TEXT_LENGTH)
  })

  it('returns the local limit for SAVE_DRAFT', () => {
    expect(getMaxLength(EditorAction.SAVE_DRAFT)).toBe(MAX_ENC_TEXT_LENGTH)
  })
})

// ---------------------------------------------------------------------------
// detectAction — default POST_PASTEBIN (encryption off)
// ---------------------------------------------------------------------------

describe('detectAction with POST_PASTEBIN default', () => {
  const def = EditorAction.POST_PASTEBIN

  it('returns default for plain text', () => {
    expect(detectAction('hello world', def)).toBe(EditorAction.POST_PASTEBIN)
  })

  it('detects OPEN_PASTEBIN for a pastebin.com link', () => {
    expect(detectAction('https://pastebin.com/abc123', def)).toBe(EditorAction.OPEN_PASTEBIN)
  })

  it('detects OPEN_PASTEBIN for a bare pastebin.com link', () => {
    expect(detectAction('pastebin.com/xyz', def)).toBe(EditorAction.OPEN_PASTEBIN)
  })

  it('detects DECRYPT for text containing the cipher prefix', () => {
    expect(detectAction('C_TXT:abc:def:ghi', def)).toBe(EditorAction.DECRYPT)
  })

  it('cipher prefix takes priority over pastebin URL', () => {
    expect(detectAction('C_TXT pastebin.com/abc', def)).toBe(EditorAction.DECRYPT)
  })

  it('does NOT match not-pastebin.com', () => {
    expect(detectAction('not-pastebin.com/fake', def)).toBe(EditorAction.POST_PASTEBIN)
  })

  it('does NOT match pastebin.com as a subdomain of another host', () => {
    expect(detectAction('https://pastebin.com.evil.com/fake', def)).toBe(EditorAction.POST_PASTEBIN)
  })

  it('does NOT match hostnames that merely start with pastebin.com', () => {
    expect(detectAction('https://pastebin.community/fake', def)).toBe(EditorAction.POST_PASTEBIN)
  })

  it('matches a bare pastebin.com domain with no path', () => {
    expect(detectAction('pastebin.com', def)).toBe(EditorAction.OPEN_PASTEBIN)
  })
})

// ---------------------------------------------------------------------------
// detectAction — default ENCRYPT_PASTEBIN (encryption on)
// ---------------------------------------------------------------------------

describe('detectAction with ENCRYPT_PASTEBIN default', () => {
  const def = EditorAction.ENCRYPT_PASTEBIN

  it('returns default for plain text', () => {
    expect(detectAction('hello world', def)).toBe(EditorAction.ENCRYPT_PASTEBIN)
  })

  it('detects DECRYPT_PASTEBIN for a pastebin.com link', () => {
    expect(detectAction('https://pastebin.com/abc123', def)).toBe(EditorAction.DECRYPT_PASTEBIN)
  })

  it('detects DECRYPT for cipher prefix regardless of default', () => {
    expect(detectAction('C_TXT:abc:def:ghi', def)).toBe(EditorAction.DECRYPT)
  })
})

// ---------------------------------------------------------------------------
// detectAction — default ENCRYPT (local only)
// ---------------------------------------------------------------------------

describe('detectAction with ENCRYPT default', () => {
  const def = EditorAction.ENCRYPT

  it('returns default for plain text', () => {
    expect(detectAction('hello world', def)).toBe(EditorAction.ENCRYPT)
  })

  it('detects DECRYPT_PASTEBIN for a pastebin.com link (encryption action default)', () => {
    expect(detectAction('https://pastebin.com/abc123', def)).toBe(EditorAction.DECRYPT_PASTEBIN)
  })
})

// ---------------------------------------------------------------------------
// isWithinLimit
// ---------------------------------------------------------------------------

describe('isWithinLimit', () => {
  it('returns false for empty text', () => {
    expect(isWithinLimit('', EditorAction.POST_PASTEBIN)).toBe(false)
  })

  it('returns true when text length equals the limit', () => {
    const limit = getMaxLength(EditorAction.POST_PASTEBIN)
    expect(isWithinLimit('a'.repeat(limit), EditorAction.POST_PASTEBIN)).toBe(true)
  })

  it('returns false when text exceeds the limit by one character', () => {
    const limit = getMaxLength(EditorAction.POST_PASTEBIN)
    expect(isWithinLimit('a'.repeat(limit + 1), EditorAction.POST_PASTEBIN)).toBe(false)
  })

  it('applies the tighter ENCRYPT_PASTEBIN limit', () => {
    const encLimit = getMaxLength(EditorAction.ENCRYPT_PASTEBIN)
    const plainLimit = getMaxLength(EditorAction.POST_PASTEBIN)
    const text = 'a'.repeat(encLimit + 1)
    expect(isWithinLimit(text, EditorAction.ENCRYPT_PASTEBIN)).toBe(false)
    expect(text.length).toBeLessThan(plainLimit)
  })

  it('counts UTF-8 bytes, not characters — multibyte text hits the limit sooner', () => {
    const limit = getMaxLength(EditorAction.POST_PASTEBIN)
    // '語' is 3 bytes in UTF-8, so limit/3 + 1 of them exceeds the byte limit
    const multibyte = '語'.repeat(Math.floor(limit / 3) + 1)
    expect(multibyte.length).toBeLessThan(limit)
    expect(isWithinLimit(multibyte, EditorAction.POST_PASTEBIN)).toBe(false)
  })
})
