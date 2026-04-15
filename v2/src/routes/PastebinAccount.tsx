import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, User, CheckCircle2, Loader2 } from 'lucide-react'
import { useStore } from '@/lib/store'
import { loginPastebin, getUserDetails } from '@/lib/pastebin'
import PageHeader from '@/components/common/PageHeader'
import { cn } from '@/lib/cn'

export default function PastebinAccount() {
  const navigate = useNavigate()
  const { settings, setSettings, signOut } = useStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isLoggedIn = !!settings.userKey

  // Load fresh user details when already logged in
  useEffect(() => {
    if (!isLoggedIn) return
    getUserDetails(settings.apiKey, settings.userKey)
      .then(d => setSettings({ username: d.username }))
      .catch(() => {})
  }, [isLoggedIn])

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) return
    setLoading(true)
    setError('')
    try {
      const userKey = await loginPastebin(settings.apiKey, username.trim(), password.trim())
      const details = await getUserDetails(settings.apiKey, userKey)
      setSettings({ userKey, username: details.username })
      setPassword('')
      navigate('/settings')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = () => {
    signOut()
    navigate('/settings')
  }

  if (isLoggedIn) {
    return (
      <div className="flex flex-col h-full">
        <PageHeader title="Pastebin Account" subtitle="Connected" />
        <div className="flex-1 px-4 py-6 space-y-5">
          <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-surface-secondary/50">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User size={20} className="text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary">{settings.username || 'Pastebin User'}</p>
              <p className="text-xs text-text-muted flex items-center gap-1">
                <CheckCircle2 size={11} className="text-success" />
                Signed in
              </p>
            </div>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Signed in enables listing your pastes, deleting pastes directly, and creating private pastes.
          </p>
        </div>
        <div className="border-t border-border px-4 py-3">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-danger/30 bg-danger/5 text-sm font-semibold text-danger hover:bg-danger/10 transition-colors"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Pastebin Account" subtitle="Sign in" />
      <div className="flex-1 px-4 py-4 space-y-4">
        <p className="text-sm text-text-secondary leading-relaxed">
          Sign in to list, manage, and delete your Pastebin pastes directly from SecureBin. Your password is used only to obtain a session token and is never stored.
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              autoComplete="username"
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-surface focus:outline-none focus:border-primary transition-colors"
              placeholder="your_username"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              autoComplete="current-password"
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-surface focus:outline-none focus:border-primary transition-colors"
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-danger bg-danger/5 border border-danger/20 rounded-lg px-3 py-2 leading-snug">
            {error}
          </p>
        )}
      </div>

      <div className="border-t border-border px-4 py-3">
        <button
          onClick={handleLogin}
          disabled={loading || !username.trim() || !password.trim()}
          className={cn(
            'w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all',
            loading || !username.trim() || !password.trim()
              ? 'bg-surface-secondary text-text-muted cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary-hover active:scale-[0.98]',
          )}
        >
          {loading && <Loader2 size={15} className="animate-spin" />}
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </div>
    </div>
  )
}
