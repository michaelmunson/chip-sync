
export interface User {
    username:string
    attributes: {
        sub:string
        email_verified:boolean
        email:string
    }
}

