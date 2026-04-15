import { useRef, useEffect, useCallback } from 'react'
import { useStore, resolveTheme } from '@/lib/store'
import { detectLanguage } from '@/lib/detect-language'
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

function getPastePlaceholder(): string {
  const platform = navigator.platform.toLowerCase()
  const ua = navigator.userAgent.toLowerCase()
  const isMac = platform.startsWith('mac') || ua.includes('mac os')
  const shortcut = isMac ? '⌘ + V' : 'Ctrl + V'
  return `Type or paste (${shortcut}) text you want to encrypt or a Pastebin.com link or ciphertext you want to decrypt here...`
}

const PLACEHOLDER = getPastePlaceholder()

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
      let format = draft.format
      if (format === 'text' && text.length > 80) {
        try {
          const detected = detectLanguage(text)
          if (detected !== 'text') format = detected
        } catch {
          // keep current format
        }
      }
      updateDraft({ plaintext: text, format, buttonEnabled: text.length > 0 })
    },
    [draft.format, updateDraft],
  )

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
          ...buildBaseExtensions(isDark),
          // Set language immediately in the initial state — no async delay
          languageCompartment.of(lang ?? []),
          EditorView.updateListener.of(update => {
            if (update.docChanged && !isUpdatingRef.current) {
              handleChange(update.state.doc.toString())
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
        placeholder={PLACEHOLDER}
        spellCheck={true}
        className="flex-1 w-full px-4 py-4 leading-relaxed bg-transparent resize-none focus:outline-none placeholder:text-text-muted/50"
        style={{ fontSize: draft.plaintext.length > 300 ? '16px' : '24px' }}
      />
    </div>
  )
}
