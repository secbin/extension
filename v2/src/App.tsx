import { useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useStore, resolveTheme } from './lib/store'
import { cn } from './lib/cn'
import NavBar from './components/NavBar'
import Editor from './routes/Editor'
import Settings from './routes/Settings'
import History from './routes/History'
import Result from './routes/Result'
import ApiKeyConfig from './routes/ApiKeyConfig'
import EncConfig from './routes/EncConfig'
import Support from './routes/Support'
import PastebinAccount from './routes/PastebinAccount'
import CloudPasteDetail from './routes/CloudPasteDetail'

// Evaluated at call-time (not module load) so content/index.tsx has set the
// flag before any component renders, even though ES module imports hoist App
// before the content script's own code runs.
export const isInjected = () => !!(window as any).__SECUREBIN_INJECTED__;

// Routes we won't try to restore (transient pages)
const NON_RESTORABLE_ROUTES = new Set(['/', '/home', '/result'])

export default function App() {
  const { settings, initialized, initialize } = useStore()
  const isDark = resolveTheme(settings.theme) === 'dark'
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  // When theme is 'system', re-evaluate whenever the OS preference changes
  useEffect(() => {
    if (settings.theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      document.documentElement.classList.toggle('dark', mq.matches)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [settings.theme])

  // Restore last page on popup open (after settings are loaded)
  useEffect(() => {
    if (!initialized) return
    if (isInjected()) return
    const { page_timeout } = settings
    if (page_timeout === 0) return

    chrome.storage.session.get(['lastRoute', 'lastRouteTime'], (data) => {
      const lastRoute: string = data.lastRoute ?? ''
      const lastRouteTime: number = data.lastRouteTime ?? 0
      if (!lastRoute || NON_RESTORABLE_ROUTES.has(lastRoute)) return

      const ageMs = Date.now() - lastRouteTime
      if (page_timeout === -1 || ageMs < page_timeout * 1000) {
        navigate(lastRoute, { replace: true })
      }
    })
  }, [initialized])

  // Persist current route so we can restore it next time
  useEffect(() => {
    if (!initialized) return
    if (isInjected()) return
    chrome.storage.session.set({ lastRoute: location.pathname, lastRouteTime: Date.now() })
  }, [location.pathname, initialized])

  if (!initialized) {
    return (
      <div className={cn('h-full flex items-center justify-center', isDark && 'dark')}>
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full bg-surface text-text-primary')}>
      <NavBar />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Editor />} />
          <Route path="/home" element={<Editor />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/apikey" element={<ApiKeyConfig />} />
          <Route path="/encconfig" element={<EncConfig />} />
          <Route path="/support" element={<Support />} />
          <Route path="/history" element={<History />} />
          <Route path="/result" element={<Result />} />
          <Route path="/result/:index" element={<Result />} />
          <Route path="/pastebin-account" element={<PastebinAccount />} />
          <Route path="/cloud-paste" element={<CloudPasteDetail />} />
        </Routes>
      </main>
    </div>
  )
}
