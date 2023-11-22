export namespace ChipSync {
    /* SUBTYPES */
    export interface Contact {
        name: string
        phone: string
    }
    export interface Position {
        latitude: number
        longitude: number
    }
    export interface Notification {
        id:string
        timestamp:number
        type:"new-marker"|"new-user"
        data:{[key:string]:any}
        opened:boolean
    }
    /* MAIN TYPES */
    export interface Organization {
        id:string
        name:string
        accessCode:string
        users: User[]
        markers: Marker[]
        notifications: Notification[]
    }
    export interface User {
        id:string
        firstName:string
        lastName:string
        role: "admin"|"standard"
        organization: Organization
    }
    export interface Marker {
        id: string
        contact: Contact
        address: string
        position: Position
        images: string[]
        type: "wood"|"chips"|"both"
        organization: Organization
    }
}