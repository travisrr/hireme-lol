/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_SITE_ORIGIN: string;
  readonly VITE_FOUNDING_PREVIEW: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
