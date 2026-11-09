import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import App from "./App";
import { DB } from "./utils/database";

vi.mock("@aws-amplify/ui-react", () => ({ withAuthenticator: (component: unknown) => component }));
vi.mock("./utils/database", () => ({ DB: { getUser: vi.fn() } }));
vi.mock("./components/utils/Logo", () => ({ default: () => <span>Chip Sync</span> }));
vi.mock("./components/register/Register", () => ({ default: () => <div>Registration</div> }));
vi.mock("./components/arborist/ArboristApp", () => ({ default: () => <div>Crew workspace</div> }));
vi.mock("./components/gardner/GardnerApp", () => ({ default: () => <div>Gardener workspace</div> }));

afterEach(() => vi.restoreAllMocks());

it("shows a recoverable startup error without treating a failed read as a new account", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.mocked(DB.getUser).mockRejectedValueOnce({ errors: [{ message: "Not Authorized" }] });
  const signOut = vi.fn();
  render(<App signOut={signOut} />);
  expect(await screen.findByRole("alert")).toHaveTextContent("couldn’t load your workspace");
  expect(screen.queryByText("Registration")).not.toBeInTheDocument();
  expect(screen.queryByText("Loading workspace")).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
  expect(signOut).toHaveBeenCalledTimes(1);

  vi.mocked(DB.getUser).mockResolvedValueOnce({ id: "existing-user", role: "admin" } as any);
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(await screen.findByText("Crew workspace")).toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});
