import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/lib/store'
import { encrypt, decrypt as decryptText } from '@/lib/crypto'
import { postPastebin, getPastebin } from '@/lib/pastebin'
import { EditorAction } from '@/lib/constants'
import { detectAction, isWithinLimit } from '@/lib/editor-utils'
import TextEditor from '@/components/editor/TextEditor'
import ActionBar from '@/components/editor/ActionBar'
import PasteMetadata from '@/components/editor/PasteMetadata'
import EncryptDialog from '@/components/dialog/EncryptDialog'
import DecryptDialog from '@/components/dialog/DecryptDialog'

export default function Editor() {
  const navigate = useNavigate()
  const { draft, settings, updateDraft, resetDraft, addToHistory } = useStore()
  const [encDialogOpen, setEncDialogOpen] = useState(false)
  const [decDialogOpen, setDecDialogOpen] = useState(false)

  // Handle text injected by the right-click context menu (background service worker)
  useEffect(() => {
    chrome.storage.session.get(['pendingText', 'lastResult'], (data) => {
      if (data.pendingText?.text) {
        const text: string = data.pendingText.text
        const action = detectAction(text, settings.default_action)
        updateDraft({ 
          plaintext: text, 
          action, 
          buttonEnabled: isWithinLimit(text, action) 
        })
        chrome.storage.session.remove('pendingText')
      } else if (data.lastResult) {
        chrome.storage.session.remove('lastResult')
        navigate('/result')
      }
    })
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const { ciphertext } = (e as CustomEvent).detail
      updateDraft({
        plaintext: ciphertext,
        action: EditorAction.DECRYPT,
        buttonEnabled: ciphertext.length > 0,
      })
    }
    window.addEventListener('securebin:load-for-decrypt', handler)
    return () => window.removeEventListener('securebin:load-for-decrypt', handler)
  }, [updateDraft])

  // Handle text injected by the right-click context menu when the panel is already open.
  // The content script dispatches this when the panel opens with pendingText set.
  useEffect(() => {
    const handler = (e: Event) => {
      const text: string = (e as CustomEvent).detail ?? ''
      if (!text) return
      const action = detectAction(text, settings.default_action)
      updateDraft({
        plaintext: text,
        action,
        buttonEnabled: isWithinLimit(text, action),
      })
    }
    window.addEventListener('securebin:set-text', handler)
    return () => window.removeEventListener('securebin:set-text', handler)
  }, [settings.default_action, updateDraft])

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
        if (draft.buttonEnabled) handleAction()
      }
      if (mod && e.shiftKey && e.key === 'e') {
        e.preventDefault()
        const isEnc = draft.action === EditorAction.ENCRYPT_PASTEBIN || draft.action === EditorAction.ENCRYPT
        updateDraft({ action: isEnc ? EditorAction.POST_PASTEBIN : EditorAction.ENCRYPT_PASTEBIN })
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [draft, handleAction, updateDraft])

  const executeAction = useCallback(
    async (passkey?: string, overrideAction?: EditorAction) => {
      const { plaintext } = draft
      const action = overrideAction ?? draft.action
      const { encMode, keyLength, apiKey } = settings

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
          })
          resetDraft()
          navigate('/result')
        } else if (action === EditorAction.ENCRYPT_PASTEBIN && passkey) {
          const result = await encrypt(plaintext, encMode, keyLength, passkey)
          const link = await postPastebin(result.cipherData, apiKey, { title: draft.title, format: draft.format, expiry: draft.expiry, privacy: draft.privacy })
          addToHistory({
            id: crypto.randomUUID(),
            action: EditorAction.ENCRYPT_PASTEBIN,
            pastebinLink: link,
            key: result.key,
            encText: result.cipherData,
            encMode: result.mode,
            keyLength: result.keyLength,
            date: Date.now(),
          })
          resetDraft()
          navigate('/result')
        } else if (action === EditorAction.POST_PASTEBIN) {
          const link = await postPastebin(plaintext, apiKey, { title: draft.title, format: draft.format, expiry: draft.expiry, privacy: draft.privacy })
          addToHistory({
            id: crypto.randomUUID(),
            action: EditorAction.POST_PASTEBIN,
            pastebinLink: link,
            key: null,
            encText: plaintext,
            encMode: null,
            keyLength: null,
            date: Date.now(),
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
          })
          resetDraft()
          navigate('/result')
        } else if (action === EditorAction.DECRYPT && passkey) {
          const decrypted = await decryptText(plaintext, passkey)
          const nextAction = detectAction(decrypted, settings.default_action)
          updateDraft({ 
            plaintext: decrypted,
            action: nextAction,
            buttonEnabled: isWithinLimit(decrypted, nextAction)
          })
        } else if (action === EditorAction.DECRYPT_PASTEBIN && passkey) {
          const pasteText = await getPastebin(plaintext)
          const decrypted = await decryptText(pasteText, passkey)
          const nextAction = detectAction(decrypted, settings.default_action)
          updateDraft({ 
            plaintext: decrypted,
            action: nextAction,
            buttonEnabled: isWithinLimit(decrypted, nextAction)
          })
        } else if (action === EditorAction.OPEN_PASTEBIN) {
          const pasteText = await getPastebin(plaintext)
          const nextAction = detectAction(pasteText, settings.default_action)
          updateDraft({ 
            plaintext: pasteText,
            action: nextAction,
            buttonEnabled: isWithinLimit(pasteText, nextAction)
          })
        }
      } catch (err) {
        console.error('Action failed:', err)
        addToHistory({
          id: crypto.randomUUID(),
          action,
          pastebinLink: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
          key: null,
          encText: null,
          encMode: null,
          keyLength: null,
          date: Date.now(),
        })
        navigate('/result')
      }
    },
    [draft, settings, addToHistory, resetDraft, updateDraft, navigate],
  )

  return (
    <div className="flex flex-col h-full">
      <PasteMetadata />
      <TextEditor />
      <ActionBar onAction={handleAction} />

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
