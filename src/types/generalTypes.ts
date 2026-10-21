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
        |"request-list"|"request-details"|"request-form"|"offer-form"|"messages"|"chat"
        |"job-list"|"job-form"|"job-details"
    data?: AnyObject
    goBackLocation?:ModalConfig["type"]
    /** Full config to return to from the header back arrow (takes precedence over goBackLocation). */
    back?: ModalConfig
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