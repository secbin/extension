import { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Lock, RefreshCw, X } from 'lucide-react'
import { useStore } from '@/lib/store'
import { generatePasskey } from '@/lib/crypto'
import { cn } from '@/lib/cn'

interface EncryptDialogProps {
  open: boolean
  onConfirm: (passkey: string) => void
  onCancel: () => void
}

export default function EncryptDialog({ open, onConfirm, onCancel }: EncryptDialogProps) {
  const [passkey, setPasskey] = useState('')

  useEffect(() => {
    if (open) {
      setPasskey(generatePasskey())
    }
  }, [open])

  const regenerate = () => setPasskey(generatePasskey())

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[360px] rounded-2xl bg-surface border border-border shadow-2xl p-5 focus:outline-none">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Lock size={20} className="text-primary" />
            </div>
            <div>
              <Dialog.Title className="text-sm font-semibold">Encryption Passkey</Dialog.Title>
              <Dialog.Description className="text-xs text-text-muted">
                Enter a passkey or use the generated one
              </Dialog.Description>
            </div>
          </div>

          <div className="relative mb-4">
            <input
              type="text"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              placeholder="Enter passkey..."
              className="w-full px-3 py-2.5 pr-10 text-[13px] font-mono rounded-xl border border-border bg-surface-secondary/50 focus:outline-none focus:border-primary transition-colors"
              autoFocus
            />
            <button
              onClick={regenerate}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-text-muted hover:text-primary hover:bg-primary/10 transition-all"
              title="Generate new passkey"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium rounded-xl text-text-secondary hover:bg-surface-hover transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(passkey || generatePasskey())}
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary-hover active:scale-[0.98] transition-all"
            >
              Encrypt
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
