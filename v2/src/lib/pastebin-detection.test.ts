import { describe, it, expect } from 'vitest'
import { detectAction, isEncryptionAction } from './editor-utils'
import { EditorAction, CIPHER_PREFIX } from './constants'

// ---------------------------------------------------------------------------
// Pastebin link detection
// ---------------------------------------------------------------------------

describe('Pastebin link detection via detectAction', () => {
  const pastebinUrls = [
    'https://pastebin.com/abc123',
    'http://pastebin.com/xyz',
    'pastebin.com/AbCdEf',
    '  pastebin.com/raw/abc  ',
    'Check this out: pastebin.com/abc123 for more',
  ]

  const nonPastebinTexts = [
    'hello world',
    'just some plain text',
    'not-pastebin.com/fake',
    'https://github.com/user/repo',
  ]

  describe('POST_PASTEBIN default → OPEN_PASTEBIN for Pastebin URLs', () => {
    const def = EditorAction.POST_PASTEBIN
    pastebinUrls.forEach((url) => {
      it(`detects OPEN_PASTEBIN for: "${url.trim()}"`, () => {
        expect(detectAction(url, def)).toBe(EditorAction.OPEN_PASTEBIN)
      })
    })

    nonPastebinTexts.forEach((text) => {
      it(`no Pastebin detection for: "${text}"`, () => {
        const action = detectAction(text, def)
        expect(action).not.toBe(EditorAction.OPEN_PASTEBIN)
        expect(action).not.toBe(EditorAction.DECRYPT_PASTEBIN)
      })
    })
  })

  describe('ENCRYPT_PASTEBIN default → DECRYPT_PASTEBIN for Pastebin URLs', () => {
    const def = EditorAction.ENCRYPT_PASTEBIN
    pastebinUrls.forEach((url) => {
      it(`detects DECRYPT_PASTEBIN for: "${url.trim()}"`, () => {
        expect(detectAction(url, def)).toBe(EditorAction.DECRYPT_PASTEBIN)
      })
    })
  })

  it('cipher prefix takes priority over Pastebin URL (POST default)', () => {
    expect(detectAction(`${CIPHER_PREFIX} pastebin.com/abc`, EditorAction.POST_PASTEBIN)).toBe(EditorAction.DECRYPT)
  })

  it('cipher prefix takes priority over Pastebin URL (ENCRYPT default)', () => {
    expect(detectAction(`${CIPHER_PREFIX} pastebin.com/abc`, EditorAction.ENCRYPT_PASTEBIN)).toBe(EditorAction.DECRYPT)
  })
})

// ---------------------------------------------------------------------------
// isPastebinLink — mirrors ActionBar conditional visibility logic
// ---------------------------------------------------------------------------

describe('isPastebinLink (ActionBar conditional visibility)', () => {
  function isPastebinLink(text: string, defaultAction: EditorAction): boolean {
    const action = detectAction(text, defaultAction)
    return action === EditorAction.DECRYPT_PASTEBIN || action === EditorAction.OPEN_PASTEBIN
  }

  it('true for Pastebin URL with POST default', () => {
    expect(isPastebinLink('pastebin.com/abc', EditorAction.POST_PASTEBIN)).toBe(true)
  })

  it('true for Pastebin URL with ENCRYPT default', () => {
    expect(isPastebinLink('https://pastebin.com/abc', EditorAction.ENCRYPT_PASTEBIN)).toBe(true)
  })

  it('false for plain text', () => {
    expect(isPastebinLink('hello world', EditorAction.POST_PASTEBIN)).toBe(false)
    expect(isPastebinLink('hello world', EditorAction.ENCRYPT_PASTEBIN)).toBe(false)
  })

  it('false for cipher text', () => {
    expect(isPastebinLink('C_TXT:iv:salt:cipher', EditorAction.POST_PASTEBIN)).toBe(false)
    expect(isPastebinLink('C_TXT:iv:salt:cipher', EditorAction.ENCRYPT_PASTEBIN)).toBe(false)
  })

  it('false for not-pastebin.com', () => {
    expect(isPastebinLink('not-pastebin.com/fake', EditorAction.POST_PASTEBIN)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Open in SecureBin — initial action inference
// ---------------------------------------------------------------------------

describe('Open in SecureBin — initial action inference', () => {
  function inferInitialAction(text: string): EditorAction {
    return text.trim().includes(CIPHER_PREFIX) ? EditorAction.DECRYPT : EditorAction.POST_PASTEBIN
  }

  it('routes cipher text to DECRYPT', () => {
    expect(inferInitialAction('C_TXT:iv:salt:ciphertext')).toBe(EditorAction.DECRYPT)
  })

  it('routes plain text to POST_PASTEBIN', () => {
    expect(inferInitialAction('just some selected text')).toBe(EditorAction.POST_PASTEBIN)
  })

  it('handles whitespace-padded cipher text', () => {
    expect(inferInitialAction('   C_TXT:data   ')).toBe(EditorAction.DECRYPT)
  })
})

// ---------------------------------------------------------------------------
// isEncryptionAction drives Pastebin link routing
// ---------------------------------------------------------------------------

describe('isEncryptionAction drives DECRYPT_PASTEBIN vs OPEN_PASTEBIN', () => {
  const url = 'pastebin.com/abc123'

  it('POST default → OPEN_PASTEBIN for Pastebin links', () => {
    expect(isEncryptionAction(EditorAction.POST_PASTEBIN)).toBe(false)
    expect(detectAction(url, EditorAction.POST_PASTEBIN)).toBe(EditorAction.OPEN_PASTEBIN)
  })

  it('ENCRYPT default → DECRYPT_PASTEBIN for Pastebin links', () => {
    expect(isEncryptionAction(EditorAction.ENCRYPT)).toBe(true)
    expect(detectAction(url, EditorAction.ENCRYPT)).toBe(EditorAction.DECRYPT_PASTEBIN)
  })

  it('ENCRYPT_PASTEBIN default → DECRYPT_PASTEBIN for Pastebin links', () => {
    expect(isEncryptionAction(EditorAction.ENCRYPT_PASTEBIN)).toBe(true)
    expect(detectAction(url, EditorAction.ENCRYPT_PASTEBIN)).toBe(EditorAction.DECRYPT_PASTEBIN)
  })
})
