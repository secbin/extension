import { useRef, useEffect, useCallback } from 'react'
import { useStore, resolveTheme, type Draft } from '@/lib/store'
import { EditorAction } from '@/lib/constants'
import { detectLanguage } from '@/lib/detect-language'
import { detectActionOnChange } from '@/lib/editor-utils'
import {
  EditorView,
  EditorState,
  buildBaseExtensions,
  getLangKey,
  getLanguage,
  languageCompartment,
  themeCompartment,
  getThemeExtension,
} from '@/lib/cm-setup'
import { isInjected } from '@/App'

function getShortcut(): string {
  const p = navigator.platform.toLowerCase()
  const ua = navigator.userAgent.toLowerCase()
  return p.startsWith('mac') || ua.includes('mac os') ? '⌘V' : 'Ctrl+V'
}

const SHORTCUT = getShortcut()

function getPlaceholder(action: EditorAction): string {
  switch (action) {
    case EditorAction.ENCRYPT:
    case EditorAction.ENCRYPT_PASTEBIN:
      return `Type or paste (${SHORTCUT}) text to encrypt and share securely…`
    case EditorAction.DECRYPT:
    case EditorAction.DECRYPT_PASTEBIN:
      return `Paste your ciphertext or a Pastebin link to decrypt…`
    default:
      return `Type or paste (${SHORTCUT}) anything — code, notes, a link…`
  }
}

const CODE_BG_LIGHT = '#f3f3f5'
const CODE_BG_DARK = '#2c313c'

export default function TextEditor() {
  const { draft, updateDraft, settings } = useStore()
  const cmRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const isUpdatingRef = useRef(false)
  const currentLangRef = useRef('')
  const isDark = resolveTheme(settings.theme) === 'dark'
  const isCodeMode = draft.format !== 'text'

  const handleChange = useCallback(
    (text: string) => {
      const partial: Partial<Draft> = { plaintext: text }
      // Pasted a ciphertext or Pastebin link → flip the action to Decrypt /
      // Open Paste (and back once the content no longer matches).
      const action = detectActionOnChange(text, draft.action, settings.default_action)
      if (action !== undefined) partial.action = action
      // Auto-detect a code language, but never override a format the user
      // picked explicitly (formatLocked) — including an explicit "Plain Text".
      if (draft.format === 'text' && !draft.formatLocked && text.length > 80) {
        try {
          const detected = detectLanguage(text)
          if (detected !== 'text') partial.format = detected
        } catch {
          // keep current format
        }
      }
      updateDraft(partial)
    },
    [draft.format, draft.formatLocked, draft.action, settings.default_action, updateDraft],
  )

  // The CodeMirror update listener is registered once per view, so it must
  // read the latest handleChange through a ref — a direct capture would keep
  // stale draft state (e.g. the format at view-creation time) forever.
  const handleChangeRef = useRef(handleChange)
  useEffect(() => {
    handleChangeRef.current = handleChange
  }, [handleChange])

  // Initialize CodeMirror when entering code mode
  useEffect(() => {
    if (!isCodeMode || !cmRef.current) return

    const shadowRoot = isInjected()
      ? ((window as any).__SECUREBIN_SHADOW_ROOT__ as ShadowRoot | undefined)
      : undefined

    // Resolve language synchronously — all grammars are eagerly imported
    const langKey = getLangKey(draft.format, draft.plaintext)
    const lang = getLanguage(langKey)
    currentLangRef.current = langKey

    const view = new EditorView({
      state: EditorState.create({
        doc: draft.plaintext,
        extensions: [
          ...buildBaseExtensions(isDark, lang),
          EditorView.updateListener.of(update => {
            if (update.docChanged && !isUpdatingRef.current) {
              handleChangeRef.current(update.state.doc.toString())
            }
          }),
        ],
      }),
      parent: cmRef.current,
      ...(shadowRoot ? { root: shadowRoot } : {}),
    })
    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
      currentLangRef.current = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCodeMode])

  // Sync content from outside (resetDraft, securebin:set-text)
  useEffect(() => {
    const view = viewRef.current
    if (!view || !isCodeMode) return
    const current = view.state.doc.toString()
    if (current !== draft.plaintext) {
      isUpdatingRef.current = true
      view.dispatch({ changes: { from: 0, to: current.length, insert: draft.plaintext } })
      isUpdatingRef.current = false
    }
  }, [draft.plaintext, isCodeMode])

  // Sync theme
  useEffect(() => {
    const view = viewRef.current
    if (!view || !isCodeMode) return
    view.dispatch({ effects: themeCompartment.reconfigure(getThemeExtension(isDark)) })
  }, [isDark, isCodeMode])

  // Swap language when format changes (e.g. user picks a different format from dropdown)
  useEffect(() => {
    if (!isCodeMode) return
    const view = viewRef.current
    if (!view) return
    const key = getLangKey(draft.format, draft.plaintext)
    if (key === currentLangRef.current) return
    currentLangRef.current = key
    const lang = getLanguage(key)
    view.dispatch({ effects: languageCompartment.reconfigure(lang ?? []) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.format, isCodeMode])

  if (isCodeMode) {
    return (
      <div
        ref={cmRef}
        className="flex-1 overflow-hidden"
        style={{ backgroundColor: isDark ? CODE_BG_DARK : CODE_BG_LIGHT }}
      />
    )
  }

  return (
    <div className="relative flex-1 flex flex-col">
      <textarea
        value={draft.plaintext}
        onChange={e => handleChange(e.target.value)}
        placeholder={getPlaceholder(draft.action)}
        spellCheck={true}
        className="flex-1 w-full px-4 py-4 leading-relaxed bg-transparent resize-none focus:outline-none placeholder:text-text-muted/50"
        style={{ fontSize: draft.plaintext.length > 300 ? '16px' : '24px' }}
      />
    </div>
  )
}
