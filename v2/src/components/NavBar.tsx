import { useNavigate, useLocation } from 'react-router-dom'
import { PenLine, Clock, Settings } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useStore } from '@/lib/store'

export default function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const isDark = useStore((s) => s.settings.theme === 'dark')

  const navItems = [
    { icon: PenLine, path: '/home', label: 'Editor' },
    { icon: Clock, path: '/history', label: 'History' },
    { icon: Settings, path: '/settings', label: 'Settings' },
  ]

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface/80 backdrop-blur-xl">
      <div className="flex items-center">
        <img
          src={isDark ? '/securebinlogo_dark.svg' : '/securebinlogo.svg'}
          alt="SecureBin"
          className="h-5"
        />
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
      </nav>
    </header>
  )
}
