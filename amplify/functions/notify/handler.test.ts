// @vitest-environment node
import type { DynamoDBRecord } from "aws-lambda";
import { describe, expect, it, vi } from "vitest";
import type { NotificationSettings } from "../../../src/utils/notificationSettings";
import { extractToken, createH2HClient, parseCredentials } from "./h2h";
import { processRecord, type Dependencies, type Recipient } from "./handler";

const record = (type: string, data: object, userId = "user-1", eventName = "INSERT"): DynamoDBRecord =>
    ({
        eventName,
        dynamodb: {
            NewImage: {
                type: { S: type },
                userNotificationsId: { S: userId },
                data: { S: JSON.stringify(data) },
            },
        },
    }) as DynamoDBRecord;

const allOn: NotificationSettings = {
    email: "crew@example.com",
    phone: "(555) 123-4567",
    events: Object.fromEntries(
        ["offerCreated", "newMessage", "dropSiteAdded", "requestAdded", "offerResponse"].map((e) => [
            e,
            { sms: true, email: true },
        ]),
    ),
};

function setup(recipient?: Recipient) {
    const h2h = { sendText: vi.fn().mockResolvedValue(undefined), sendEmail: vi.fn().mockResolvedValue(undefined) };
    const deps: Dependencies = {
        h2h,
        appUrl: "https://app.test",
        getRecipient: vi.fn().mockResolvedValue(recipient),
    };
    return { h2h, deps };
}

describe("processRecord", () => {
    it("sends nothing when the user never configured notifications", async () => {
        const { h2h, deps } = setup({ role: "gardner", settings: { email: "", phone: "", events: {} } });
        const outcome = await processRecord(record("new-offer", { organizationName: "Tree Co" }), deps);
        expect(outcome).toContain("off");
        expect(h2h.sendText).not.toHaveBeenCalled();
        expect(h2h.sendEmail).not.toHaveBeenCalled();
    });

    it("texts and emails a gardener about a new offer when both are on", async () => {
        const { h2h, deps } = setup({ role: "gardner", settings: allOn });
        await processRecord(
            record("new-offer", { organizationName: "Tree Co", summary: "Chips", address: "1 Oak St" }),
            deps,
        );
        expect(h2h.sendText).toHaveBeenCalledWith("+15551234567", expect.stringContaining("Tree Co sent you an offer"));
        expect(h2h.sendEmail).toHaveBeenCalledWith(
            "crew@example.com",
            "Chip Sync: Tree Co sent you an offer",
            expect.stringContaining("https://app.test"),
        );
    });

    it("sends only the channels switched on", async () => {
        const settings: NotificationSettings = {
            ...allOn,
            events: { newMessage: { sms: false, email: true } },
        };
        const { h2h, deps } = setup({ role: "admin", settings });
        await processRecord(record("new-message", { senderName: "Sam", preview: "On my way" }), deps);
        expect(h2h.sendText).not.toHaveBeenCalled();
        expect(h2h.sendEmail).toHaveBeenCalledOnce();
    });

    it("does not send a channel that has no address", async () => {
        const { h2h, deps } = setup({ role: "admin", settings: { ...allOn, phone: "", email: "bad" } });
        await processRecord(record("new-service-request", { summary: "Chips", address: "2 Elm" }), deps);
        expect(h2h.sendText).not.toHaveBeenCalled();
        expect(h2h.sendEmail).not.toHaveBeenCalled();
    });

    it("keeps arborist events away from gardeners", async () => {
        const { h2h, deps } = setup({ role: "gardner", settings: allOn });
        const outcome = await processRecord(record("new-service-request", {}), deps);
        expect(outcome).toContain("off");
        expect(h2h.sendText).not.toHaveBeenCalled();
    });

    it("maps accepted and declined offers to one setting", async () => {
        const { h2h, deps } = setup({ role: "member", settings: allOn });
        await processRecord(record("offer-declined", { requesterName: "Ana Lee", summary: "Chips" }), deps);
        expect(h2h.sendText).toHaveBeenCalledWith("+15551234567", expect.stringContaining("Ana declined your offer"));
    });

    it("only notifies for drop sites, not facilities, and skips the creator", async () => {
        const { h2h, deps } = setup({ role: "member", settings: allOn });
        expect(await processRecord(record("new-org-marker", { kind: "facility", name: "Depot" }), deps)).toContain(
            "not configurable",
        );
        expect(
            await processRecord(record("new-org-marker", { kind: "dropSite", createdById: "user-1" }), deps),
        ).toContain("own action");
        expect(h2h.sendText).not.toHaveBeenCalled();

        await processRecord(record("new-org-marker", { kind: "dropSite", name: "Yard", createdById: "other" }), deps);
        expect(h2h.sendText).toHaveBeenCalledWith("+15551234567", expect.stringContaining("New drop site added: Yard"));
    });

    it("ignores notification types users can't configure and non-inserts", async () => {
        const { h2h, deps } = setup({ role: "admin", settings: allOn });
        expect(await processRecord(record("join-request", {}), deps)).toContain("not configurable");
        expect(await processRecord(record("new-message", {}, "user-1", "MODIFY"), deps)).toContain("not an insert");
        expect(h2h.sendText).not.toHaveBeenCalled();
    });

    it("still sends the email when the text fails", async () => {
        const { h2h, deps } = setup({ role: "gardner", settings: allOn });
        h2h.sendText.mockRejectedValue(new Error("H2H text failed (500)"));
        vi.spyOn(console, "error").mockImplementation(() => {});
        const outcome = await processRecord(record("new-offer", { organizationName: "Tree Co" }), deps);
        expect(h2h.sendEmail).toHaveBeenCalledOnce();
        expect(outcome).toContain("sent [email]");
        expect(outcome).toContain("failed [sms]");
    });
});

describe("H2H client", () => {
    it("parses credentials from a few key spellings and rejects incomplete secrets", () => {
        expect(parseCredentials('{"username":"a@b.c","password":"pw"}')).toEqual({ username: "a@b.c", password: "pw" });
        expect(parseCredentials('{"H2H_USERNAME":"u","H2H_PASSWORD":"p"}')).toEqual({ username: "u", password: "p" });
        expect(() => parseCredentials("nope")).toThrow();
        expect(() => parseCredentials('{"username":"u"}')).toThrow();
    });

    it("unwraps the login token", () => {
        expect(extractToken("abc.def\n")).toBe("abc.def");
        expect(extractToken('"abc"')).toBe("abc");
        expect(extractToken('{"token":"abc"}')).toBe("abc");
    });

    it("logs in once, sends the token, and re-logs in after a 401", async () => {
        const calls: { url: string; auth?: string; body: any }[] = [];
        let logins = 0;
        const fetchMock = vi.fn(async (url: string, init: any) => {
            const body = JSON.parse(init.body);
            calls.push({ url, auth: init.headers.Authorization, body });
            if (url.endsWith("/auth/login")) return new Response(`token-${++logins}`);
            // First token is rejected once.
            return new Response("", { status: init.headers.Authorization === "token-1" && logins === 1 ? 401 : 200 });
        });
        const client = createH2HClient(async () => ({ username: "u", password: "p" }), fetchMock as any);

        await client.sendText("+15551234567", "hi");
        expect(logins).toBe(2);
        expect(calls.filter((c) => c.url.endsWith("/auth/login"))[0].body).toEqual({ email: "u", password: "p" });
        const textCalls = calls.filter((c) => c.url.endsWith("/notifications/text"));
        expect(textCalls.at(-1)).toMatchObject({
            url: "https://v2.api.htwoh.com/@chipsync/@chipsync/api/notifications/text",
            auth: "token-2",
            body: { to: "+15551234567", message: "hi" },
        });

        await client.sendEmail("a@b.c", "subj", "body");
        expect(logins).toBe(2);
        expect(calls.at(-1)).toMatchObject({
            url: "https://v2.api.htwoh.com/@chipsync/@chipsync/api/notifications/email",
            body: { to: "a@b.c", subject: "subj", body: "body" },
        });
    });
});
