import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Copy, Check, ExternalLink, Loader2 } from 'lucide-react'
import { useStore } from '@/lib/store'
import { EditorAction } from '@/lib/constants'
import { deletePastebin, extractPasteKey } from '@/lib/pastebin'
import PageHeader from '@/components/common/PageHeader'
import CopyBox from '@/components/common/CopyBox'
import { cn } from '@/lib/cn'

export default function Result() {
  const { index } = useParams()
  const navigate = useNavigate()
  const { history, removeFromHistory, settings } = useStore()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [shareCopied, setShareCopied] = useState(false)

  const idx = index !== undefined ? parseInt(index, 10) : 0
  const item = history[idx]

  if (!item) {
    return (
      <>
        <PageHeader title="Result" />
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <p className="text-sm text-text-muted">No result to display.</p>
        </div>
      </>
    )
  }

  const isError = item.pastebinLink?.startsWith('Error')
  const hasPastebin = !!item.pastebinLink && !isError && item.pastebinLink.startsWith('http')
  const hasEncryption = !!item.encMode
  const canDeleteFromPastebin = hasPastebin && !!settings.userKey

  const headerTitle = hasEncryption
    ? `${(item.keyLength ?? 16) * 8} ${item.encMode} Ciphertext`
    : hasPastebin
      ? 'Pastebin Result'
      : item.action === EditorAction.SAVE_DRAFT
        ? 'Draft'
        : 'Result'

  const headerSubtitle = format(new Date(item.date), 'h:mm a, MMMM d, yyyy')

  const handleRemoveFromHistory = async () => {
    if (canDeleteFromPastebin) {
      setDeleting(true)
      setDeleteError('')
      try {
        const pasteKey = extractPasteKey(item.pastebinLink)
        await deletePastebin(settings.apiKey, settings.userKey, pasteKey)
      } catch (e) {
        setDeleteError(e instanceof Error ? e.message : 'Delete failed')
        setDeleting(false)
        return
      }
    }
    removeFromHistory(item.id)
    setDeleteDialogOpen(false)
    navigate('/history')
  }

  const handleRemoveLocalOnly = () => {
    removeFromHistory(item.id)
    setDeleteDialogOpen(false)
    navigate('/history')
  }

  const handleOpenOnPastebin = () => {
    window.open(item.pastebinLink, '_blank', 'noopener,noreferrer')
    setDeleteDialogOpen(false)
  }

  const handleDecrypt = () => {
    const ciphertext = item.encText ?? ''
    window.dispatchEvent(new CustomEvent('securebin:load-for-decrypt', { detail: { ciphertext } }))
    navigate('/home')
  }

  const handleCopyShareLink = async () => {
    if (!hasPastebin || !item.key) return
    const pasteKey = extractPasteKey(item.pastebinLink)
    const shareLink = `https://securebin.org/view#key=${encodeURIComponent(item.key)}&paste=${pasteKey}`
    await navigator.clipboard.writeText(shareLink)
    setShareCopied(true)
    setTimeout(() => setShareCopied(false), 2000)
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title={headerTitle} subtitle={headerSubtitle} />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Error card with retry */}
        {isError && (
          <div className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 space-y-2">
            <p className="text-sm text-danger font-medium">Action Failed</p>
            <p className="text-xs text-text-secondary leading-snug">{item.pastebinLink.replace('Error: ', '')}</p>
            <button
              onClick={() => navigate('/home')}
              className="text-xs text-primary hover:underline"
            >
              ← Try again
            </button>
          </div>
        )}

        {hasPastebin && (
          <CopyBox label="Link" value={item.pastebinLink} openInNew />
        )}

        {item.encText && (
          <CopyBox label="Ciphertext" value={item.encText} multiline rows={6} />
        )}

        {item.key && (
          <CopyBox label="Passkey" value={item.key} masked />
        )}

        {/* Share link — only when we have both a paste URL and a key */}
        {hasPastebin && item.key && (
          <button
            onClick={handleCopyShareLink}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all',
              shareCopied
                ? 'border-success/30 bg-success/5 text-success'
                : 'border-border text-text-secondary hover:bg-surface-hover',
            )}
          >
            {shareCopied ? <Check size={14} /> : <Copy size={14} />}
            {shareCopied ? 'Share link copied!' : 'Copy Share Link'}
          </button>
        )}

        {/* Actions */}
        <div className="pt-2 space-y-2">
          <p className="text-xs font-semibold text-text-muted">
            Actions
          </p>
          {(hasPastebin || !hasPastebin) && (
            <button
              onClick={() => setDeleteDialogOpen(true)}
              className={cn(
                'w-full py-3 rounded-xl border text-sm font-semibold transition-colors',
                hasPastebin
                  ? 'border-danger/30 bg-danger/5 text-danger hover:bg-danger/10'
                  : 'border-border text-text-muted hover:bg-surface-hover',
              )}
            >
              {hasPastebin ? 'Delete From Pastebin' : 'Remove from History'}
            </button>
          )}
          {hasEncryption && (
            <button
              onClick={handleDecrypt}
              className="w-full py-3 rounded-xl border border-border bg-surface text-sm font-semibold text-primary hover:bg-surface-hover transition-colors"
            >
              Decrypt
            </button>
          )}
        </div>
      </div>

      {/* Delete dialog */}
      {deleteDialogOpen && (
        <div className="absolute inset-0 z-50 flex items-end bg-black/30" onClick={() => { if (!deleting) setDeleteDialogOpen(false) }}>
          <div
            className="w-full bg-surface rounded-t-2xl p-5 space-y-3 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="space-y-1">
              <p className="text-base font-semibold text-text-primary">Delete paste?</p>
              {deleteError && (
                <p className="text-xs text-danger bg-danger/5 border border-danger/20 rounded-lg px-3 py-2">{deleteError}</p>
              )}
              {canDeleteFromPastebin ? (
                <p className="text-sm text-text-muted leading-snug">
                  This will permanently delete the paste from Pastebin and remove it from your local history.
                </p>
              ) : hasPastebin ? (
                <p className="text-sm text-text-muted leading-snug">
                  You can remove this from your local history. To delete from Pastebin, sign in to your Pastebin account in Settings first.
                </p>
              ) : (
                <p className="text-sm text-text-muted leading-snug">
                  This will remove the item from your local history only.
                </p>
              )}
            </div>

            {canDeleteFromPastebin && (
              <button
                onClick={handleRemoveFromHistory}
                disabled={deleting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-danger/30 bg-danger/5 text-sm font-semibold text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
              >
                {deleting && <Loader2 size={14} className="animate-spin" />}
                {deleting ? 'Deleting…' : 'Delete from Pastebin + History'}
              </button>
            )}

            {hasPastebin && !canDeleteFromPastebin && (
              <button
                onClick={handleOpenOnPastebin}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-sm font-semibold text-text-primary hover:bg-surface-hover transition-colors"
              >
                <ExternalLink size={15} />
                Open on Pastebin to Delete
              </button>
            )}

            <button
              onClick={handleRemoveLocalOnly}
              disabled={deleting}
              className={cn(
                'w-full py-3 rounded-xl border text-sm font-semibold transition-colors',
                canDeleteFromPastebin
                  ? 'border-border text-text-muted hover:bg-surface-hover'
                  : 'border-danger/30 bg-danger/5 text-danger hover:bg-danger/10',
              )}
            >
              Remove from History Only
            </button>

            <button
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
              className="w-full py-2.5 rounded-xl text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
