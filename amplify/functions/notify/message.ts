import type { NotificationEvent } from "../../../src/utils/notificationSettings";

export interface NotificationMessage {
    /** Short text for SMS (one segment where possible). */
    sms: string;
    subject: string;
    body: string;
}

const clip = (value: string, max: number) => (value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value);
const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const firstName = (name: unknown) => text(name).split(/\s+/)[0] || "A gardener";

/** Builds the SMS / email wording for an in-app notification that maps to a configurable event. */
export function buildMessage(
    type: string,
    event: NotificationEvent,
    data: Record<string, any>,
    appUrl: string,
): NotificationMessage {
    const subject = text(data.summary);
    const where = text(data.address) ? ` at ${text(data.address)}` : "";
    let headline: string;
    let detail = "";

    switch (event) {
        case "offerCreated":
            headline = `${text(data.organizationName) || "A crew"} sent you an offer`;
            detail = subject ? `For your request: ${subject}${where}.` : "";
            break;
        case "newMessage":
            headline = `New message from ${text(data.senderName) || "Chip Sync"}`;
            detail = text(data.preview);
            break;
        case "requestAdded":
            headline = "New gardener request near your crew";
            detail = [subject, text(data.address)].filter(Boolean).join(" · ");
            break;
        case "offerResponse":
            headline = `${firstName(data.requesterName)} ${type === "offer-declined" ? "declined" : "accepted"} your offer`;
            detail = subject ? `${subject}${where}.` : "";
            break;
        case "dropSiteAdded":
            headline = `New drop site added${text(data.name) ? `: ${text(data.name)}` : ""}`;
            detail = [text(data.address)].filter(Boolean).join(" ");
            break;
    }

    const sms = clip([`Chip Sync: ${headline}.`, detail && clip(detail, 100), appUrl].filter(Boolean).join(" "), 320);
    const body = [headline, detail, `Open Chip Sync: ${appUrl}`].filter(Boolean).join("\n\n");
    return { sms, subject: `Chip Sync: ${headline}`, body };
}
