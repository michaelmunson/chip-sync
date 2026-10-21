/** Website-restricted browser key, inlined from the Amplify env var at build time. */
export function getGoogleMapsApiKey(): string {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        throw new Error("VITE_GOOGLE_MAPS_API_KEY is not set");
    }
    return apiKey;
}
