import { useRef, useEffect } from 'react'
import { EditorView, EditorState, buildBaseExtensions, getLangKey, getLanguage } from '@/lib/cm-setup'
import { isInjected } from '@/App'

interface CodePreviewProps {
  code: string
  format?: string
  isDark: boolean
  maxHeight?: string
  showGutter?: boolean
}

export default function CodePreview({ code, format = 'text', isDark, maxHeight = '280px', showGutter = false }: CodePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const langKey = getLangKey(format, code)
    const lang = getLanguage(langKey)
    const shadowRoot = isInjected()
      ? ((window as any).__SECUREBIN_SHADOW_ROOT__ as ShadowRoot | undefined)
      : undefined

    const view = new EditorView({
      state: EditorState.create({
        doc: code,
        extensions: [
          ...buildBaseExtensions(isDark, lang),
          EditorState.readOnly.of(true),
          EditorView.editable.of(false),
          EditorView.theme({
            '&': { maxHeight },
            '.cm-scroller': { overflow: 'auto' },
            '.cm-activeLine': { backgroundColor: 'transparent' },
            '&.cm-focused .cm-activeLine': { backgroundColor: 'transparent' },
            '.cm-gutters': showGutter ? {} : { display: 'none' },
            '.cm-content': { padding: '10px 0' },
            '.cm-line': { padding: '0 12px' },
          }),
        ],
      }),
      parent: containerRef.current,
      ...(shadowRoot ? { root: shadowRoot } : {}),
    })
    return () => view.destroy()
  }, [code, format, isDark, showGutter, maxHeight])

  return <div ref={containerRef} className="overflow-hidden" />
}
