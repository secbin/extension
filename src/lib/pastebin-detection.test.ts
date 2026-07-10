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
    'https://www.pastebin.com/abc123',
  ]

  const nonPastebinTexts = [
    'hello world',
    'just some plain text',
    'not-pastebin.com/fake',
    'https://github.com/user/repo',
    // The whole text must BE a link — prose around it must not trigger
    'Check this out: pastebin.com/abc123 for more',
    'just mentioning pastebin.com in a note',
    'pastebin.com',
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

  describe('ENCRYPT_PASTEBIN default → OPEN_PASTEBIN for Pastebin URLs (open hands off to decrypt)', () => {
    const def = EditorAction.ENCRYPT_PASTEBIN
    pastebinUrls.forEach((url) => {
      it(`detects OPEN_PASTEBIN for: "${url.trim()}"`, () => {
        expect(detectAction(url, def)).toBe(EditorAction.OPEN_PASTEBIN)
      })
    })
  })

  it('ciphertext blob takes priority over an embedded Pastebin URL (POST default)', () => {
    expect(detectAction(`{"${CIPHER_PREFIX}":"abc","src":"pastebin.com/abc"}`, EditorAction.POST_PASTEBIN)).toBe(EditorAction.DECRYPT)
  })

  it('ciphertext blob takes priority over an embedded Pastebin URL (ENCRYPT default)', () => {
    expect(detectAction(`{"${CIPHER_PREFIX}":"abc","src":"pastebin.com/abc"}`, EditorAction.ENCRYPT_PASTEBIN)).toBe(EditorAction.DECRYPT)
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
// "Open in Editor" (context menu) — initial action inference via detectAction
// ---------------------------------------------------------------------------

describe('Open in Editor — initial action inference', () => {
  const def = EditorAction.POST_PASTEBIN

  it('routes a ciphertext blob to DECRYPT', () => {
    expect(detectAction(`{"${CIPHER_PREFIX}":"iv","IV":"x"}`, def)).toBe(EditorAction.DECRYPT)
  })

  it('routes plain text to the default action', () => {
    expect(detectAction('just some selected text', def)).toBe(EditorAction.POST_PASTEBIN)
  })

  it('handles whitespace-padded ciphertext', () => {
    expect(detectAction(`   {"${CIPHER_PREFIX}":"data"}   `, def)).toBe(EditorAction.DECRYPT)
  })

  it('routes prose mentioning C_TXT to the default action', () => {
    expect(detectAction('C_TXT:iv:salt:ciphertext is the legacy shape', def)).toBe(EditorAction.POST_PASTEBIN)
  })
})

// ---------------------------------------------------------------------------
// Pastebin links always route to OPEN_PASTEBIN — opening auto-detects an
// encrypted paste and hands off to the decrypt flow, so the user's default
// action no longer changes how a link is handled
// ---------------------------------------------------------------------------

describe('Pastebin links route to OPEN_PASTEBIN regardless of default action', () => {
  const url = 'pastebin.com/abc123'

  it('POST default → OPEN_PASTEBIN for Pastebin links', () => {
    expect(isEncryptionAction(EditorAction.POST_PASTEBIN)).toBe(false)
    expect(detectAction(url, EditorAction.POST_PASTEBIN)).toBe(EditorAction.OPEN_PASTEBIN)
  })

  it('ENCRYPT default → OPEN_PASTEBIN for Pastebin links', () => {
    expect(isEncryptionAction(EditorAction.ENCRYPT)).toBe(true)
    expect(detectAction(url, EditorAction.ENCRYPT)).toBe(EditorAction.OPEN_PASTEBIN)
  })

  it('ENCRYPT_PASTEBIN default → OPEN_PASTEBIN for Pastebin links', () => {
    expect(isEncryptionAction(EditorAction.ENCRYPT_PASTEBIN)).toBe(true)
    expect(detectAction(url, EditorAction.ENCRYPT_PASTEBIN)).toBe(EditorAction.OPEN_PASTEBIN)
  })
})
