import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Copy, Check, Loader2, LogIn, Globe, EyeOff, Lock, Clock, Pencil, Send, KeyRound, ChevronDown, Trash2, AlertCircle } from 'lucide-react'
import { useStore, resolveTheme } from '@/lib/store'
import { EditorAction, hasCustomApiKey } from '@/lib/constants'
import { deletePastebin, extractPasteKey } from '@/lib/pastebin'
import PageHeader from '@/components/common/PageHeader'
import CopyBox from '@/components/common/CopyBox'
import CodePreview from '@/components/common/CodePreview'
import { cn } from '@/lib/cn'

const PRIVACY_LABEL: Record<string, string> = { '0': 'Public', '1': 'Unlisted', '2': 'Private' }
const PRIVACY_ICON: Record<string, typeof Globe> = { '0': Globe, '1': EyeOff, '2': Lock }
const EXPIRY_LABEL: Record<string, string> = {
  '10M': '10 min', '1H': '1 hr', '1D': '1 day', '1W': '1 week',
  '2W': '2 weeks', '1M': '1 month', '6M': '6 months', '1Y': '1 year',
}

const CODE_BG_LIGHT = '#f3f3f5'
const CODE_BG_DARK = '#2c313c'

export default function Result() {
  const { index } = useParams()
  const navigate = useNavigate()
  const { history, removeFromHistory, settings, updateDraft } = useStore()
  const isDark = resolveTheme(settings.theme) === 'dark'
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [shareCopied, setShareCopied] = useState(false)
  const [contentCopied, setContentCopied] = useState(false)
  const [postDropdownOpen, setPostDropdownOpen] = useState(false)

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
  const isDraft = item.action === EditorAction.SAVE_DRAFT
  const hasOwnApiKey = hasCustomApiKey(settings.apiKey)
  const canDeleteFromPastebin = hasPastebin && !!settings.userKey && !!hasOwnApiKey

  const headerTitle = item.title
    || (hasEncryption ? `${(item.keyLength ?? 16) * 8}-bit ${item.encMode}` : hasPastebin ? 'Pastebin Paste' : item.action === EditorAction.SAVE_DRAFT ? 'Draft' : 'Result')
  const headerSubtitle = format(new Date(item.date), 'h:mm a, MMMM d, yyyy')

  // Metadata chips: show privacy, format, expiry when relevant
  const PrivacyIcon = item.privacy ? (PRIVACY_ICON[item.privacy] ?? Globe) : null
  const showMeta = hasPastebin && (item.format || item.privacy || item.expiry)
  const contentFormat = hasEncryption ? 'text' : (item.format || 'text')

  const handleRemoveFromHistory = async () => {
    if (canDeleteFromPastebin) {
      setDeleting(true)
      setDeleteError('')
      try {
        await deletePastebin(settings.apiKey, settings.userKey, extractPasteKey(item.pastebinLink))
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

  // Load draft content into editor with the chosen action, then navigate to editor
  const handleOpenInEditor = (action?: EditorAction) => {
    const text = item.encText ?? ''
    if (!text) return
    updateDraft({
      plaintext: text,
      title: item.title || '',
      format: item.format || 'text',
      expiry: item.expiry || 'N',
      privacy: (item.privacy as '0' | '1') || '0',
      action: action ?? settings.default_action,
      buttonEnabled: true,
    })
    navigate('/home')
  }

  const handleCopyContent = async () => {
    if (!item.encText) return
    await navigator.clipboard.writeText(item.encText)
    setContentCopied(true)
    setTimeout(() => setContentCopied(false), 2000)
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title={headerTitle} subtitle={headerSubtitle} />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Error card */}
        {isError && (
          <div className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle size={16} className="text-danger shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-danger font-semibold leading-none mb-1">Action Failed</p>
                <p className="text-xs text-text-secondary leading-snug">{item.pastebinLink.replace('Error: ', '')}</p>
              </div>
            </div>
            {item.encText && (
              <button
                onClick={() => handleOpenInEditor()}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-danger/20 text-sm font-semibold text-danger hover:bg-danger/10 transition-colors"
              >
                <Pencil size={14} />
                Open in Editor
              </button>
            )}
          </div>
        )}

        {/* Paste link */}
        {hasPastebin && <CopyBox label="Link" value={item.pastebinLink} openInNew large />}

        {/* Metadata chips — privacy, format, expiry */}
        {showMeta && (
          <div className="flex flex-wrap items-center gap-2">
            {item.privacy && PrivacyIcon && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-secondary text-xs text-text-muted">
                <PrivacyIcon size={11} />
                {PRIVACY_LABEL[item.privacy] ?? 'Public'}
              </div>
            )}
            {item.format && item.format !== 'text' && (
              <div className="px-2.5 py-1.5 rounded-lg bg-surface-secondary text-xs text-text-muted">
                {item.format}
              </div>
            )}
            {item.expiry && item.expiry !== 'N' && EXPIRY_LABEL[item.expiry] && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-secondary text-xs text-text-muted">
                <Clock size={11} />
                {EXPIRY_LABEL[item.expiry]}
              </div>
            )}
          </div>
        )}

        {/* Content / Ciphertext — read-only CodePreview with copy button */}
        {item.encText && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-text-secondary">
                {hasEncryption ? 'Ciphertext' : 'Content'}
              </label>
              <button
                onClick={handleCopyContent}
                className={cn(
                  'flex items-center gap-1 text-xs transition-colors',
                  contentCopied ? 'text-success' : 'text-text-muted hover:text-text-secondary',
                )}
              >
                {contentCopied ? <Check size={12} /> : <Copy size={12} />}
                {contentCopied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div
              className="rounded-xl border border-border overflow-hidden"
              style={{ backgroundColor: isDark ? CODE_BG_DARK : CODE_BG_LIGHT }}
            >
              <CodePreview
                code={item.encText}
                format={contentFormat}
                isDark={isDark}
                maxHeight="200px"
                showGutter
              />
            </div>
          </div>
        )}

        {/* Passkey */}
        {item.key && <CopyBox label="Passkey" value={item.key} masked />}

        {/* Share link */}
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
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.06em]">Actions</p>

          {isDraft ? (
            /* Draft-specific actions: Edit + Post split button */
            <>
              {/* Edit — primary action, opens in editor */}
              <button
                onClick={() => handleOpenInEditor()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all"
              >
                <Pencil size={15} />
                Edit
              </button>

              {/* Post split button */}
              <div className="relative flex items-stretch">
                <button
                  onClick={() => handleOpenInEditor(EditorAction.POST_PASTEBIN)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-l-full border border-border text-sm font-semibold text-text-secondary hover:bg-surface-hover transition-colors"
                >
                  <Send size={15} />
                  Post to Pastebin
                </button>
                <button
                  onClick={() => setPostDropdownOpen(v => !v)}
                  className="flex items-center px-3.5 py-3 rounded-r-full border border-l-0 border-border text-text-muted hover:bg-surface-hover transition-colors"
                >
                  <ChevronDown size={15} className={cn('transition-transform', postDropdownOpen && 'rotate-180')} />
                </button>
                {postDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setPostDropdownOpen(false)} />
                    <div
                      className="absolute right-0 top-full mt-2 z-50 w-52 py-1.5 rounded-xl border border-border bg-surface animate-in fade-in slide-in-from-top-1 duration-150"
                      style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)' }}
                    >
                      <button
                        onClick={() => { handleOpenInEditor(EditorAction.POST_PASTEBIN); setPostDropdownOpen(false) }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-surface-hover transition-colors"
                      >
                        <Send size={14} className="text-success" />
                        Post to Pastebin
                      </button>
                      <button
                        onClick={() => { handleOpenInEditor(EditorAction.ENCRYPT_PASTEBIN); setPostDropdownOpen(false) }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-surface-hover transition-colors"
                      >
                        <KeyRound size={14} className="text-primary" />
                        Encrypt & Post
                      </button>
                      <button
                        onClick={() => { handleOpenInEditor(EditorAction.ENCRYPT); setPostDropdownOpen(false) }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-surface-hover transition-colors"
                      >
                        <Lock size={14} className="text-primary" />
                        Encrypt Only
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Delete draft */}
              <button
                onClick={handleRemoveLocalOnly}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-danger/30 bg-danger/5 text-sm font-semibold text-danger hover:bg-danger/10 transition-colors"
              >
                <Trash2 size={15} />
                Delete Draft
              </button>
            </>
          ) : (
            /* Non-draft actions */
            <>
              {hasEncryption && (
                <button
                  onClick={handleDecrypt}
                  className="w-full py-3 rounded-xl border border-border bg-surface text-sm font-semibold text-primary hover:bg-surface-hover transition-colors"
                >
                  Decrypt
                </button>
              )}
              {canDeleteFromPastebin && (
                <button
                  onClick={() => setDeleteDialogOpen(true)}
                  className="w-full py-3 rounded-xl border border-danger/30 bg-danger/5 text-sm font-semibold text-danger hover:bg-danger/10 transition-colors"
                >
                  Delete From Pastebin
                </button>
              )}
              <button
                onClick={canDeleteFromPastebin ? () => setDeleteDialogOpen(true) : handleRemoveLocalOnly}
                className="w-full py-3 rounded-xl border border-border text-sm font-semibold text-text-muted hover:bg-surface-hover transition-colors"
              >
                Remove from History
              </button>
              {hasPastebin && !settings.userKey && (
                <button
                  onClick={() => navigate('/pastebin-account')}
                  className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-text-muted hover:text-primary transition-colors"
                >
                  <LogIn size={12} />
                  Sign in to Pastebin to manage this paste
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete confirmation sheet */}
      {deleteDialogOpen && (
        <div className="absolute inset-0 z-50 flex items-end bg-black/30" onClick={() => { if (!deleting) setDeleteDialogOpen(false) }}>
          <div className="w-full bg-surface rounded-t-2xl p-5 space-y-3 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="space-y-1">
              <p className="text-base font-semibold text-text-primary">Delete paste?</p>
              {deleteError && (
                <p className="text-xs text-danger bg-danger/5 border border-danger/20 rounded-lg px-3 py-2">{deleteError}</p>
              )}
              {canDeleteFromPastebin ? (
                <p className="text-sm text-text-muted leading-snug">
                  This will permanently delete the paste from Pastebin and remove it from your local history.
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
