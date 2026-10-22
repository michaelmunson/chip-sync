import type { NotificationEvent } from "../../../src/utils/notificationSettings";

export interface NotificationMessage {
    /** Short text for SMS (one segment where possible). */
    sms: string;
    subject: string;
    /** HTML email body (inline styles only, so it renders in mail clients). */
    body: string;
}

const clip = (value: string, max: number) => (value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value);
const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const firstName = (name: unknown) => text(name).split(/\s+/)[0] || "A gardener";

export function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

/** Small label above the headline and the label on the email's button, per event. */
const EMAIL_COPY: Record<NotificationEvent, { eyebrow: string; button: string }> = {
    offerCreated: { eyebrow: "New offer", button: "View offer" },
    newMessage: { eyebrow: "New message", button: "Read message" },
    requestAdded: { eyebrow: "New request", button: "View request" },
    offerResponse: { eyebrow: "Offer update", button: "View details" },
    dropSiteAdded: { eyebrow: "New drop site", button: "View drop site" },
};

const BRAND = "#216849";
const BRAND_DARK = "#123d2a";
const BRAND_SOFT = "#eef7f1";
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

function displayUrl(url: string): string {
    return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

/** Branded HTML email: header band, headline, detail card, call-to-action button, and a settings footer. */
export function renderEmail({
    event,
    headline,
    detail,
    appUrl,
}: {
    event: NotificationEvent;
    headline: string;
    detail: string;
    appUrl: string;
}): string {
    const { eyebrow, button } = EMAIL_COPY[event];
    const url = escapeHtml(appUrl);
    const detailBlock = detail
        ? `<tr><td style="padding:0 32px 8px 32px;">
              <div style="background:${BRAND_SOFT};border-left:4px solid ${BRAND};border-radius:6px;padding:14px 16px;font-size:16px;line-height:1.5;color:#2b2f2d;">${escapeHtml(detail)}</div>
           </td></tr>`
        : "";

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(headline)}</title>
</head>
<body style="margin:0;padding:0;background:#f1f4f2;font-family:${FONT};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(detail || headline)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f4f2;">
  <tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(18,61,42,0.10);">
      <tr><td style="background:${BRAND};background-image:linear-gradient(135deg,${BRAND} 0%,${BRAND_DARK} 100%);padding:22px 32px;">
        <span style="font-size:22px;font-weight:800;letter-spacing:-0.01em;color:#ffffff;">&#127795; Chip Sync</span>
      </td></tr>
      <tr><td style="padding:32px 32px 8px 32px;">
        <div style="font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND};">${escapeHtml(eyebrow)}</div>
        <h1 style="margin:8px 0 0 0;font-size:24px;line-height:1.3;font-weight:750;color:#1b1f1d;">${escapeHtml(headline)}</h1>
      </td></tr>
      <tr><td style="height:16px;line-height:16px;font-size:0;">&nbsp;</td></tr>
      ${detailBlock}
      <tr><td align="left" style="padding:20px 32px 32px 32px;">
        <a href="${url}" style="display:inline-block;background:${BRAND};color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:13px 26px;border-radius:10px;">${escapeHtml(button)} &rarr;</a>
      </td></tr>
      <tr><td style="background:#f7f9f8;border-top:1px solid #e6ebe8;padding:18px 32px;font-size:12.5px;line-height:1.6;color:#7a847f;">
        You&rsquo;re getting this because you turned on email notifications for this in Chip Sync.
        To change what we send, open <a href="${url}" style="color:${BRAND};text-decoration:underline;">${escapeHtml(displayUrl(appUrl))}</a> and go to Settings &rarr; Text &amp; email notifications.
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

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

    const sms = clip([`Chip Sync: ${headline}.`, detail && clip(detail, 100), displayUrl(appUrl)].filter(Boolean).join(" "), 320);
    return {
        sms,
        subject: `Chip Sync: ${headline}`,
        body: renderEmail({ event, headline, detail, appUrl }),
    };
}
