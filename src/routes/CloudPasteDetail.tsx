import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { format, formatDistanceToNow, differenceInHours } from 'date-fns'
import { Globe, EyeOff, Lock, Loader2, ExternalLink, FileText, Trash2, Copy, Check, Link2, Clock } from 'lucide-react'
import { useStore, resolveTheme } from '@/lib/store'
import { getCachedPasteContent, deletePastebin, extractPasteKey, formatBytes, type PasteItem } from '@/lib/pastebin'
import { detectAction, isWithinLimit } from '@/lib/editor-utils'
import PageHeader from '@/components/common/PageHeader'
import CopyBox from '@/components/common/CopyBox'
import { cn } from '@/lib/cn'
import CodePreview from '@/components/common/CodePreview'

const PRIVACY_LABEL: Record<string, string> = { '0': 'Public', '1': 'Unlisted', '2': 'Private' }
const PRIVACY_ICON: Record<string, typeof Globe> = { '0': Globe, '1': EyeOff, '2': Lock }


export default function CloudPasteDetail() {
  const navigate = useNavigate()
  const location = useLocation()
  const paste: PasteItem = location.state?.paste
  const { settings, updateDraft } = useStore()
  const isDark = resolveTheme(settings.theme) === 'dark'

  const [content, setContent] = useState<string | null>(null)
  const [loadingContent, setLoadingContent] = useState(false)
  const [contentError, setContentError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [copied, setCopied] = useState<'content' | 'raw' | null>(null)

  useEffect(() => {
    if (!paste) return
    setLoadingContent(true)
    getCachedPasteContent(paste.key, paste.url)
      .then(text => setContent(text))
      .catch(e => setContentError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoadingContent(false))
  }, [paste?.key])

  if (!paste) {
    return (
      <>
        <PageHeader title="Paste" />
        <p className="px-4 py-8 text-sm text-text-muted text-center">Paste not found.</p>
      </>
    )
  }

  const PrivacyIcon = PRIVACY_ICON[paste.privacy] ?? Globe
  const date = paste.date ? format(new Date(Number(paste.date) * 1000), 'MMM d, yyyy · h:mm a') : ''
  const pasteKey = extractPasteKey(paste.url)

  // Expiry
  const expireTs = paste.expireDate ? Number(paste.expireDate) : 0
  const hasExpiry = expireTs > 0
  const expiryDate = hasExpiry ? new Date(expireTs * 1000) : null
  const expiryLabel = expiryDate ? formatDistanceToNow(expiryDate, { addSuffix: true }) : null
  const expiryUrgent = expiryDate ? differenceInHours(expiryDate, new Date()) < 24 : false

  const handleViewInEditor = () => {
    const url = paste.url
    const action = detectAction(url, settings.default_action)
    updateDraft({ plaintext: url, title: paste.title, format: paste.formatShort || 'text', action, buttonEnabled: isWithinLimit(url, action) })
    navigate('/home')
  }

  const handleDelete = async () => {
    setDeleting(true)
    setDeleteError('')
    try {
      await deletePastebin(settings.apiKey, settings.userKey, pasteKey)
      navigate(-1)
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'Delete failed')
      setDeleting(false)
    }
  }

  const handleCopyContent = async () => {
    if (!content) return
    await navigator.clipboard.writeText(content)
    setCopied('content')
    setTimeout(() => setCopied(null), 2000)
  }

  const handleCopyRaw = async () => {
    await navigator.clipboard.writeText(`https://pastebin.com/raw/${pasteKey}`)
    setCopied('raw')
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={paste.title}
        subtitle={`${PRIVACY_LABEL[paste.privacy] ?? ''} · ${paste.formatLong || paste.formatShort || 'Text'} · ${date}`}
      />

      <div className="flex-1 overflow-y-auto">
        {/* URL row */}
        <div className="px-4 pt-4 pb-3">
          <CopyBox label="Pastebin link" value={paste.url} openInNew />
        </div>

        {/* Content preview */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-text-secondary">Content</span>
            <div className="flex items-center gap-3">
              {content && (
                <>
                  <button
                    onClick={handleCopyRaw}
                    className={cn('flex items-center gap-1 text-xs transition-colors', copied === 'raw' ? 'text-success' : 'text-text-muted hover:text-text-secondary')}
                  >
                    {copied === 'raw' ? <Check size={12} /> : <Link2 size={12} />}
                    {copied === 'raw' ? 'Copied' : 'Raw URL'}
                  </button>
                  <button
                    onClick={handleCopyContent}
                    className={cn('flex items-center gap-1 text-xs transition-colors', copied === 'content' ? 'text-success' : 'text-text-muted hover:text-text-secondary')}
                  >
                    {copied === 'content' ? <Check size={12} /> : <Copy size={12} />}
                    {copied === 'content' ? 'Copied' : 'Copy'}
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="rounded-xl border border-border overflow-hidden min-h-24" style={{ backgroundColor: isDark ? '#2c313c' : '#f3f3f5' }}>
            {loadingContent && (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={18} className="animate-spin text-text-muted" />
              </div>
            )}
            {contentError && (
              <p className="px-3 py-3 text-xs text-danger">{contentError}</p>
            )}
            {content !== null && !loadingContent && (
              <CodePreview code={content} format={paste.formatShort || 'text'} isDark={isDark} />
            )}
          </div>
        </div>

        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-2 px-4 pb-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-secondary text-xs text-text-muted">
            <PrivacyIcon size={11} />
            {PRIVACY_LABEL[paste.privacy] ?? 'Unknown'}
          </div>
          {paste.formatLong && (
            <div className="px-2.5 py-1.5 rounded-lg bg-surface-secondary text-xs text-text-muted">
              {paste.formatLong}
            </div>
          )}
          {paste.size && (
            <div className="px-2.5 py-1.5 rounded-lg bg-surface-secondary text-xs text-text-muted">
              {formatBytes(paste.size)}
            </div>
          )}
          {paste.hits && (
            <div className="px-2.5 py-1.5 rounded-lg bg-surface-secondary text-xs text-text-muted">
              {paste.hits} views
            </div>
          )}
          {hasExpiry && expiryLabel && (
            <div className={cn(
              'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs',
              expiryUrgent
                ? 'bg-danger/10 text-danger'
                : 'bg-surface-secondary text-text-muted',
            )}>
              <Clock size={11} />
              Expires {expiryLabel}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-4 pb-4 space-y-2.5">
          <p className="text-xs font-semibold text-text-muted">Actions</p>

          <button
            onClick={() => window.open(paste.url, '_blank', 'noopener,noreferrer')}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-sm font-semibold text-text-primary hover:bg-surface-hover transition-colors"
          >
            <ExternalLink size={15} />
            Open on Pastebin
          </button>

          <button
            onClick={handleViewInEditor}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-sm font-semibold text-primary hover:bg-surface-hover transition-colors"
          >
            <FileText size={15} />
            Open in Editor
          </button>

          {deleteConfirm ? (
            <div className="space-y-2">
              {deleteError && (
                <p className="text-xs text-danger bg-danger/5 border border-danger/20 rounded-lg px-3 py-2">{deleteError}</p>
              )}
              <p className="text-xs text-text-muted text-center">Permanently delete from Pastebin?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-text-muted hover:bg-surface-hover transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-danger/30 bg-danger/5 text-sm font-semibold text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
                >
                  {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-danger/30 bg-danger/5 text-sm font-semibold text-danger hover:bg-danger/10 transition-colors"
            >
              <Trash2 size={15} />
              Delete from Pastebin
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
