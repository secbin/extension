import { useState, useEffect, useRef } from 'react'
import { CheckCircle2, ExternalLink } from 'lucide-react'
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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(debounceRef.current), [])

  // Pre-validate on mount if there's already a key
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
      <PageHeader title="Pastebin API" subtitle="Set API Key" />

      <div className="flex-1 px-4 py-4 space-y-4">
        {/* Label row: "API Key" left, "✓ Verified by Pastebin" right */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-text-secondary">API Key</label>
          {validation === 'valid' && (
            <span className="flex items-center gap-1 text-xs font-semibold text-success">
              <CheckCircle2 size={13} />
              Verified by Pastebin
            </span>
          )}
        </div>

        <input
          type="text"
          value={apiKey}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="5b6d1b053d850e4c095ff6707ba816fc"
          maxLength={32}
          className="w-full px-3 py-2.5 text-[14px] font-mono rounded-xl border border-border bg-surface focus:outline-none focus:border-primary transition-colors"
        />

        <div className="space-y-2 text-sm text-text-secondary leading-relaxed">
          <p className="font-medium text-text-primary">Getting your API Key</p>
          <p>
            In order to be able to use the PasteBin API, you will need to create an account with{' '}
            <button
              onClick={() => window.open('https://pastebin.com/signup', '_blank', 'noopener')}
              className="text-primary hover:underline inline-flex items-center gap-0.5"
            >
              PasteBin <ExternalLink size={11} />
            </button>{' '}
            in order to get an Api key.
          </p>
          <p>
            Once you have made an account enter in the key here and you are all good to go!
          </p>
        </div>
      </div>

      {/* Bottom footer save button — matches v1 */}
      <div className="border-t border-border bg-surface px-4 py-3">
        <button
          onClick={handleSave}
          disabled={!apiKey.trim()}
          className={cn(
            'w-full py-2.5 text-sm font-semibold transition-all',
            apiKey.trim()
              ? 'text-primary hover:text-primary-hover'
              : 'text-text-muted/40 cursor-not-allowed',
          )}
        >
          Save Key
        </button>
      </div>
    </div>
  )
}
