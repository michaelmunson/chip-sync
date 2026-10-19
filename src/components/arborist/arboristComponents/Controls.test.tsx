import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import Controls from "./Controls";
import { User } from "../../../types/dataTypes";

const user = {
  firstName: "Alex",
  lastName: "Green",
  organization: { name: "Green Tree Crew", markers: [{ id: "site-1" }] },
  notifications: [{ opened: false }, { opened: true }],
} as User;

test("workspace tools open their respective workflows and expose unread activity", () => {
  const toggleModal = jest.fn();
  render(<Controls userData={user} toggleModal={toggleModal} />);
  expect(screen.getByText("Green Tree Crew")).toBeTruthy();
  expect(
    screen.getByRole("button", { name: "Notifications, 1 unread" }),
  ).toBeTruthy();
  const workflows = [
    ["Sites", "marker-list"],
    ["Add site", "add-marker"],
    ["Notifications, 1 unread", "notifications"],
    ["Settings", "settings"],
  ];
  workflows.forEach(([name, type]) => {
    fireEvent.click(screen.getByRole("button", { name }));
    expect(toggleModal).toHaveBeenLastCalledWith(true, { type });
  });
});
