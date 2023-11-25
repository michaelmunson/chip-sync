import { API, Auth } from "aws-amplify";
import { User, Organization } from "../types/dataTypes";
import {
    getUser as getUserQuery,
    listOrganizations as listOrganizationsQuery
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
        
        if (res?.data?.getUser){
            return res?.data?.getUser; 
        } 
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
    async createAdmin({firstName,lastName,organizationId}:DBTypes.CreateAdmin) : Promise<User> {
        const res:any = await API.graphql({
            query: createUserMutation,
            variables: {
                input : {
                    id: this.userId,
                    firstName,
                    lastName,
                    role:'admin',
                    organizationUsersId: organizationId
                }   
            }
        });
        return res.data.createUser; 
    },
    async createUser(){
        
    },
    async createGardner(){
    
    }
}