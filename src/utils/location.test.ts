import { describe, expect, test } from "vitest";
import { Geo } from "./location";

const drop = { latitude: 42.1, longitude: -71.2 };
const facility = { latitude: 42.5, longitude: -71.6 };

describe("Geo.getRouteURL", () => {
  test("google: current location is the implicit origin, drop site a waypoint, facility the destination", () => {
    const url = new URL(Geo.getRouteURL({ mapChoice: "google", stops: [drop, facility] })!);
    expect(url.origin + url.pathname).toBe("https://www.google.com/maps/dir/");
    expect(url.searchParams.get("origin")).toBeNull();
    expect(url.searchParams.get("waypoints")).toBe("42.1,-71.2");
    expect(url.searchParams.get("destination")).toBe("42.5,-71.6");
  });

  test("google: a single stop has no waypoints", () => {
    const url = new URL(Geo.getRouteURL({ mapChoice: "google", stops: [facility] })!);
    expect(url.searchParams.has("waypoints")).toBe(false);
    expect(url.searchParams.get("destination")).toBe("42.5,-71.6");
  });

  test("apple: starts at Current Location and chains stops with to:", () => {
    const href = Geo.getRouteURL({ mapChoice: "apple", stops: [drop, facility] })!;
    expect(href).toContain("saddr=Current%20Location");
    expect(href).toContain("daddr=42.1,-71.2+to:42.5,-71.6");
  });

  test("returns null with nothing to route to", () => {
    expect(Geo.getRouteURL({ mapChoice: "google", stops: [] })).toBeNull();
  });
});
