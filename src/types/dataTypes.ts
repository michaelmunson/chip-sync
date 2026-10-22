declare global {
    interface Window { 
        exports: any;
        ReactNativeWebView: any;
    }
}

window.exports = window.exports || {};
window.ReactNativeWebView = window.ReactNativeWebView || undefined;

import type { NotificationSettings } from "../utils/notificationSettings"

/* SUBTYPES */
export interface Contact {
    name: string
    phone: string
}
/* MAIN TYPES */
/** Where a pin lives on the map. Drop sites accept material; facilities are permanent; job sites are dated. */
export type MarkerKind = "dropSite" | "facility" | "jobSite"
export type MaterialType = "wood" | "chips" | "both"
export interface Marker {
    id: string
    name: string
    description:string
    contact: Contact
    address: string
    latitude: number
    longitude: number
    images: string[]
    type: MaterialType
    kind: MarkerKind
    startDate?: string | null
    endDate?: string | null
    organization: Organization
    distance?:number
}
export interface LocationAssignment {
    id: string
    organizationId: string
    markerId: string
    userId: string
    note?: string | null
    createdAt: string
}
export type JobStatus = "planned" | "active" | "done" | "cancelled"
export type JobLocationRole = "facility" | "jobSite"
export interface Job {
    id: string
    organizationId: string
    name: string
    status: JobStatus
    produces: MaterialType[]
    notes?: string | null
    startDate?: string | null
    endDate?: string | null
    createdById: string
    createdAt: string
    updatedAt?: string
}
export interface JobLocation {
    id: string
    jobId: string
    markerId: string
    organizationId: string
    role: JobLocationRole
}
export interface JobAssignment {
    id: string
    jobId: string
    userId: string
    organizationId: string
    jobSiteMarkerId?: string | null
    createdAt: string
}
export interface RoutingPlan {
    id: string
    jobId: string
    userId: string
    organizationId: string
    facilityMarkerId?: string | null
    jobSiteMarkerId?: string | null
    dropSiteMarkerIds: string[]
    materialFilter: MaterialType
    createdAt: string
}
export interface GardnerMarker {
    id: string
    description:string
    address: string
    latitude: number
    longitude: number
    images: [string]
    type: "wood"|"chips"|"both"
    user: User
}
/* SERVICE REQUESTS (gardener -> crews) */
export type ServiceType = "chips"|"logs"|"removal"|"trim"|"stump"|"other"
export type RequestStatus = "open"|"accepted"|"completed"|"cancelled"
export type RequestTiming = "asap"|"flexible"|"date"
export interface ServiceRequest {
    id: string
    userId: string
    requesterName: string
    status: RequestStatus
    services: ServiceType[]
    description?: string|null
    address: string
    latitude: number
    longitude: number
    images: string[]
    timing: RequestTiming
    preferredDate?: string|null
    contact?: GardenerContact|null
    acceptedOfferId?: string|null
    acceptedOrganizationId?: string|null
    closedAt?: string|null
    createdAt: string
    updatedAt: string
    distance?: number
}
export type OfferPricing = "fixed"|"free"|"unknown"
export type OfferStatus = "pending"|"accepted"|"declined"|"withdrawn"|"closed"
export interface Offer {
    id: string
    serviceRequestId: string
    organizationId: string
    organizationName: string
    createdById: string
    createdByName?: string|null
    pricing: OfferPricing
    price?: number|null
    chipsYards?: number|null
    logLoads?: number|null
    availableDate?: string|null
    message?: string|null
    status: OfferStatus
    responseNote?: string|null
    respondedAt?: string|null
    createdAt: string
    updatedAt: string
}
export type ChatSide = "gardener"|"organization"|"system"
export interface Conversation {
    id: string
    serviceRequestId: string
    offerId: string
    gardenerId: string
    gardenerName: string
    organizationId: string
    organizationName: string
    summary?: string|null
    lastMessageAt: string
    lastMessagePreview?: string|null
    lastMessageSenderSide?: ChatSide|null
    createdAt: string
}
export interface Message {
    id: string
    conversationId: string
    senderId: string
    senderName: string
    senderSide: ChatSide
    body: string
    createdAt: string
    /** Client-only: optimistic message that hasn't been confirmed yet. */
    pending?: boolean
    failed?: boolean
}
/** Gardeners keep their phone and home ZIP (map start) in User.contact. */
export interface GardenerContact {
    name?: string
    phone?: string
    zip?: string
}

export namespace Notification {
    interface GenericNotification {
        id:string
        timestamp:number
        opened:boolean
        createdAt:string
        updatedAt:string
    }
    export interface MarkerNotification extends GenericNotification {
        type:"new-org-marker"
            |"new-gardner-marker"
        data:Marker
    }
    export interface JoinReqNotification extends GenericNotification {
        type:"join-request"
        data:User
    }
    export interface RequestNotification extends GenericNotification {
        type:"new-service-request"
            |"new-offer"
            |"offer-updated"
            |"offer-withdrawn"
            |"offer-accepted"
            |"offer-declined"
            |"offer-closed"
            |"request-cancelled"
            |"request-completed"
        data: {
            serviceRequestId: string
            offerId?: string
            conversationId?: string
            services?: ServiceType[]
            address?: string
            organizationName?: string
            requesterName?: string
            summary?: string
        }
    }
    export interface MessageNotification extends GenericNotification {
        type:"new-message"
        data: {
            conversationId: string
            serviceRequestId: string
            senderName: string
            preview: string
        }
    }
    export type Any = JoinReqNotification|MarkerNotification|RequestNotification|MessageNotification
}
export interface User {
    id:string
    firstName:string
    lastName:string
    role: "admin"|"member"|"gardner"
    organization: Organization
    notifications: Notification.Any[]
    mapChoice: "apple"|"google"
    /** Text / email preferences; parsed to all-off defaults when never saved. */
    notificationSettings?: NotificationSettings
    // if gardner
    contact?: GardenerContact
    markers?: GardnerMarker[]
}
export interface Organization {
    id:string
    name:string
    tier: {
        plan: "basic"|"pro"|"enterprise"|"free"|""
        cycle: "monthly"|"annually"
        timestamp: number
    }
    location:string
    accessCode:string
    users: User[]
    markers: Marker[]
}
