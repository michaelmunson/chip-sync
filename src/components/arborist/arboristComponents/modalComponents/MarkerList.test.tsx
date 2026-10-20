import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import MarkerList from "./MarkerList";
import { User } from "../../../../types/dataTypes";

vi.mock("../../../../utils/location", () => ({
  Geo: { distance: () => 2, getAddressURL: () => "https://maps.example/dir" },
}));
const user = {
  organization: {
    markers: [
      {
        id: "chips-1",
        name: "Garden site",
        address: "412 Maple Street, Brooklyn, NY",
        type: "chips",
        latitude: 0,
        longitude: 0,
      },
    ],
  },
} as unknown as User;
const currentLocation = { latitude: 0, longitude: 0 };

test("material filters show an actionable empty state and recover on All", () => {
  const toggleModal = vi.fn();
  render(
    <MarkerList
      userData={user}
      currentLocation={currentLocation}
      toggleModal={toggleModal}
    />,
  );
  expect(screen.getByText("Garden site")).toBeTruthy();
  fireEvent.click(screen.getByRole("tab", { name: /^Wood/ }));
  expect(screen.getByText("No drop sites found")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Add a drop site" }));
  expect(toggleModal).toHaveBeenCalledWith(true, { type: "add-marker" });
  fireEvent.click(screen.getByRole("tab", { name: /^All/ }));
  expect(screen.getByText("Garden site")).toBeTruthy();
});

test("search narrows the list and can be cleared from the empty state", () => {
  render(
    <MarkerList
      userData={user}
      currentLocation={currentLocation}
      toggleModal={vi.fn()}
    />,
  );
  const search = screen.getByRole("searchbox", { name: "Search sites" });
  fireEvent.change(search, { target: { value: "maple" } });
  expect(screen.getByText("Garden site")).toBeTruthy();
  fireEvent.change(search, { target: { value: "zzz" } });
  expect(screen.getByText("No matching sites")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
  expect(screen.getByText("Garden site")).toBeTruthy();
});

test("sites refresh when organization data changes", () => {
  const { rerender } = render(
    <MarkerList
      userData={user}
      currentLocation={currentLocation}
      toggleModal={vi.fn()}
    />,
  );
  rerender(
    <MarkerList
      userData={{
        ...user,
        organization: { ...user.organization, markers: [] },
      }}
      currentLocation={currentLocation}
      toggleModal={vi.fn()}
    />,
  );
  expect(screen.queryByText("Garden site")).toBeNull();
  expect(screen.getByText("No drop sites found")).toBeTruthy();
});
