import { AnyObject } from "../types/generalTypes";
import { getAppSyncRealtimeEndpoints } from "./appsync";

const generateUUID = () => {
    let uuid = "";
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890-";
    for (let i = 0; i < 32; i++) {
        const randint = Math.floor(Math.random() * chars.length - 1);
        uuid += chars[randint];
    }
    return uuid;
}

export class NotificationGQLSocket extends WebSocket {
    wsUrl:string
    hostUrl:string
    token:string; 
    callback:(data:any) => void
    userId:string
    subscriptionId:string|null
    defaultTimeoutMs:number
    connectionTimeoutMs:number
    timeout:any
    isInit:boolean
    isRegistered:boolean

    constructor({
        idToken,
        userId,
        callback
    } : {
        idToken:string
        userId:string
        callback:(data:any) => void
    }){
        const { wsUrl, host } = getAppSyncRealtimeEndpoints();
        const url = wsUrl;
        const api_header = {
            host,
            Authorization: idToken,
        };

        const payload = {};
        
        const base64_api_header = btoa(JSON.stringify(api_header));

        const base64_payload = btoa(JSON.stringify(payload));

        const appsync_url = url + '?header=' + base64_api_header + '&payload=' + base64_payload;
        
        super(appsync_url, ['graphql-ws']);

        this.wsUrl = wsUrl;
        this.hostUrl = host;
        this.token = idToken; 
        this.callback = callback
        this.userId = userId;
        this.subscriptionId = null;
        this.defaultTimeoutMs = 300000;
        this.connectionTimeoutMs = this.defaultTimeoutMs;
        this.timeout = null;
        this.isInit = false;
        this.isRegistered = false;
    }

    handleMessage({type, data}:AnyObject){
        const handlers:AnyObject = {
            'ka' : (data:any) => {
                this.initCloseTimeout();
            },
            'connection_ack' : (data:any) => {
                // console.log("Connection Timeout MS: ", data.payload.connectionTimeoutMs);
                this.connectionTimeoutMs = data.payload.connectionTimeoutMs
                this.initCloseTimeout(this.connectionTimeoutMs);
                this.registerSubscription();
            },
            'start_ack' : (data:any) => {
                this.subscriptionId = data.id;
                // console.log("Organization Subscription Acknowledged - id: ", data.id);
            },
            'error' : (data:any) => {
                console.error("Connection error: ", data.payload.errors);
            },
            'data' : async (data:any) => {
                const notification = data.payload.data?.onCreateNotification;
                // The belongs-to key is not a valid subscription filter, so other
                // users' creates arrive here and are dropped.
                if (!notification || notification.userNotificationsId !== this.userId) return;
                this.callback(notification);
            },
            'complete' : (data:any) => {
                console.log('Subscription Unregistration Complete: ', data);
            }
        }

        if (type in handlers){
            handlers[type](data);
        }
        else {
            throw new Error(`Type "${type}" not in available handlers`)
        }
    }

    initCloseTimeout(timeoutMs=this.connectionTimeoutMs){
        if (this.timeout){
            // console.log('Clearing Timeout...');
            clearTimeout(this.timeout);
        }
        // console.log(`Initializing Timeout - ${timeoutMs}ms`);
        this.timeout = setTimeout(() => {
            this.close();
        }, timeoutMs);
    }

    init(){
        this.addEventListener("open", (event) => {
            this.isInit = true; 
            this.send(JSON.stringify({
                type: "connection_init"
            }));
        });

        this.addEventListener("message", (event) => {
            const data = JSON.parse(event.data);
            const {type} = data;
            // Handle Messages
            this.handleMessage({type, data});
        });

        this.addEventListener("close", event => {
            // console.log('Organization WS Close Event: ', event);
        })    
    }

    registerSubscription(){
        const query = `
            subscription MySubscription {
                onCreateNotification {
                    id
                    type
                    data
                    userNotificationsId
                }
            }
        `;

        this.send(JSON.stringify({
            id: this.userId+'-'+generateUUID(),
            payload: {
                data : JSON.stringify({
                    query,
                }),
                extensions : {
                    authorization : {
                        Authorization : this.token,
                        host : this.hostUrl
                    }
                }
            },
            type: "start",
        }))
    }

    unregisterSubscription(){
        this.send(JSON.stringify({
            type: "stop",
            id: this.subscriptionId
        }))
    }
}