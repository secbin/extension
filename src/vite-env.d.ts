/// <reference types="vite/client" />
/// <reference types="@crxjs/vite-plugin/client" />

interface ImportMetaEnv {
  /** Bundled default Pastebin dev key, set in .env.local (never committed). */
  readonly VITE_DEFAULT_PASTEBIN_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
