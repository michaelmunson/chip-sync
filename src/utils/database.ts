import { generateClient } from "aws-amplify/api";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import { User, Organization, Marker, Notification, GardenerContact } from "../types/dataTypes";
import {
    getUser as getUserQuery,
    listOrganizations as listOrganizationsQuery,
    getOrganization as getOrganizationQuery,
} from "../graphql/queries";
import {
    createOrganization as createOrganizationMutation,
    createUser as createUserMutation,
    createMarker as createMarkerMutation,
    updateMarker as updateMarkerMutation,
    createNotification as createNotificationMutation,
    updateNotification as updateNotificationMutation,
    updateOrganization as updateOrganizationMutation,
    updateUser as updateUserMutation,
    deleteMarker as deleteMarkerMutation,
    deleteUser as deleteUserMutation,
    deleteNotification as deleteNotificationMutation
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
    export interface UpdateOrg {
        organizationId:string
        tier: Organization["tier"]
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
    export interface CreateGardner {
        firstName:string
        lastName:string
        contact:GardenerContact
    }
    export interface UpdateUser{
        id:string
        role?:User["role"]
        mapChoice?:User["mapChoice"]
        firstName?:string
        lastName?:string
        contact?:GardenerContact
    }
    export interface UpdateMarker {
        id:string
        type:Marker["type"]
        name:string
        description:string
        contact:Marker["contact"]
        address:string
    }
    export type NotificationType = Notification.Any["type"]
}

const client = generateClient();

const getIdToken = async () => {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (!token) {
        throw new Error("No ID token in auth session");
    }
    return token;
};

const getUserId = async () => {
    const user = await getCurrentUser();
    return user.userId;
};

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

/** AWSJSON fields arrive as strings (sometimes double-encoded); anything unparseable is returned as-is. */
export function parseJson(value:any):any{
    let result = value;
    for (let i = 0; i < 2 && typeof result === "string"; i++){
        try { result = JSON.parse(result); } catch { return result; }
    }
    return result;
}

export function cleanData(data:{[key:string]:any}|null|undefined):any{
    if (!data) return data;
    if (data.markers && "items" in data.markers){
        data.markers = data.markers.items;
        for (const i in data.markers){
            if (data.markers[i].contact){
                data.markers[i].contact = parseJson(data.markers[i].contact); 
            }
        } 
    }
    if (data.users && "items" in data.users){
        data.users = data.users.items; 
    }
    if (data.notifications && "items" in data.notifications){
        data.notifications = data.notifications.items;
        for (const i in data.notifications){
            const notification = data.notifications[i];
            if ("data" in notification){
                notification.data = parseJson(notification.data) ?? {};
                if (notification.data && "contact" in notification.data){
                    notification.data.contact = parseJson(notification.data.contact);
                }
            }
        }
    }
    if ("organization" in data){
        data.organization = cleanData(data.organization);
    }
    if ("contact" in data){
        data.contact = parseJson(data.contact);
    }
    if ("tier" in data){
        data.tier = parseJson(data.tier);
    }
    return data; 
}

export const DB = {
    /* USER */
    async getUser():Promise<User|void>{
        const res:any = await client.graphql({
            query:getUserQuery,
            variables:{
                id: await getUserId()
            }
        });
        const userData = res?.data?.getUser;
        if (userData){
            return cleanData(userData);
        }
    },
    async createAdmin({firstName,lastName,organizationId}:DBTypes.CreateAdmin) : Promise<User> {
        const res:any = await client.graphql({
            query: createUserMutation,
            variables: {
                input : {
                    id: await getUserId(),
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
            const res:any = await client.graphql({
                query: createUserMutation,
                variables: {
                    input : {
                        id: await getUserId(),
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
    async createGardner({firstName,lastName,contact}:DBTypes.CreateGardner) : Promise<User> {
        const res:any = await client.graphql({
            query: createUserMutation,
            variables: {
                input : {
                    id: await getUserId(),
                    firstName,
                    lastName,
                    role:'gardner',
                    contact: JSON.stringify(contact),
                }
            }
        });
        return cleanData(res.data.createUser);
    },
    async updateUser({id,role,mapChoice,firstName,lastName,contact}:DBTypes.UpdateUser){
        const input:AnyObject = {id};
        if (role) input.role = role;
        if (mapChoice) input.mapChoice = mapChoice;
        if (firstName !== undefined) input.firstName = firstName;
        if (lastName !== undefined) input.lastName = lastName;
        if (contact !== undefined) input.contact = JSON.stringify(contact);
        if (Object.keys(input).length === 1) return;
        return await client.graphql({
            query: updateUserMutation,
            variables: {
                input
            }
        });
    },
    async deleteUser({userId}:{userId:string}){
        return await client.graphql({
            query: deleteUserMutation,
            variables: {
                input : {
                    id: userId,
                }
            }
        })
    },
    /* ORGANIZATION */
    async getOrganization({organizationId}:{organizationId:string}): Promise<Organization|null> {
        const res:any = await client.graphql({
            query: getOrganizationQuery,
            variables: {
                id: organizationId
            }
        });
        return cleanData(res.data.getOrganization); 
    },
    async getOrganizationByAccessCode({accessCode}:{accessCode:string}) : Promise<Organization|void> {
        const res:any = await client.graphql({
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
        const res:any = await client.graphql({
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
        const res:any = await client.graphql({
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
    async updateOrganization({organizationId, tier}:DBTypes.UpdateOrg) : Promise<Organization> {
        const result:any = await client.graphql({
            query: updateOrganizationMutation,
            variables: {
                input: {
                    id: organizationId,
                    tier:JSON.stringify(tier)
                }
            }
        });

        return result; 
    },
    /* MARKER */
    async createMarker({type,name,address,description,contact,images,userData}:DBTypes.CreateMarker) : Promise<Marker> {
        const organizationId = userData.organization.id; 
        const imageKeys = await S3.put({organizationId, images}); 
        const {latitude, longitude} = await Geo.addressToCoords(address); 
        const res:any = await client.graphql({
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
    async deleteMarker({id}:{id:string}){
        await client.graphql({
            query: deleteMarkerMutation,
            variables: {
                input: {
                    id
                }
            }
        })
    },
    async updateMarker({id,type,name,address,description,contact}:DBTypes.UpdateMarker) : Promise<Marker> {
        // const imageKeys = await S3.put({organizationId, images}); 
        const {latitude, longitude} = await Geo.addressToCoords(address); 
        const res:any = await client.graphql({
            query: updateMarkerMutation,
            variables: {
                input : {
                    id,
                    type,
                    name,
                    address,
                    description,
                    contact: JSON.stringify(contact),
                    latitude,
                    longitude                
                }   
            }
        });
        const data = cleanData(res.data.updateMarker);
        console.log("Update Marker Res Cleaned: ", data);
        return data; 
    },
    /* NOTIFICATIONS */
    async createNotification({data,userId,type}:{data:AnyObject,userId:string,type:DBTypes.NotificationType}){
        const res:any = await client.graphql({
            query: createNotificationMutation,
            variables: {
                input: {
                    userNotificationsId: userId,
                    type,
                    data: JSON.stringify(data),
                    opened: false,
                    // Seconds, because AppSync Int is 32-bit.
                    timestamp: Math.floor(Date.now() / 1000)
                }
            }
        }); 
        const resData = res.data.createNotification;
        console.log("Create Notification Res: ", resData);
        return resData; 
    },
    async updateNotification({id}:{id:string}){
        const res:any = await client.graphql({
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
        return await client.graphql({
            query: deleteNotificationMutation,
            variables: {
                input: {
                    id
                }
            }
        })
    },
    async subscribeToNotification(callback:(data:any) => void){
        const idToken = await getIdToken(); 
        const userId = await getUserId();
        const socket = new NotificationGQLSocket({
            idToken,
            userId,
            callback
        });
        socket.init();
        return socket; 
    },
}   