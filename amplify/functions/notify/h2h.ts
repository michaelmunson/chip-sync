/** Client for the H2H notification API (text + email), see https://v2.api.htwoh.com. */

export interface H2HCredentials {
    username: string;
    password: string;
}

export interface H2HClient {
    sendText(to: string, message: string): Promise<void>;
    sendEmail(to: string, subject: string, body: string): Promise<void>;
}

export const H2H_API = "https://v2.api.htwoh.com";
const NOTIFICATIONS_API = `${H2H_API}/@chipsync/@chipsync/api/notifications`;

/**
 * The secret is JSON holding the H2H login. Accepts `username` / `email` / `H2H_USERNAME`
 * and `password` / `H2H_PASSWORD` so the exact key names in Secrets Manager don't matter.
 */
export function parseCredentials(secretString: string | undefined): H2HCredentials {
    let parsed: Record<string, unknown> = {};
    try {
        const value = JSON.parse(secretString ?? "");
        if (value && typeof value === "object") parsed = value as Record<string, unknown>;
    } catch {
        /* handled below */
    }
    const pick = (...keys: string[]) => {
        for (const key of keys) {
            const value = parsed[key];
            if (typeof value === "string" && value) return value;
        }
        return undefined;
    };
    const username = pick("username", "email", "user", "H2H_USERNAME");
    const password = pick("password", "pass", "H2H_PASSWORD");
    if (!username || !password) {
        throw new Error("H2H secret must be JSON with a username (or email) and a password");
    }
    return { username, password };
}

/** The login endpoint returns the Authorization header value as its body (raw, quoted, or wrapped in JSON). */
export function extractToken(body: string): string {
    const raw = body.trim();
    try {
        const parsed = JSON.parse(raw);
        if (typeof parsed === "string") return parsed;
        if (parsed && typeof parsed === "object") {
            for (const key of ["authorization", "Authorization", "token", "accessToken", "access_token", "idToken"]) {
                if (typeof parsed[key] === "string") return parsed[key];
            }
        }
    } catch {
        /* not JSON: use as is */
    }
    return raw;
}

export function createH2HClient(
    getCredentials: () => Promise<H2HCredentials>,
    fetchImpl: typeof fetch = fetch,
): H2HClient {
    let authorization: string | undefined;

    async function login(): Promise<string> {
        const { username, password } = await getCredentials();
        const response = await fetchImpl(`${H2H_API}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: username, password }),
        });
        if (!response.ok) throw new Error(`H2H login failed (${response.status})`);
        const token = extractToken(await response.text());
        if (!token) throw new Error("H2H login returned no token");
        return token;
    }

    /** Logs in lazily, and once more if the token was rejected (stale warm Lambda). */
    async function post(path: "text" | "email", payload: Record<string, string>): Promise<void> {
        for (let attempt = 0; attempt < 2; attempt++) {
            authorization ??= await login();
            const response = await fetchImpl(`${NOTIFICATIONS_API}/${path}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: authorization },
                body: JSON.stringify(payload),
            });
            if (response.ok) return;
            if ((response.status === 401 || response.status === 403) && attempt === 0) {
                authorization = undefined;
                continue;
            }
            throw new Error(`H2H ${path} failed (${response.status})`);
        }
    }

    return {
        sendText: (to, message) => post("text", { to, message }),
        sendEmail: (to, subject, body) => post("email", { to, subject, body }),
    };
}
