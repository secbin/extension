import { useRef, useEffect, useCallback } from 'react'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/cn'
import { EditorAction } from '@/lib/constants'
import { detectAction, getMaxLength, isWithinLimit } from '@/lib/editor-utils'

export default function TextEditor() {
  const { draft, updateDraft, settings } = useStore()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value
      clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        const action = detectAction(text, settings.default_action)
        updateDraft({
          plaintext: text,
          action,
          buttonEnabled: isWithinLimit(text, action),
        })
      }, 200)
      // Immediate text update for responsive typing
      updateDraft({ plaintext: text })
    },
    [settings.default_action, updateDraft],
  )

  useEffect(() => {
    return () => clearTimeout(debounceRef.current)
  }, [])

  const placeholder = (() => {
    if (draft.action === EditorAction.DECRYPT || draft.action === EditorAction.DECRYPT_PASTEBIN) {
      return 'Paste encrypted text or Pastebin link...'
    }
    return 'Type or paste your text here...'
  })()

  const isEmpty = draft.plaintext.length === 0

  return (
    <div className="relative flex-1 flex flex-col">
      <textarea
        ref={textareaRef}
        value={draft.plaintext}
        onChange={handleChange}
        placeholder={placeholder}
        spellCheck={false}
        className="flex-1 w-full px-4 py-3 text-[15px] leading-relaxed bg-transparent resize-none focus:outline-none placeholder:text-text-muted/50"
        style={{
          fontSize: draft.plaintext.length > 300 ? '13px' : '15px',
        }}
      />
      {isEmpty && (
        <div className="px-4 pb-3 flex flex-col gap-1.5 pointer-events-none">
          <p className="text-[11px] text-text-muted/60 leading-relaxed">
            Paste a <span className="font-medium">pastebin.com</span> link to open or decrypt it.
            Paste <span className="font-medium">encrypted text</span> (starting with C_TXT) to decrypt locally.
          </p>
        </div>
      )}
    </div>
  )
}
