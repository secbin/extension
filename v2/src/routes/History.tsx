import { useNavigate } from 'react-router-dom'
import { format, formatDistanceToNow, differenceInHours } from 'date-fns'
import { ChevronRight, Lock, Send, Save, ExternalLink, X } from 'lucide-react'
import { useStore, type HistoryItem } from '@/lib/store'
import { EditorAction } from '@/lib/constants'
import StatusBadge from '@/components/common/StatusBadge'
import { cn } from '@/lib/cn'

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  if (differenceInHours(new Date(), date) < 47) {
    return formatDistanceToNow(date, { addSuffix: true })
  }
  return format(date, 'MMMM d, yyyy')
}

function formatDateHeading(timestamp: number): string {
  return format(new Date(timestamp), 'MMMM d, yyyy')
}

function getActionIcon(action: EditorAction) {
  switch (action) {
    case EditorAction.ENCRYPT:
    case EditorAction.ENCRYPT_PASTEBIN:
      return Lock
    case EditorAction.POST_PASTEBIN:
      return Send
    case EditorAction.SAVE_DRAFT:
      return Save
    default:
      return ExternalLink
  }
}

function getItemTitle(item: HistoryItem): string {
  if (item.pastebinLink && !item.pastebinLink.startsWith('Error')) {
    return item.pastebinLink
  }
  if (item.pastebinLink?.startsWith('Error')) {
    return 'Error'
  }
  if (item.encMode) {
    return `${(item.keyLength ?? 16) * 8}-bit ${item.encMode}`
  }
  return 'Draft'
}

export default function History() {
  const navigate = useNavigate()
  const { history, removeFromHistory } = useStore()

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    removeFromHistory(id)
  }

  if (history.length === 0) {
    return <StatusBadge variant="empty-history" title="No History" subtitle="Your encrypted pastes and drafts will appear here" />
  }

  // Group by date heading
  let lastHeading = ''

  return (
    <div className="flex flex-col">
      <div className="divide-y divide-border flex-1">
        {history.map((item, index) => {
          const heading = formatDateHeading(item.date)
          const showHeading = heading !== lastHeading
          lastHeading = heading
          const Icon = getActionIcon(item.action)
          const isError = item.pastebinLink?.startsWith('Error')

          return (
            <div key={item.id}>
              {showHeading && (
                <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-text-muted bg-surface-secondary/30">
                  {heading}
                </p>
              )}
              <div className="relative group flex items-center hover:bg-surface-hover transition-colors">
                <button
                  onClick={() => navigate(`/result/${index}`)}
                  className="flex-1 flex items-center gap-3 px-4 py-3 text-left min-w-0 pr-12"
                >
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                    isError ? 'bg-danger/10' : 'bg-primary/10',
                  )}>
                    <Icon size={15} className={isError ? 'text-danger' : 'text-primary'} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn(
                      'text-sm font-medium truncate',
                      isError && 'text-danger',
                    )}>
                      {getItemTitle(item)}
                    </p>
                    <p className="text-xs text-text-muted">{formatDate(item.date)}</p>
                  </div>
                  <ChevronRight size={16} className="text-text-muted shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                {/* Delete button — separated from chevron with fixed right position */}
                <button
                  onClick={(e) => handleDelete(e, item.id)}
                  className="absolute right-3 p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete from history"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Info text */}
      <p className="px-4 py-2.5 text-[10px] text-text-muted border-t border-border bg-surface-secondary/20">
        Deleting items removes them from this history only — pastes on pastebin.com are not affected.
      </p>
    </div>
  )
}
