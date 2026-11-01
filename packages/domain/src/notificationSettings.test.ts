import { describe, expect, it } from "vitest";
import {
    eventForNotification,
    normalizePhone,
    parseNotificationSettings,
    resolveDelivery,
    setChannelEnabled,
    settingsEqual,
} from "./notificationSettings";

describe("parseNotificationSettings", () => {
    it("defaults to everything off", () => {
        for (const raw of [undefined, null, "", "not json", 7, "{}"]) {
            const settings = parseNotificationSettings(raw);
            expect(settings).toEqual({ email: "", phone: "", events: {} });
            expect(resolveDelivery(settings, "arborist", "newMessage")).toEqual({});
        }
    });

    it("reads stored JSON, including double-encoded values, and ignores junk", () => {
        const stored = { email: " a@b.co ", phone: "5551234567", events: { newMessage: { sms: true, email: "yes" }, bogus: { sms: true } } };
        const expected = { email: "a@b.co", phone: "5551234567", events: { newMessage: { sms: true, email: false } } };
        expect(parseNotificationSettings(JSON.stringify(stored))).toEqual(expected);
        expect(parseNotificationSettings(JSON.stringify(JSON.stringify(stored)))).toEqual(expected);
    });
});

describe("normalizePhone", () => {
    it("normalizes US numbers to E.164", () => {
        expect(normalizePhone("(555) 123-4567")).toBe("+15551234567");
        expect(normalizePhone("1-555-123-4567")).toBe("+15551234567");
        expect(normalizePhone("+44 20 7946 0958")).toBe("+442079460958");
    });
    it("rejects numbers that can't be dialed", () => {
        expect(normalizePhone("")).toBeNull();
        expect(normalizePhone("12345")).toBeNull();
        expect(normalizePhone("abc")).toBeNull();
    });
});

describe("eventForNotification", () => {
    it("maps in-app notifications to configurable events", () => {
        expect(eventForNotification("new-offer")).toBe("offerCreated");
        expect(eventForNotification("offer-accepted")).toBe("offerResponse");
        expect(eventForNotification("offer-declined")).toBe("offerResponse");
        expect(eventForNotification("new-service-request")).toBe("requestAdded");
        expect(eventForNotification("new-message")).toBe("newMessage");
        expect(eventForNotification("offer-updated")).toBeUndefined();
        expect(eventForNotification("join-request")).toBeUndefined();
    });
    it("treats markers without a kind as drop sites", () => {
        expect(eventForNotification("new-org-marker", {})).toBe("dropSiteAdded");
        expect(eventForNotification("new-org-marker", { kind: "dropSite" })).toBe("dropSiteAdded");
        expect(eventForNotification("new-org-marker", { kind: "jobSite" })).toBeUndefined();
    });
});

describe("settings helpers", () => {
    it("toggles channels and compares by meaning", () => {
        const base = parseNotificationSettings(undefined);
        const on = setChannelEnabled(base, "newMessage", "sms", true);
        expect(settingsEqual(base, on)).toBe(false);
        expect(settingsEqual(base, setChannelEnabled(on, "newMessage", "sms", false))).toBe(true);
    });
});
