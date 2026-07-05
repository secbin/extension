import { useStore, type DraftTitleMode, generateDraftTitle } from '@/lib/store'
import PageHeader from '@/components/common/PageHeader'
import { cn } from '@/lib/cn'

type BaseOption = { value: DraftTitleMode; label: string; preview: string }

const BASE_OPTIONS: BaseOption[] = [
  { value: 'datetime', label: 'Date & Time', preview: 'Apr 9, 2:34 PM' },
  { value: 'date', label: 'Date', preview: 'Apr 9, 2025' },
  { value: 'untitled', label: 'Untitled', preview: 'Untitled Paste' },
]

const CUSTOM_SUFFIX_OPTIONS: { value: DraftTitleMode; label: string }[] = [
  { value: 'custom', label: 'None' },
  { value: 'custom_date', label: '+ Date' },
  { value: 'custom_datetime', label: '+ Date & Time' },
]

const CUSTOM_MODES = new Set<DraftTitleMode>(['custom', 'custom_date', 'custom_datetime'])

export default function PasteNameConfig() {
  const { settings, setSettings } = useStore()
  const mode = settings.draft_title_mode ?? 'datetime'
  const prefix = settings.draft_title_prefix?.trim() || ''
  const isCustom = CUSTOM_MODES.has(mode)
  const livePreview = generateDraftTitle(mode, prefix)

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Paste Name" subtitle="Applied to each new paste" />
      <div className="flex-1 px-4 py-4">
        <div className="rounded-xl border border-border/60 overflow-hidden">
          {BASE_OPTIONS.map((opt, idx) => {
            const isSelected = mode === opt.value
            return (
              <div key={opt.value}>
                {idx > 0 && <div className="border-t border-border/20 mx-3" />}
                <button
                  onClick={() => setSettings({ draft_title_mode: opt.value })}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-3 text-left transition-colors',
                    isSelected ? 'bg-surface-secondary/50' : 'hover:bg-surface-hover',
                  )}
                >
                  <div className={cn(
                    'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                    isSelected ? 'border-primary' : 'border-border',
                  )}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <span className={cn('text-sm flex-1', isSelected ? 'font-medium text-text-primary' : 'text-text-secondary')}>
                    {opt.label}
                  </span>
                  <span className="text-xs text-text-muted font-mono shrink-0">{opt.preview}</span>
                </button>
              </div>
            )
          })}

          {/* Custom — grouped row with inline suffix picker */}
          <div className="border-t border-border/20 mx-3" />
          <button
            onClick={() => { if (!isCustom) setSettings({ draft_title_mode: 'custom' }) }}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-3 text-left transition-colors',
              isCustom ? 'bg-surface-secondary/50' : 'hover:bg-surface-hover',
            )}
          >
            <div className={cn(
              'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
              isCustom ? 'border-primary' : 'border-border',
            )}>
              {isCustom && <div className="w-2 h-2 rounded-full bg-primary" />}
            </div>
            <span className={cn('text-sm flex-1', isCustom ? 'font-medium text-text-primary' : 'text-text-secondary')}>
              Custom
            </span>
            {isCustom && prefix && (
              <span className="text-xs text-text-muted font-mono shrink-0">{livePreview}</span>
            )}
          </button>

          {/* Expanded custom controls */}
          {isCustom && (
            <div className="px-3 pb-3 space-y-2.5 pt-0.5">
              {/* Live preview */}
              {livePreview && (
                <p className="text-[11px] text-text-muted font-mono px-0.5">{livePreview}</p>
              )}
              {/* Prefix input */}
              <input
                value={settings.draft_title_prefix ?? ''}
                onChange={e => setSettings({ draft_title_prefix: e.target.value })}
                placeholder="e.g. Work Notes, Snippet, Draft"
                maxLength={60}
                autoFocus
                className="w-full px-2.5 py-2 rounded-lg border border-border/70 bg-surface text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition-colors"
              />
              {/* Suffix segmented control */}
              <div>
                <p className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.06em] mb-1.5 px-0.5">Suffix</p>
                <div className="flex p-0.5 rounded-xl bg-surface-secondary/60 border border-border/50">
                  {CUSTOM_SUFFIX_OPTIONS.map(s => (
                    <button
                      key={s.value}
                      onClick={() => setSettings({ draft_title_mode: s.value })}
                      className={cn(
                        'flex-1 py-1.5 text-xs font-medium rounded-[10px] transition-all duration-150',
                        mode === s.value
                          ? 'bg-surface text-text-primary shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                          : 'text-text-muted hover:text-text-secondary',
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
