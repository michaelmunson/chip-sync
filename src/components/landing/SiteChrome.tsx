import React from "react";
import { LandingPageId } from "../../utils/landing";
import Logo from "../utils/Logo";
import { useLanding } from "./LandingContext";

/** In-site link: client-side navigation for landing pages, ordinary link otherwise. */
export function SiteLink({
  page,
  hash,
  children,
  ...rest
}: { page: LandingPageId; hash?: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const { href, navigate } = useLanding();
  return (
    <a
      {...rest}
      href={href(page) + (hash ? `#${hash}` : "")}
      onClick={(event) => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
        event.preventDefault();
        navigate(page, hash);
      }}
    >
      {children}
    </a>
  );
}

export function Brand() {
  return (
    <SiteLink page="home" className="lp-brand" aria-label="Chip Sync home">
      <Logo size="small" />
      <span>Chip Sync</span>
    </SiteLink>
  );
}

export function SiteNav({ onHome, tabs }: { onHome: boolean; tabs?: React.ReactNode }) {
  const { appUrl } = useLanding();
  return (
    <header className="lp-nav">
      <div className={`lp-container lp-nav-inner${tabs ? " has-tabs" : ""}`}>
        <Brand />
        {onHome && tabs}
        <a className="lp-btn lp-btn--primary lp-btn--sm lp-nav-cta" href={appUrl}>
          Open Chip Sync
        </a>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { appUrl } = useLanding();
  return (
    <footer className="lp-footer">
      <div className="lp-container lp-footer-inner">
        <div className="lp-footer-brand">
          <Brand />
          <p>Your crew. Your sites. One connected workspace.</p>
        </div>
        <nav aria-label="Legal" className="lp-footer-col">
          <h2>Legal</h2>
          <SiteLink page="privacy">Privacy Policy</SiteLink>
          <SiteLink page="terms">Terms &amp; Conditions</SiteLink>
          <SiteLink page="cookies">Cookie Policy</SiteLink>
        </nav>
        <div className="lp-footer-col">
          <h2>Get started</h2>
          <a href={appUrl}>Sign in or create an account</a>
          <a href="mailto:support@chipsync.co">support@chipsync.co</a>
        </div>
      </div>
      <div className="lp-container lp-footer-base">
        <span>© {new Date().getFullYear()} Tarrant Munson Enterprises LLC. All rights reserved.</span>
        <span>Putnam Valley, New York</span>
      </div>
    </footer>
  );
}
