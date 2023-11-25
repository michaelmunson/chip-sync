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
    contact: Contact
    address: string
    latitude: Number
    longitude: Number
    images: string[]
    type: "wood"|"chips"|"both"
    organization: Organization
}
export interface GardnerMarker {
    id: string
    address: string
    latitude: number
    longitude: number
    images: [string]
    type: "wood"|"chips"|"both"
    user: User
}
export namespace Notification {
    export interface MarkerNotification {
        id:string
        timestamp:number
        type:"new-org-marker"
            |"new-gardner-marker"
        data:Marker
        opened:boolean
    }
    export interface AdminNotification {
        id:string
        timestamp:number
        type:"join-request"
        data:User
        opened:boolean
    }
}
export interface User {
    id:string
    firstName:string
    lastName:string
    role: "admin"|"employee"|"gardner"
    organization: Organization
    notifications: Array<Notification.AdminNotification|Notification.MarkerNotification>
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
