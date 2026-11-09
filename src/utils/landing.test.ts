import { APP_HOST, appUrl, landingHref, resolveLandingRoute } from "./landing";

describe("resolveLandingRoute", () => {
  it("serves the landing page on chipsync.co and its www / get aliases", () => {
    for (const host of ["chipsync.co", "www.chipsync.co", "get.chipsync.co"]) {
      expect(resolveLandingRoute(host, "/")).toEqual({ page: "home", base: "" });
    }
    expect(resolveLandingRoute("CHIPSYNC.co", "/anything")).toEqual({ page: "home", base: "" });
  });

  it("serves the app, not the landing page, on app.chipsync.co", () => {
    expect(resolveLandingRoute(APP_HOST, "/")).toBeNull();
    expect(resolveLandingRoute(APP_HOST, "/landing-page")).toBeNull();
    expect(resolveLandingRoute(APP_HOST, "/privacy-policy")).toBeNull();
  });

  it("resolves the legal pages on the landing hosts", () => {
    expect(resolveLandingRoute("chipsync.co", "/privacy-policy")?.page).toBe("privacy");
    expect(resolveLandingRoute("get.chipsync.co", "/privacy-policy")?.page).toBe("privacy");
    expect(resolveLandingRoute("get.chipsync.co", "/cookie-policy/")?.page).toBe("cookies");
    expect(resolveLandingRoute("get.chipsync.co", "/terms-and-conditions")?.page).toBe("terms");
  });

  it("serves the landing page on localhost only under /landing-page", () => {
    expect(resolveLandingRoute("localhost", "/landing-page")).toEqual({ page: "home", base: "/landing-page" });
    expect(resolveLandingRoute("localhost", "/landing-page/")?.page).toBe("home");
    expect(resolveLandingRoute("localhost", "/landing-page/privacy-policy")).toEqual({
      page: "privacy",
      base: "/landing-page",
    });
    expect(resolveLandingRoute("127.0.0.1", "/landing-page")?.page).toBe("home");
    expect(resolveLandingRoute("localhost", "/")).toBeNull();
    expect(resolveLandingRoute("localhost", "/landing-pages")).toBeNull();
  });

  it("never serves the landing page on any other host", () => {
    expect(resolveLandingRoute("www.chipsync.co", "/landing-page")?.base).toBe("");
    expect(resolveLandingRoute("evil-chipsync.co", "/")).toBeNull();
    expect(resolveLandingRoute("chipsync.co.evil.com", "/")).toBeNull();
  });
});

describe("landingHref", () => {
  it("prefixes links with the base", () => {
    expect(landingHref({ base: "" }, "home")).toBe("/");
    expect(landingHref({ base: "" }, "terms")).toBe("/terms-and-conditions");
    expect(landingHref({ base: "/landing-page" }, "home")).toBe("/landing-page");
    expect(landingHref({ base: "/landing-page" }, "privacy")).toBe("/landing-page/privacy-policy");
  });
});

describe("appUrl", () => {
  it("opens the local app when developing", () => {
    expect(appUrl({ base: "/landing-page" })).toBe("/");
  });

  it("opens app.chipsync.co from the real landing hosts", () => {
    expect(appUrl({ base: "" })).toBe("https://app.chipsync.co");
  });
});
