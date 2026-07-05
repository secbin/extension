import { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'

interface SettingsRowProps {
  label: string
  description?: string
  children?: ReactNode
  onClick?: () => void
  chevron?: boolean
  danger?: boolean
  className?: string
}

export default function SettingsRow({
  label,
  description,
  children,
  onClick,
  chevron = false,
  danger = false,
  className,
}: SettingsRowProps) {
  const Comp = onClick ? 'button' : 'div'

  return (
    <Comp
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors',
        onClick && 'hover:bg-surface-hover active:bg-surface-hover/80 cursor-pointer',
        danger && 'text-danger',
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <p className={cn('text-sm font-medium', danger && 'text-danger')}>{label}</p>
        {description && (
          <p className="text-xs text-text-muted mt-0.5 leading-snug">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {children}
        {chevron && <ChevronRight size={16} className="text-text-muted" />}
      </div>
    </Comp>
  )
}
