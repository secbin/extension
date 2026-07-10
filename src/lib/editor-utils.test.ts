import { describe, it, expect } from 'vitest'
import {
  detectAction,
  detectActionOnChange,
  getMaxLength,
  isWithinLimit,
  isEncryptionAction,
  isCiphertext,
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
  const cipher = '{"C_TXT":"abc","IV":"def","Mode":"AES-GCM","Tag":"ghi"}'

  it('returns default for plain text', () => {
    expect(detectAction('hello world', def)).toBe(EditorAction.POST_PASTEBIN)
  })

  it('detects OPEN_PASTEBIN for a pastebin.com link', () => {
    expect(detectAction('https://pastebin.com/abc123', def)).toBe(EditorAction.OPEN_PASTEBIN)
  })

  it('detects OPEN_PASTEBIN for a bare pastebin.com link', () => {
    expect(detectAction('pastebin.com/xyz', def)).toBe(EditorAction.OPEN_PASTEBIN)
  })

  it('detects DECRYPT for a ciphertext blob', () => {
    expect(detectAction(cipher, def)).toBe(EditorAction.DECRYPT)
  })

  it('ciphertext takes priority over a pastebin URL inside it', () => {
    expect(detectAction('{"C_TXT":"abc","src":"pastebin.com/abc"}', def)).toBe(EditorAction.DECRYPT)
  })

  it('does NOT match prose that merely mentions pastebin.com', () => {
    // The exact failure the user hit: selected release notes mentioning the
    // domain flipped the action to Open Paste
    expect(detectAction('just mentioning pastebin.com in a note never changes your selected action', def)).toBe(EditorAction.POST_PASTEBIN)
  })

  it('does NOT match prose with an embedded pastebin link', () => {
    expect(detectAction('Check this out: pastebin.com/abc123 for more', def)).toBe(EditorAction.POST_PASTEBIN)
  })

  it('does NOT match prose mentioning C_TXT', () => {
    expect(detectAction('the C_TXT field holds the ciphertext', def)).toBe(EditorAction.POST_PASTEBIN)
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

  it('does NOT match the bare domain with no paste id', () => {
    expect(detectAction('pastebin.com', def)).toBe(EditorAction.POST_PASTEBIN)
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

  it('detects OPEN_PASTEBIN for a pastebin.com link (open hands off to decrypt for encrypted pastes)', () => {
    expect(detectAction('https://pastebin.com/abc123', def)).toBe(EditorAction.OPEN_PASTEBIN)
  })

  it('detects DECRYPT for a ciphertext blob regardless of default', () => {
    expect(detectAction('{"C_TXT":"abc","IV":"def","Mode":"AES-GCM","Tag":"ghi"}', def)).toBe(EditorAction.DECRYPT)
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

  it('detects OPEN_PASTEBIN for a pastebin.com link (encryption action default)', () => {
    expect(detectAction('https://pastebin.com/abc123', def)).toBe(EditorAction.OPEN_PASTEBIN)
  })
})

// ---------------------------------------------------------------------------
// isCiphertext
// ---------------------------------------------------------------------------

describe('isCiphertext', () => {
  it('accepts the JSON blob produced by encrypt()', () => {
    expect(isCiphertext('{"C_TXT":"abc","IV":"def","Mode":"AES-GCM","Tag":"ghi"}')).toBe(true)
    expect(isCiphertext('  {"C_TXT":"abc"}  ')).toBe(true)
  })

  it('rejects prose that merely mentions C_TXT', () => {
    expect(isCiphertext('the C_TXT field holds the ciphertext')).toBe(false)
  })

  it('rejects plain text and JSON without the marker', () => {
    expect(isCiphertext('hello world')).toBe(false)
    expect(isCiphertext('{"foo":"bar"}')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// detectActionOnChange — auto-switching as the user types or pastes
// ---------------------------------------------------------------------------

describe('detectActionOnChange', () => {
  const def = EditorAction.POST_PASTEBIN
  const ciphertext = '{"C_TXT":"abc","IV":"def","Mode":"AES-GCM","Tag":"ghi"}'

  it('switches to DECRYPT when a ciphertext is pasted', () => {
    expect(detectActionOnChange(ciphertext, EditorAction.POST_PASTEBIN, def)).toBe(EditorAction.DECRYPT)
  })

  it('switches to DECRYPT even when the current action was chosen explicitly', () => {
    expect(detectActionOnChange(ciphertext, EditorAction.ENCRYPT, def)).toBe(EditorAction.DECRYPT)
  })

  it('switches to OPEN_PASTEBIN when a pastebin link is pasted (plain default)', () => {
    expect(detectActionOnChange('https://pastebin.com/abc123', EditorAction.POST_PASTEBIN, def)).toBe(EditorAction.OPEN_PASTEBIN)
  })

  it('switches to OPEN_PASTEBIN when a pastebin link is pasted (encryption default)', () => {
    expect(detectActionOnChange('https://pastebin.com/abc123', EditorAction.ENCRYPT_PASTEBIN, EditorAction.ENCRYPT_PASTEBIN)).toBe(EditorAction.OPEN_PASTEBIN)
  })

  it('switches back to the default when the ciphertext is removed', () => {
    expect(detectActionOnChange('plain text now', EditorAction.DECRYPT, def)).toBe(EditorAction.POST_PASTEBIN)
  })

  it('switches back to the default when the link is removed', () => {
    expect(detectActionOnChange('plain text now', EditorAction.OPEN_PASTEBIN, def)).toBe(EditorAction.POST_PASTEBIN)
  })

  it('keeps the current action when nothing content-specific is detected', () => {
    expect(detectActionOnChange('plain text', EditorAction.POST_PASTEBIN, def)).toBeUndefined()
  })

  it('never overrides an explicit non-default choice with plain text', () => {
    // User picked "Encrypt Only", keeps typing plain text — action must not snap back
    expect(detectActionOnChange('plain text', EditorAction.ENCRYPT, def)).toBeUndefined()
    expect(detectActionOnChange('plain text', EditorAction.SAVE_DRAFT, def)).toBeUndefined()
  })

  it('returns undefined when the detected action equals the current one', () => {
    expect(detectActionOnChange(ciphertext, EditorAction.DECRYPT, def)).toBeUndefined()
    expect(detectActionOnChange('https://pastebin.com/abc', EditorAction.OPEN_PASTEBIN, def)).toBeUndefined()
  })

  it('switches between content actions when the content kind changes', () => {
    // Ciphertext replaced by a pastebin link
    expect(detectActionOnChange('https://pastebin.com/abc', EditorAction.DECRYPT, def)).toBe(EditorAction.OPEN_PASTEBIN)
  })

  it('keeps an explicit link-action pick while the text is still a link', () => {
    // User picked "Decrypt from Link" over the detected "Open Paste" (or vice
    // versa) — editing the link must not flip it back
    expect(detectActionOnChange('https://pastebin.com/abc1', EditorAction.DECRYPT_PASTEBIN, def)).toBeUndefined()
    expect(detectActionOnChange('https://pastebin.com/abc1', EditorAction.OPEN_PASTEBIN, EditorAction.ENCRYPT_PASTEBIN)).toBeUndefined()
  })

  it('does NOT hijack the action when pastebin.com is merely mentioned in prose', () => {
    expect(detectActionOnChange('remember to check pastebin.com for the logs', EditorAction.POST_PASTEBIN, def)).toBeUndefined()
    expect(detectActionOnChange('remember to check pastebin.com for the logs', EditorAction.ENCRYPT, def)).toBeUndefined()
    expect(detectActionOnChange('see pastebin.com/abc123 in the docs', EditorAction.SAVE_DRAFT, def)).toBeUndefined()
  })

  it('does NOT hijack the action when C_TXT appears in prose', () => {
    expect(detectActionOnChange('the C_TXT field holds the ciphertext', EditorAction.POST_PASTEBIN, def)).toBeUndefined()
  })

  it('accepts raw links and bare-domain paste links', () => {
    expect(detectActionOnChange('pastebin.com/xyz9', EditorAction.POST_PASTEBIN, def)).toBe(EditorAction.OPEN_PASTEBIN)
    expect(detectActionOnChange('https://pastebin.com/raw/xyz9', EditorAction.POST_PASTEBIN, def)).toBe(EditorAction.OPEN_PASTEBIN)
  })

  it('does NOT treat a lookalike domain as a paste link', () => {
    expect(detectActionOnChange('https://pastebin.com.evil.com/abc', EditorAction.POST_PASTEBIN, def)).toBeUndefined()
    expect(detectActionOnChange('https://pastebin.community/abc', EditorAction.POST_PASTEBIN, def)).toBeUndefined()
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
