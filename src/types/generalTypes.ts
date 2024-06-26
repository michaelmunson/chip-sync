import { Organization, User } from "./dataTypes";

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
    type: "add-marker"|"settings"|"marker-list"|"notifications"|"marker-details"|"edit-marker"
    data?: AnyObject
    goBackLocation?:ModalConfig["type"]
}

export type ToggleModal = (isOpen: boolean, config?: ModalConfig) => void; 

export namespace NativeMessaging {
    export type Payment = {
        status:number
        messageType:'payment'
        data:{
            tier:Organization['tier']
        }
    }
    export type Error = {
        status:number
        messageType:'error'
        data: {
            errorMessage:string
            errorType:"payment-failure"
            errorCode?:number
        }
    }
}