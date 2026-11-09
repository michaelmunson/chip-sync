import React, { useContext } from "react";
import { LandingPageId, LandingRoute } from "../../utils/landing";

export interface LandingContextValue {
  route: LandingRoute;
  navigate: (page: LandingPageId, hash?: string) => void;
  href: (page: LandingPageId) => string;
  /** Destination of the "Open Chip Sync" buttons. */
  appUrl: string;
}

export const LandingContext = React.createContext<LandingContextValue | null>(null);

export function useLanding(): LandingContextValue {
  const ctx = useContext(LandingContext);
  if (!ctx) throw new Error("useLanding must be used inside <LandingApp>");
  return ctx;
}
