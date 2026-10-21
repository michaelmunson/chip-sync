import { describe, expect, test } from "vitest";
import { Marker } from "../types/dataTypes";
import { buildRoutingStops, nearestDropSites } from "./jobs";

vi.mock("./location", () => ({
  Geo: {
    distance: (
      a: { latitude: number; longitude: number },
      b: { latitude: number; longitude: number },
    ) => Math.abs(a.latitude - b.latitude) + Math.abs(a.longitude - b.longitude),
  },
}));

const marker = (
  partial: Partial<Marker> & Pick<Marker, "id" | "name" | "type" | "kind">,
): Marker =>
  ({
    address: "addr",
    description: "",
    contact: { name: "", phone: "" },
    images: [],
    latitude: 0,
    longitude: 0,
    organization: {} as Marker["organization"],
    ...partial,
  }) as Marker;

describe("nearestDropSites", () => {
  test("returns closest drop sites matching material, ignoring facilities", () => {
    const markers = [
      marker({ id: "f1", name: "HQ", type: "both", kind: "facility", latitude: 0, longitude: 0 }),
      marker({ id: "d1", name: "Far chips", type: "chips", kind: "dropSite", latitude: 5, longitude: 0 }),
      marker({ id: "d2", name: "Near chips", type: "chips", kind: "dropSite", latitude: 1, longitude: 0 }),
      marker({ id: "d3", name: "Near wood", type: "wood", kind: "dropSite", latitude: 0.5, longitude: 0 }),
    ];
    const nearest = nearestDropSites({
      from: { latitude: 0, longitude: 0 },
      markers,
      filter: "chips",
      limit: 5,
    });
    expect(nearest.map((m) => m.id)).toEqual(["d2", "d1"]);
  });
});

describe("buildRoutingStops", () => {
  test("prefers the assignee’s attached facility and assigned job site", () => {
    const facilityMarkers = [
      marker({ id: "fac-a", name: "Depot A", type: "both", kind: "facility", latitude: 0, longitude: 0 }),
      marker({ id: "fac-b", name: "Depot B", type: "both", kind: "facility", latitude: 2, longitude: 0 }),
    ];
    const jobSiteMarkers = [
      marker({ id: "job-1", name: "Site 1", type: "both", kind: "jobSite", latitude: 1, longitude: 0 }),
      marker({ id: "job-2", name: "Site 2", type: "both", kind: "jobSite", latitude: 3, longitude: 0 }),
    ];
    const dropMarkers = [
      marker({ id: "drop-1", name: "Drop", type: "chips", kind: "dropSite", latitude: 1.1, longitude: 0 }),
    ];

    const stops = buildRoutingStops({
      assigneeUserId: "user-1",
      jobSiteMarkerId: "job-2",
      facilityMarkers,
      jobSiteMarkers,
      dropMarkers,
      locationAssignments: [
        {
          id: "la-1",
          organizationId: "org",
          markerId: "fac-b",
          userId: "user-1",
          createdAt: "",
        },
      ],
      materialFilter: "chips",
    });

    expect(stops.facilityMarkerId).toBe("fac-b");
    expect(stops.jobSiteMarkerId).toBe("job-2");
    expect(stops.dropSiteMarkerIds).toEqual(["drop-1"]);
  });
});
