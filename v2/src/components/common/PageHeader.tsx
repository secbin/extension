import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
}

export default function PageHeader({ title, subtitle, showBack = true }: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface-secondary/50">
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 -ml-1.5 rounded-lg hover:bg-surface-hover active:scale-95 transition-all text-text-muted hover:text-text-primary"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      <div className="min-w-0">
        <h2 className="text-sm font-semibold truncate">{title}</h2>
        {subtitle && (
          <p className="text-xs text-text-muted truncate">{subtitle}</p>
        )}
      </div>
    </div>
  )
}
