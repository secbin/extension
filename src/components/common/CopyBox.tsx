import { useState, useCallback } from 'react'
import { Copy, Check, ExternalLink, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/cn'

interface CopyBoxProps {
  label?: string
  value: string
  multiline?: boolean
  rows?: number
  masked?: boolean
  allowCopy?: boolean
  openInNew?: boolean
  large?: boolean
  className?: string
}

export default function CopyBox({
  label,
  value,
  multiline = false,
  rows = 4,
  masked = false,
  allowCopy = true,
  openInNew = false,
  large = false,
  className,
}: CopyBoxProps) {
  const [copied, setCopied] = useState(false)
  const [visible, setVisible] = useState(!masked)

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [value])

  const handleOpenNew = useCallback(() => {
    window.open(value, '_blank', 'noopener,noreferrer')
  }, [value])

  // Single-line URL boxes get the external link inside the right of the box
  const inlineOpen = openInNew && !multiline && !masked

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between">
        {label && (
          <label className="text-xs font-medium text-text-secondary">
            {label}
          </label>
        )}
        <div className="flex items-center gap-2 ml-auto">
          {masked && (
            <button
              onClick={() => setVisible(!visible)}
              className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              {visible ? <EyeOff size={13} /> : <Eye size={13} />}
              {visible ? 'Hide' : 'Show'}
            </button>
          )}
          {openInNew && (multiline || masked) && (
            <button
              onClick={handleOpenNew}
              className="p-1 rounded text-text-muted hover:text-text-secondary transition-colors"
              title="Open in new tab"
            >
              <ExternalLink size={13} />
            </button>
          )}
          {allowCopy && (
            <button
              onClick={handleCopy}
              className={cn(
                'flex items-center gap-1 text-xs transition-colors',
                copied ? 'text-success' : 'text-text-muted hover:text-text-secondary',
              )}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>
      </div>
      <div className="relative rounded-xl border border-border bg-surface-secondary/50 overflow-hidden transition-colors hover:border-border-hover">
        {multiline ? (
          <textarea
            readOnly
            value={value}
            rows={rows}
            className="w-full px-3 py-2.5 text-[13px] font-mono bg-transparent resize-none focus:outline-none text-text-primary"
          />
        ) : (
          <input
            readOnly
            type={visible ? 'text' : 'password'}
            value={value}
            className={cn(
              'w-full py-2.5 bg-transparent focus:outline-none text-text-primary font-mono',
              large ? 'text-[15px] font-semibold px-3' : 'text-[13px] px-3',
              inlineOpen && 'pr-9',
            )}
          />
        )}
        {/* Inline open-in-browser: right side with fade */}
        {inlineOpen && (
          <>
            {/* Gradient fades URL into the button */}
            <div
              className="absolute right-8 top-0 bottom-0 w-8 pointer-events-none"
              style={{ background: 'linear-gradient(to right, transparent, var(--color-surface-secondary))' }}
            />
            <button
              onClick={handleOpenNew}
              className="absolute right-0 top-0 bottom-0 flex items-center px-2.5 text-text-muted hover:text-primary transition-colors z-10"
              title="Open in browser"
            >
              <ExternalLink size={13} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
