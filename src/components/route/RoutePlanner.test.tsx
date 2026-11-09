import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import RoutePlanner from "./RoutePlanner";
import { User } from "../../types/dataTypes";

const m = (id: string, kind: string, type: string, latitude: number) => ({
  id, name: id, kind, type, latitude, longitude: 0, address: id,
});

const user = (markers: any[]) =>
  ({ mapChoice: "google", organization: { markers } }) as unknown as User;

const here = { latitude: 0, longitude: 0 };
const render_ = (u: User, onAddLocation = vi.fn(), toggleModal = vi.fn()) =>
  render(<RoutePlanner userData={u} toggleModal={toggleModal} currentLocation={here} onAddLocation={onAddLocation} />);

test("offers Chips, Logs and Both, and shows no route until one is picked", () => {
  render_(user([m("Yard", "dropSite", "chips", 1), m("HQ", "facility", "both", 5)]));
  ["Chips", "Logs", "Both"].forEach((name) => expect(screen.getByRole("button", { name })).toBeTruthy());
  expect(screen.queryByText("Shortest route")).toBeNull();
});

test("routes current location → drop site → HQ and links to the maps app", () => {
  render_(user([m("Yard", "dropSite", "chips", 1), m("HQ", "facility", "both", 5)]));
  fireEvent.click(screen.getByRole("button", { name: "Chips" }));
  expect(screen.getByText("Shortest route")).toBeTruthy();
  expect(screen.getByText("Yard")).toBeTruthy();
  const link = screen.getByRole("link", { name: /Open in Google Maps/ }) as HTMLAnchorElement;
  const url = new URL(link.href);
  expect(url.searchParams.get("waypoints")).toBe("1,0");
  expect(url.searchParams.get("destination")).toBe("5,0");
  // One facility: nothing to choose between.
  expect(screen.queryByText("Finish at")).toBeNull();
});

test("with several facilities the user can pick which HQ to finish at", () => {
  render_(user([m("Yard", "dropSite", "wood", 1), m("Near HQ", "facility", "both", 2), m("Far HQ", "facility", "both", 30)]));
  fireEvent.click(screen.getByRole("button", { name: "Logs" }));
  expect(screen.getByText("Finish at")).toBeTruthy();
  const link = () => new URL((screen.getByRole("link", { name: /Open in/ }) as HTMLAnchorElement).href);
  expect(link().searchParams.get("destination")).toBe("2,0"); // shortest by default
  fireEvent.click(screen.getByRole("button", { name: /Far HQ/ }));
  expect(link().searchParams.get("destination")).toBe("30,0");
});

test("explains when no drop site takes the chosen material", () => {
  render_(user([m("Yard", "dropSite", "chips", 1), m("HQ", "facility", "both", 5)]));
  fireEvent.click(screen.getByRole("button", { name: "Logs" }));
  expect(screen.getByText("No drop site found")).toBeTruthy();
  expect(screen.queryByRole("link", { name: /Open in/ })).toBeNull();
});

test("without a facility it prompts to add one", () => {
  const onAddLocation = vi.fn();
  const toggleModal = vi.fn();
  render_(user([m("Yard", "dropSite", "chips", 1)]), onAddLocation, toggleModal);
  fireEvent.click(screen.getByRole("button", { name: "Add a facility" }));
  expect(toggleModal).toHaveBeenCalledWith(false);
  expect(onAddLocation).toHaveBeenCalledWith({ lockedKind: "facility" });
});
