import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import Controls from "./Controls";
import { User } from "../../../types/dataTypes";
import { Coordinates } from "../../../types/generalTypes";

const currentLocation: Coordinates = { latitude: 40.7, longitude: -73.9 };

const user = {
  firstName: "Alex",
  lastName: "Green",
  mapChoice: "google",
  organization: {
    name: "Green Tree Crew",
    markers: [
      {
        id: "site-1",
        name: "Oak Yard",
        address: "1 Oak St, Brooklyn, NY",
        type: "chips",
        latitude: 40.71,
        longitude: -73.91,
      },
      {
        id: "site-2",
        name: "Pine Lot",
        address: "2 Pine Ave, Brooklyn, NY",
        type: "wood",
        latitude: 40.72,
        longitude: -73.92,
      },
      {
        id: "site-3",
        name: "Both Depot",
        address: "3 Both Rd, Brooklyn, NY",
        type: "both",
        latitude: 40.705,
        longitude: -73.905,
      },
    ],
  },
  notifications: [{ opened: false }, { opened: true }],
} as User;

vi.mock("../../../utils/location", () => ({
  Geo: {
    distance: (_a: Coordinates, _b: Coordinates) => 1.2,
    getAddressURL: ({ address }: { address: string }) => `https://maps.example/?q=${address}`,
  },
}));

test("workspace header identifies the crew and exposes activity and settings icons", () => {
  render(<Controls userData={user} toggleModal={vi.fn()} currentLocation={currentLocation} />);
  expect(screen.getByText("Green Tree Crew")).toBeTruthy();
  expect(screen.getByText("3 drop sites")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Activity, 1 unread" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Settings" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Activity, 1 unread" })?.closest("header")).toBeTruthy();
});

test("workspace tools open their respective workflows from the dock and header", () => {
  const toggleModal = vi.fn();
  render(<Controls userData={user} toggleModal={toggleModal} currentLocation={currentLocation} />);
  const workflows = [
    ["Sites", "marker-list"],
    ["Add site", "add-marker"],
    ["Activity, 1 unread", "notifications"],
    ["Settings", "settings"],
  ];
  workflows.forEach(([name, type]) => {
    fireEvent.click(screen.getByRole("button", { name }));
    expect(toggleModal).toHaveBeenLastCalledWith(true, { type });
  });
});

test("route menu filters closest sites and opens maps", () => {
  const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
  render(<Controls userData={user} toggleModal={vi.fn()} currentLocation={currentLocation} />);

  fireEvent.click(screen.getByRole("button", { name: "Route" }));
  const menu = screen.getByRole("menu");
  expect(within(menu).getByRole("menuitem", { name: "Chips" })).toBeTruthy();
  expect(within(menu).getByRole("menuitem", { name: "Logs" })).toBeTruthy();
  expect(within(menu).getByRole("menuitem", { name: "Both" })).toBeTruthy();

  fireEvent.click(within(menu).getByRole("menuitem", { name: "Chips" }));
  expect(within(menu).getByRole("menuitem", { name: /Oak Yard/ })).toBeTruthy();
  expect(within(menu).getByRole("menuitem", { name: /Both Depot/ })).toBeTruthy();
  expect(within(menu).queryByRole("menuitem", { name: /Pine Lot/ })).toBeNull();

  fireEvent.click(within(menu).getByRole("menuitem", { name: /Oak Yard/ }));
  expect(openSpy).toHaveBeenCalledWith(
    "https://maps.example/?q=1 Oak St, Brooklyn, NY",
    "_blank",
    "noopener,noreferrer",
  );
  openSpy.mockRestore();
});
