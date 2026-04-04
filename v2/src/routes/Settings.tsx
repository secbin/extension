import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Moon, Sun, Shield, Key, HelpCircle, Trash2, RotateCcw, Navigation, Send, KeyRound, Lock } from 'lucide-react'
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
  const { settings, setSettings, toggleTheme, clearHistory, resetSettings, history } = useStore()
  const [clearHistoryOpen, setClearHistoryOpen] = useState(false)
  const [resetSettingsOpen, setResetSettingsOpen] = useState(false)

  const isDark = settings.theme === 'dark'
  const hasApiKey = settings.apiKey && settings.apiKey !== atob('MmU1OGNlMjcyMzllMzRhNzdjNWVmNjVkYmVhOGIyNGQ=')

  return (
    <div className="divide-y divide-border">
      {/* Appearance */}
      <div className="py-1">
        <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
          Appearance
        </p>
        <SettingsRow
          label={isDark ? 'Dark Mode' : 'Light Mode'}
          description="Toggle between light and dark themes"
          onClick={toggleTheme}
        >
          <div className="p-1.5 rounded-lg bg-surface-secondary">
            {isDark ? <Moon size={16} className="text-primary" /> : <Sun size={16} className="text-warning" />}
          </div>
        </SettingsRow>
      </div>

      {/* Security */}
      <div className="py-1">
        <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
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
      </div>

      {/* Editor */}
      <div className="py-1">
        <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
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

        <SettingsRow
          label="Remember Last Page"
          description={
            settings.page_timeout === 0
              ? 'Always opens on the editor'
              : settings.page_timeout === -1
                ? 'Always returns to the last viewed page'
                : 'Returns to the last page if reopened within 30 seconds'
          }
        >
          <Navigation size={16} className="text-text-muted" />
          <select
            value={settings.page_timeout}
            onChange={(e) => setSettings({ page_timeout: Number(e.target.value) })}
            className="text-xs bg-surface-secondary border border-border rounded-lg px-2 py-1 text-text-primary focus:outline-none focus:border-primary"
          >
            {PAGE_TIMEOUT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </SettingsRow>
      </div>

      {/* Help */}
      <div className="py-1">
        <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
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
        <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
          Data
        </p>
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
