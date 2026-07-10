import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Copy, Check, Unlock, Pencil } from 'lucide-react'
import { useStore, resolveTheme } from '@/lib/store'
import { detectLanguage } from '@/lib/detect-language'
import { detectAction } from '@/lib/editor-utils'
import PageHeader from '@/components/common/PageHeader'
import CodePreview from '@/components/common/CodePreview'
import { cn } from '@/lib/cn'

const CODE_BG_LIGHT = '#f3f3f5'
const CODE_BG_DARK = '#2c313c'

export default function DecryptResult() {
  const navigate = useNavigate()
  const { decryptResult, settings, updateDraft } = useStore()
  const isDark = resolveTheme(settings.theme) === 'dark'
  const [copied, setCopied] = useState(false)

  if (!decryptResult) {
    return (
      <>
        <PageHeader title="Decrypted" />
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <p className="text-sm text-text-muted">Nothing to display.</p>
        </div>
      </>
    )
  }

  const { plaintext, date } = decryptResult
  const contentFormat = plaintext.length > 80 ? detectLanguage(plaintext) : 'text'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(plaintext)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOpenInEditor = () => {
    updateDraft({
      plaintext,
      format: contentFormat,
      formatLocked: false,
      action: detectAction(plaintext, settings.default_action),
    })
    navigate('/home')
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Decrypted" subtitle={format(new Date(date), 'h:mm a, MMMM d, yyyy')} />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Success banner */}
        <div className="flex items-center gap-2.5 rounded-xl border border-success/20 bg-success/5 px-4 py-3">
          <Unlock size={15} className="text-success shrink-0" />
          <p className="text-sm text-success font-medium leading-snug">Decrypted successfully</p>
        </div>

        {/* Decrypted content */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-text-secondary">Content</label>
            <button
              onClick={handleCopy}
              className={cn(
                'flex items-center gap-1 text-xs transition-colors',
                copied ? 'text-success' : 'text-text-muted hover:text-text-secondary',
              )}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div
            className="rounded-xl border border-border overflow-hidden"
            style={{ backgroundColor: isDark ? CODE_BG_DARK : CODE_BG_LIGHT }}
          >
            <CodePreview
              code={plaintext}
              format={contentFormat}
              isDark={isDark}
              maxHeight="280px"
              showGutter
            />
          </div>
          <p className="text-[11px] text-text-muted/70 leading-snug">
            Shown only here — decrypted content is never saved to history.
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2 space-y-2">
          <button
            onClick={handleCopy}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all',
              copied
                ? 'border border-success/30 bg-success/5 text-success'
                : 'bg-primary text-white hover:bg-primary-hover active:scale-[0.98]',
            )}
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Copied!' : 'Copy Content'}
          </button>
          <button
            onClick={handleOpenInEditor}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-sm font-semibold text-text-secondary hover:bg-surface-hover transition-colors"
          >
            <Pencil size={15} />
            Open in Editor
          </button>
        </div>
      </div>
    </div>
  )
}
