import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Moon, Sun, SunMoon, Shield, Key, HelpCircle, Trash2, RotateCcw, Send, KeyRound, Lock, Download, UserCircle, ChevronDown } from 'lucide-react'
import { useStore } from '@/lib/store'
import { EditorAction } from '@/lib/constants'
import SettingsRow from '@/components/common/SettingsRow'
import ConfirmDialog from '@/components/dialog/ConfirmDialog'
import { cn } from '@/lib/cn'

const PAGE_TIMEOUT_OPTIONS = [
  { label: 'Never', value: 0 },
  { label: '30 seconds', value: 30 },
  { label: 'Always', value: -1 },
]

const DEFAULT_ACTION_OPTIONS: {
  value: EditorAction
  label: string
  description: string
  icon: typeof Send
}[] = [
  {
    value: EditorAction.POST_PASTEBIN,
    label: 'Post to Pastebin',
    description: 'Upload plain text directly — no encryption',
    icon: Send,
  },
  {
    value: EditorAction.ENCRYPT_PASTEBIN,
    label: 'Encrypt & Post',
    description: 'Encrypt locally, then upload to Pastebin',
    icon: KeyRound,
  },
  {
    value: EditorAction.ENCRYPT,
    label: 'Encrypt Only',
    description: 'Encrypt without uploading anywhere',
    icon: Lock,
  },
]

export default function Settings() {
  const navigate = useNavigate()
  const { settings, setSettings, clearHistory, resetSettings, history, signOut } = useStore()
  const [clearHistoryOpen, setClearHistoryOpen] = useState(false)
  const [resetSettingsOpen, setResetSettingsOpen] = useState(false)
  const [pageTimeoutOpen, setPageTimeoutOpen] = useState(false)

  const hasApiKey = settings.apiKey && settings.apiKey !== atob('MmU1OGNlMjcyMzllMzRhNzdjNWVmNjVkYmVhOGIyNGQ=')

  const THEME_OPTIONS: { value: 'light' | 'dark' | 'system'; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: SunMoon },
  ]

  return (
    <div className="divide-y divide-border">
      {/* Appearance */}
      <div className="py-1">
        <p className="px-4 pt-4 pb-1 text-xs font-semibold text-text-muted">
          Appearance
        </p>
        <div className="px-4 pt-1 pb-3">
          <p className="text-sm font-medium text-text-primary mb-2">Theme</p>
          <div className="flex gap-2">
            {THEME_OPTIONS.map(opt => {
              const Icon = opt.icon
              const isSelected = settings.theme === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setSettings({ theme: opt.value })}
                  className={cn(
                    'flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all',
                    isSelected
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-text-muted hover:border-border-hover hover:bg-surface-hover',
                  )}
                >
                  <Icon size={16} />
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="py-1">
        <p className="px-4 pt-4 pb-1 text-xs font-semibold text-text-muted">
          Security
        </p>
        <SettingsRow
          label="Encryption"
          description={`${settings.encMode} · ${settings.keyLength * 8}-bit`}
          onClick={() => navigate('/encconfig')}
          chevron
        >
          <Shield size={16} className="text-text-muted" />
        </SettingsRow>
        <SettingsRow
          label="Pastebin API Key"
          description={hasApiKey ? 'Configured' : 'Not set'}
          onClick={() => navigate('/apikey')}
          chevron
        >
          <Key size={16} className={hasApiKey ? 'text-success' : 'text-text-muted'} />
        </SettingsRow>
        <SettingsRow
          label={settings.userKey ? `Signed in as ${settings.username || 'Pastebin User'}` : 'Pastebin Account'}
          description={settings.userKey ? 'Tap to manage or sign out' : 'Sign in to manage your pastes'}
          onClick={() => navigate('/pastebin-account')}
          chevron
        >
          <UserCircle size={16} className={settings.userKey ? 'text-success' : 'text-text-muted'} />
        </SettingsRow>
      </div>

      {/* Editor */}
      <div className="py-1">
        <p className="px-4 pt-4 pb-1 text-xs font-semibold text-text-muted">
          Editor
        </p>

        {/* Default Action — custom option cards */}
        <div className="px-4 pt-2 pb-3 space-y-1.5">
          <p className="text-sm font-medium text-text-primary">Default Action</p>
          {DEFAULT_ACTION_OPTIONS.map((opt) => {
            const Icon = opt.icon
            const isSelected = settings.default_action === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => setSettings({ default_action: opt.value })}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-border-hover hover:bg-surface-hover',
                )}
              >
                <div className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                  isSelected ? 'bg-primary/15' : 'bg-surface-secondary',
                )}>
                  <Icon size={14} className={isSelected ? 'text-primary' : 'text-text-muted'} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn('text-sm font-medium leading-none mb-0.5', isSelected && 'text-primary')}>
                    {opt.label}
                  </p>
                  <p className="text-[11px] text-text-muted leading-tight">{opt.description}</p>
                </div>
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                )}
              </button>
            )
          })}
        </div>

        <div className="w-full flex items-start justify-between gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Remember Last Page</p>
            <p className="text-xs text-text-muted mt-0.5 leading-snug">
              {settings.page_timeout === 0
                ? 'Always opens on the editor'
                : settings.page_timeout === -1
                  ? 'Always returns to the last viewed page'
                  : 'Returns to the last page if reopened within 30 seconds'}
            </p>
          </div>
          <div className="relative shrink-0">
            <button
              onClick={() => setPageTimeoutOpen(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface-secondary text-xs text-text-primary hover:bg-surface-hover transition-colors"
            >
              {PAGE_TIMEOUT_OPTIONS.find(o => o.value === settings.page_timeout)?.label ?? 'Never'}
              <ChevronDown size={12} className={cn('transition-transform', pageTimeoutOpen && 'rotate-180')} />
            </button>
            {pageTimeoutOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setPageTimeoutOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 w-40 py-1.5 rounded-xl border border-border bg-surface animate-in fade-in slide-in-from-top-1 duration-150" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)' }}>
                  <p className="px-3 pt-1 pb-1 text-[10px] font-semibold text-text-muted">Restore on open</p>
                  <div className="mx-3 mb-1 border-t border-border" />
                  {PAGE_TIMEOUT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setSettings({ page_timeout: opt.value }); setPageTimeoutOpen(false) }}
                      className={cn(
                        'w-full flex items-center px-3 py-2 text-sm text-left transition-colors',
                        settings.page_timeout === opt.value
                          ? 'text-primary font-medium'
                          : 'text-text-primary hover:bg-surface-hover',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Help */}
      <div className="py-1">
        <p className="px-4 pt-4 pb-1 text-xs font-semibold text-text-muted">
          Help
        </p>
        <SettingsRow
          label="Support & FAQ"
          onClick={() => navigate('/support')}
          chevron
        >
          <HelpCircle size={16} className="text-text-muted" />
        </SettingsRow>
      </div>

      {/* Data */}
      <div className="py-1">
        <p className="px-4 pt-4 pb-1 text-xs font-semibold text-text-muted">
          Data
        </p>
        <SettingsRow
          label="Export History"
          description="Download as JSON"
          onClick={() => {
            const data = JSON.stringify(history, null, 2)
            const blob = new Blob([data], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `securebin-history-${new Date().toISOString().slice(0, 10)}.json`
            a.click()
            URL.revokeObjectURL(url)
          }}
        >
          <Download size={16} className="text-text-muted" />
        </SettingsRow>
        <SettingsRow
          label="Clear History"
          description={`${history.length} item${history.length !== 1 ? 's' : ''}`}
          onClick={() => setClearHistoryOpen(true)}
          danger
        >
          <Trash2 size={16} className="text-danger/60" />
        </SettingsRow>
        <SettingsRow
          label="Reset All Settings"
          description="Restore defaults on this and synced devices"
          onClick={() => setResetSettingsOpen(true)}
          danger
        >
          <RotateCcw size={16} className="text-danger/60" />
        </SettingsRow>
      </div>

      <ConfirmDialog
        open={clearHistoryOpen}
        title="Clear History"
        description={`This will permanently delete ${history.length} history item${history.length !== 1 ? 's' : ''}. This action cannot be undone.`}
        confirmLabel="Clear All"
        onConfirm={() => { clearHistory(); setClearHistoryOpen(false) }}
        onCancel={() => setClearHistoryOpen(false)}
      />

      <ConfirmDialog
        open={resetSettingsOpen}
        title="Reset Settings"
        description="All settings will be reset to defaults on this device and all synced devices. This cannot be undone."
        confirmLabel="Reset"
        onConfirm={() => { resetSettings(); setResetSettingsOpen(false) }}
        onCancel={() => setResetSettingsOpen(false)}
      />
    </div>
  )
}
