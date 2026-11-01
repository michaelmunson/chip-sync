/** Presentation helpers shared across the UI. */

/** (212) 555-0143 for 10/11-digit US numbers; anything else is returned untouched. */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const national =
    digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (national.length !== 10) return raw;
  return `(${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`;
}

export function initials(first = "", last = ""): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || "?";
}

/** Initials from a full or business name, skipping symbols: "Oak & Ash Tree Co" -> "OA". */
export function nameInitials(name: string): string {
  const [first = "", second = ""] = name.split(/\s+/).filter((word) => /^[\p{L}\p{N}]/u.test(word));
  return initials(first, second);
}

export function formatDistance(miles: number | undefined): string {
  if (miles === undefined || Number.isNaN(miles)) return "";
  if (miles < 0.1) return "Nearby";
  return `${miles < 10 ? miles.toFixed(1) : Math.round(miles)} mi`;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "Just now", "5m ago", "3h ago", "2d ago", then "Oct 3". */
export function timeAgo(input: string | number | Date, now = Date.now()): string {
  const time = new Date(input).getTime();
  if (Number.isNaN(time)) return "";
  const diff = Math.max(0, now - time);
  if (diff < MINUTE) return "Just now";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}d ago`;
  return new Date(time).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(new Date(time).getFullYear() !== new Date(now).getFullYear()
      ? { year: "numeric" }
      : {}),
  });
}

/** For interpolating user-provided text into HTML strings (e.g. Google InfoWindow). */
export function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        ch
      ] as string,
  );
}
