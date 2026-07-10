import { create } from 'zustand'
import {
  StorageKey,
  EncryptionMode,
  EditorAction,
  DEFAULT_API_KEY,
  encodeStoredApiKey,
  decodeStoredApiKey,
} from './constants'
import { isWithinLimit } from './editor-utils'
import { getSyncItem, setSyncItem, deleteSyncItem, getLocalItem, setLocalItem, deleteLocalItem, appendToLocalArray, removeFromLocalArray } from './storage'

// Types
export interface HistoryItem {
  id: string
  action: EditorAction
  pastebinLink: string
  encText: string | null
  key: string | null
  encMode: string | null
  keyLength: number | null
  date: number
  // Paste metadata (optional — not stored on old history items)
  title?: string
  format?: string
  expiry?: string   // 'N' | '10M' | '1H' | '1D' | '1W' | '2W' | '1M' | '6M' | '1Y'
  privacy?: string  // '0' public | '1' unlisted
}

export type DraftTitleMode = 'datetime' | 'date' | 'untitled' | 'custom' | 'custom_date' | 'custom_datetime'

export interface Settings {
  apiKey: string
  encMode: EncryptionMode
  keyLength: number
  theme: 'light' | 'dark' | 'system'
  default_action: EditorAction  // default primary action in editor
  page_timeout: number          // seconds to remember last page; 0 = disabled, -1 = always
  userKey: string       // api_user_key from Pastebin login, empty = not logged in
  username: string      // display name, from userdetails
  draft_title_mode: DraftTitleMode
  draft_title_prefix: string    // used when draft_title_mode === 'custom'
}

export interface Draft {
  action: EditorAction
  plaintext: string
  buttonEnabled: boolean
  encText: string
  pastebinLink: string
  key: string
  updatedAt: number
  title: string
  format: string
  formatLocked: boolean  // user explicitly picked the format — don't auto-detect over it
  expiry: string
  privacy: '0' | '1'
}

interface AppState {
  // Settings
  settings: Settings
  setSettings: (settings: Partial<Settings>) => void
  resetSettings: () => void
  loadSettings: () => Promise<void>

  // Theme
  toggleTheme: () => void
  signOut: () => void

  // Draft
  draft: Draft
  updateDraft: (draft: Partial<Draft>) => void
  resetDraft: () => void
  loadDraft: () => Promise<void>

  // History
  history: HistoryItem[]
  addToHistory: (item: HistoryItem) => void
  removeFromHistory: (id: string) => void
  clearHistory: () => void
  loadHistory: () => Promise<void>

  // Decrypt result — in-memory only. Decrypted plaintext is deliberately never
  // written to extension storage (history stores ciphertext, not plaintext).
  decryptResult: { plaintext: string; date: number } | null
  setDecryptResult: (result: { plaintext: string; date: number } | null) => void

  // Dialog
  activeDialog: string | null
  openDialog: (id: string) => void
  closeDialog: () => void

  // Initialization
  initialized: boolean
  initialize: () => Promise<void>
}

function getSystemTheme(): 'light' | 'dark' {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function generateDraftTitle(mode: DraftTitleMode = 'datetime', prefix = ''): string {
  const now = new Date()
  switch (mode) {
    case 'datetime':
      return now.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    case 'date':
      return now.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    case 'untitled':
      return 'Untitled Paste'
    case 'custom':
      return prefix.trim() || 'Untitled Paste'
    case 'custom_date': {
      const p = prefix.trim() || 'Paste'
      return `${p} — ${now.toLocaleString('en-US', { month: 'short', day: 'numeric' })}`
    }
    case 'custom_datetime': {
      const p = prefix.trim() || 'Paste'
      return `${p} — ${now.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`
    }
  }
}

const DEFAULT_SETTINGS: Settings = {
  apiKey: DEFAULT_API_KEY,
  encMode: EncryptionMode.AES_GCM,
  keyLength: 16,
  theme: 'system',
  default_action: EditorAction.POST_PASTEBIN,
  page_timeout: 30,
  userKey: '',
  username: '',
  draft_title_mode: 'datetime',
  draft_title_prefix: '',
}

/** Resolves the effective dark/light value for a given theme setting */
export function resolveTheme(theme: Settings['theme']): 'light' | 'dark' {
  if (theme === 'system') return getSystemTheme()
  return theme
}

const DEFAULT_DRAFT: Draft = {
  action: EditorAction.POST_PASTEBIN,
  plaintext: '',
  buttonEnabled: false,
  encText: '',
  pastebinLink: '',
  key: '',
  updatedAt: 0,
  title: 'Untitled Paste',
  format: 'text',
  formatLocked: false,
  expiry: 'N',
  privacy: '0',
}

// Draft writes are debounced: updateDraft fires on every keystroke and drafts
// can be large, so each write replaces any still-pending one.
const DRAFT_PERSIST_DELAY_MS = 400
let draftPersistTimer: ReturnType<typeof setTimeout> | undefined

export const useStore = create<AppState>((set, get) => ({
  // Settings
  settings: { ...DEFAULT_SETTINGS },

  setSettings: (partial) => {
    const updated = { ...get().settings, ...partial }
    set({ settings: updated })
    const toStore = { ...updated, apiKey: encodeStoredApiKey(updated.apiKey) }
    setSyncItem(StorageKey.SETTINGS, JSON.stringify(toStore))
  },

  resetSettings: () => {
    set({ settings: { ...DEFAULT_SETTINGS } })
    setSyncItem(StorageKey.SETTINGS, JSON.stringify({ ...DEFAULT_SETTINGS, apiKey: encodeStoredApiKey(DEFAULT_API_KEY) }))
  },

  loadSettings: async () => {
    const raw = await getSyncItem<string>(StorageKey.SETTINGS)
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        set({
          settings: {
            ...DEFAULT_SETTINGS,
            ...parsed,
            theme: parsed.theme ?? getSystemTheme(),
            userKey: parsed.userKey ?? '',
            username: parsed.username ?? '',
            apiKey: parsed.apiKey ? decodeStoredApiKey(parsed.apiKey) : DEFAULT_SETTINGS.apiKey,
          },
        })
      } catch {
        // corrupt data, use defaults
      }
    }
  },

  // Theme
  toggleTheme: () => {
    const current = get().settings.theme
    const next: Settings['theme'] = current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light'
    get().setSettings({ theme: next })
  },

  signOut: () => {
    get().setSettings({ userKey: '', username: '' })
  },

  // Draft
  draft: { ...DEFAULT_DRAFT },

  updateDraft: (partial) => {
    const updated = { ...get().draft, ...partial, updatedAt: Date.now() }
    // Keep buttonEnabled in sync with the text/action pair unless the caller
    // explicitly set it — limits differ per action, so switching the action
    // must re-validate the current text.
    if (partial.buttonEnabled === undefined && (partial.plaintext !== undefined || partial.action !== undefined)) {
      updated.buttonEnabled = isWithinLimit(updated.plaintext, updated.action)
    }
    set({ draft: updated })
    // Drafts live in local storage: sync storage caps items at 8 KB and 120
    // writes/min, both far below what per-keystroke saving of large pastes needs.
    clearTimeout(draftPersistTimer)
    draftPersistTimer = setTimeout(() => {
      setLocalItem(StorageKey.DRAFT, JSON.stringify(updated)).catch(() => {})
    }, DRAFT_PERSIST_DELAY_MS)
  },

  resetDraft: () => {
    clearTimeout(draftPersistTimer)  // a pending write would resurrect the cleared draft
    const { default_action, draft_title_mode, draft_title_prefix } = get().settings
    const action = default_action ?? EditorAction.POST_PASTEBIN
    const title = generateDraftTitle(draft_title_mode ?? 'datetime', draft_title_prefix ?? '')
    set({ draft: { ...DEFAULT_DRAFT, action, title } })
    deleteLocalItem(StorageKey.DRAFT)
    deleteSyncItem(StorageKey.DRAFT)  // clear any copy left from the sync-storage era
  },

  loadDraft: async () => {
    const defaultAction = get().settings.default_action ?? EditorAction.POST_PASTEBIN
    let raw = await getLocalItem<string>(StorageKey.DRAFT)
    if (!raw) {
      // Migrate drafts saved before the move from sync to local storage
      raw = await getSyncItem<string>(StorageKey.DRAFT)
      if (raw) deleteSyncItem(StorageKey.DRAFT)
    }
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (!parsed.plaintext?.length) {
          set({ draft: { ...DEFAULT_DRAFT, action: defaultAction } })
          return
        }
        set({ draft: { ...DEFAULT_DRAFT, ...parsed } })
      } catch {
        // corrupt data — fall back to defaults
        set({ draft: { ...DEFAULT_DRAFT, action: defaultAction } })
      }
    } else {
      set({ draft: { ...DEFAULT_DRAFT, action: defaultAction } })
    }
  },

  // History
  history: [],

  addToHistory: (item) => {
    set((state) => ({ history: [item, ...state.history] }))
    appendToLocalArray(StorageKey.HISTORY, item)
  },

  removeFromHistory: (id) => {
    set((state) => ({ history: state.history.filter((h) => h.id !== id) }))
    removeFromLocalArray(StorageKey.HISTORY, id)
  },

  clearHistory: () => {
    set({ history: [] })
    setLocalItem(StorageKey.HISTORY, [])
  },

  loadHistory: async () => {
    const items = await getLocalItem<HistoryItem[]>(StorageKey.HISTORY)
    if (items?.length) {
      // Most recent first
      set({ history: items.reverse() })
    }
  },

  // Decrypt result
  decryptResult: null,
  setDecryptResult: (result) => set({ decryptResult: result }),

  // Dialog
  activeDialog: null,
  openDialog: (id) => set({ activeDialog: id }),
  closeDialog: () => set({ activeDialog: null }),

  // Initialization
  initialized: false,

  initialize: async () => {
    if (get().initialized) return
    // Load settings first so loadDraft can check draft_timeout
    await get().loadSettings()
    await Promise.all([
      get().loadDraft(),
      get().loadHistory(),
    ])
    set({ initialized: true })
  },
}))
