import { escapeHtml, formatDistance, formatPhone, initials, timeAgo } from "./format";

test("formatPhone formats US numbers and leaves others alone", () => {
  expect(formatPhone("2125550143")).toBe("(212) 555-0143");
  expect(formatPhone("+1 212-555-0143")).toBe("(212) 555-0143");
  expect(formatPhone("12345")).toBe("12345");
});

test("initials falls back to a placeholder", () => {
  expect(initials("ada", "lovelace")).toBe("AL");
  expect(initials()).toBe("?");
});

test("formatDistance", () => {
  expect(formatDistance(0.04)).toBe("Nearby");
  expect(formatDistance(2.345)).toBe("2.3 mi");
  expect(formatDistance(14.6)).toBe("15 mi");
  expect(formatDistance(undefined)).toBe("");
});

test("timeAgo", () => {
  const now = new Date("2026-10-19T12:00:00Z").getTime();
  expect(timeAgo(now - 10_000, now)).toBe("Just now");
  expect(timeAgo(now - 5 * 60_000, now)).toBe("5m ago");
  expect(timeAgo(now - 3 * 3_600_000, now)).toBe("3h ago");
  expect(timeAgo(now - 2 * 86_400_000, now)).toBe("2d ago");
  expect(timeAgo("not a date", now)).toBe("");
});

test("escapeHtml neutralises markup", () => {
  expect(escapeHtml(`<img src=x onerror="a('b')">&`)).toBe(
    "&lt;img src=x onerror=&quot;a(&#39;b&#39;)&quot;&gt;&amp;",
  );
});
