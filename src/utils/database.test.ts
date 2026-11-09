import { expect, it, vi } from "vitest";
import { DB } from "./database";

const { graphql } = vi.hoisted(() => ({ graphql: vi.fn() }));
vi.mock("aws-amplify/api", () => ({ generateClient: () => ({ graphql }) }));
vi.mock("aws-amplify/auth", () => ({
  getCurrentUser: vi.fn().mockResolvedValue({ userId: "existing-user" }),
  fetchAuthSession: vi.fn(),
}));
vi.mock("./location", () => ({ Geo: {} }));
vi.mock("./storage", () => ({ S3: {} }));
vi.mock("./websocket", () => ({ NotificationGQLSocket: vi.fn() }));

it("loads an existing profile and normalizes legacy markers after schema validation fails", async () => {
  graphql.mockRejectedValueOnce({
    errors: [
      ["Marker", "kind"], ["Marker", "startDate"], ["Marker", "endDate"], ["User", "notificationSettings"],
    ].map(([type, field]) => ({
      message: `Validation error of type FieldUndefined: Field '${field}' in type '${type}' is undefined`,
    })),
  }).mockResolvedValueOnce({
    data: {
      getUser: {
        id: "existing-user",
        role: "admin",
        organization: {
          id: "org",
          users: { items: [] },
          markers: { items: [{ id: "site", contact: '{"name":"Crew"}' }] },
        },
        notifications: { items: [] },
      },
    },
  });

  expect(await DB.getUser()).toMatchObject({
    id: "existing-user",
    role: "admin",
    organization: {
      users: [],
      markers: [{ id: "site", kind: "dropSite", contact: { name: "Crew" } }],
    },
    notifications: [],
  });
  expect(graphql).toHaveBeenCalledTimes(2);
  expect(graphql.mock.calls[1][0].variables).toEqual({ id: "existing-user" });
  expect(graphql.mock.calls.every(([operation]) => !operation.query.includes("mutation"))).toBe(true);
});
