import { API, Auth } from "aws-amplify";
import { User, Organization, Marker, Notification } from "../types/dataTypes";
import {
    getUser as getUserQuery,
    listOrganizations as listOrganizationsQuery,
    getOrganization as getOrganizationQuery,
} from "../graphql/queries";
import {
    createOrganization as createOrganizationMutation,
    createUser as createUserMutation,
    createMarker as createMarkerMutation,
    createNotification as createNotificationMutation,
    updateNotification as updateNotificationMutation,
    updateUser as updateUserMutation
} from "../graphql/mutations";
import { Geo } from "./location";
import { S3 } from "./storage";
import { NotificationGQLSocket } from "./websocket";
import { AnyObject } from "../types/generalTypes";
import logger from "./logger";

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
    export interface CreateUser {
        firstName:string
        lastName:string
        accessCode:string
    }
    export interface CreateMarker {
        type:Marker["type"]
        name:string
        description:string
        contact:Marker["contact"]
        address:string
        images:File[]
        userData: User
    }
    export interface UpdateUser{
        role?:User["role"]
        mapChoice?:User["mapChoice"]
    }
    export type NotificationType = Notification.JoinReqNotification["type"] | Notification.MarkerNotification["type"]
}

const getIdToken = async () => {
    const session = await Auth.currentSession();
    return session.getIdToken().getJwtToken();
}

const generateAccessCode = (length:number=7) => {
    const characters = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase();
    let result = '';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      if (i % 2 === 0) result += characters.charAt(randomIndex);
      else result += Math.floor(Math.random() * 10);
    }
  
    return result;
}

export function cleanData(data:{[key:string]:any}):any{
    if ("markers" in data && "items" in data?.markers){
        data.markers = data.markers.items;
        for (const i in data.markers){
            if (data.markers[i].contact){
                data.markers[i].contact = JSON.parse(data.markers[i].contact); 
            }
        } 
    }
    if ("users" in data && "items" in data?.users){
        data.users = data.users.items; 
    }
    if ("notifications" in data && "items" in data?.notifications){
        data.notifications = data.notifications.items;
        for (const i in data.notifications){
            if ("data" in data.notifications[i]){
                data.notifications[i].data = JSON.parse(data.notifications[i].data);
                data.notifications[i].data.contact = JSON.parse(data.notifications[i].data.contact);
            }
        }
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
    /* USER */
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
    async createMember({firstName,lastName,accessCode}:DBTypes.CreateUser) : Promise<User|void> {
        const orgRes = await this.getOrganizationByAccessCode({accessCode});
        if (orgRes && orgRes.accessCode === accessCode) {
            const res:any = await API.graphql({
                query: createUserMutation,
                variables: {
                    input : {
                        id: this.userId,
                        firstName,
                        lastName,
                        role:'member',
                        organizationUsersId: orgRes.id,
                    }   
                }
            });
            const data = cleanData(res.data.createUser); 
            console.log("Create User Res Cleaned: ", data); 
            orgRes.users.filter(user => user.role === "admin").forEach(user => {
                this.createNotification({
                    userId: user.id,
                    type: "join-request",
                    data
                });
            });
            return data;
        }
    },
    async updateUserOrganization(){
        
    },
    async createGardner(){
    
    },
    async updateUser({role,mapChoice}:DBTypes.UpdateUser){
        if (role || mapChoice) {
            const input = role ? {id:this.userId, role} : {id:this.userId, mapChoice};
            return await API.graphql({
                query: updateUserMutation,
                variables: {
                    input
                }
            })
        }
        
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
    async getOrganizationByAccessCode({accessCode}:{accessCode:string}) : Promise<Organization|void> {
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
        if (res.data.listOrganizations.items.length){
            return cleanData(res.data.listOrganizations.items[0]) 
        }
    },
    async getUniqueAccessCode():Promise<string>{
        const accessCode = generateAccessCode(10);
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
    /* MARKER */
    async createMarker({type,name,address,description,contact,images,userData}:DBTypes.CreateMarker) : Promise<Marker> {
        const organizationId = userData.organization.id; 
        const imageKeys = await S3.put({organizationId, images}); 
        const {latitude, longitude} = await Geo.addressToCoords(address); 
        const res:any = await API.graphql({
            query: createMarkerMutation,
            variables: {
                input : {
                    type,
                    name,
                    address,
                    description,
                    contact: JSON.stringify(contact),
                    latitude,
                    longitude,
                    organizationMarkersId: organizationId,
                    images: imageKeys
                }   
            }
        });
        userData.organization.users.forEach(user => {
            this.createNotification({
                userId: user.id,
                type: "new-org-marker",
                data: {
                    type,
                    name,
                    address,
                    description,
                    contact: JSON.stringify(contact),
                    latitude,
                    longitude,
                    organizationMarkersId: organizationId,
                    images: imageKeys
                }
            });
        })
        const data = cleanData(res.data.createMarker);
        console.log("Create Marker Res Cleaned: ", data);
        return data; 
    },
    /* NOTIFICATIONS */
    async createNotification({data,userId,type}:{data:AnyObject,userId:string,type:DBTypes.NotificationType}){
        const res:any = await API.graphql({
            query: createNotificationMutation,
            variables: {
                input: {
                    userNotificationsId: userId,
                    type,
                    data: JSON.stringify(data),
                    opened: false,
                    timestamp: 0
                }
            }
        }); 
        const resData = res.data.createNotification;
        console.log("Create Notification Res: ", resData);
        return resData; 
    },
    async updateNotification({id}:{id:string}){
        const res:any = await API.graphql({
            query: updateNotificationMutation,
            variables: {
                input: {
                    id,
                    opened: true
                }
            } 
        });

        logger.logRequest(res?.data?.updateNotification, {
            error: {
                type: "UpdateNotificationError",
                message: "Failed to Update Notification"
            },
            data: res
        });

        return res?.data?.updateNotification; 
    },
    async deleteNotification({id}:{id:string}){
        
    },
    async subscribeToNotification(callback:(data:any) => void){
        const idToken = await getIdToken(); 
        const userId = (await Auth.currentUserInfo()).username; 
        const socket = new NotificationGQLSocket({
            idToken,
            userId,
            callback
        });
        socket.init();
        return socket; 
    },
}   