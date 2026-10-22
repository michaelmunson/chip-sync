import { Job, Marker } from "../types/dataTypes";
import { escapeHtml } from "./format";

/** Material "work" icon path (24x24) so the pin can be plain DOM for Google's AdvancedMarkerElement. */
const WORK_ICON_PATH =
    "M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2m-6 0h-4V4h4z";

export function buildJobPin(): HTMLElement {
    const pin = document.createElement("div");
    pin.className = "req-pin req-pin--job";
    pin.innerHTML = `
        <span class="req-pin-head">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${WORK_ICON_PATH}"/></svg>
        </span>
    `;
    return pin;
}

/** Info-window content for a job pin. Returns a DOM node so the button can be wired directly. */
export function buildJobInfo({
    job,
    site,
    onOpen,
}: {
    job: Job;
    site: Marker;
    onOpen: () => void;
}): HTMLElement {
    const node = document.createElement("div");
    node.className = "marker-content";
    const status = job.status.charAt(0).toUpperCase() + job.status.slice(1);
    node.innerHTML = `
        <h2>${escapeHtml(job.name)}</h2>
        <div class="marker-pills"><span class="marker-pill marker-pill--${job.status}">${escapeHtml(status)}</span></div>
        <p class="marker-contact">${escapeHtml(site.name)}</p>
        <p class="marker-address">${escapeHtml(site.address)}</p>
        <button type="button" class="details-button">View job</button>
    `;
    node.querySelector("button")?.addEventListener("click", onOpen);
    return node;
}
