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

/**
 * Infers the most appropriate action based on text content and the user's
 * configured default action.
 *
 * - C_TXT prefix → always DECRYPT
 * - pastebin.com URL → OPEN_PASTEBIN (opening auto-detects an encrypted paste
 *   and hands off to the decrypt flow, so it covers both cases)
 * - plain text → returns defaultAction unchanged
 */
export function detectAction(text: string, defaultAction: EditorAction): EditorAction {
  const trimmed = text.trim()

  if (trimmed.includes(CIPHER_PREFIX)) {
    return EditorAction.DECRYPT
  }

  // Match pastebin.com only when it appears as a whole domain, not as a
  // substring of another hostname — neither "not-pastebin.com" (prefix) nor
  // "pastebin.com.evil.com" / "pastebin.community" (suffix) should match.
  if (/(?:^|[\s/:("'])pastebin\.com(?:[/\s:)"',]|$)/.test(trimmed)) {
    return EditorAction.OPEN_PASTEBIN
  }

  return defaultAction
}

// Actions that detectAction derives from the text itself rather than from the
// user's default — the only ones auto-switching may enter or leave.
const CONTENT_DETECTED_ACTIONS = new Set<EditorAction>([
  EditorAction.DECRYPT,
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
// Both are triggered by a Pastebin link — an explicit pick of one must not be
// overridden by re-detection of the other while the text is still a link.
const LINK_ACTIONS = new Set<EditorAction>([
  EditorAction.DECRYPT_PASTEBIN,
  EditorAction.OPEN_PASTEBIN,
])

// On-change detection runs on every keystroke, so it must be much stricter
// than detectAction (which classifies a context-menu selection once): the
// whole text has to BE a paste link — not merely mention pastebin.com in a
// sentence — before we take the action button away from the user.
const PASTEBIN_LINK_ONLY = /^(?:https?:\/\/)?(?:www\.)?pastebin\.com\/(?:raw\/)?\w+\/?$/i

/** The whole trimmed text is a securebin ciphertext or a Pastebin paste link. */
function detectContentAction(trimmed: string): EditorAction | null {
  if (isCiphertext(trimmed)) return EditorAction.DECRYPT
  // Open Paste covers encrypted pastes too — opening auto-detects a
  // ciphertext and hands off to the decrypt flow
  if (PASTEBIN_LINK_ONLY.test(trimmed)) return EditorAction.OPEN_PASTEBIN
  return null
}

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
