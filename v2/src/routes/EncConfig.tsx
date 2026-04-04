import { useStore } from '@/lib/store'
import { ENCRYPTION_MODES, KEY_LENGTHS, type EncryptionMode } from '@/lib/constants'
import PageHeader from '@/components/common/PageHeader'
import { cn } from '@/lib/cn'

export default function EncConfig() {
  const { settings, setSettings } = useStore()

  return (
    <div>
      <PageHeader title="Encryption" subtitle="Configure the AES algorithm and key length" />

      <div className="divide-y divide-border">
        {/* Algorithm */}
        <div className="px-4 py-3">
          <p className="text-sm font-medium mb-2">Algorithm</p>
          <div className="flex flex-col gap-1.5">
            {ENCRYPTION_MODES.map((mode) => (
              <button
                key={mode.value}
                onClick={() => setSettings({ encMode: mode.value as EncryptionMode })}
                className={cn(
                  'flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-all',
                  settings.encMode === mode.value
                    ? 'border-primary bg-primary/5 text-primary font-medium'
                    : 'border-border hover:border-border-hover hover:bg-surface-hover',
                )}
              >
                {mode.label}
                {settings.encMode === mode.value && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Key Length */}
        <div className="px-4 py-3">
          <p className="text-sm font-medium mb-2">Key Length</p>
          <div className="flex gap-2">
            {KEY_LENGTHS.map((kl) => (
              <button
                key={kl.value}
                onClick={() => setSettings({ keyLength: kl.value })}
                className={cn(
                  'flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all',
                  settings.keyLength === kl.value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-border-hover hover:bg-surface-hover text-text-secondary',
                )}
              >
                {kl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="px-4 py-3">
          <p className="text-xs text-text-muted leading-relaxed">
            SecureBin uses AES encryption to protect your text before it's posted to Pastebin.
            AES-GCM is recommended as it provides both encryption and authentication.
          </p>
        </div>
      </div>
    </div>
  )
}
