import { useState, useRef, useEffect } from 'react'
import { Pencil, ChevronDown, Lock, Unlock, Eye, EyeOff } from 'lucide-react'
import { useStore } from '@/lib/store'
import { PASTEBIN_FORMATS, PASTEBIN_EXPIRY, EditorAction } from '@/lib/constants'
import { cn } from '@/lib/cn'

type DropdownType = 'format' | 'expiry' | null

const EXPIRY_LABEL: Record<string, string> = {
  N: '∞',
  '10M': '10 min',
  '1H': '1 hr',
  '1D': '1 day',
  '1W': '1 wk',
  '2W': '2 wks',
  '1M': '1 mo',
  '6M': '6 mo',
  '1Y': '1 yr',
}

const DROPDOWN_LABEL = 'px-3 pt-2 pb-0.5 text-[10px] text-text-muted/70'
const DROPDOWN_DIVIDER = 'border-t border-primary/10 mb-1'

export default function PasteMetadata() {
  const { draft, updateDraft } = useStore()
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(draft.title)
  const [openDropdown, setOpenDropdown] = useState<DropdownType>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sync titleValue when draft.title changes externally (e.g. resetDraft)
  useEffect(() => {
    if (!editingTitle) setTitleValue(draft.title)
  }, [draft.title, editingTitle])

  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [editingTitle])

  useEffect(() => {
    if (!openDropdown) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [openDropdown])

  const commitTitle = () => {
    const trimmed = titleValue.trim() || draft.title
    setTitleValue(trimmed)
    updateDraft({ title: trimmed })
    setEditingTitle(false)
  }

  const currentFormat = PASTEBIN_FORMATS.find(f => f.value === draft.format)
  const isEncrypting = draft.action === EditorAction.ENCRYPT_PASTEBIN || draft.action === EditorAction.ENCRYPT
  const isPrivate = draft.privacy === '1'

  return (
    <div ref={containerRef} className="relative flex items-stretch border-b border-border bg-surface">
      {/* Title */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0 px-3 py-2.5 border-r border-border">
        {editingTitle ? (
          <input
            ref={titleInputRef}
            value={titleValue}
            onChange={e => setTitleValue(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={e => {
              if (e.key === 'Enter') commitTitle()
              if (e.key === 'Escape') { setTitleValue(draft.title); setEditingTitle(false) }
            }}
            className="flex-1 min-w-0 text-sm bg-transparent focus:outline-none text-text-primary"
          />
        ) : (
          <button
            onClick={() => setEditingTitle(true)}
            className="flex items-center gap-1.5 flex-1 min-w-0 text-left group"
          >
            <span className="text-sm text-text-secondary truncate">{draft.title}</span>
            <Pencil size={12} className="text-text-muted shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}
      </div>

      {/* Format dropdown */}
      <div className="relative flex">
        <button
          onClick={() => setOpenDropdown(openDropdown === 'format' ? null : 'format')}
          className="flex items-center gap-1 px-3 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover border-r border-border transition-colors"
        >
          {currentFormat?.label.split(' ')[0] ?? 'Text'}
          <ChevronDown size={12} className={cn('transition-transform', openDropdown === 'format' && 'rotate-180')} />
        </button>

        {openDropdown === 'format' && (
          <div className="absolute top-full left-0 z-50 mt-px w-44 max-h-52 overflow-y-auto rounded-b-xl border border-t-0 border-border bg-surface" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)' }}>
            <p className={DROPDOWN_LABEL}>Format</p>
            <div className={DROPDOWN_DIVIDER} />
            {PASTEBIN_FORMATS.map(f => (
              <button
                key={f.value + f.label}
                onClick={() => { updateDraft({ format: f.value }); setOpenDropdown(null) }}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm transition-colors',
                  draft.format === f.value
                    ? 'text-primary bg-primary/5 font-medium'
                    : 'text-text-secondary hover:bg-surface-hover',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Encryption toggle */}
      <button
        onClick={() => {
          const next = !isEncrypting
          updateDraft({ action: next ? EditorAction.ENCRYPT_PASTEBIN : EditorAction.POST_PASTEBIN })
        }}
        className={cn(
          'flex items-center justify-center w-10 border-r border-border transition-colors',
          isEncrypting
            ? 'text-primary bg-primary/5'
            : 'text-text-muted hover:text-text-secondary hover:bg-surface-hover',
        )}
        title={isEncrypting ? 'Encryption on — click to disable' : 'Encryption off — click to enable'}
      >
        {isEncrypting ? <Lock size={14} /> : <Unlock size={14} />}
      </button>

      {/* Privacy toggle */}
      <button
        onClick={() => updateDraft({ privacy: draft.privacy === '0' ? '1' : '0' })}
        className={cn(
          'flex items-center justify-center w-10 border-r border-border transition-colors',
          isPrivate
            ? 'text-warning'
            : 'text-text-muted hover:text-text-secondary hover:bg-surface-hover',
        )}
        title={isPrivate ? 'Unlisted — click to make public' : 'Public — click to make unlisted'}
      >
        {isPrivate ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>

      {/* Expiry dropdown */}
      <div className="relative flex">
        <button
          onClick={() => setOpenDropdown(openDropdown === 'expiry' ? null : 'expiry')}
          className="flex items-center gap-1 px-3 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors min-w-18 justify-center"
        >
          {EXPIRY_LABEL[draft.expiry] ?? draft.expiry}
          <ChevronDown size={12} className={cn('transition-transform', openDropdown === 'expiry' && 'rotate-180')} />
        </button>

        {openDropdown === 'expiry' && (
          <div className="absolute top-full right-0 z-50 mt-px w-36 rounded-b-xl border border-t-0 border-border bg-surface" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)' }}>
            <p className={DROPDOWN_LABEL}>Expires</p>
            <div className={DROPDOWN_DIVIDER} />
            {PASTEBIN_EXPIRY.map(e => (
              <button
                key={e.value}
                onClick={() => { updateDraft({ expiry: e.value }); setOpenDropdown(null) }}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm transition-colors',
                  draft.expiry === e.value
                    ? 'text-primary bg-primary/5 font-medium'
                    : 'text-text-secondary hover:bg-surface-hover',
                )}
              >
                {e.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
