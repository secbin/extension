import { useNavigate, useLocation } from 'react-router-dom'
import { PenLine, Files, Settings, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useStore, resolveTheme } from '@/lib/store'
import { emitPanelEvent } from '@/lib/panel-bus'
import { isInjected } from '../App'
import SecurebinLogo from './common/SecurebinLogo'

export default function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const isDark = useStore((s) => resolveTheme(s.settings.theme) === 'dark')

  const navItems = [
    { icon: PenLine, path: '/home', label: 'Editor' },
    { icon: Files, path: '/history', label: 'Pastes' },
    { icon: Settings, path: '/settings', label: 'Settings' },
  ]

  return (
    <header className={cn('flex items-center justify-between border-b border-border bg-surface', isInjected() ? 'px-5 py-3' : 'px-4 py-3')}>
      <div className="flex items-center">
        {isInjected() ? (
          <SecurebinLogo darkmode={isDark} />
        ) : (
          <img
            src={isDark ? '/securebinlogo_dark.svg' : '/securebinlogo.svg'}
            alt="securebin"
            className="h-5"
          />
        )}
      </div>
      <nav className="flex items-center gap-1">
        {navItems.map(({ icon: Icon, path, label }) => {
          const isActive = location.pathname === path || (path === '/home' && location.pathname === '/')
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                'p-2 rounded-lg transition-all duration-150',
                'hover:bg-surface-hover active:scale-95',
                isActive
                  ? 'text-primary bg-primary-light/50'
                  : 'text-text-muted hover:text-text-secondary',
              )}
              title={label}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
            </button>
          )
        })}
        {isInjected() && (
          <button
            onClick={() => emitPanelEvent('securebin:close')}
            className="p-2 rounded-lg text-text-muted hover:text-text-secondary hover:bg-surface-hover transition-all duration-150"
            title="Close"
          >
            <X size={18} />
          </button>
        )}
      </nav>
    </header>
  )
}
