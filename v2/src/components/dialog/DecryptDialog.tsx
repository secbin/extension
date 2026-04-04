import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Unlock, X } from 'lucide-react'

interface DecryptDialogProps {
  open: boolean
  onConfirm: (passkey: string) => void
  onCancel: () => void
}

export default function DecryptDialog({ open, onConfirm, onCancel }: DecryptDialogProps) {
  const [passkey, setPasskey] = useState('')

  const handleConfirm = () => {
    if (passkey.trim()) {
      onConfirm(passkey.trim())
      setPasskey('')
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) { onCancel(); setPasskey('') } }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[360px] rounded-2xl bg-surface border border-border shadow-2xl p-5 focus:outline-none">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Unlock size={20} className="text-success" />
            </div>
            <div>
              <Dialog.Title className="text-sm font-semibold">Decryption Key</Dialog.Title>
              <Dialog.Description className="text-xs text-text-muted">
                Enter the passkey to decrypt the content
              </Dialog.Description>
            </div>
          </div>

          <input
            type="text"
            value={passkey}
            onChange={(e) => setPasskey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
            placeholder="Paste decryption key..."
            className="w-full px-3 py-2.5 mb-4 text-[13px] font-mono rounded-xl border border-border bg-surface-secondary/50 focus:outline-none focus:border-primary transition-colors"
            autoFocus
          />

          <div className="flex gap-2 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium rounded-xl text-text-secondary hover:bg-surface-hover transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!passkey.trim()}
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Decrypt
            </button>
          </div>

          <Dialog.Close asChild>
            <button
              onClick={onCancel}
              className="absolute top-3 right-3 p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-hover transition-all"
            >
              <X size={16} />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
