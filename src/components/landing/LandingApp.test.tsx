import { fireEvent, render, screen } from "@testing-library/react";
import LandingApp from "./LandingApp";

beforeAll(() => {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

describe("LandingApp", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
  });

  it("renders the landing page with legal links and an app link", () => {
    window.history.pushState({}, "", "/landing-page");
    render(<LandingApp initialRoute={{ page: "home", base: "/landing-page" }} />);

    expect(screen.getByRole("heading", { level: 1 }).textContent).toMatch(/can go/i);
    expect(document.title).toMatch(/Chip Sync/);
    expect(screen.getAllByRole("link", { name: "Open Chip Sync" })[0].getAttribute("href")).toBe("/");
    expect(screen.getByRole("link", { name: "Privacy Policy" }).getAttribute("href")).toBe(
      "/landing-page/privacy-policy",
    );
  });

  it("renders a legal document with the chipsync.co domain", () => {
    window.history.pushState({}, "", "/landing-page/cookie-policy");
    const { container } = render(<LandingApp initialRoute={{ page: "cookies", base: "/landing-page" }} />);

    const host = container.querySelector(".lp-legal-doc") as HTMLElement;
    const text = host.shadowRoot?.textContent ?? "";
    expect(text).toContain("Cookie Policy");
    expect(text).toContain("support@chipsync.co");
    expect(text).not.toContain("chipsync.io");
  });

  it("switches between the tree company and customer views with tabs", () => {
    window.history.pushState({}, "", "/landing-page");
    render(<LandingApp initialRoute={{ page: "home", base: "/landing-page" }} />);

    const companies = screen.getByRole("tab", { name: "For Tree Companies" });
    const customers = screen.getByRole("tab", { name: "For Customers" });
    expect(companies.getAttribute("aria-selected")).toBe("true");
    expect(screen.getAllByText(/drop sites/i).length).toBeGreaterThan(0);
    expect(screen.queryByText("Request wood chips, logs or tree work.")).toBeNull();

    fireEvent.click(customers);
    expect(customers.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("heading", { level: 1 }).textContent).toMatch(/local crews/i);
    expect(screen.getByText("Request wood chips, logs or tree work.")).toBeTruthy();
    expect(window.location.search).toBe("?for=customers");

    fireEvent.keyDown(customers, { key: "ArrowLeft" });
    expect(companies.getAttribute("aria-selected")).toBe("true");
  });
});
