import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, formatDistanceToNow, differenceInHours } from 'date-fns'
import { ChevronRight, Lock, Send, Save, ExternalLink, X, Search, Cloud, Globe, EyeOff, RefreshCw, Loader2, SlidersHorizontal, Check } from 'lucide-react'
import pastebinFavicon from '@/assets/pastebin-favicon.webp'
import { useStore, type HistoryItem } from '@/lib/store'
import { EditorAction } from '@/lib/constants'
import { listPastes, formatBytes, type PasteItem } from '@/lib/pastebin'
import StatusBadge from '@/components/common/StatusBadge'
import { cn } from '@/lib/cn'

type ScopeFilter = 'all' | 'local' | 'cloud'
type TypeFilter = 'all' | 'pastes' | 'encrypted' | 'drafts' | 'errors'

// A unified list item is either a local HistoryItem or a cloud PasteItem
type UnifiedItem =
  | { kind: 'local'; item: HistoryItem; sortDate: number }
  | { kind: 'cloud'; paste: PasteItem; sortDate: number }

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  if (differenceInHours(new Date(), date) < 47) return formatDistanceToNow(date, { addSuffix: true })
  return format(date, 'MMMM d, yyyy')
}

function formatDateHeading(timestamp: number): string {
  return format(new Date(timestamp), 'MMMM d, yyyy')
}

function getLocalIcon(action: EditorAction) {
  switch (action) {
    case EditorAction.ENCRYPT:
    case EditorAction.ENCRYPT_PASTEBIN: return Lock
    case EditorAction.POST_PASTEBIN: return Send
    case EditorAction.SAVE_DRAFT: return Save
    default: return ExternalLink
  }
}

// Swiss-style color coding: each action type gets a consistent accent
function getLocalColors(action: EditorAction, isError: boolean) {
  if (isError) return { bg: 'bg-danger/10', fg: 'text-danger' }
  switch (action) {
    case EditorAction.ENCRYPT:
    case EditorAction.ENCRYPT_PASTEBIN:
    case EditorAction.DECRYPT:
    case EditorAction.DECRYPT_PASTEBIN:
      return { bg: 'bg-primary/10', fg: 'text-primary' }
    case EditorAction.POST_PASTEBIN:
    case EditorAction.OPEN_PASTEBIN:
      return { bg: 'bg-success/10', fg: 'text-success' }
    case EditorAction.SAVE_DRAFT:
      return { bg: 'bg-warning/10', fg: 'text-warning' }
    default:
      return { bg: 'bg-surface-secondary', fg: 'text-text-muted' }
  }
}

function getLocalTitle(item: HistoryItem): string {
  if (item.pastebinLink && !item.pastebinLink.startsWith('Error')) return item.pastebinLink
  if (item.pastebinLink?.startsWith('Error')) return 'Error'
  if (item.encMode) return `${(item.keyLength ?? 16) * 8}-bit ${item.encMode}`
  return 'Draft'
}

const PRIVACY_ICONS: Record<string, typeof Globe> = { '0': Globe, '1': EyeOff, '2': Lock }

export default function History() {
  const navigate = useNavigate()
  const { history, removeFromHistory, settings, updateDraft } = useStore()
  const isLoggedIn = !!settings.userKey

  const [search, setSearch] = useState('')
  const [scope, setScope] = useState<ScopeFilter>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')

  const [cloudPastes, setCloudPastes] = useState<PasteItem[]>([])
  const [cloudLoading, setCloudLoading] = useState(false)
  const [cloudError, setCloudError] = useState('')
  const [cloudLimit, setCloudLimit] = useState(50)
  const [cloudLoaded, setCloudLoaded] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const loadCloud = useCallback(async (limit = cloudLimit) => {
    setCloudLoading(true)
    setCloudError('')
    try {
      const items = await listPastes(settings.apiKey, settings.userKey, limit)
      setCloudPastes(items)
      setCloudLoaded(true)
    } catch (e) {
      setCloudError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setCloudLoading(false)
    }
  }, [settings.apiKey, settings.userKey, cloudLimit])

  // Load cloud pastes when user is logged in, on first render
  useEffect(() => {
    if (isLoggedIn && !cloudLoaded && !cloudLoading) loadCloud()
  }, [isLoggedIn])

  const handleDeleteLocal = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    removeFromHistory(id)
  }

  // Build unified list
  const localItems: UnifiedItem[] = history.map(item => ({
    kind: 'local',
    item,
    sortDate: item.date,
  }))

  const cloudItems: UnifiedItem[] = cloudPastes.map(paste => ({
    kind: 'cloud',
    paste,
    sortDate: paste.date ? Number(paste.date) * 1000 : 0,
  }))

  // Merge and sort newest-first
  let unified: UnifiedItem[] = []
  if (scope === 'all') unified = [...localItems, ...cloudItems]
  else if (scope === 'local') unified = localItems
  else unified = cloudItems
  unified.sort((a, b) => b.sortDate - a.sortDate)

  // Type filter (only applies to local items; cloud items always shown when scope allows)
  const filtered = unified.filter(u => {
    if (u.kind === 'cloud') {
      // Cloud items pass all type filters except local-only ones
      if (typeFilter === 'drafts' || typeFilter === 'errors') return false
      if (search && !u.paste.title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    }
    // u.kind === 'local' from here
    const item = u.item
    if (typeFilter === 'pastes' && !item.pastebinLink?.startsWith('http')) return false
    if (typeFilter === 'encrypted' && !item.encMode) return false
    if (typeFilter === 'drafts' && item.action !== EditorAction.SAVE_DRAFT) return false
    if (typeFilter === 'errors' && !item.pastebinLink?.startsWith('Error')) return false
    if (search) {
      const q = search.toLowerCase()
      if (!getLocalTitle(item).toLowerCase().includes(q)) return false
    }
    return true
  })

  const showEmpty = filtered.length === 0 && !cloudLoading
  const hasContent = history.length > 0 || cloudPastes.length > 0

  const totalCount = history.length + cloudPastes.length

  return (
    <div className="flex flex-col h-full">
      {/* ── Header zone ─────────────────────────────────── */}
      <div className="bg-surface border-b border-border/60 shrink-0">
        {/* Title row */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div className="flex items-baseline gap-2">
            <h2 className="text-lg font-bold text-text-primary tracking-tight">Pastes</h2>
            {totalCount > 0 && (
              <span className="text-xs font-medium text-text-muted tabular-nums">{totalCount}</span>
            )}
          </div>
          {isLoggedIn && (
            <button
              onClick={() => loadCloud()}
              disabled={cloudLoading}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors disabled:opacity-50"
            >
              <RefreshCw size={12} className={cloudLoading ? 'animate-spin' : ''} />
              {cloudLoading && cloudPastes.length === 0 ? 'Syncing…' : 'Refresh'}
            </button>
          )}
        </div>

        {/* Search bar with inline filter button */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border/70 bg-surface-secondary/50">
            <Search size={14} className="text-text-muted shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search pastes…"
              className="flex-1 text-sm bg-transparent focus:outline-none placeholder:text-text-muted/50"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-text-muted hover:text-text-primary shrink-0">
                <X size={13} />
              </button>
            )}
            <div className="w-px h-4 bg-border/60 shrink-0" />
            {/* Filter icon with active indicator */}
            <div className="relative shrink-0">
              <button
                onClick={() => setFiltersOpen(v => !v)}
                className={cn(
                  'flex items-center transition-colors',
                  (scope !== 'all' || typeFilter !== 'all') ? 'text-primary' : 'text-text-muted hover:text-text-secondary',
                )}
                title="Filter"
              >
                <SlidersHorizontal size={14} />
                {(scope !== 'all' || typeFilter !== 'all') && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>
              {filtersOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setFiltersOpen(false)} />
                  <div
                    className="absolute right-0 top-full mt-2 z-50 w-44 rounded-xl border border-border bg-surface py-1.5 animate-in fade-in slide-in-from-top-1 duration-150"
                    style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)' }}
                  >
                    {isLoggedIn && (
                      <>
                        <p className="px-3 pt-2 pb-0.5 text-[10px] font-semibold text-text-muted/60 uppercase tracking-[0.06em]">Source</p>
                        {(['all', 'local', 'cloud'] as ScopeFilter[]).map(s => (
                          <button
                            key={s}
                            onClick={() => setScope(s)}
                            className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-surface-hover transition-colors"
                          >
                            <span className={cn(scope === s ? 'text-primary font-medium' : 'text-text-primary')}>
                              {s === 'all' ? 'All' : s === 'local' ? 'On Device' : 'Pastebin'}
                            </span>
                            {scope === s && <Check size={13} className="text-primary" />}
                          </button>
                        ))}
                        <div className="border-t border-border/20 mx-3 my-1" />
                      </>
                    )}
                    <p className="px-3 pt-2 pb-0.5 text-[10px] font-semibold text-text-muted/60 uppercase tracking-[0.06em]">Type</p>
                    {(['all', 'pastes', 'encrypted', 'drafts', 'errors'] as TypeFilter[]).map(f => (
                      <button
                        key={f}
                        onClick={() => { setTypeFilter(f); setFiltersOpen(false) }}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm capitalize hover:bg-surface-hover transition-colors"
                      >
                        <span className={cn(typeFilter === f ? 'text-primary font-medium' : 'text-text-primary')}>
                          {f === 'all' ? 'Any type' : f}
                        </span>
                        {typeFilter === f && <Check size={13} className="text-primary" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* Cloud error */}
      {cloudError && (
        <div className="px-4 py-2 shrink-0 flex items-center justify-between">
          <span className="text-xs text-danger">{cloudError}</span>
          <button onClick={() => loadCloud()} className="text-xs text-primary hover:underline">Retry</button>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/30">
        {!hasContent && !cloudLoading ? (
          <div className="h-full flex items-center justify-center">
            <StatusBadge variant="empty-history" title="No History" subtitle="Your pastes and encrypted items will appear here" />
          </div>
        ) : showEmpty ? (
          <p className="px-4 py-8 text-sm text-text-muted text-center">No results</p>
        ) : (
          (() => {
            let lastHeading = ''
            return filtered.map((u, idx) => {
              const heading = formatDateHeading(u.sortDate || Date.now())
              const showHeading = heading !== lastHeading
              lastHeading = heading

              if (u.kind === 'cloud') {
                const paste = u.paste
                const PrivacyIcon = PRIVACY_ICONS[paste.privacy] ?? Globe
                const date = paste.date ? formatDate(Number(paste.date) * 1000) : ''
                return (
                  <div key={`cloud-${paste.key}`}>
                    {showHeading && (
                      <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-text-muted bg-surface-secondary/30">
                        {heading}
                      </p>
                    )}
                    <button
                      onClick={() => navigate('/cloud-paste', { state: { paste } })}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-hover transition-colors"
                    >
                      <div className="w-9 h-9 rounded-full bg-surface-secondary flex items-center justify-center shrink-0">
                        <PrivacyIcon size={14} className="text-text-muted" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium truncate text-text-primary">{paste.title}</p>
                          <Cloud size={10} className="text-text-muted shrink-0" />
                        </div>
                        <p className="text-xs text-text-muted">
                          {paste.formatShort || 'text'}{paste.size ? ` · ${formatBytes(paste.size)}` : ''} · {date}
                        </p>
                      </div>
                      <ChevronRight size={15} className="text-text-muted shrink-0" />
                    </button>
                  </div>
                )
              }

              const item = u.item
              const Icon = getLocalIcon(item.action)
              const isError = !!item.pastebinLink?.startsWith('Error')
              const realIndex = history.indexOf(item)
              const { bg, fg } = getLocalColors(item.action, isError)
              const isDraft = item.action === EditorAction.SAVE_DRAFT

              const handleLocalItemClick = () => {
                if (isDraft && item.encText) {
                  // Drafts open directly in the editor for continued editing
                  updateDraft({
                    plaintext: item.encText,
                    title: item.title || '',
                    format: item.format || 'text',
                    expiry: item.expiry || 'N',
                    privacy: (item.privacy as '0' | '1') || '0',
                    action: settings.default_action,
                    buttonEnabled: true,
                  })
                  navigate('/home')
                } else {
                  navigate(`/result/${realIndex}`)
                }
              }

              return (
                <div key={item.id}>
                  {showHeading && (
                    <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-text-muted bg-surface-secondary/30">
                      {heading}
                    </p>
                  )}
                  <button
                    onClick={handleLocalItemClick}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-hover transition-colors"
                  >
                    {/* Circular colored icon — Swiss/Apple type indicator */}
                    <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0', bg)}>
                      <Icon size={15} className={fg} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn('text-sm font-medium truncate', isError ? 'text-danger' : 'text-text-primary')}>
                        {getLocalTitle(item)}
                      </p>
                      <p className="text-xs text-text-muted">{formatDate(item.date)}</p>
                    </div>
                    <ChevronRight size={15} className="text-text-muted/50 shrink-0" />
                  </button>
                </div>
              )
            })
          })()
        )}

        {/* Connect banner at bottom — Apple pattern: show what you have first, invite more below */}
        {!isLoggedIn && (
          <button
            onClick={() => navigate('/pastebin-account')}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-hover transition-colors border-t border-border/30"
          >
            <div className="w-9 h-9 rounded-full bg-surface-secondary flex items-center justify-center shrink-0">
              <img src={pastebinFavicon} alt="Pastebin" className="w-5 h-5 rounded-sm object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text-secondary">Connect Pastebin account</p>
              <p className="text-xs text-text-muted">Sign in to see your cloud pastes here</p>
            </div>
            <ChevronRight size={15} className="text-text-muted/50 shrink-0" />
          </button>
        )}

        {/* Load more cloud */}
        {isLoggedIn && cloudPastes.length >= cloudLimit && cloudLimit < 1000 && (
          <button
            onClick={() => { const next = cloudLimit + 50; setCloudLimit(next); loadCloud(next) }}
            className="w-full py-3 text-sm text-primary hover:bg-surface-hover transition-colors"
          >
            Load more from Pastebin
          </button>
        )}
      </div>

    </div>
  )
}
