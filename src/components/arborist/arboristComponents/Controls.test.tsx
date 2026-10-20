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

test("workspace header identifies the crew and its site count", () => {
  render(<Controls userData={user} toggleModal={vi.fn()} />);
  expect(screen.getByText("Green Tree Crew")).toBeTruthy();
  expect(screen.getByText("1 drop site")).toBeTruthy();
});

test("workspace tools open their respective workflows and expose unread activity", () => {
  const toggleModal = vi.fn();
  render(<Controls userData={user} toggleModal={toggleModal} />);
  expect(screen.getByRole("button", { name: "Activity, 1 unread" })).toBeTruthy();
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
