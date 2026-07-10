import {
  EditorAction,
  CIPHER_PREFIX,
  MAX_PASTEBIN_TEXT_LENGTH,
  MAX_ENC_PASTEBIN_PLAINTEXT_LENGTH,
  MAX_ENC_TEXT_LENGTH,
} from './constants'

/** Returns true when the action implies encryption should be used. */
export function isEncryptionAction(action: EditorAction): boolean {
  return action === EditorAction.ENCRYPT || action === EditorAction.ENCRYPT_PASTEBIN
}

/**
 * True when the text is a securebin ciphertext — the JSON blob produced by
 * encrypt() — rather than prose that merely mentions the C_TXT marker.
 */
export function isCiphertext(text: string): boolean {
  const trimmed = text.trim()
  return trimmed.startsWith('{') && trimmed.includes(CIPHER_PREFIX)
}

// The whole text has to BE a paste link — pastebin.com/<id>, optionally
// scheme/www/raw — not merely mention the domain somewhere in a sentence.
const PASTEBIN_LINK_ONLY = /^(?:https?:\/\/)?(?:www\.)?pastebin\.com\/(?:raw\/)?\w+\/?$/i

/**
 * The whole trimmed text is a securebin ciphertext or a Pastebin paste link,
 * or null for anything else. This is deliberately strict — prose that merely
 * mentions pastebin.com or C_TXT must never change the user's action.
 */
function detectContentAction(trimmed: string): EditorAction | null {
  if (isCiphertext(trimmed)) return EditorAction.DECRYPT
  // Open Paste covers encrypted pastes too — opening auto-detects a
  // ciphertext and hands off to the decrypt flow
  if (PASTEBIN_LINK_ONLY.test(trimmed)) return EditorAction.OPEN_PASTEBIN
  return null
}

/**
 * Infers the most appropriate action for a piece of text.
 *
 * - securebin ciphertext blob → DECRYPT
 * - a pastebin.com paste link → OPEN_PASTEBIN (opening auto-detects an
 *   encrypted paste and hands off to the decrypt flow, so it covers both)
 * - anything else → defaultAction unchanged
 */
export function detectAction(text: string, defaultAction: EditorAction): EditorAction {
  return detectContentAction(text.trim()) ?? defaultAction
}

// Actions that detectAction derives from the text itself rather than from the
// user's default — the only ones auto-switching may enter or leave.
const CONTENT_DETECTED_ACTIONS = new Set<EditorAction>([
  EditorAction.DECRYPT,
  EditorAction.DECRYPT_PASTEBIN,
  EditorAction.OPEN_PASTEBIN,
])

// Both are triggered by a Pastebin link — an explicit pick of one must not be
// overridden by re-detection of the other while the text is still a link.
const LINK_ACTIONS = new Set<EditorAction>([
  EditorAction.DECRYPT_PASTEBIN,
  EditorAction.OPEN_PASTEBIN,
])

/**
 * Action to switch to as the user types or pastes, or undefined to keep the
 * current one. Auto-switches only into a content-derived action (ciphertext or
 * Pastebin link detected) or back out of one once the content no longer
 * matches — an explicit choice like "Encrypt Only" is never overridden while
 * the text stays plain.
 */
export function detectActionOnChange(
  text: string,
  currentAction: EditorAction,
  defaultAction: EditorAction,
): EditorAction | undefined {
  const detected = detectContentAction(text.trim())
  if (detected !== null) {
    if (detected === currentAction) return undefined
    if (LINK_ACTIONS.has(detected) && LINK_ACTIONS.has(currentAction)) return undefined
    return detected
  }
  // Content no longer matches — leave a content-derived action, but never
  // touch an explicit choice like "Encrypt Only" over plain text
  if (CONTENT_DETECTED_ACTIONS.has(currentAction)) return defaultAction
  return undefined
}

/**
 * Returns the maximum allowed plaintext character count for a given action.
 * For actions that post to Pastebin the limit reflects the 512 KB API maximum,
 * with encrypted pastes getting a lower limit to account for base64 expansion.
 */
export function getMaxLength(action: EditorAction): number {
  if (action === EditorAction.ENCRYPT_PASTEBIN) return MAX_ENC_PASTEBIN_PLAINTEXT_LENGTH
  if (action === EditorAction.POST_PASTEBIN) return MAX_PASTEBIN_TEXT_LENGTH
  return MAX_ENC_TEXT_LENGTH
}

const utf8 = new TextEncoder()

/**
 * UTF-8 byte length of the text — Pastebin's 512 KB limit is bytes, so
 * multibyte characters count for more than their UTF-16 char count.
 */
export function byteLength(text: string): number {
  return utf8.encode(text).length
}

/**
 * Returns true when the text is non-empty and within the byte limit for the
 * given action.
 */
export function isWithinLimit(text: string, action: EditorAction): boolean {
  return text.length > 0 && byteLength(text) <= getMaxLength(action)
}
