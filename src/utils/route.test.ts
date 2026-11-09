import { describe, expect, test } from "vitest";
import { Marker } from "../types/dataTypes";
import { planRoute, planRoutesByFacility } from "./route";

vi.mock("./location", () => ({
  Geo: {
    distance: (
      a: { latitude: number; longitude: number },
      b: { latitude: number; longitude: number },
    ) => Math.abs(a.latitude - b.latitude) + Math.abs(a.longitude - b.longitude),
  },
}));

const marker = (m: Partial<Marker> & Pick<Marker, "id" | "type" | "kind">): Marker =>
  ({ name: m.id, address: "a", latitude: 0, longitude: 0, ...m }) as Marker;

const me = { latitude: 0, longitude: 0 };

describe("planRoute", () => {
  test("prefers the drop site that minimises the whole trip over the one nearest to the user", () => {
    const facility = marker({ id: "hq", type: "both", kind: "facility", latitude: 10 });
    const near = marker({ id: "near", type: "chips", kind: "dropSite", latitude: -2 }); // 2 + 12 = 14
    const onTheWay = marker({ id: "way", type: "chips", kind: "dropSite", latitude: 5 }); // 5 + 5 = 10
    const route = planRoute({ from: me, facility, markers: [near, onTheWay, facility], filter: "chips" });
    expect(route?.dropSite.id).toBe("way");
    expect(route?.totalMiles).toBe(10);
  });

  test("only considers drop sites that accept the material, ignoring facilities and job sites", () => {
    const facility = marker({ id: "hq", type: "both", kind: "facility", latitude: 10 });
    const wood = marker({ id: "wood", type: "wood", kind: "dropSite", latitude: 1 });
    const chips = marker({ id: "chips", type: "chips", kind: "dropSite", latitude: 8 });
    const jobSite = marker({ id: "job", type: "chips", kind: "jobSite", latitude: 1 });
    const route = planRoute({ from: me, facility, markers: [wood, chips, jobSite, facility], filter: "chips" });
    expect(route?.dropSite.id).toBe("chips");
  });

  test("a drop site accepting both materials serves chips and logs; \"both\" needs one that takes both", () => {
    const facility = marker({ id: "hq", type: "both", kind: "facility", latitude: 10 });
    const chips = marker({ id: "chips", type: "chips", kind: "dropSite", latitude: 5 });
    const both = marker({ id: "both", type: "both", kind: "dropSite", latitude: 9 });
    const markers = [chips, both, facility];
    expect(planRoute({ from: me, facility, markers, filter: "chips" })?.dropSite.id).toBe("chips");
    expect(planRoute({ from: me, facility, markers, filter: "both" })?.dropSite.id).toBe("both");
  });

  test("returns null when no drop site accepts the material", () => {
    const facility = marker({ id: "hq", type: "both", kind: "facility" });
    const chips = marker({ id: "chips", type: "chips", kind: "dropSite" });
    expect(planRoute({ from: me, facility, markers: [chips, facility], filter: "wood" })).toBeNull();
  });

  test("treats legacy markers without a kind as drop sites", () => {
    const facility = marker({ id: "hq", type: "both", kind: "facility", latitude: 4 });
    const legacy = marker({ id: "old", type: "chips", kind: undefined as any, latitude: 2 });
    expect(planRoute({ from: me, facility, markers: [legacy, facility], filter: "chips" })?.dropSite.id).toBe("old");
  });
});

describe("planRoutesByFacility", () => {
  test("returns one route per facility, shortest first", () => {
    const far = marker({ id: "far", type: "both", kind: "facility", latitude: 20 });
    const close = marker({ id: "close", type: "both", kind: "facility", latitude: 6 });
    const drop = marker({ id: "drop", type: "chips", kind: "dropSite", latitude: 5 });
    const routes = planRoutesByFacility({ from: me, markers: [far, close, drop], filter: "chips" });
    expect(routes.map((r) => r.facility.id)).toEqual(["close", "far"]);
  });

  test("is empty without facilities", () => {
    const drop = marker({ id: "drop", type: "chips", kind: "dropSite" });
    expect(planRoutesByFacility({ from: me, markers: [drop], filter: "chips" })).toEqual([]);
  });
});
