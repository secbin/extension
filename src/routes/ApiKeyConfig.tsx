import { useState, useEffect, useRef } from 'react'
import { CheckCircle2, ExternalLink } from 'lucide-react'
import { useStore } from '@/lib/store'
import { isValidDevKey } from '@/lib/pastebin'
import { PASTEBIN_API_KEY_LENGTH, hasCustomApiKey } from '@/lib/constants'
import PageHeader from '@/components/common/PageHeader'
import { cn } from '@/lib/cn'

type ValidationState = 'idle' | 'validating' | 'valid' | 'invalid'

export default function ApiKeyConfig() {
  const { settings, setSettings } = useStore()
  const [apiKey, setApiKey] = useState(hasCustomApiKey(settings.apiKey) ? settings.apiKey : '')
  const [validation, setValidation] = useState<ValidationState>('idle')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(debounceRef.current), [])

  useEffect(() => {
    if (apiKey.length === PASTEBIN_API_KEY_LENGTH) {
      setValidation('validating')
      isValidDevKey(apiKey).then(valid => setValidation(valid ? 'valid' : 'invalid'))
    }
  }, [])

  const handleChange = (value: string) => {
    setApiKey(value)
    clearTimeout(debounceRef.current)
    if (value.length === PASTEBIN_API_KEY_LENGTH) {
      setValidation('validating')
      debounceRef.current = setTimeout(async () => {
        const valid = await isValidDevKey(value)
        setValidation(valid ? 'valid' : 'invalid')
      }, 400)
    } else {
      setValidation('idle')
    }
  }

  const handleSave = () => {
    if (!apiKey.trim()) return
    setSettings({ apiKey: apiKey.trim() })
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="API Key" subtitle="Your Pastebin developer key" />

      <div className="flex-1 px-4 py-4 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.06em]">
              API Key
            </label>
            {validation === 'valid' && (
              <span className="flex items-center gap-1 text-xs font-medium text-success">
                <CheckCircle2 size={12} />
                Verified
              </span>
            )}
            {validation === 'invalid' && (
              <span className="text-xs text-danger">Invalid key</span>
            )}
          </div>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="32-character developer key"
            maxLength={32}
            className="w-full px-3 py-2.5 text-[13px] font-mono rounded-xl border border-border bg-surface focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="rounded-xl border border-border/60 bg-surface-secondary/30 px-3 py-3 space-y-1.5">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-[0.06em]">How to get a key</p>
          <p className="text-[13px] text-text-secondary leading-relaxed">
            Create a free account at{' '}
            <button
              onClick={() => window.open('https://pastebin.com/signup', '_blank', 'noopener')}
              className="text-primary hover:underline inline-flex items-center gap-0.5"
            >
              pastebin.com <ExternalLink size={11} />
            </button>
            , then copy your developer key from your account settings.
          </p>
        </div>
      </div>

      <div className="border-t border-border bg-surface px-4 py-3">
        <button
          onClick={handleSave}
          disabled={!apiKey.trim()}
          className={cn(
            'w-full flex items-center justify-center py-2.5 rounded-xl text-sm font-semibold transition-all',
            apiKey.trim()
              ? 'bg-primary text-white hover:bg-primary-hover active:scale-[0.98]'
              : 'bg-surface-secondary text-text-muted cursor-not-allowed',
          )}
        >
          Save Key
        </button>
      </div>
    </div>
  )
}
