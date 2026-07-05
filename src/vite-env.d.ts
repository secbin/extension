/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Bundled default Pastebin dev key, set in .env.local (never committed). */
  readonly VITE_DEFAULT_PASTEBIN_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
