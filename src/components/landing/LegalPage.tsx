import React, { useEffect, useRef } from "react";
import privacyHtml from "./legal/privacy-policy.html?raw";
import cookieHtml from "./legal/cookie-policy.html?raw";
import termsHtml from "./legal/terms-and-conditions.html?raw";
import { LandingPageId } from "../../utils/landing";
import { SiteFooter, SiteLink, SiteNav } from "./SiteChrome";

const DOCUMENTS: Partial<Record<LandingPageId, { title: string; html: string }>> = {
  privacy: { title: "Privacy Policy", html: privacyHtml },
  cookies: { title: "Cookie Policy", html: cookieHtml },
  terms: { title: "Terms & Conditions", html: termsHtml },
};

/**
 * The legal documents are exported HTML with their own global <style> rules
 * (`body`, `ul`, …). A shadow root keeps those from leaking into the page.
 */
function LegalDocument({ html }: { html: string }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const root = el.shadowRoot ?? el.attachShadow({ mode: "open" });
    root.innerHTML = `
      <style>
        :host { display: block; }
        .doc { font-family: Arial, Helvetica, sans-serif; color: #404040; line-height: 1.6; overflow-wrap: anywhere; user-select: text; -webkit-user-select: text; }
        .doc img { max-width: 100%; height: auto; }
        .doc table { max-width: 100%; display: block; overflow-x: auto; }
      </style>
      <div class="doc">${html}</div>`;
  }, [html]);

  return <div ref={host} className="lp-legal-doc" />;
}

export default function LegalPage({ page }: { page: LandingPageId }) {
  const doc = DOCUMENTS[page];
  return (
    <div className="lp lp-legal">
      <SiteNav onHome={false} />
      <main className="lp-container lp-legal-main">
        <SiteLink page="home" className="lp-back">← Back to Chip Sync</SiteLink>
        <h1 className="lp-visually-hidden">{doc?.title}</h1>
        <article className="lp-legal-card">{doc && <LegalDocument html={doc.html} />}</article>
      </main>
      <SiteFooter />
    </div>
  );
}
