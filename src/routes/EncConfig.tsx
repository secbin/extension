import { Check } from 'lucide-react'
import { useStore } from '@/lib/store'
import { ENCRYPTION_MODES, KEY_LENGTHS, type EncryptionMode } from '@/lib/constants'
import PageHeader from '@/components/common/PageHeader'
import { cn } from '@/lib/cn'

export default function EncConfig() {
  const { settings, setSettings } = useStore()

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Encryption" subtitle="AES algorithm and key length" />

      <div className="flex-1 px-4 py-4 space-y-6">
        {/* Algorithm */}
        <div>
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.06em] mb-2 px-0.5">Algorithm</p>
          <div className="rounded-xl border border-border/60 overflow-hidden">
            {ENCRYPTION_MODES.map((mode, idx) => (
              <div key={mode.value}>
                {idx > 0 && <div className="border-t border-border/20 mx-3" />}
                <button
                  onClick={() => setSettings({ encMode: mode.value as EncryptionMode })}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-3 text-sm transition-colors',
                    settings.encMode === mode.value ? 'bg-surface-secondary/50' : 'hover:bg-surface-hover',
                  )}
                >
                  <span className={cn('font-medium', settings.encMode === mode.value ? 'text-text-primary' : 'text-text-secondary')}>
                    {mode.label}
                  </span>
                  {settings.encMode === mode.value && <Check size={15} className="text-primary shrink-0" />}
                </button>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-text-muted mt-2 leading-relaxed px-0.5">
            AES-GCM is recommended — it authenticates the ciphertext (AEAD) so any tampering is detectable.
            AES-CTR provides confidentiality only.
          </p>
        </div>

        {/* Key Length */}
        <div>
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.06em] mb-2 px-0.5">Key Length</p>
          <div className="flex p-0.5 rounded-xl bg-surface-secondary/60 border border-border/50">
            {KEY_LENGTHS.map(kl => (
              <button
                key={kl.value}
                onClick={() => setSettings({ keyLength: kl.value })}
                className={cn(
                  'flex-1 py-2 text-sm font-medium rounded-[10px] transition-all duration-150',
                  settings.keyLength === kl.value
                    ? 'bg-surface text-text-primary shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_1px_rgba(0,0,0,0.04)]'
                    : 'text-text-muted hover:text-text-secondary',
                )}
              >
                {kl.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-text-muted mt-2 leading-relaxed px-0.5">
            Longer keys are harder to brute-force. 256-bit is the strongest and recommended for sensitive data.
            128-bit is significantly faster with no practical security difference for most use cases.
          </p>
        </div>
      </div>
    </div>
  )
}
