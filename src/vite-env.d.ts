/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL del backend, sin /api/v1. Por defecto http://127.0.0.1:8000 */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
