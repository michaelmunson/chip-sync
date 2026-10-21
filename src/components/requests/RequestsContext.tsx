import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Conversation, Notification, Offer, ServiceRequest, User } from "../../types/dataTypes";
import { SetUserData } from "../../types/generalTypes";
import { DB } from "../../utils/database";
import { notificationEvents } from "../../utils/notificationFeed";
import { RequestsAPI } from "../../utils/serviceRequests";

export type RequestsRole = "gardener" | "organization";

export interface RequestsStore {
  role: RequestsRole;
  /** First load finished (successfully or not). */
  ready: boolean;
  error: string | null;
  /** Gardener: their own requests. Crew: open requests plus ones booked with this crew. */
  requests: ServiceRequest[];
  /** Gardener: offers on their requests. Crew: this crew's offers. Newest first. */
  offers: Offer[];
  conversations: Conversation[];
  unreadByConversation: Record<string, number>;
  refresh: () => Promise<void>;
  findRequest: (id: string) => ServiceRequest | undefined;
  offersFor: (requestId: string) => Offer[];
  conversationFor: (requestId: string) => Conversation | undefined;
  /** Fetches a request that isn't in the store (e.g. opened from an old notification). */
  fetchRequest: (id: string) => Promise<ServiceRequest | null>;
  loadOffersFor: (requestId: string) => Promise<Offer[]>;
  upsertRequest: (request: ServiceRequest) => void;
  upsertOffers: (offers: Offer[]) => void;
  upsertConversation: (conversation: Conversation) => void;
  markConversationRead: (conversationId: string) => void;
  markRequestSeen: (requestId: string) => void;
}

const noop = () => {};
const EMPTY: RequestsStore = {
  role: "organization",
  ready: true,
  error: null,
  requests: [],
  offers: [],
  conversations: [],
  unreadByConversation: {},
  refresh: async () => {},
  findRequest: () => undefined,
  offersFor: () => [],
  conversationFor: () => undefined,
  fetchRequest: async () => null,
  loadOffersFor: async () => [],
  upsertRequest: noop,
  upsertOffers: noop,
  upsertConversation: noop,
  markConversationRead: noop,
  markRequestSeen: noop,
};

const RequestsContext = createContext<RequestsStore>(EMPTY);

/** Works without a provider (returns an empty store), which keeps unit tests simple. */
export const useRequests = () => useContext(RequestsContext);

const REFRESH_MS = 60_000;
const LIVE_TYPES = new Set<Notification.Any["type"]>([
  "new-service-request",
  "new-offer",
  "offer-updated",
  "offer-withdrawn",
  "offer-accepted",
  "offer-declined",
  "offer-closed",
  "request-cancelled",
  "request-completed",
  "new-message",
]);

const byNewest = <T extends { createdAt: string }>(a: T, b: T) => b.createdAt.localeCompare(a.createdAt);
const byRecentMessage = (a: Conversation, b: Conversation) => b.lastMessageAt.localeCompare(a.lastMessageAt);

function upsert<T extends { id: string }>(list: T[], items: T[]): T[] {
  const next = [...list];
  items.forEach((item) => {
    const index = next.findIndex((existing) => existing.id === item.id);
    if (index === -1) next.push(item);
    else next[index] = { ...next[index], ...item };
  });
  return next;
}

async function loadGardener(user: User) {
  const [requests, conversations] = await Promise.all([
    RequestsAPI.listMine(user.id),
    RequestsAPI.listConversationsForGardener(user.id),
  ]);
  const live = requests.filter((r) => r.status === "open" || r.status === "accepted");
  const offerLists = await Promise.all(live.map((r) => RequestsAPI.listOffersForRequest(r.id)));
  return { requests, conversations, offers: offerLists.flat() };
}

async function loadOrganization(user: User) {
  const orgId = user.organization.id;
  const [open, booked, offers, conversations] = await Promise.all([
    RequestsAPI.listOpen(),
    RequestsAPI.listBookedFor(orgId),
    RequestsAPI.listOffersForOrganization(orgId),
    RequestsAPI.listConversationsForOrganization(orgId),
  ]);
  return { requests: upsert(open, booked), offers, conversations };
}

export function RequestsProvider({
  role,
  userData,
  setUserData,
  children,
}: {
  role: RequestsRole;
  userData: User;
  setUserData: SetUserData;
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const inFlight = useRef<Promise<void> | null>(null);
  const userRef = useRef(userData);
  userRef.current = userData;

  const refresh = useCallback(() => {
    if (inFlight.current) return inFlight.current;
    const run = (async () => {
      try {
        const result =
          role === "gardener" ? await loadGardener(userRef.current) : await loadOrganization(userRef.current);
        setRequests(result.requests.sort(byNewest));
        setOffers(result.offers.sort(byNewest));
        setConversations(result.conversations.sort(byRecentMessage));
        setError(null);
      } catch (err) {
        console.warn("Could not load service requests", err);
        setError("Service requests couldn’t be loaded. Check your connection and try again.");
      } finally {
        setReady(true);
        inFlight.current = null;
      }
    })();
    inFlight.current = run;
    return run;
  }, [role]);

  useEffect(() => {
    refresh();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, REFRESH_MS);
    const onVisible = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVisible);
    const unsubscribe = notificationEvents.subscribe((notification) => {
      if (LIVE_TYPES.has(notification.type)) refresh();
    });
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      unsubscribe();
    };
  }, [refresh]);

  const notifications = userData.notifications;
  const unreadByConversation = useMemo(() => {
    const counts: Record<string, number> = {};
    notifications.forEach((n) => {
      if (n.type === "new-message" && !n.opened && n.data?.conversationId) {
        counts[n.data.conversationId] = (counts[n.data.conversationId] ?? 0) + 1;
      }
    });
    return counts;
  }, [notifications]);

  const markOpened = useCallback(
    (matches: (n: Notification.Any) => boolean) => {
      const targets = userRef.current.notifications.filter((n) => !n.opened && matches(n));
      if (!targets.length) return;
      const ids = new Set(targets.map((n) => n.id));
      setUserData((current) =>
        current
          ? {
              ...current,
              notifications: current.notifications.map((n) => (ids.has(n.id) ? { ...n, opened: true } : n)),
            }
          : current,
      );
      targets.forEach((n) => DB.updateNotification({ id: n.id }).catch(() => {}));
    },
    [setUserData],
  );

  const store = useMemo<RequestsStore>(
    () => ({
      role,
      ready,
      error,
      requests,
      offers,
      conversations,
      unreadByConversation,
      refresh,
      findRequest: (id) => requests.find((r) => r.id === id),
      offersFor: (requestId) => offers.filter((o) => o.serviceRequestId === requestId),
      conversationFor: (requestId) => conversations.find((c) => c.serviceRequestId === requestId),
      fetchRequest: async (id) => {
        const request = await RequestsAPI.getRequest(id);
        if (request) setRequests((list) => upsert(list, [request]).sort(byNewest));
        return request;
      },
      loadOffersFor: async (requestId) => {
        const loaded = await RequestsAPI.listOffersForRequest(requestId);
        const visible =
          role === "gardener" ? loaded : loaded.filter((o) => o.organizationId === userRef.current.organization?.id);
        setOffers((list) => upsert(list, visible).sort(byNewest));
        return visible;
      },
      upsertRequest: (request) => setRequests((list) => upsert(list, [request]).sort(byNewest)),
      upsertOffers: (items) => setOffers((list) => upsert(list, items).sort(byNewest)),
      upsertConversation: (conversation) =>
        setConversations((list) => upsert(list, [conversation]).sort(byRecentMessage)),
      markConversationRead: (conversationId) => {
        // Message notifications only feed unread badges, so they're deleted once read
        // instead of accumulating in the user's notification list.
        const read = userRef.current.notifications.filter(
          (n) => n.type === "new-message" && n.data?.conversationId === conversationId,
        );
        if (!read.length) return;
        const ids = new Set(read.map((n) => n.id));
        setUserData((current) =>
          current ? { ...current, notifications: current.notifications.filter((n) => !ids.has(n.id)) } : current,
        );
        read.forEach((n) => DB.deleteNotification({ id: n.id }).catch(() => {}));
      },
      markRequestSeen: (requestId) =>
        markOpened((n) => n.type !== "new-message" && (n.data as any)?.serviceRequestId === requestId),
    }),
    [role, ready, error, requests, offers, conversations, unreadByConversation, refresh, markOpened],
  );

  return <RequestsContext.Provider value={store}>{children}</RequestsContext.Provider>;
}
