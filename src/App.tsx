import { useEffect, useCallback, useRef } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useStore, resolveTheme, type HistoryItem } from './lib/store'
import { panelBus, emitPanelEvent } from './lib/panel-bus'
import { EditorAction } from './lib/constants'
import { detectAction } from './lib/editor-utils'
import { detectLanguage } from './lib/detect-language'
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
import PasteNameConfig from './routes/PasteNameConfig'
import QuickPostLoading from './routes/QuickPostLoading'
import DecryptResult from './routes/DecryptResult'

// Evaluated at call-time (not module load) so content/index.tsx has set the
// flag before any component renders, even though ES module imports hoist App
// before the content script's own code runs.
export const isInjected = () => !!(window as any).__SECUREBIN_INJECTED__;

// Routes we won't try to restore (transient pages)
const NON_RESTORABLE_ROUTES = new Set(['/', '/home', '/result', '/quick-post-loading', '/decrypted'])

export default function App() {
  const { settings, initialized, initialize, addToHistory, updateDraft, setDecryptResult } = useStore()
  const isDark = resolveTheme(settings.theme) === 'dark'
  const navigate = useNavigate()
  const location = useLocation()
  // Current location for listeners that must not re-register on route change
  const locationRef = useRef(location)
  useEffect(() => { locationRef.current = location }, [location])

  useEffect(() => {
    initialize()
  }, [initialize])

  // Handle quick-post result from background context menu action
  const handleQuickPostResult = useCallback((detail: { url: string | null; error: string | null; text: string }) => {
    const item: HistoryItem = {
      id: Date.now().toString(),
      action: EditorAction.POST_PASTEBIN,
      pastebinLink: detail.url ?? `Error: ${detail.error ?? 'Post failed'}`,
      encText: detail.text,
      key: null,
      encMode: null,
      keyLength: null,
      date: Date.now(),
      title: 'Quick Post',
      format: 'text',
      privacy: '0',
      expiry: 'N',
    }
    addToHistory(item)
    // Auto-copy the URL to clipboard so the user can paste it immediately
    if (detail.url) {
      navigator.clipboard.writeText(detail.url).catch(() => {})
    }
    navigate('/result/0', { replace: true })
  }, [addToHistory, navigate])

  // Handle text injected by context menu ("Open in Editor")
  // Lives in App.tsx so it works regardless of which route is active
  const handleSetText = useCallback((text: string) => {
    if (!text) return
    const action = detectAction(text, settings.default_action)
    // Auto-detect code language so the editor opens in the right mode
    const format = text.length > 80 ? detectLanguage(text) : 'text'
    updateDraft({ plaintext: text, format, formatLocked: false, action })
    navigate('/home')
  }, [settings.default_action, updateDraft, navigate])

  // Injected mode: event from content script
  useEffect(() => {
    const handler = (e: Event) => handleSetText((e as CustomEvent).detail ?? '')
    panelBus.addEventListener('securebin:set-text', handler)
    return () => panelBus.removeEventListener('securebin:set-text', handler)
  }, [handleSetText])

  // Quick-post: show loading overlay while background makes the API call
  useEffect(() => {
    const handler = () => navigate('/quick-post-loading', { replace: true })
    panelBus.addEventListener('securebin:quick-post-loading', handler)
    return () => panelBus.removeEventListener('securebin:quick-post-loading', handler)
  }, [navigate])

  // Quick-post result — injected mode
  useEffect(() => {
    const handler = (e: Event) => handleQuickPostResult((e as CustomEvent).detail)
    panelBus.addEventListener('securebin:quick-post-result', handler)
    return () => panelBus.removeEventListener('securebin:quick-post-result', handler)
  }, [handleQuickPostResult])

  // Injected mode: the panel is only hidden, never unmounted, so drop the
  // decrypted plaintext when it closes — reopening must not reveal it.
  useEffect(() => {
    const handler = () => {
      setDecryptResult(null)
      if (locationRef.current.pathname === '/decrypted') {
        navigate('/home', { replace: true })
      }
    }
    panelBus.addEventListener('securebin:panel-hidden', handler)
    return () => panelBus.removeEventListener('securebin:panel-hidden', handler)
  }, [setDecryptResult, navigate])

  // Injected mode: the content script buffers app-bound events (quick-post
  // loading, pending text) until this signal — declared after the listener
  // effects above so they are registered before any buffered event replays.
  useEffect(() => {
    if (initialized && isInjected()) {
      emitPanelEvent('securebin:app-ready')
    }
  }, [initialized])

  // Popup mode: read pending data from session after init. Injected mode gets
  // this via window events instead — content scripts can't read session storage.
  useEffect(() => {
    if (!initialized || isInjected()) return
    chrome.storage.session.get(['pendingQuickPost', 'pendingText'], (data) => {
      if (data.pendingQuickPost) {
        chrome.storage.session.remove(['pendingQuickPost'])
        handleQuickPostResult(data.pendingQuickPost)
      } else if (data.pendingText?.text) {
        chrome.storage.session.remove(['pendingText'])
        handleSetText(data.pendingText.text)
      }
    })
  }, [initialized, handleQuickPostResult, handleSetText])

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
          <Route path="/paste-name" element={<PasteNameConfig />} />
          <Route path="/quick-post-loading" element={<QuickPostLoading />} />
          <Route path="/decrypted" element={<DecryptResult />} />
        </Routes>
      </main>
    </div>
  )
}
