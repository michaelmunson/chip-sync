/// <reference types="vite/client" />
/// <reference types="vitest/globals" />

interface ImportMetaEnv {
    readonly VITE_GOOGLE_MAPS_API_KEY?: string;
    /** Where the landing page's "Open the app" buttons point. */
    readonly VITE_APP_URL?: string;
}
