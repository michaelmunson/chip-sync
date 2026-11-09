/**
 * Marketing-site routing. The landing page is served instead of the app on
 * `chipsync.co` (and `www.` / `get.`); the app itself lives on `app.chipsync.co`
 * and is the default for every other host. On localhost the landing page lives
 * under `/landing-page` so it can be developed next to the app. There is no
 * router in the app, so this resolves a (hostname, pathname) pair straight to a page.
 */
export type LandingPageId = "home" | "privacy" | "cookies" | "terms";

export const APP_HOST = "app.chipsync.co";
/** Hosts that serve the landing page. `get.` is kept because the legal documents link to it. */
export const LANDING_HOSTS = new Set(["chipsync.co", "www.chipsync.co", "get.chipsync.co"]);
export const LOCAL_LANDING_BASE = "/landing-page";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

/** Paths mirror the legacy site so existing links to the legal pages keep working. */
export const LANDING_PATHS: Record<LandingPageId, string> = {
  home: "/",
  privacy: "/privacy-policy",
  cookies: "/cookie-policy",
  terms: "/terms-and-conditions",
};

export interface LandingRoute {
  page: LandingPageId;
  /** Prefix for every landing URL: "" on the real host, "/landing-page" locally. */
  base: string;
}

const trimSlashes = (path: string) => path.replace(/\/+$/, "");

function pageFor(path: string): LandingPageId {
  const clean = trimSlashes(path).toLowerCase();
  const match = (Object.keys(LANDING_PATHS) as LandingPageId[]).find(
    (id) => id !== "home" && LANDING_PATHS[id] === clean,
  );
  return match ?? "home";
}

/** Returns the landing route for this location, or null when the app should render. */
export function resolveLandingRoute(hostname: string, pathname: string): LandingRoute | null {
  const host = hostname.toLowerCase();

  if (LANDING_HOSTS.has(host)) return { page: pageFor(pathname), base: "" };

  if (LOCAL_HOSTS.has(host)) {
    const clean = trimSlashes(pathname);
    if (clean === LOCAL_LANDING_BASE || clean.startsWith(`${LOCAL_LANDING_BASE}/`)) {
      return { page: pageFor(clean.slice(LOCAL_LANDING_BASE.length)), base: LOCAL_LANDING_BASE };
    }
  }
  return null;
}

export function landingHref(route: Pick<LandingRoute, "base">, page: LandingPageId): string {
  const path = LANDING_PATHS[page];
  if (!route.base) return path;
  return page === "home" ? route.base : `${route.base}${path}`;
}

/** Where "Open the app" points. Locally that's the app itself; override with VITE_APP_URL. */
export function appUrl(route: Pick<LandingRoute, "base">): string {
  const configured = import.meta.env.VITE_APP_URL;
  if (configured) return configured;
  return route.base ? "/" : `https://${APP_HOST}`;
}
