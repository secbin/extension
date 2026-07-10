import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/lib/store'
import { encrypt, decrypt as decryptText } from '@/lib/crypto'
import { postPastebin, getPastebin } from '@/lib/pastebin'
import { EditorAction } from '@/lib/constants'
import { detectAction } from '@/lib/editor-utils'
import { panelBus } from '@/lib/panel-bus'
import TextEditor from '@/components/editor/TextEditor'
import ActionBar from '@/components/editor/ActionBar'
import PasteMetadata from '@/components/editor/PasteMetadata'
import EncryptDialog from '@/components/dialog/EncryptDialog'
import DecryptDialog from '@/components/dialog/DecryptDialog'

export default function Editor() {
  const navigate = useNavigate()
  const { draft, settings, updateDraft, resetDraft, addToHistory, setDecryptResult } = useStore()
  const [encDialogOpen, setEncDialogOpen] = useState(false)
  const [decDialogOpen, setDecDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Context-menu text ("Open in Editor") is handled centrally in App.tsx —
  // via chrome.storage.session in popup mode and window events when injected.

  useEffect(() => {
    const handler = (e: Event) => {
      const { ciphertext } = (e as CustomEvent).detail
      updateDraft({
        plaintext: ciphertext,
        action: EditorAction.DECRYPT,
      })
    }
    panelBus.addEventListener('securebin:load-for-decrypt', handler)
    return () => panelBus.removeEventListener('securebin:load-for-decrypt', handler)
  }, [updateDraft])


  const handleAction = useCallback((overrideAction?: EditorAction) => {
    // The dropdown passes the action directly so we don't rely on a stale draft closure
    const action = overrideAction ?? draft.action

    // Actions requiring encryption passkey
    if (action === EditorAction.ENCRYPT || action === EditorAction.ENCRYPT_PASTEBIN) {
      setEncDialogOpen(true)
      return
    }

    // Actions requiring decryption key
    if (action === EditorAction.DECRYPT || action === EditorAction.DECRYPT_PASTEBIN) {
      setDecDialogOpen(true)
      return
    }

    // Direct actions
    executeAction(undefined, action)
  }, [draft])

  // Keyboard shortcuts: Cmd/Ctrl+Enter = trigger action, Cmd/Ctrl+Shift+E = toggle encryption
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key === 'Enter') {
        e.preventDefault()
        if (draft.buttonEnabled && !loading) handleAction()
      }
      // key is 'E' while Shift is held, so compare case-insensitively
      if (mod && e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault()
        const isEnc = draft.action === EditorAction.ENCRYPT_PASTEBIN || draft.action === EditorAction.ENCRYPT
        updateDraft({ action: isEnc ? EditorAction.POST_PASTEBIN : EditorAction.ENCRYPT_PASTEBIN })
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [draft, loading, handleAction, updateDraft])

  const executeAction = useCallback(
    async (passkey?: string, overrideAction?: EditorAction) => {
      const { plaintext } = draft
      const action = overrideAction ?? draft.action
      const { encMode, keyLength, apiKey } = settings

      // Shared paste metadata from the current draft
      const meta = { title: draft.title, format: draft.format, expiry: draft.expiry, privacy: draft.privacy }

      setLoading(true)
      try {
        if (action === EditorAction.ENCRYPT && passkey) {
          const result = await encrypt(plaintext, encMode, keyLength, passkey)
          addToHistory({
            id: crypto.randomUUID(),
            action: EditorAction.ENCRYPT,
            pastebinLink: '',
            key: result.key,
            encText: result.cipherData,
            encMode: result.mode,
            keyLength: result.keyLength,
            date: Date.now(),
            ...meta,
          })
          resetDraft()
          navigate('/result')
        } else if (action === EditorAction.ENCRYPT_PASTEBIN && passkey) {
          const result = await encrypt(plaintext, encMode, keyLength, passkey)
          const link = await postPastebin(result.cipherData, apiKey, meta)
          addToHistory({
            id: crypto.randomUUID(),
            action: EditorAction.ENCRYPT_PASTEBIN,
            pastebinLink: link,
            key: result.key,
            encText: result.cipherData,
            encMode: result.mode,
            keyLength: result.keyLength,
            date: Date.now(),
            ...meta,
          })
          resetDraft()
          navigate('/result')
        } else if (action === EditorAction.POST_PASTEBIN) {
          const link = await postPastebin(plaintext, apiKey, meta)
          addToHistory({
            id: crypto.randomUUID(),
            action: EditorAction.POST_PASTEBIN,
            pastebinLink: link,
            key: null,
            encText: plaintext,
            encMode: null,
            keyLength: null,
            date: Date.now(),
            ...meta,
          })
          resetDraft()
          navigate('/result')
        } else if (action === EditorAction.SAVE_DRAFT) {
          addToHistory({
            id: crypto.randomUUID(),
            action: EditorAction.SAVE_DRAFT,
            pastebinLink: '',
            key: null,
            encText: plaintext,
            encMode: null,
            keyLength: null,
            date: Date.now(),
            ...meta,
          })
          resetDraft()
          navigate('/result')
        } else if (action === EditorAction.DECRYPT && passkey) {
          const decrypted = await decryptText(plaintext, passkey)
          // Show the plaintext on its own page; the ciphertext stays in the
          // editor so nothing is lost if the user navigates back.
          setDecryptResult({ plaintext: decrypted, date: Date.now() })
          navigate('/decrypted')
        } else if (action === EditorAction.DECRYPT_PASTEBIN && passkey) {
          const pasteText = await getPastebin(plaintext)
          const decrypted = await decryptText(pasteText, passkey)
          setDecryptResult({ plaintext: decrypted, date: Date.now() })
          navigate('/decrypted')
        } else if (action === EditorAction.OPEN_PASTEBIN) {
          const pasteText = await getPastebin(plaintext)
          updateDraft({
            plaintext: pasteText,
            action: detectAction(pasteText, settings.default_action),
          })
        }
      } catch (err) {
        addToHistory({
          id: crypto.randomUUID(),
          action,
          pastebinLink: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
          key: null,
          encText: plaintext,  // save original text so user can recover it from result page
          encMode: null,
          keyLength: null,
          date: Date.now(),
          ...meta,
        })
        navigate('/result')
      } finally {
        setLoading(false)
      }
    },
    [draft, settings, addToHistory, resetDraft, updateDraft, setDecryptResult, navigate],
  )

  return (
    <div className="flex flex-col h-full">
      <PasteMetadata />
      <TextEditor />
      <ActionBar onAction={handleAction} loading={loading} />

      <EncryptDialog
        open={encDialogOpen}
        onConfirm={(passkey) => {
          setEncDialogOpen(false)
          executeAction(passkey)
        }}
        onCancel={() => setEncDialogOpen(false)}
      />

      <DecryptDialog
        open={decDialogOpen}
        onConfirm={(passkey) => {
          setDecDialogOpen(false)
          executeAction(passkey)
        }}
        onCancel={() => setDecDialogOpen(false)}
      />
    </div>
  )
}
