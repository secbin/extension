import { CheckCircle2, XCircle, AlertCircle, Clock, FileText, History } from 'lucide-react'
import { cn } from '@/lib/cn'

type Variant = 'success' | 'error' | 'warning' | 'empty' | 'empty-history'

interface StatusBadgeProps {
  variant: Variant
  title: string
  subtitle?: string
  className?: string
}

const config: Record<Variant, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  success: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
  error: { icon: XCircle, color: 'text-danger', bg: 'bg-danger/10' },
  warning: { icon: AlertCircle, color: 'text-warning', bg: 'bg-warning/10' },
  empty: { icon: FileText, color: 'text-text-muted', bg: 'bg-surface-secondary' },
  'empty-history': { icon: History, color: 'text-text-muted', bg: 'bg-surface-secondary' },
}

export default function StatusBadge({ variant, title, subtitle, className }: StatusBadgeProps) {
  const { icon: Icon, color, bg } = config[variant]

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-6', className)}>
      <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center mb-4', bg)}>
        <Icon size={28} className={color} />
      </div>
      <p className={cn('text-sm font-semibold', color)}>{title}</p>
      {subtitle && (
        <p className="text-xs text-text-muted mt-1 text-center max-w-[240px]">{subtitle}</p>
      )}
    </div>
  )
}
