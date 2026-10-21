import { generateClient } from "aws-amplify/api";
import {
    Conversation,
    GardenerContact,
    Message,
    Notification,
    Offer,
    OfferPricing,
    Organization,
    RequestTiming,
    ServiceRequest,
    ServiceType,
    User,
} from "../types/dataTypes";
import * as Q from "../graphql/serviceRequests";
import { listOrganizations as listOrganizationsQuery } from "../graphql/queries";
import { DB, parseJson } from "./database";
import { Geo } from "./location";
import { S3 } from "./storage";
import { describeOffer, possessive, requestSummary } from "./requestFormat";

const client = generateClient();

/** Crews within this many miles of a new request get notified about it. */
export const NEARBY_CREW_MILES = 50;
const PAGE = 200;
const MAX_PAGES = 10;

export interface RequestInput {
    services: ServiceType[];
    description: string;
    address: string;
    latitude: number;
    longitude: number;
    timing: RequestTiming;
    preferredDate: string | null;
    contact: GardenerContact;
}

export interface OfferInput {
    pricing: OfferPricing;
    price: number | null;
    chipsYards: number | null;
    logLoads: number | null;
    availableDate: string | null;
    message: string;
}

const fullName = (user: Pick<User, "firstName" | "lastName">) =>
    `${user.firstName} ${user.lastName}`.trim();

async function gql<T = any>(query: string, variables: Record<string, any> = {}): Promise<T> {
    const res: any = await client.graphql({ query, variables });
    return res.data;
}

/** Follows nextToken until exhausted (bounded) and returns all items. */
async function listAll<T>(query: string, field: string, variables: Record<string, any>): Promise<T[]> {
    const items: T[] = [];
    let nextToken: string | null | undefined;
    for (let page = 0; page < MAX_PAGES; page++) {
        const data = await gql(query, { ...variables, limit: PAGE, nextToken });
        const result = data[field];
        items.push(...(result?.items ?? []).filter(Boolean));
        nextToken = result?.nextToken;
        if (!nextToken) break;
    }
    return items;
}

function toRequest(raw: any): ServiceRequest {
    return {
        ...raw,
        services: (raw.services ?? []).filter(Boolean),
        images: (raw.images ?? []).filter(Boolean),
        contact: parseJson(raw.contact) ?? null,
    };
}

/* ---------- Organization lookups (for notifications) ---------- */

const orgCache = new Map<string, { at: number; org: Organization }>();
const ORG_TTL = 5 * 60_000;

async function getOrganization(organizationId: string): Promise<Organization | null> {
    const cached = orgCache.get(organizationId);
    if (cached && Date.now() - cached.at < ORG_TTL) return cached.org;
    const org = await DB.getOrganization({ organizationId });
    if (org) orgCache.set(organizationId, { at: Date.now(), org });
    return org;
}

/** Fire-and-forget: notifications must never block or fail the user's action. */
function notify(userIds: Iterable<string>, type: Notification.Any["type"], data: Record<string, any>) {
    const unique = Array.from(new Set(userIds)).filter(Boolean);
    unique.forEach((userId) => {
        DB.createNotification({ userId, type, data }).catch((error) =>
            console.warn(`Notification ${type} to ${userId} failed`, error),
        );
    });
}

async function notifyOrganization(
    organizationId: string,
    type: Notification.Any["type"],
    data: Record<string, any>,
    { adminsOnly = false, exceptUserId }: { adminsOnly?: boolean; exceptUserId?: string } = {},
) {
    try {
        const org = await getOrganization(organizationId);
        const users = (org?.users ?? []).filter(
            (user) => (!adminsOnly || user.role === "admin") && user.id !== exceptUserId,
        );
        notify(users.map((user) => user.id), type, data);
    } catch (error) {
        console.warn("Could not notify organization", organizationId, error);
    }
}

async function notifyNearbyCrews(request: ServiceRequest) {
    try {
        const orgs = await listAll<any>(listOrganizationsQuery, "listOrganizations", {});
        const adminIds: string[] = [];
        orgs.forEach((raw) => {
            try {
                const coords = Geo.zipcodeToCoordinates(raw.location);
                if (Geo.distance(coords, request) > NEARBY_CREW_MILES) return;
            } catch {
                return; // org without a known ZIP
            }
            (raw.users?.items ?? [])
                .filter((user: User) => user.role === "admin")
                .forEach((user: User) => adminIds.push(user.id));
        });
        notify(adminIds, "new-service-request", requestNotificationData(request));
    } catch (error) {
        console.warn("Could not notify nearby crews", error);
    }
}

function requestNotificationData(request: ServiceRequest, extra: Record<string, any> = {}) {
    return {
        serviceRequestId: request.id,
        services: request.services,
        address: request.address,
        requesterName: request.requesterName,
        summary: requestSummary(request),
        ...extra,
    };
}

/* ---------- Chat helpers ---------- */

async function postMessage(
    conversation: Conversation,
    { senderId, senderName, senderSide, body }: Pick<Message, "senderId" | "senderName" | "senderSide" | "body">,
): Promise<{ message: Message; conversation: Conversation }> {
    const data = await gql(Q.createMessage, {
        input: { conversationId: conversation.id, senderId, senderName, senderSide, body },
    });
    const message: Message = data.createMessage;
    const updated = await gql(Q.updateConversation, {
        input: {
            id: conversation.id,
            lastMessageAt: message.createdAt,
            lastMessagePreview: body.slice(0, 140),
            lastMessageSenderSide: senderSide,
        },
    })
        .then((res) => res.updateConversation as Conversation)
        .catch(() => ({ ...conversation, lastMessageAt: message.createdAt, lastMessagePreview: body }));
    return { message, conversation: updated };
}

async function postSystemMessage(serviceRequestId: string, body: string) {
    try {
        const data = await gql(Q.conversationsByServiceRequest, { serviceRequestId });
        const conversations: Conversation[] = data.conversationsByServiceRequest?.items ?? [];
        await Promise.all(
            conversations.map((conversation) =>
                postMessage(conversation, { senderId: "system", senderName: "Chip Sync", senderSide: "system", body }),
            ),
        );
    } catch (error) {
        console.warn("Could not post system message", error);
    }
}

/* ========================================================================== */

export const RequestsAPI = {
    /* ---------- Gardener: own requests ---------- */
    async listMine(userId: string): Promise<ServiceRequest[]> {
        const items = await listAll<any>(Q.serviceRequestsByUser, "serviceRequestsByUser", { userId });
        return items.map(toRequest);
    },

    async create(user: User, input: RequestInput, photos: File[]): Promise<ServiceRequest> {
        const images = photos.length ? await S3.putRequestImages({ userId: user.id, images: photos }) : [];
        const data = await gql(Q.createServiceRequest, {
            input: {
                ...input,
                userId: user.id,
                requesterName: fullName(user),
                status: "open",
                images,
                contact: JSON.stringify(input.contact),
            },
        });
        const request = toRequest(data.createServiceRequest);
        notifyNearbyCrews(request);
        return request;
    },

    async update(
        request: ServiceRequest,
        input: RequestInput,
        { keepImages, newPhotos }: { keepImages: string[]; newPhotos: File[] },
    ): Promise<ServiceRequest> {
        const added = newPhotos.length
            ? await S3.putRequestImages({ userId: request.userId, images: newPhotos })
            : [];
        const data = await gql(Q.updateServiceRequest, {
            input: {
                id: request.id,
                ...input,
                images: [...keepImages, ...added],
                contact: JSON.stringify(input.contact),
            },
            condition: { status: { eq: "open" } },
        });
        const removed = request.images.filter((key) => !keepImages.includes(key));
        if (removed.length) S3.removeImages(removed);
        return toRequest(data.updateServiceRequest);
    },

    /** Cancels an open or booked request and lets every crew involved know. */
    async cancel(request: ServiceRequest, offers: Offer[]): Promise<ServiceRequest> {
        const data = await gql(Q.updateServiceRequest, {
            input: { id: request.id, status: "cancelled", closedAt: new Date().toISOString() },
        });
        const updated = toRequest(data.updateServiceRequest);
        const pending = offers.filter((offer) => offer.status === "pending");
        await Promise.allSettled(
            pending.map((offer) => gql(Q.updateOffer, { input: { id: offer.id, status: "closed" } })),
        );
        const orgIds = new Set(pending.map((offer) => offer.organizationId));
        if (request.acceptedOrganizationId) orgIds.add(request.acceptedOrganizationId);
        orgIds.forEach((orgId) =>
            notifyOrganization(orgId, "request-cancelled", requestNotificationData(request)),
        );
        if (request.status === "accepted") {
            postSystemMessage(request.id, `${request.requesterName} cancelled this request.`);
        }
        return updated;
    },

    async complete(request: ServiceRequest): Promise<ServiceRequest> {
        const data = await gql(Q.updateServiceRequest, {
            input: { id: request.id, status: "completed", closedAt: new Date().toISOString() },
            condition: { status: { eq: "accepted" } },
        });
        const updated = toRequest(data.updateServiceRequest);
        if (request.acceptedOrganizationId) {
            notifyOrganization(request.acceptedOrganizationId, "request-completed", requestNotificationData(request));
        }
        postSystemMessage(request.id, `${request.requesterName} marked this job as complete.`);
        return updated;
    },

    /**
     * Books the request with one crew: closes competing offers, opens a chat
     * between the gardener and that crew, and notifies everyone involved.
     */
    async acceptOffer(
        user: User,
        request: ServiceRequest,
        offer: Offer,
        allOffers: Offer[],
    ): Promise<{ request: ServiceRequest; offers: Offer[]; conversation: Conversation }> {
        const now = new Date().toISOString();
        // The condition makes a double-accept (two tabs, two taps) fail instead of booking twice.
        const requestData = await gql(Q.updateServiceRequest, {
            input: {
                id: request.id,
                status: "accepted",
                acceptedOfferId: offer.id,
                acceptedOrganizationId: offer.organizationId,
            },
            condition: { status: { eq: "open" } },
        });
        const accepted = await gql(Q.updateOffer, {
            input: { id: offer.id, status: "accepted", respondedAt: now },
        });
        const competing = allOffers.filter((o) => o.id !== offer.id && o.status === "pending");
        const closed = await Promise.all(
            competing.map((o) =>
                gql(Q.updateOffer, { input: { id: o.id, status: "closed", respondedAt: now } })
                    .then((res) => res.updateOffer as Offer)
                    .catch(() => ({ ...o, status: "closed" as const })),
            ),
        );

        const summary = requestSummary(request);
        const created = await gql(Q.createConversation, {
            input: {
                serviceRequestId: request.id,
                offerId: offer.id,
                gardenerId: user.id,
                gardenerName: fullName(user),
                organizationId: offer.organizationId,
                organizationName: offer.organizationName,
                summary,
                lastMessageAt: now,
            },
        });
        const { conversation } = await postMessage(created.createConversation, {
            senderId: "system",
            senderName: "Chip Sync",
            senderSide: "system",
            body: `${fullName(user)} accepted ${possessive(offer.organizationName)} offer (${describeOffer(offer)}). Use this chat to plan the visit.`,
        });

        notifyOrganization(
            offer.organizationId,
            "offer-accepted",
            requestNotificationData(request, { offerId: offer.id, conversationId: conversation.id }),
        );
        competing.forEach((o) =>
            notifyOrganization(o.organizationId, "offer-closed", requestNotificationData(request, { offerId: o.id }), {
                adminsOnly: true,
            }),
        );

        const updatedOffers = allOffers.map((o) => {
            if (o.id === offer.id) return accepted.updateOffer as Offer;
            return closed.find((c) => c.id === o.id) ?? o;
        });
        return { request: toRequest(requestData.updateServiceRequest), offers: updatedOffers, conversation };
    },

    async declineOffer(request: ServiceRequest, offer: Offer, note: string): Promise<Offer> {
        const data = await gql(Q.updateOffer, {
            input: {
                id: offer.id,
                status: "declined",
                responseNote: note.trim() || null,
                respondedAt: new Date().toISOString(),
            },
            condition: { status: { eq: "pending" } },
        });
        notifyOrganization(
            offer.organizationId,
            "offer-declined",
            requestNotificationData(request, { offerId: offer.id }),
            { adminsOnly: true },
        );
        return data.updateOffer;
    },

    /* ---------- Offers ---------- */
    async listOffersForRequest(serviceRequestId: string): Promise<Offer[]> {
        return listAll<Offer>(Q.offersByServiceRequest, "offersByServiceRequest", { serviceRequestId });
    },

    async listOffersForOrganization(organizationId: string): Promise<Offer[]> {
        return listAll<Offer>(Q.offersByOrganization, "offersByOrganization", { organizationId });
    },

    /* ---------- Crews ---------- */
    async listOpen(): Promise<ServiceRequest[]> {
        const items = await listAll<any>(Q.serviceRequestsByStatus, "serviceRequestsByStatus", { status: "open" });
        return items.map(toRequest);
    },

    async listBookedFor(organizationId: string): Promise<ServiceRequest[]> {
        const items = await listAll<any>(
            Q.serviceRequestsByAcceptedOrganization,
            "serviceRequestsByAcceptedOrganization",
            { acceptedOrganizationId: organizationId },
        );
        return items.map(toRequest);
    },

    async getRequest(id: string): Promise<ServiceRequest | null> {
        const data = await gql(Q.getServiceRequest, { id });
        return data.getServiceRequest ? toRequest(data.getServiceRequest) : null;
    },

    async createOffer(user: User, request: ServiceRequest, input: OfferInput): Promise<Offer> {
        const data = await gql(Q.createOffer, {
            input: {
                ...input,
                message: input.message.trim() || null,
                serviceRequestId: request.id,
                organizationId: user.organization.id,
                organizationName: user.organization.name,
                createdById: user.id,
                createdByName: fullName(user),
                status: "pending",
            },
        });
        const offer: Offer = data.createOffer;
        notify([request.userId], "new-offer", {
            ...requestNotificationData(request),
            offerId: offer.id,
            organizationName: offer.organizationName,
        });
        return offer;
    },

    async updateOffer(request: ServiceRequest, offer: Offer, input: OfferInput): Promise<Offer> {
        const data = await gql(Q.updateOffer, {
            input: { id: offer.id, ...input, message: input.message.trim() || null },
            condition: { status: { eq: "pending" } },
        });
        notify([request.userId], "offer-updated", {
            ...requestNotificationData(request),
            offerId: offer.id,
            organizationName: offer.organizationName,
        });
        return data.updateOffer;
    },

    async withdrawOffer(request: ServiceRequest, offer: Offer): Promise<Offer> {
        const data = await gql(Q.updateOffer, {
            input: { id: offer.id, status: "withdrawn", respondedAt: new Date().toISOString() },
            condition: { status: { eq: "pending" } },
        });
        notify([request.userId], "offer-withdrawn", {
            ...requestNotificationData(request),
            offerId: offer.id,
            organizationName: offer.organizationName,
        });
        return data.updateOffer;
    },

    /* ---------- Chat ---------- */
    async listConversationsForGardener(gardenerId: string): Promise<Conversation[]> {
        return listAll<Conversation>(Q.conversationsByGardener, "conversationsByGardener", { gardenerId });
    },

    async listConversationsForOrganization(organizationId: string): Promise<Conversation[]> {
        return listAll<Conversation>(Q.conversationsByOrganization, "conversationsByOrganization", { organizationId });
    },

    async getConversation(id: string): Promise<Conversation | null> {
        const data = await gql(Q.getConversation, { id });
        return data.getConversation ?? null;
    },

    /** Newest page first from the API; returned oldest-first for rendering. */
    async listMessages(
        conversationId: string,
        nextToken?: string | null,
        limit = 40,
    ): Promise<{ items: Message[]; nextToken: string | null }> {
        const data = await gql(Q.messagesByConversation, { conversationId, limit, nextToken });
        const result = data.messagesByConversation;
        return {
            items: [...(result?.items ?? [])].reverse(),
            nextToken: result?.nextToken ?? null,
        };
    },

    async sendMessage(
        user: User,
        conversation: Conversation,
        body: string,
    ): Promise<{ message: Message; conversation: Conversation }> {
        const isGardener = user.role === "gardner";
        const senderName = isGardener ? fullName(user) : `${fullName(user)} · ${user.organization.name}`;
        const result = await postMessage(conversation, {
            senderId: user.id,
            senderName,
            senderSide: isGardener ? "gardener" : "organization",
            body,
        });
        const data = {
            conversationId: conversation.id,
            serviceRequestId: conversation.serviceRequestId,
            senderName: isGardener ? fullName(user) : user.organization.name,
            preview: body.slice(0, 120),
        };
        notifyOrganization(conversation.organizationId, "new-message", data, { exceptUserId: user.id });
        if (!isGardener) notify([conversation.gardenerId], "new-message", data);
        return result;
    },
};
