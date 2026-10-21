import { Offer, RequestStatus, ServiceRequest, ServiceType } from "../types/dataTypes";

export const SERVICE_LABEL: Record<ServiceType, string> = {
    chips: "Wood chip drop",
    logs: "Log drop",
    removal: "Tree removal",
    trim: "Tree trimming",
    stump: "Stump grinding",
    other: "Other tree work",
};

export const SERVICE_SHORT: Record<ServiceType, string> = {
    chips: "Chips",
    logs: "Logs",
    removal: "Removal",
    trim: "Trimming",
    stump: "Stump",
    other: "Other",
};

export const SERVICE_ORDER: ServiceType[] = ["chips", "logs", "removal", "trim", "stump", "other"];

/** Deliveries (free material for the gardener) vs. paid tree work. */
export const isDelivery = (service: ServiceType) => service === "chips" || service === "logs";

export function sortServices(services: ServiceType[]): ServiceType[] {
    return [...services].sort((a, b) => SERVICE_ORDER.indexOf(a) - SERVICE_ORDER.indexOf(b));
}

/** "Wood chip drop", "Wood chip drop + Log drop", "Tree removal + 2 more". */
export function requestSummary(request: Pick<ServiceRequest, "services">): string {
    const services = sortServices(request.services ?? []);
    if (services.length === 0) return "Service request";
    if (services.length <= 2) return services.map((s) => SERVICE_LABEL[s]).join(" + ");
    return `${SERVICE_LABEL[services[0]]} + ${services.length - 1} more`;
}

export const STATUS_LABEL: Record<RequestStatus, string> = {
    open: "Open",
    accepted: "Booked",
    completed: "Completed",
    cancelled: "Cancelled",
};

export function formatDate(isoDate: string | null | undefined, withWeekday = true): string {
    if (!isoDate) return "";
    // AWSDate has no time zone; parse as a local calendar date.
    const [y, m, d] = isoDate.slice(0, 10).split("-").map(Number);
    if (!y || !m || !d) return isoDate;
    return new Date(y, m - 1, d).toLocaleDateString(undefined, {
        ...(withWeekday ? { weekday: "short" } : {}),
        month: "short",
        day: "numeric",
    });
}

export function formatTiming(request: Pick<ServiceRequest, "timing" | "preferredDate">): string {
    if (request.timing === "asap") return "As soon as possible";
    if (request.timing === "date" && request.preferredDate) return `On or around ${formatDate(request.preferredDate)}`;
    return "Flexible timing";
}

export function formatMoney(amount: number): string {
    return amount.toLocaleString(undefined, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    });
}

/** Headline price for an offer card. */
export function offerPrice(offer: Pick<Offer, "pricing" | "price">): string {
    if (offer.pricing === "free") return "Free";
    if (offer.pricing === "unknown" || offer.price == null) return "Price TBD";
    return formatMoney(offer.price);
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function offerQuantities(offer: Pick<Offer, "chipsYards" | "logLoads">): string[] {
    const parts: string[] = [];
    if (offer.chipsYards) parts.push(`${offer.chipsYards} yd³ of chips`);
    if (offer.logLoads) parts.push(plural(offer.logLoads, "load of logs", "loads of logs"));
    return parts;
}

/** One-line description used in chat system messages and notifications. */
export function describeOffer(offer: Pick<Offer, "pricing" | "price" | "chipsYards" | "logLoads">): string {
    const price =
        offer.pricing === "unknown" ? "price to be confirmed on site" : offer.pricing === "free" ? "free" : offerPrice(offer);
    return [price, ...offerQuantities(offer)].join(", ");
}

export const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** "Greenline Arborists" -> "Greenline Arborists’", "Oak Co" -> "Oak Co’s". */
export const possessive = (name: string) => (/s$/i.test(name) ? `${name}’` : `${name}’s`);

/** Street line only: "412 Maple Street, Brooklyn, NY 11201, USA" -> "412 Maple Street, Brooklyn". */
export function shortAddress(address: string): string {
    return address.split(",").slice(0, 2).join(",").trim();
}

/** Today's date as YYYY-MM-DD in local time, for date input minimums. */
export function todayIso(now = new Date()): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
