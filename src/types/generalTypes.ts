import {User} from "./dataTypes"; 

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
