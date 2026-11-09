import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CssBaseline } from "@mui/material";
import {
  LandingPageId,
  LandingRoute,
  appUrl,
  landingHref,
  resolveLandingRoute,
} from "../../utils/landing";
import LandingPage from "./LandingPage";
import LegalPage from "./LegalPage";
import { LandingContext, LandingContextValue } from "./LandingContext";
import "./landing.css";

const TITLES: Record<LandingPageId, string> = {
  home: "Chip Sync — Every load of chips has a place to go",
  privacy: "Privacy Policy — Chip Sync",
  cookies: "Cookie Policy — Chip Sync",
  terms: "Terms & Conditions — Chip Sync",
};

const DESCRIPTION =
  "Chip Sync connects tree crews, drop sites and gardeners on one live map — with requests, offers, jobs, chat and route planning.";

function currentRoute(fallback: LandingRoute): LandingRoute {
  return resolveLandingRoute(window.location.hostname, window.location.pathname) ?? fallback;
}

function setMeta(name: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.name = name;
    document.head.appendChild(tag);
  }
  tag.content = content;
}

export default function LandingApp({ initialRoute }: { initialRoute: LandingRoute }) {
  const [route, setRoute] = useState(initialRoute);

  // The app styles lock the page to the viewport; the landing page scrolls like a normal site.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("landing-mode");
    const dark = window.matchMedia?.("(prefers-color-scheme: dark)");
    const apply = () => {
      root.dataset.theme = dark?.matches ? "dark" : "light";
    };
    apply();
    dark?.addEventListener?.("change", apply);
    return () => {
      root.classList.remove("landing-mode");
      delete root.dataset.theme;
      dark?.removeEventListener?.("change", apply);
    };
  }, []);

  useEffect(() => {
    document.title = TITLES[route.page];
    setMeta("description", DESCRIPTION);
    window.scrollTo(0, 0);
  }, [route.page]);

  useEffect(() => {
    const onPop = () => setRoute((prev) => currentRoute(prev));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = useCallback(
    (page: LandingPageId, hash?: string) => {
      const href = landingHref(route, page) + (hash ? `#${hash}` : "");
      window.history.pushState({}, "", href);
      setRoute((prev) => ({ ...prev, page }));
      if (hash) requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }));
    },
    [route],
  );

  const value = useMemo<LandingContextValue>(
    () => ({ route, navigate, href: (page) => landingHref(route, page), appUrl: appUrl(route) }),
    [route, navigate],
  );

  return (
    <LandingContext.Provider value={value}>
      <CssBaseline />
      {route.page === "home" ? <LandingPage /> : <LegalPage page={route.page} />}
    </LandingContext.Provider>
  );
}
