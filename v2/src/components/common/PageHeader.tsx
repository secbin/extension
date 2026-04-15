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
    <div className="flex items-center border-b border-border bg-surface">
      {showBack && (
        <>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-12 h-12 shrink-0 text-text-secondary hover:text-text-primary hover:bg-surface-hover active:scale-95 transition-all"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="w-px self-stretch bg-border mx-1" />
        </>
      )}
      <div className="flex-1 flex flex-col items-center justify-center py-3.5 px-2 text-center">
        <h2 className="text-sm font-semibold text-text-primary leading-tight">{title}</h2>
        {subtitle && (
          <p className="text-xs text-text-muted leading-tight mt-0.5">{subtitle}</p>
        )}
      </div>
      {/* Spacer to visually balance the back button */}
      {showBack && <div className="w-14 shrink-0" />}
    </div>
  )
}
