import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, formatDistanceToNow, differenceInHours } from 'date-fns'
import { ChevronRight, Lock, Send, Save, ExternalLink, X, Search, Cloud, Globe, EyeOff, RefreshCw, Loader2 } from 'lucide-react'
import { useStore, type HistoryItem } from '@/lib/store'
import { EditorAction } from '@/lib/constants'
import { listPastes, type PasteItem } from '@/lib/pastebin'
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

function getLocalTitle(item: HistoryItem): string {
  if (item.pastebinLink && !item.pastebinLink.startsWith('Error')) return item.pastebinLink
  if (item.pastebinLink?.startsWith('Error')) return 'Error'
  if (item.encMode) return `${(item.keyLength ?? 16) * 8}-bit ${item.encMode}`
  return 'Draft'
}

const PRIVACY_ICONS: Record<string, typeof Globe> = { '0': Globe, '1': EyeOff, '2': Lock }

export default function History() {
  const navigate = useNavigate()
  const { history, removeFromHistory, settings } = useStore()
  const isLoggedIn = !!settings.userKey

  const [search, setSearch] = useState('')
  const [scope, setScope] = useState<ScopeFilter>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')

  const [cloudPastes, setCloudPastes] = useState<PasteItem[]>([])
  const [cloudLoading, setCloudLoading] = useState(false)
  const [cloudError, setCloudError] = useState('')
  const [cloudLimit, setCloudLimit] = useState(50)
  const [cloudLoaded, setCloudLoaded] = useState(false)

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

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-4 pt-3 pb-2 space-y-2 shrink-0">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-surface-secondary/50">
          <Search size={14} className="text-text-muted shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search history…"
            className="flex-1 text-sm bg-transparent focus:outline-none placeholder:text-text-muted/60"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-text-muted hover:text-text-primary">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Scope + type filters in one scrollable row */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
          {/* Scope pills — only when logged in */}
          {isLoggedIn && (
            <>
              {(['all', 'local', 'cloud'] as ScopeFilter[]).map(s => (
                <button
                  key={s}
                  onClick={() => setScope(s)}
                  className={cn(
                    'shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors',
                    scope === s ? 'bg-primary text-white' : 'bg-surface-secondary text-text-muted hover:text-text-primary',
                  )}
                >
                  {s === 'cloud' && <Cloud size={10} />}
                  {s === 'all' ? 'All' : s === 'local' ? 'On Device' : 'Pastebin'}
                </button>
              ))}
              <div className="w-px self-stretch bg-border mx-0.5 shrink-0" />
            </>
          )}

          {/* Type filters */}
          {(['all', 'pastes', 'encrypted', 'drafts', 'errors'] as TypeFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={cn(
                'shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize',
                typeFilter === f ? 'bg-primary text-white' : 'bg-surface-secondary text-text-muted hover:text-text-primary',
              )}
            >
              {f === 'all' ? 'Any type' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Connect banner — when not logged in */}
      {!isLoggedIn && (
        <button
          onClick={() => navigate('/pastebin-account')}
          className="mx-4 mb-2 flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border bg-surface-secondary/50 hover:bg-surface-hover transition-colors text-left shrink-0"
        >
          <Cloud size={14} className="text-text-muted shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-text-secondary">Connect Pastebin account</p>
            <p className="text-[11px] text-text-muted leading-snug">Sign in to see and manage your cloud pastes here</p>
          </div>
          <ChevronRight size={13} className="text-text-muted shrink-0" />
        </button>
      )}

      {/* Cloud loading indicator */}
      {cloudLoading && cloudPastes.length === 0 && (
        <div className="flex items-center gap-2 px-4 py-2 shrink-0">
          <Loader2 size={12} className="animate-spin text-text-muted" />
          <span className="text-xs text-text-muted">Loading Pastebin…</span>
        </div>
      )}
      {cloudError && (
        <div className="px-4 py-2 shrink-0 flex items-center justify-between">
          <span className="text-xs text-danger">{cloudError}</span>
          <button onClick={() => loadCloud()} className="text-xs text-primary hover:underline">Retry</button>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-border">
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
                      <div className="w-8 h-8 rounded-lg bg-surface-secondary flex items-center justify-center shrink-0">
                        <PrivacyIcon size={14} className="text-text-muted" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium truncate text-text-primary">{paste.title}</p>
                          <Cloud size={10} className="text-text-muted shrink-0" />
                        </div>
                        <p className="text-xs text-text-muted">
                          {paste.formatShort || 'text'} · {date}
                        </p>
                      </div>
                      <ChevronRight size={15} className="text-text-muted shrink-0" />
                    </button>
                  </div>
                )
              }

              const item = u.item
              const Icon = getLocalIcon(item.action)
              const isError = item.pastebinLink?.startsWith('Error')
              const realIndex = history.indexOf(item)
              return (
                <div key={item.id}>
                  {showHeading && (
                    <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-text-muted bg-surface-secondary/30">
                      {heading}
                    </p>
                  )}
                  <div className="relative group flex items-center hover:bg-surface-hover transition-colors">
                    <button
                      onClick={() => navigate(`/result/${realIndex}`)}
                      className="flex-1 flex items-center gap-3 px-4 py-3 text-left min-w-0 pr-12"
                    >
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', isError ? 'bg-danger/10' : 'bg-primary/10')}>
                        <Icon size={15} className={isError ? 'text-danger' : 'text-primary'} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={cn('text-sm font-medium truncate', isError && 'text-danger')}>
                          {getLocalTitle(item)}
                        </p>
                        <p className="text-xs text-text-muted">{formatDate(item.date)}</p>
                      </div>
                      <ChevronRight size={16} className="text-text-muted shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <button
                      onClick={e => handleDeleteLocal(e, item.id)}
                      className="absolute right-3 p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 opacity-0 group-hover:opacity-100 transition-all"
                      title="Remove from history"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )
            })
          })()
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

      {/* Footer */}
      <div className="border-t border-border px-4 py-2.5 flex items-center justify-between shrink-0">
        <p className="text-[10px] text-text-muted">
          Local deletes don't affect pastebin.com
        </p>
        {isLoggedIn && (
          <button
            onClick={() => loadCloud()}
            className="flex items-center gap-1 text-[10px] text-text-muted hover:text-text-primary transition-colors"
          >
            <RefreshCw size={10} />
            Refresh
          </button>
        )}
      </div>
    </div>
  )
}
