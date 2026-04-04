import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Trash2 } from 'lucide-react'
import { useStore } from '@/lib/store'
import { EditorAction } from '@/lib/constants'
import PageHeader from '@/components/common/PageHeader'
import CopyBox from '@/components/common/CopyBox'
import StatusBadge from '@/components/common/StatusBadge'

export default function Result() {
  const { index } = useParams()
  const navigate = useNavigate()
  const { history, removeFromHistory } = useStore()

  // Default to most recent item
  const idx = index !== undefined ? parseInt(index, 10) : 0
  const item = history[idx]

  if (!item) {
    return (
      <>
        <PageHeader title="Result" />
        <StatusBadge variant="empty" title="No Encryptions" subtitle="Create your first encrypted paste" />
      </>
    )
  }

  const isError = item.pastebinLink?.startsWith('Error')
  const hasPastebin = item.pastebinLink && !isError && item.pastebinLink.startsWith('http')
  const hasEncryption = !!item.encMode

  const statusVariant = isError ? 'error' : hasPastebin ? 'success' : 'success'
  const statusTitle = isError
    ? 'Error'
    : hasPastebin
      ? 'Posted to Pastebin'
      : item.action === EditorAction.SAVE_DRAFT
        ? 'Draft Saved'
        : 'Encrypted'

  const subtitle = hasEncryption
    ? `${(item.keyLength ?? 16) * 8}-bit ${item.encMode} \u00b7 ${format(new Date(item.date), 'MMM d, h:mm a')}`
    : format(new Date(item.date), 'MMM d, yyyy h:mm a')

  const handleDelete = () => {
    removeFromHistory(item.id)
    navigate('/history')
  }

  return (
    <div>
      <PageHeader
        title={hasPastebin ? 'Pastebin Result' : item.action === EditorAction.SAVE_DRAFT ? 'Draft' : 'Encryption Result'}
      />

      <StatusBadge
        variant={statusVariant}
        title={statusTitle}
        subtitle={isError ? item.pastebinLink : subtitle}
      />

      <div className="px-4 pb-4 space-y-3">
        {hasPastebin && (
          <CopyBox
            label="Pastebin Link"
            value={item.pastebinLink}
            openInNew
          />
        )}

        {item.encText && (
          <CopyBox
            label="Ciphertext"
            value={item.encText}
            multiline
            rows={5}
          />
        )}

        {item.key && (
          <CopyBox
            label="Passkey"
            value={item.key}
            masked
          />
        )}

        {/* Delete from history */}
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 text-xs text-text-muted hover:text-danger transition-colors mt-1"
        >
          <Trash2 size={13} />
          Delete from history
        </button>
        {hasPastebin && (
          <p className="text-[10px] text-text-muted/70 -mt-1">
            This removes the item from your local history only — the paste on pastebin.com is not affected.
          </p>
        )}
      </div>
    </div>
  )
}
