import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import MarkerList from "./MarkerList";
import { User } from "../../../../types/dataTypes";

jest.mock("../../../../utils/location", () => ({ Geo: { distance: () => 2 } }));
jest.mock("../../../utils/AddressLink", () => ({
  AddressLink: () => <span>Site address</span>,
}));
const user = {
  organization: {
    markers: [
      {
        id: "chips-1",
        name: "Garden site",
        type: "chips",
        latitude: 0,
        longitude: 0,
      },
    ],
  },
} as unknown as User;
const currentLocation = { latitude: 0, longitude: 0 };

test("material filters show an actionable empty state and recover on All", () => {
  const toggleModal = jest.fn();
  render(
    <MarkerList
      userData={user}
      currentLocation={currentLocation}
      toggleModal={toggleModal}
    />,
  );
  expect(screen.getByText("Garden site")).toBeTruthy();
  fireEvent.click(screen.getByRole("tab", { name: "Wood" }));
  expect(screen.getByText("No drop sites found")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Add a drop site" }));
  expect(toggleModal).toHaveBeenCalledWith(true, { type: "add-marker" });
  fireEvent.click(screen.getByRole("tab", { name: "All" }));
  expect(screen.getByText("Garden site")).toBeTruthy();
});

test("sites refresh when organization data changes", () => {
  const { rerender } = render(
    <MarkerList
      userData={user}
      currentLocation={currentLocation}
      toggleModal={jest.fn()}
    />,
  );
  rerender(
    <MarkerList
      userData={{
        ...user,
        organization: { ...user.organization, markers: [] },
      }}
      currentLocation={currentLocation}
      toggleModal={jest.fn()}
    />,
  );
  expect(screen.queryByText("Garden site")).toBeNull();
  expect(screen.getByText("No drop sites found")).toBeTruthy();
});
