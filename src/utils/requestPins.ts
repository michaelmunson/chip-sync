import { Offer, ServiceRequest, ServiceType, User } from "../types/dataTypes";
import { escapeHtml, timeAgo } from "./format";
import { Geo } from "./location";
import { formatTiming, offerPrice, SERVICE_SHORT, shortAddress, sortServices, requestSummary } from "./requestFormat";

/** Material icon paths (24x24) so pins can be plain DOM for Google's AdvancedMarkerElement. */
export const SERVICE_ICON_PATHS: Record<ServiceType, string[]> = {
    chips: ["M10 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2M6 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m12-8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m-4 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m4-4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m-4-4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m-4-4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2"],
    logs: ["M16 12 9 2 2 12h1.86L0 18h7v4h4v-4h7l-3.86-6z", "M20.14 12H22L15 2l-2.39 3.41L17.92 13h-1.95l3.22 5H24zM13 19h4v3h-4z"],
    removal: ["M19.73 14.23 7 1.5 3.11 5.39l8.13 11.67c-.78.78-.78 2.05 0 2.83l1.41 1.41c.78.78 2.05.78 2.83 0l4.24-4.24c.79-.78.79-2.05.01-2.83m-5.66 5.65-1.41-1.41 4.24-4.24 1.41 1.41z"],
    trim: ["M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1zM6 8c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2m0 12c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2m6-7.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5M19 3l-6 6 2 2 7-7V3z"],
    stump: ["M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10S2 17.52 2 12m10 6c3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6 2.69 6 6 6"],
    other: [
        "m21.67 18.17-5.3-5.3h-.99l-2.54 2.54v.99l5.3 5.3c.39.39 1.02.39 1.41 0l2.12-2.12c.39-.38.39-1.02 0-1.41",
        "m17.34 10.19 1.41-1.41 2.12 2.12c1.17-1.17 1.17-3.07 0-4.24l-3.54-3.54-1.41 1.41V1.71l-.7-.71-3.54 3.54.71.71h2.83l-1.41 1.41 1.06 1.06-2.89 2.89-4.13-4.13V5.06L4.83 2.04 2 4.87 5.03 7.9h1.41l4.13 4.13-.85.85H7.6l-5.3 5.3c-.39.39-.39 1.02 0 1.41l2.12 2.12c.39.39 1.02.39 1.41 0l5.3-5.3v-2.12l5.15-5.15z",
    ],
};

export const serviceIconSvg = (service: ServiceType) =>
    `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${SERVICE_ICON_PATHS[service]
        .map((d) => `<path d="${d}"/>`)
        .join("")}</svg>`;

/**
 * Pin tones:
 *  - open: waiting for offers (crew map: a job you could bid on)
 *  - offered: this crew has a live offer on it
 *  - booked: accepted (gardener's own) / booked with this crew
 *  - draft: the pin a gardener is placing
 */
export type PinTone = "open" | "offered" | "booked" | "draft";

export function buildRequestPin({
    services,
    tone,
    badge,
    label,
}: {
    services: ServiceType[];
    tone: PinTone;
    badge?: number;
    label?: string;
}): HTMLElement {
    const primary = sortServices(services)[0] ?? "other";
    const pin = document.createElement("div");
    pin.className = `req-pin req-pin--${tone}`;
    const head = tone === "draft" ? `<span class="req-pin-dot"></span>` : serviceIconSvg(primary);
    pin.innerHTML = `
        <span class="req-pin-head">${head}</span>
        ${badge ? `<span class="req-pin-badge">${badge > 9 ? "9+" : badge}</span>` : ""}
        ${label ? `<span class="req-pin-label">${escapeHtml(label)}</span>` : ""}
    `;
    return pin;
}

/** Info-window content for a request pin. Returns a DOM node so the button can be wired directly. */
export function buildRequestInfo({
    request,
    viewer,
    myOffer,
    onOpen,
}: {
    request: ServiceRequest;
    viewer: User;
    myOffer?: Offer;
    onOpen: () => void;
}): HTMLElement {
    const node = document.createElement("div");
    node.className = "marker-content";
    const pills = sortServices(request.services)
        .map((s) => `<span class="marker-pill marker-pill--${s}">${SERVICE_SHORT[s]}</span>`)
        .join("");
    const href = escapeHtml(Geo.getAddressURL({ mapChoice: viewer.mapChoice, address: request.address }));
    let offerLine = "";
    if (myOffer) {
        const state =
            myOffer.status === "pending" ? "awaiting reply" : myOffer.status === "accepted" ? "accepted" : myOffer.status;
        offerLine = `<p class="marker-offer">Your offer: <strong>${escapeHtml(offerPrice(myOffer))}</strong> · ${escapeHtml(state)}</p>`;
    }
    node.innerHTML = `
        <h2>${escapeHtml(requestSummary(request))}</h2>
        <div class="marker-pills">${pills}</div>
        <p class="marker-address"><a href="${href}" target="_blank" rel="noreferrer">${escapeHtml(shortAddress(request.address))}</a></p>
        <p class="marker-contact">${escapeHtml(formatTiming(request))} · posted ${escapeHtml(timeAgo(request.createdAt).toLowerCase())}</p>
        ${offerLine}
        <button type="button" class="details-button">View request</button>
    `;
    node.querySelector("button")?.addEventListener("click", onOpen);
    return node;
}
