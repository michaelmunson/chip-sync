declare global {
    interface Window { exports: any; }
}

window.exports = window.exports || {};

/* SUBTYPES */
export interface Contact {
    name: string
    phone: string
}
export interface Position {
    latitude: number
    longitude: number
}
/* MAIN TYPES */
export interface Marker {
    id: string
    contact: Contact
    address: string
    position: Position
    images: string[]
    type: "wood"|"chips"|"both"
    organization: Organization
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

}
export interface User {
    id:string
    firstName:string
    lastName:string
    role: "admin"|"employee"|"gardner"
    organization: Organization
    notifications: Notification.MarkerNotification
}
export interface Organization {
    id:string
    name:string

    accessCode:string
    users: User[]
    markers: Marker[]
}
