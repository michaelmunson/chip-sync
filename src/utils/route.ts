import { Marker, MaterialType } from "../types/dataTypes";
import { Coordinates } from "../types/generalTypes";
import { Geo } from "./location";
import { isDropSite, isFacility, matchesMaterialFilter } from "./markers";

export interface PlannedRoute {
  dropSite: Marker;
  facility: Marker;
  /** Straight-line miles: current location → drop site. */
  toDropMiles: number;
  /** Straight-line miles: drop site → facility. */
  toFacilityMiles: number;
  totalMiles: number;
}

/**
 * Shortest trip from `from` to a drop site accepting `filter`, then on to `facility`.
 * Picks the drop site that minimises the whole trip, not merely the one closest to `from`
 * (a slightly farther drop that sits on the way to the facility can win).
 * Distances are straight-line estimates; the maps app computes the real driving route.
 */
export function planRoute({
  from,
  facility,
  markers,
  filter,
}: {
  from: Coordinates;
  facility: Marker;
  markers: Marker[];
  filter: MaterialType;
}): PlannedRoute | null {
  let best: PlannedRoute | null = null;
  for (const dropSite of markers) {
    if (!isDropSite(dropSite) || !matchesMaterialFilter(dropSite.type, filter)) continue;
    const toDropMiles = Geo.distance(from, dropSite);
    const toFacilityMiles = Geo.distance(dropSite, facility);
    const totalMiles = toDropMiles + toFacilityMiles;
    if (!best || totalMiles < best.totalMiles) {
      best = { dropSite, facility, toDropMiles, toFacilityMiles, totalMiles };
    }
  }
  return best;
}

/** One route per facility, shortest total trip first. Facilities with no matching drop site are omitted. */
export function planRoutesByFacility({
  from,
  markers,
  filter,
}: {
  from: Coordinates;
  markers: Marker[];
  filter: MaterialType;
}): PlannedRoute[] {
  return markers
    .filter(isFacility)
    .map((facility) => planRoute({ from, facility, markers, filter }))
    .filter((route): route is PlannedRoute => route !== null)
    .sort((a, b) => a.totalMiles - b.totalMiles);
}
