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
 * Infers the most appropriate action based on text content and the user's
 * configured default action.
 *
 * - C_TXT prefix → always DECRYPT
 * - pastebin.com URL → DECRYPT_PASTEBIN if default is an encryption action, else OPEN_PASTEBIN
 * - plain text → returns defaultAction unchanged
 */
export function detectAction(text: string, defaultAction: EditorAction): EditorAction {
  const trimmed = text.trim()

  if (trimmed.includes(CIPHER_PREFIX)) {
    return EditorAction.DECRYPT
  }

  // Match pastebin.com only when it appears as a domain, not as a substring of
  // another hostname (e.g. "not-pastebin.com" should not match).
  if (/(?:^|[\s/:("])pastebin\.com[/\s]?/.test(trimmed)) {
    return isEncryptionAction(defaultAction) ? EditorAction.DECRYPT_PASTEBIN : EditorAction.OPEN_PASTEBIN
  }

  return defaultAction
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

/**
 * Returns true when the text is non-empty and within the limit for the given action.
 */
export function isWithinLimit(text: string, action: EditorAction): boolean {
  return text.length > 0 && text.length <= getMaxLength(action)
}
