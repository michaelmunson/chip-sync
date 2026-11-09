import { describe, expect, it, vi } from "vitest";
import { getOrganization, getUser } from "../graphql/queries";
import { createProfileReader } from "./profileQuery";

const undefinedField = (type: string, field: string) => ({
  path: null,
  message: `Validation error of type FieldUndefined: Field '${field}' in type '${type}' is undefined @ 'getUser/organization/markers/items/${field}'`,
});
const legacyError = {
  errors: [
    undefinedField("Marker", "kind"),
    undefinedField("Marker", "startDate"),
    undefinedField("Marker", "endDate"),
    undefinedField("User", "notificationSettings"),
  ],
};

describe("profile schema compatibility", () => {
  it("preserves the complete query when the deployed schema supports it", async () => {
    const result = { data: { getUser: { id: "user", notificationSettings: "{}" } } };
    const execute = vi.fn().mockResolvedValue(result);
    const read = createProfileReader(execute);
    expect(await read(getUser, { id: "user" })).toBe(result);
    expect(execute).toHaveBeenCalledExactlyOnceWith(getUser, { id: "user" });
  });

  it("retries the reported startup failure without the four unsupported scalars", async () => {
    const result = { data: { getUser: { id: "user" } } };
    const execute = vi.fn().mockRejectedValueOnce(legacyError).mockResolvedValue(result);
    expect(await createProfileReader(execute)(getUser, { id: "user" })).toBe(result);
    expect(execute).toHaveBeenCalledTimes(2);
    const [compatible, variables] = execute.mock.calls[1];
    expect(variables).toEqual({ id: "user" });
    for (const field of ["kind", "startDate", "endDate", "notificationSettings"]) {
      expect(compatible).not.toMatch(new RegExp(`^\\s*${field}\\s*$`, "m"));
    }
    for (const field of ["role", "organization", "markers", "images", "notifications", "contact"]) {
      expect(compatible).toMatch(new RegExp(`\\b${field}\\b`));
    }
  });

  it("remembers missing fields for subsequent user and organization reads", async () => {
    const execute = vi.fn().mockRejectedValueOnce(legacyError).mockResolvedValue({ data: {} });
    const read = createProfileReader(execute);
    await read(getUser, { id: "user" });
    await read(getUser, { id: "user" });
    await read(getOrganization, { id: "org" });
    expect(execute).toHaveBeenCalledTimes(4);
    expect(execute.mock.calls[2][0]).toBe(execute.mock.calls[1][0]);
    expect(execute.mock.calls[3][0]).not.toMatch(/^\s*(kind|startDate|endDate)\s*$/m);
  });

  it("retains other optional fields on a partially upgraded schema", async () => {
    const execute = vi.fn()
      .mockRejectedValueOnce({ errors: [undefinedField("User", "notificationSettings")] })
      .mockResolvedValue({ data: {} });
    await createProfileReader(execute)(getUser, { id: "user" });
    expect(execute.mock.calls[1][0]).not.toMatch(/^\s*notificationSettings\s*$/m);
    for (const field of ["kind", "startDate", "endDate"]) {
      expect(execute.mock.calls[1][0]).toMatch(new RegExp(`^\\s*${field}\\s*$`, "m"));
    }
  });

  it.each([
    new Error("Network unavailable"),
    { errors: [{ message: "Not Authorized" }] },
    { errors: [undefinedField("User", "firstName")] },
    { errors: [undefinedField("User", "kind")] },
    { errors: [...legacyError.errors, { message: "Not Authorized" }] },
    { errors: [] },
  ])("propagates failures outside the known optional fields: %j", async error => {
    const execute = vi.fn().mockRejectedValue(error);
    await expect(createProfileReader(execute)(getUser, { id: "user" })).rejects.toBe(error);
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it("propagates retry failures without an unbounded retry loop", async () => {
    const failure = new Error("Network unavailable");
    const execute = vi.fn().mockRejectedValueOnce(legacyError).mockRejectedValue(failure);
    await expect(createProfileReader(execute)(getUser, { id: "user" })).rejects.toBe(failure);
    expect(execute).toHaveBeenCalledTimes(2);
  });
});
