import { API, Auth } from "aws-amplify";
import { User, Organization } from "../types/dataTypes";
import {
    getUser as getUserQuery,
    listOrganizations as listOrganizationsQuery,
    getOrganization as getOrganizationQuery,
} from "../graphql/queries";
import {
    createOrganization as createOrganizationMutation,
    createUser as createUserMutation
} from "../graphql/mutations";

namespace DBTypes {
    export interface CreateOrg {
        name:string
        location:string
        tier:string
    }
    export interface CreateAdmin {
        firstName:string
        lastName:string
        organizationId:string
    }
}

function cleanData(data:{[key:string]:any}):any{
    if ("markers" in data && "items" in data?.markers){
        data.markers = data.markers.items; 
    }
    if ("users" in data && "items" in data?.users){
        data.users = data.users.items; 
    }
    if ("notifications" in data && "items" in data?.notifications){
        data.notifications = data.notifications.items; 
    }
    if ("organization" in data){
        data.organization = cleanData(data.organization);
    }
    return data; 
}

export const DB = {
    get userId(){
        const authObj:any = {...Auth}
        return authObj.user.username; 
    },
    async getUser():Promise<User|void>{
        const res:any = await API.graphql({
            query:getUserQuery,
            variables:{
                id:this.userId
            }
        });
        const userData = res?.data?.getUser;
        if (userData){
            return cleanData(userData);
        }
    },
    async createAdmin({firstName,lastName,organizationId}:DBTypes.CreateAdmin) : Promise<User> {
        const res:any = await API.graphql({
            query: createUserMutation,
            variables: {
                input : {
                    id: this.userId,
                    firstName,
                    lastName,
                    role:'admin',
                    organizationUsersId: organizationId,
                }   
            }
        });
        const data = cleanData(res.data.createUser); 
        console.log("Create Admin Res Cleaned: ", data); 
        return data; 
    },
    async createUser(){
        
    },
    async createGardner(){
    
    },
    /* ORGANIZATION */
    async getOrganization({organizationId}:{organizationId:string}): Promise<Organization|null> {
        const res:any = await API.graphql({
            query: getOrganizationQuery,
            variables: {
                id: organizationId
            }
        });
        return cleanData(res.data.getOrganization); 
    },
    async getUniqueAccessCode():Promise<string>{
        const accessCode = Math.floor(100000 + Math.random() * 900000);
        console.log('access code', accessCode); 
        const res:any = await API.graphql({
            query:listOrganizationsQuery,
            variables: {
                filter: {
                    accessCode: {
                        eq: accessCode
                    }
                }
            }
        });
        if (res.data.listOrganizations.items.length === 0){
            return accessCode.toString(); 
        } else {
            return await this.getUniqueAccessCode(); 
        }
    },
    async createOrganization({name,location,tier}:DBTypes.CreateOrg) : Promise<Organization> {
        const accessCode = await this.getUniqueAccessCode(); 
        const res:any = await API.graphql({
            query: createOrganizationMutation,
            variables: {
                input : {
                    name,
                    location,
                    tier,
                    accessCode
                }
            }
        });
        return res?.data?.createOrganization; 
    },
}