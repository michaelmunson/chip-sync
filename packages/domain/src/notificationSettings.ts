/**
 * Text / email notification preferences. Shared by the settings screens and the
 * `notify` Lambda (amplify/functions/notify), so keep this file free of browser
 * and AWS imports.
 *
 * Stored as JSON in `User.notificationSettings`. Everything is off until the user
 * turns it on: a missing or malformed value parses to the all-off defaults.
 */

export type NotificationChannel = "sms" | "email";
export const NOTIFICATION_CHANNELS: NotificationChannel[] = ["sms", "email"];

export type NotificationEvent =
    | "offerCreated"
    | "newMessage"
    | "dropSiteAdded"
    | "requestAdded"
    | "offerResponse";

/** Gardeners ("gardner" role) and arborist crews (admin / member roles) see different events. */
export type NotificationAudience = "gardener" | "arborist";

export interface NotificationSettings {
    email: string;
    phone: string;
    events: Partial<Record<NotificationEvent, Partial<Record<NotificationChannel, boolean>>>>;
}

export interface NotificationEventInfo {
    event: NotificationEvent;
    label: string;
    description: string;
}

export const NOTIFICATION_EVENTS: Record<NotificationAudience, NotificationEventInfo[]> = {
    gardener: [
        { event: "offerCreated", label: "New offer", description: "A crew sends an offer on your request" },
        { event: "newMessage", label: "New message", description: "A crew messages you in a chat" },
    ],
    arborist: [
        { event: "dropSiteAdded", label: "Drop site added", description: "Someone on your crew adds a drop site" },
        { event: "requestAdded", label: "Request added", description: "A gardener posts a request near you" },
        { event: "offerResponse", label: "Offer accepted or declined", description: "A gardener answers one of your offers" },
        { event: "newMessage", label: "New message", description: "A gardener messages you in a chat" },
    ],
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = { email: "", phone: "", events: {} };

export function audienceForRole(role: string | null | undefined): NotificationAudience {
    return role === "gardner" ? "gardener" : "arborist";
}

export function isEventForAudience(audience: NotificationAudience, event: NotificationEvent): boolean {
    return NOTIFICATION_EVENTS[audience].some((info) => info.event === event);
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
    return EMAIL_PATTERN.test(email.trim());
}

/**
 * Normalizes a US-style phone number to E.164 (`+15551234567`). Returns null when
 * it can't be a dialable number. Numbers already starting with "+" keep their
 * country code.
 */
export function normalizePhone(raw: string): string | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const digits = trimmed.replace(/\D/g, "");
    if (trimmed.startsWith("+")) return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
    return null;
}

/** Parses whatever is stored on the user (JSON string, object, or nothing) into safe settings. */
export function parseNotificationSettings(raw: unknown): NotificationSettings {
    let value: unknown = raw;
    // AWSJSON can arrive double-encoded; unwrap up to twice.
    for (let i = 0; i < 2 && typeof value === "string"; i++) {
        try {
            value = JSON.parse(value);
        } catch {
            return { ...DEFAULT_NOTIFICATION_SETTINGS, events: {} };
        }
    }
    const input = value && typeof value === "object" ? (value as Record<string, any>) : {};
    const events: NotificationSettings["events"] = {};
    const allEvents = new Set(
        [...NOTIFICATION_EVENTS.gardener, ...NOTIFICATION_EVENTS.arborist].map((info) => info.event),
    );
    for (const event of allEvents) {
        const channels = input.events?.[event];
        if (!channels || typeof channels !== "object") continue;
        events[event] = {
            sms: channels.sms === true,
            email: channels.email === true,
        };
    }
    return {
        email: typeof input.email === "string" ? input.email.trim() : "",
        phone: typeof input.phone === "string" ? input.phone.trim() : "",
        events,
    };
}

export function isChannelEnabled(
    settings: NotificationSettings,
    event: NotificationEvent,
    channel: NotificationChannel,
): boolean {
    return settings.events[event]?.[channel] === true;
}

export function setChannelEnabled(
    settings: NotificationSettings,
    event: NotificationEvent,
    channel: NotificationChannel,
    enabled: boolean,
): NotificationSettings {
    return {
        ...settings,
        events: { ...settings.events, [event]: { ...settings.events[event], [channel]: enabled } },
    };
}

/** Compares by meaning: a missing event/channel is the same as one switched off. */
export function settingsEqual(a: NotificationSettings, b: NotificationSettings): boolean {
    if (a.email !== b.email || a.phone !== b.phone) return false;
    const all = [...NOTIFICATION_EVENTS.gardener, ...NOTIFICATION_EVENTS.arborist];
    return all.every(({ event }) =>
        NOTIFICATION_CHANNELS.every((channel) => isChannelEnabled(a, event, channel) === isChannelEnabled(b, event, channel)),
    );
}

/**
 * Maps an in-app notification (`Notification.type` + its data) to the configurable
 * event it represents, or undefined when it isn't one users can be texted / emailed about.
 */
export function eventForNotification(type: string, data: Record<string, any> = {}): NotificationEvent | undefined {
    switch (type) {
        case "new-offer":
            return "offerCreated";
        case "new-message":
            return "newMessage";
        case "new-service-request":
            return "requestAdded";
        case "offer-accepted":
        case "offer-declined":
            return "offerResponse";
        case "new-org-marker":
            // Facilities and job sites share the marker table; only drop sites count. Legacy rows have no kind.
            return !data.kind || data.kind === "dropSite" ? "dropSiteAdded" : undefined;
        default:
            return undefined;
    }
}

export interface Delivery {
    sms?: string;
    email?: string;
}

/**
 * Where to send a notification for `event`: only channels the user switched on for
 * that event, that are valid for their audience, and that have a usable address.
 */
export function resolveDelivery(
    settings: NotificationSettings,
    audience: NotificationAudience,
    event: NotificationEvent,
): Delivery {
    const delivery: Delivery = {};
    if (!isEventForAudience(audience, event)) return delivery;
    if (isChannelEnabled(settings, event, "sms")) {
        const phone = normalizePhone(settings.phone);
        if (phone) delivery.sms = phone;
    }
    if (isChannelEnabled(settings, event, "email") && isValidEmail(settings.email)) {
        delivery.email = settings.email.trim();
    }
    return delivery;
}
