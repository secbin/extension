import { useState } from 'react'
import { ChevronDown, Lock, Unlock, Send, Save, Link, ExternalLink, KeyRound } from 'lucide-react'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/cn'
import {
  EditorAction,
  MAX_PASTEBIN_TEXT_LENGTH,
  MAX_ENC_PASTEBIN_PLAINTEXT_LENGTH,
  MAX_ENC_TEXT_LENGTH,
} from '@/lib/constants'
import { isEncryptionAction } from '@/lib/editor-utils'

interface ActionBarProps {
  onAction: (action?: EditorAction) => void
}

const actionConfig: Record<EditorAction, { icon: typeof Lock; label: string }> = {
  [EditorAction.ENCRYPT]: { icon: Lock, label: 'Encrypt' },
  [EditorAction.ENCRYPT_PASTEBIN]: { icon: KeyRound, label: 'Encrypt & Post' },
  [EditorAction.POST_PASTEBIN]: { icon: Send, label: 'Post to Pastebin' },
  [EditorAction.DECRYPT]: { icon: Unlock, label: 'Decrypt' },
  [EditorAction.DECRYPT_PASTEBIN]: { icon: Unlock, label: 'Decrypt from Link' },
  [EditorAction.OPEN_PASTEBIN]: { icon: ExternalLink, label: 'Open Paste' },
  [EditorAction.SAVE_DRAFT]: { icon: Save, label: 'Save Draft' },
}

export default function ActionBar({ onAction }: ActionBarProps) {
  const { draft, updateDraft, settings } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)

  const maxLen =
    draft.action === EditorAction.ENCRYPT_PASTEBIN
      ? MAX_ENC_PASTEBIN_PLAINTEXT_LENGTH
      : draft.action === EditorAction.POST_PASTEBIN
        ? MAX_PASTEBIN_TEXT_LENGTH
        : MAX_ENC_TEXT_LENGTH

  const isOverLimit = draft.plaintext.length > maxLen
  const pct = Math.min((draft.plaintext.length / maxLen) * 100, 100)
  const barColor =
    pct >= 90 ? 'bg-danger' :
    pct >= 70 ? 'bg-warning' :
    'bg-success/70'

  const currentAction = actionConfig[draft.action]
  const Icon = currentAction.icon
  const hasApiKey = settings.apiKey && settings.apiKey !== atob('MmU1OGNlMjcyMzllMzRhNzdjNWVmNjVkYmVhOGIyNGQ=')

  // Derive encryption preference from the default action setting
  const encryptionDefault = isEncryptionAction(settings.default_action)

  // "Decrypt from Link" / "Open Paste" are only relevant when a Pastebin URL is detected
  const isPastebinLink = draft.action === EditorAction.DECRYPT_PASTEBIN || draft.action === EditorAction.OPEN_PASTEBIN

  const menuItems: { action: EditorAction; icon: typeof Lock; label: string; disabled?: boolean; divider?: boolean }[] = encryptionDefault
    ? [
        { action: EditorAction.ENCRYPT_PASTEBIN, icon: KeyRound, label: 'Encrypt & Post', disabled: !hasApiKey },
        { action: EditorAction.POST_PASTEBIN, icon: Send, label: 'Post (Unencrypted)', disabled: !hasApiKey },
        { action: EditorAction.ENCRYPT, icon: Lock, label: 'Encrypt Only' },
        { action: EditorAction.SAVE_DRAFT, icon: Save, label: 'Save Draft', divider: true },
        { action: EditorAction.DECRYPT, icon: Unlock, label: 'Decrypt' },
        ...(isPastebinLink ? [{ action: EditorAction.DECRYPT_PASTEBIN, icon: Unlock, label: 'Decrypt from Link', disabled: !hasApiKey }] : []),
      ]
    : [
        { action: EditorAction.POST_PASTEBIN, icon: Send, label: 'Post to Pastebin', disabled: !hasApiKey },
        { action: EditorAction.ENCRYPT_PASTEBIN, icon: KeyRound, label: 'Encrypt & Post', disabled: !hasApiKey },
        { action: EditorAction.ENCRYPT, icon: Lock, label: 'Encrypt Only' },
        { action: EditorAction.SAVE_DRAFT, icon: Save, label: 'Save Draft', divider: true },
        ...(isPastebinLink ? [{ action: EditorAction.OPEN_PASTEBIN, icon: Link, label: 'Open Paste', disabled: !hasApiKey, divider: true }] : []),
      ]

  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-t border-border bg-surface-secondary/30">
      {/* Usage bar */}
      <div className="flex flex-col gap-1 w-24">
        <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-300', barColor, isOverLimit && 'bg-danger')}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className={cn('text-[10px] tabular-nums leading-none', isOverLimit ? 'text-danger' : 'text-text-muted/60')}>
          {draft.plaintext.length.toLocaleString()} / {maxLen.toLocaleString()}
        </span>
      </div>

      {/* Action button group */}
      <div className="relative flex items-stretch">
        <button
          onClick={() => onAction()}
          disabled={!draft.buttonEnabled}
          className={cn(
            'flex items-center gap-2 pl-5 pr-4 py-2.5 rounded-l-xl text-sm font-semibold transition-all',
            'bg-primary text-white',
            draft.buttonEnabled
              ? 'hover:bg-primary-hover active:scale-[0.98]'
              : 'opacity-40 cursor-not-allowed',
          )}
        >
          <Icon size={15} />
          {currentAction.label}
        </button>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={cn(
            'flex items-center px-3.5 py-2.5 rounded-r-xl border-l border-white/20 text-white transition-all',
            'bg-primary hover:bg-primary-hover active:scale-[0.98]',
          )}
        >
          <ChevronDown size={16} className={cn('transition-transform', menuOpen && 'rotate-180')} />
        </button>

        {/* Dropdown menu */}
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div className="absolute bottom-full right-0 mb-2 z-50 w-52 py-1.5 rounded-xl border border-border bg-surface shadow-lg shadow-black/10 animate-in fade-in slide-in-from-bottom-2 duration-150">
              {menuItems.map((item, i) => (
                <div key={item.action}>
                  {item.divider && i > 0 && <div className="my-1.5 border-t border-border" />}
                  <button
                    onClick={() => {
                      updateDraft({ action: item.action })
                      setMenuOpen(false)
                      onAction(item.action)
                    }}
                    disabled={item.disabled}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors',
                      item.disabled
                        ? 'text-text-muted/40 cursor-not-allowed'
                        : 'text-text-primary hover:bg-surface-hover',
                      draft.action === item.action && 'text-primary font-medium',
                    )}
                  >
                    <item.icon size={15} className={item.disabled ? 'opacity-40' : ''} />
                    {item.label}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
