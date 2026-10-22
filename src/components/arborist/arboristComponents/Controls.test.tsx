import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import Controls from "./Controls";
import { User } from "../../../types/dataTypes";

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

vi.mock("../../requests/RequestsContext", () => ({
  useRequests: () => ({ requests: [], unreadByConversation: {} }),
}));

test("workspace header identifies the crew and exposes activity and settings icons", () => {
  render(<Controls userData={user} toggleModal={vi.fn()} onAddLocation={vi.fn()} />);
  expect(screen.getByText("Green Tree Crew")).toBeTruthy();
  expect(screen.getByText("3 locations")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Activity, 1 unread" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Settings" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Activity, 1 unread" })?.closest("header")).toBeTruthy();
});

test("workspace tools open their respective workflows from the dock and header", () => {
  const toggleModal = vi.fn();
  const onAddLocation = vi.fn();
  render(
    <Controls userData={user} toggleModal={toggleModal} onAddLocation={onAddLocation} />,
  );
  const workflows = [
    ["Sites", "marker-list"],
    ["Jobs", "job-list"],
    ["Activity, 1 unread", "notifications"],
    ["Settings", "settings"],
  ];
  workflows.forEach(([name, type]) => {
    fireEvent.click(screen.getByRole("button", { name }));
    expect(toggleModal).toHaveBeenLastCalledWith(true, { type });
  });
  fireEvent.click(screen.getByRole("button", { name: "Add" }));
  expect(onAddLocation).toHaveBeenCalled();
  expect(screen.queryByRole("button", { name: "Route" })).toBeNull();
});
