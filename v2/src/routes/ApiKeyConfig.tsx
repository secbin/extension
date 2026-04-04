import { useState, useEffect, useRef } from 'react'
import { CheckCircle2, XCircle, Loader2, ExternalLink } from 'lucide-react'
import { useStore } from '@/lib/store'
import { isValidDevKey } from '@/lib/pastebin'
import { PASTEBIN_API_KEY_LENGTH } from '@/lib/constants'
import PageHeader from '@/components/common/PageHeader'
import { cn } from '@/lib/cn'

type ValidationState = 'idle' | 'validating' | 'valid' | 'invalid'

export default function ApiKeyConfig() {
  const { settings, setSettings } = useStore()
  const defaultKey = atob('MmU1OGNlMjcyMzllMzRhNzdjNWVmNjVkYmVhOGIyNGQ=')
  const [apiKey, setApiKey] = useState(settings.apiKey === defaultKey ? '' : settings.apiKey)
  const [validation, setValidation] = useState<ValidationState>('idle')
  const [saved, setSaved] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(debounceRef.current), [])

  const handleChange = (value: string) => {
    setApiKey(value)
    setSaved(false)
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
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <PageHeader title="Pastebin API" subtitle="Configure your API key" />

      <div className="px-4 py-4 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-text-muted">API Developer Key</label>
          <div className="relative">
            <input
              type="text"
              value={apiKey}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="5b6d1b053d850e4c095ff6707ba816fc"
              maxLength={32}
              className="w-full px-3 py-2.5 pr-10 text-[13px] font-mono rounded-xl border border-border bg-surface-secondary/50 focus:outline-none focus:border-primary transition-colors"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {validation === 'validating' && <Loader2 size={16} className="text-text-muted animate-spin" />}
              {validation === 'valid'      && <CheckCircle2 size={16} className="text-success" />}
              {validation === 'invalid'    && <XCircle size={16} className="text-warning" />}
            </div>
          </div>

          {validation === 'valid' && (
            <p className="text-xs text-success">Key verified with Pastebin.</p>
          )}
          {validation === 'invalid' && (
            <p className="text-xs text-text-muted">Could not verify with Pastebin — you can still save and use the key.</p>
          )}

          <button
            onClick={handleSave}
            disabled={!apiKey.trim()}
            className={cn(
              'w-full py-2 rounded-xl text-sm font-semibold transition-all',
              saved
                ? 'bg-success/10 text-success border border-success/30'
                : apiKey.trim()
                  ? 'bg-primary text-white hover:bg-primary-hover active:scale-[0.98]'
                  : 'bg-surface-secondary text-text-muted/40 cursor-not-allowed border border-border',
            )}
          >
            {saved ? '✓ Saved' : 'Save API Key'}
          </button>
        </div>

        <div className="rounded-xl border border-border bg-surface-secondary/30 p-4 space-y-3">
          <h3 className="text-sm font-semibold">Get your API key</h3>
          <ol className="text-xs text-text-secondary space-y-2 list-decimal list-inside leading-relaxed">
            <li>
              Create an account on{' '}
              <button
                onClick={() => window.open('https://pastebin.com/signup', '_blank', 'noopener')}
                className="text-primary hover:underline inline-flex items-center gap-0.5"
              >
                pastebin.com <ExternalLink size={10} />
              </button>
            </li>
            <li>
              Go to the{' '}
              <button
                onClick={() => window.open('https://pastebin.com/doc_api', '_blank', 'noopener')}
                className="text-primary hover:underline inline-flex items-center gap-0.5"
              >
                API documentation <ExternalLink size={10} />
              </button>
            </li>
            <li>Copy your Unique Developer API Key</li>
            <li>Paste it above and tap <strong>Save API Key</strong></li>
          </ol>
        </div>
      </div>
    </div>
  )
}
