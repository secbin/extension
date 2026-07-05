import { useStore, resolveTheme } from '@/lib/store'
import SecurebinLogo from '@/components/common/SecurebinLogo'
import { Loader2 } from 'lucide-react'

export default function QuickPostLoading() {
  const { settings } = useStore()
  const isDark = resolveTheme(settings.theme) === 'dark'

  return (
    <div className="flex flex-col h-full items-center justify-center gap-4">
      <div className="flex items-center justify-between w-full px-5">
        <SecurebinLogo darkmode={isDark} />
        <Loader2 size={18} className="animate-spin text-text-muted" />
      </div>
      <p className="text-xs text-text-muted">Posting to Pastebin…</p>
    </div>
  )
}
