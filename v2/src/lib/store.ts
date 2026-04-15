import { create } from 'zustand'
import {
  StorageKey,
  EncryptionMode,
  EditorAction,
  DEFAULT_API_KEY_HASH,
} from './constants'
import { getSyncItem, setSyncItem, deleteSyncItem, getLocalItem, setLocalItem, appendToLocalArray, removeFromLocalArray } from './storage'

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
}

export interface Settings {
  apiKey: string
  encMode: EncryptionMode
  keyLength: number
  theme: 'light' | 'dark' | 'system'
  default_action: EditorAction  // default primary action in editor
  page_timeout: number          // seconds to remember last page; 0 = disabled, -1 = always
  userKey: string       // api_user_key from Pastebin login, empty = not logged in
  username: string      // display name, from userdetails
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

function generateDraftTitle(): string {
  return new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
  // → "Apr 9, 2:34 PM"
}

const DEFAULT_SETTINGS: Settings = {
  apiKey: atob(DEFAULT_API_KEY_HASH),
  encMode: EncryptionMode.AES_GCM,
  keyLength: 16,
  theme: 'system',
  default_action: EditorAction.POST_PASTEBIN,
  page_timeout: 30,
  userKey: '',
  username: '',
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
  expiry: 'N',
  privacy: '0',
}

export const useStore = create<AppState>((set, get) => ({
  // Settings
  settings: { ...DEFAULT_SETTINGS },

  setSettings: (partial) => {
    const updated = { ...get().settings, ...partial }
    set({ settings: updated })
    // Encode API key as base64 for storage; use encodeURIComponent to handle any character set
    const encodedKey = btoa(encodeURIComponent(updated.apiKey))
    const toStore = { ...updated, apiKey: encodedKey }
    setSyncItem(StorageKey.SETTINGS, JSON.stringify(toStore))
  },

  resetSettings: () => {
    set({ settings: { ...DEFAULT_SETTINGS } })
    setSyncItem(StorageKey.SETTINGS, JSON.stringify({ ...DEFAULT_SETTINGS, apiKey: DEFAULT_API_KEY_HASH }))
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
            apiKey: parsed.apiKey ? decodeURIComponent(atob(parsed.apiKey)) : DEFAULT_SETTINGS.apiKey,
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
    set({ draft: updated })
    setSyncItem(StorageKey.DRAFT, JSON.stringify(updated))
  },

  resetDraft: () => {
    const defaultAction = get().settings.default_action ?? EditorAction.POST_PASTEBIN
    set({ draft: { ...DEFAULT_DRAFT, action: defaultAction, title: generateDraftTitle() } })
    deleteSyncItem(StorageKey.DRAFT)
  },

  loadDraft: async () => {
    const defaultAction = get().settings.default_action ?? EditorAction.POST_PASTEBIN
    const raw = await getSyncItem<string>(StorageKey.DRAFT)
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
