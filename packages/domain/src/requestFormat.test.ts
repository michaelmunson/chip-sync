import {
  describeOffer,
  formatTiming,
  isDelivery,
  offerPrice,
  offerQuantities,
  possessive,
  requestSummary,
  shortAddress,
  sortServices,
  todayIso,
} from "./requestFormat";

test("sortServices puts deliveries first in a stable order", () => {
  expect(sortServices(["other", "trim", "chips", "logs"])).toEqual(["chips", "logs", "trim", "other"]);
  expect(isDelivery("logs")).toBe(true);
  expect(isDelivery("removal")).toBe(false);
});

test("requestSummary", () => {
  expect(requestSummary({ services: [] })).toBe("Service request");
  expect(requestSummary({ services: ["logs", "chips"] })).toBe("Wood chip drop + Log drop");
  expect(requestSummary({ services: ["stump", "removal", "trim"] })).toBe("Tree removal + 2 more");
});

test("formatTiming", () => {
  expect(formatTiming({ timing: "asap" })).toBe("As soon as possible");
  expect(formatTiming({ timing: "flexible" })).toBe("Flexible timing");
  expect(formatTiming({ timing: "date", preferredDate: null })).toBe("Flexible timing");
  expect(formatTiming({ timing: "date", preferredDate: "2026-11-03" })).toMatch(/^On or around .*3/);
});

test("offerPrice and offerQuantities", () => {
  expect(offerPrice({ pricing: "free" })).toBe("Free");
  expect(offerPrice({ pricing: "unknown", price: 300 })).toBe("Price TBD");
  expect(offerPrice({ pricing: "fixed", price: 450 })).toBe("$450");
  expect(offerPrice({ pricing: "fixed", price: 99.5 })).toBe("$99.50");
  expect(offerQuantities({ chipsYards: 10, logLoads: 1 })).toEqual(["10 yd³ of chips", "1 load of logs"]);
  expect(offerQuantities({ logLoads: 2 })).toEqual(["2 loads of logs"]);
  expect(offerQuantities({})).toEqual([]);
});

test("describeOffer", () => {
  expect(describeOffer({ pricing: "free", chipsYards: 12 })).toBe("free, 12 yd³ of chips");
  expect(describeOffer({ pricing: "unknown" })).toBe("price to be confirmed on site");
  expect(describeOffer({ pricing: "fixed", price: 800 })).toBe("$800");
});

test("possessive", () => {
  expect(possessive("Greenline Arborists")).toBe("Greenline Arborists’");
  expect(possessive("Oak & Ash Tree Co")).toBe("Oak & Ash Tree Co’s");
});

test("shortAddress and todayIso", () => {
  expect(shortAddress("412 Maple Street, Brooklyn, NY 11201, USA")).toBe("412 Maple Street, Brooklyn");
  expect(shortAddress("Somewhere")).toBe("Somewhere");
  expect(todayIso(new Date(2026, 0, 5))).toBe("2026-01-05");
});
