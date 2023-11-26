import { User } from "./dataTypes";

export type SetUserData = React.Dispatch<React.SetStateAction<User|undefined>>

export interface CognitoUser {
    username:string
    attributes: {
        sub:string
        email_verified:boolean
        email:string
    }
}

export interface AnyObject {
    [key:string] : any
}

export interface Coordinates {
    latitude: number
    longitude: number
}

export interface ModalConfig {
    type: "add-marker"|"settings"|"marker-list"|"notifications"|"marker-details"
    data?: AnyObject
    goBack?:boolean
    goBackLocation?:ModalConfig["type"]
}

export type ToggleModal = (isOpen: boolean, config?: ModalConfig) => void; 