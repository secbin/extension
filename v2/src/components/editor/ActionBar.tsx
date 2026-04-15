import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
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
import { isInjected } from '@/App'

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
  const buttonGroupRef = useRef<HTMLDivElement>(null)

  const maxLen =
    draft.action === EditorAction.ENCRYPT_PASTEBIN
      ? MAX_ENC_PASTEBIN_PLAINTEXT_LENGTH
      : draft.action === EditorAction.POST_PASTEBIN
        ? MAX_PASTEBIN_TEXT_LENGTH
        : MAX_ENC_TEXT_LENGTH

  const isOverLimit = draft.plaintext.length > maxLen
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

  const dropdownContent = (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
      <div className="absolute bottom-full right-0 mb-2 z-50 w-52 py-1.5 rounded-xl border border-border bg-surface animate-in fade-in slide-in-from-bottom-2 duration-150" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)' }}>
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
  );

  return (
    <div className="flex items-start justify-between px-4 pt-2 pb-3 bg-surface border-t border-border">
      {/* Character count — top-left corner, aligned with top of button */}
      <span className={cn('text-[11px] tabular-nums text-text-muted/50 mt-1.5', isOverLimit && 'text-danger font-medium')}>
        {draft.plaintext.length.toLocaleString()} / {maxLen.toLocaleString()}
      </span>

      {/* Action button group */}
      <div ref={buttonGroupRef} className="relative flex items-stretch">
        <button
          onClick={() => onAction()}
          disabled={!draft.buttonEnabled}
          className={cn(
            'flex items-center gap-2 pl-5 pr-4 py-2.5 rounded-l-full text-sm font-semibold transition-all',
            draft.buttonEnabled
              ? 'bg-primary text-white hover:bg-primary-hover active:scale-[0.98]'
              : 'bg-surface-secondary text-text-muted cursor-not-allowed',
          )}
        >
          {draft.action !== EditorAction.POST_PASTEBIN && <Icon size={15} />}
          {currentAction.label}
        </button>
        <button
          onClick={() => {
            setMenuOpen(!menuOpen)
          }}
          className={cn(
            'flex items-center px-3.5 py-2.5 rounded-r-full text-white transition-all',
            'bg-primary hover:bg-primary-hover active:scale-[0.98]',
            draft.buttonEnabled ? 'border-l border-white/20' : 'border-l border-primary/30',
          )}
        >
          <ChevronDown size={16} className={cn('transition-transform', menuOpen && 'rotate-180')} />
        </button>

        {/* Dropdown menu */}
        {menuOpen && (() => {
          const portal = (window as any).__SECUREBIN_PORTAL__ as HTMLElement | undefined;
          if (isInjected() && portal && buttonGroupRef.current) {
            const rect = buttonGroupRef.current.getBoundingClientRect();
            const fixedDropdown = (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div
                  className="fixed z-50 w-52 py-1.5 rounded-xl border border-border bg-surface animate-in fade-in slide-in-from-bottom-2 duration-150"
                  style={{
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
                    bottom: window.innerHeight - rect.top + 8,
                    right: window.innerWidth - rect.right,
                  }}
                >
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
            );
            return createPortal(fixedDropdown, portal);
          }
          return dropdownContent;
        })()}
      </div>
    </div>
  )
}
