import * as Dialog from '@radix-ui/react-dialog'
import { AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/cn'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  danger = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[340px] rounded-2xl bg-surface border border-border shadow-2xl p-5 focus:outline-none">
          <div className="flex items-center gap-3 mb-3">
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              danger ? 'bg-danger/10' : 'bg-warning/10',
            )}>
              <AlertTriangle size={20} className={danger ? 'text-danger' : 'text-warning'} />
            </div>
            <Dialog.Title className="text-sm font-semibold">{title}</Dialog.Title>
          </div>

          <Dialog.Description className="text-sm text-text-secondary mb-5 leading-relaxed">
            {description}
          </Dialog.Description>

          <div className="flex gap-2 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium rounded-xl text-text-secondary hover:bg-surface-hover transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={cn(
                'px-4 py-2 text-sm font-semibold rounded-xl text-white active:scale-[0.98] transition-all',
                danger
                  ? 'bg-danger hover:bg-danger-hover'
                  : 'bg-primary hover:bg-primary-hover',
              )}
            >
              {confirmLabel}
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
