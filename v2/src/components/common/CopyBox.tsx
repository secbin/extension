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

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative group rounded-xl border border-border bg-surface-secondary/50 overflow-hidden transition-colors hover:border-border-hover">
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
            className="w-full pl-3 pr-20 py-2.5 text-[13px] font-mono bg-transparent focus:outline-none text-text-primary"
          />
        )}
        <div className={cn(
          'absolute flex items-center gap-0.5',
          multiline ? 'top-1.5 right-1.5' : 'top-1/2 -translate-y-1/2 right-1.5',
        )}>
          {masked && (
            <button
              onClick={() => setVisible(!visible)}
              className="p-1.5 rounded-md text-text-muted hover:text-text-secondary hover:bg-surface-hover transition-all"
              title={visible ? 'Hide' : 'Show'}
            >
              {visible ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          )}
          {openInNew && (
            <button
              onClick={handleOpenNew}
              className="p-1.5 rounded-md text-text-muted hover:text-text-secondary hover:bg-surface-hover transition-all"
              title="Open in new tab"
            >
              <ExternalLink size={14} />
            </button>
          )}
          {allowCopy && (
            <button
              onClick={handleCopy}
              className={cn(
                'p-1.5 rounded-md transition-all',
                copied
                  ? 'text-success'
                  : 'text-text-muted hover:text-text-secondary hover:bg-surface-hover',
              )}
              title={copied ? 'Copied!' : 'Copy'}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
