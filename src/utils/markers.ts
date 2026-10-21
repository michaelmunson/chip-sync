import { Marker, MarkerKind, MaterialType } from "../types/dataTypes";

/** Legacy markers omit kind; treat them as drop sites. */
export function markerKind(marker: Pick<Marker, "kind"> | { kind?: string | null }): MarkerKind {
  if (marker.kind === "facility" || marker.kind === "jobSite" || marker.kind === "dropSite") {
    return marker.kind;
  }
  return "dropSite";
}

export function isDropSite(marker: Pick<Marker, "kind">): boolean {
  return markerKind(marker) === "dropSite";
}

export function isFacility(marker: Pick<Marker, "kind">): boolean {
  return markerKind(marker) === "facility";
}

export function isJobSite(marker: Pick<Marker, "kind">): boolean {
  return markerKind(marker) === "jobSite";
}

export const KIND_LABEL: Record<MarkerKind, string> = {
  dropSite: "Drop site",
  facility: "Facility",
  jobSite: "Job site",
};

/** Material filter used by Route menu and job routing plans. */
export function matchesMaterialFilter(markerType: MaterialType, filter: MaterialType): boolean {
  if (filter === "both") return markerType === "both";
  return markerType === filter || markerType === "both";
}

/** Collapse a job's produces list into one filter for nearest-drop lookup. */
export function materialFilterFromProduces(produces: MaterialType[]): MaterialType {
  const set = new Set(produces);
  if (set.has("both") || (set.has("chips") && set.has("wood"))) return "both";
  if (set.has("chips")) return "chips";
  if (set.has("wood")) return "wood";
  return "both";
}

/** ISO date (YYYY-MM-DD) for today in local time. */
export function localISODate(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDaysISO(startISO: string, days: number): string {
  const [y, m, d] = startISO.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return localISODate(date);
}

/** Hide expired job sites from the default map (endDate before today). */
export function isJobSiteActive(marker: Pick<Marker, "kind" | "endDate">, today = localISODate()): boolean {
  if (!isJobSite(marker)) return true;
  if (!marker.endDate) return true;
  return marker.endDate >= today;
}
