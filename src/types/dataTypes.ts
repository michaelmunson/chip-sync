declare global {
    interface Window { exports: any; }
}
window.exports = window.exports || {};

/* SUBTYPES */
export interface Contact {
    name: string
    phone: string
}
/* MAIN TYPES */
export interface Marker {
    id: string
    name: string
    description:string
    contact: Contact
    address: string
    latitude: number
    longitude: number
    images: string[]
    type: "wood"|"chips"|"both"
    organization: Organization
    distance?:number
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
}
export interface User {
    id:string
    firstName:string
    lastName:string
    role: "admin"|"member"|"gardner"
    organization: Organization
    notifications: Array<Notification.JoinReqNotification|Notification.MarkerNotification>
    mapChoice: "apple"|"google"
    // if gardner
    contact?: Contact
    markers?: GardnerMarker[]
}
export interface Organization {
    id:string
    name:string
    tier: "basic"|"pro"|"enterprise"
    location:string
    accessCode:string
    users: User[]
    markers: Marker[]
}
