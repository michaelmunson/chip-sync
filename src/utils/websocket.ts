import { AnyObject } from "../types/generalTypes";
import { Auth } from "aws-amplify";
import { cleanData } from "./database";

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
        const url = "wss://3wbb2yhbkjeetjpozeisw2zhza.appsync-realtime-api.us-east-1.amazonaws.com/graphql"; 
        const api_header = {
            host: '3wbb2yhbkjeetjpozeisw2zhza.appsync-api.us-east-1.amazonaws.com',
            Authorization: idToken,
        };
        const payload = {};
        const base64_api_header = btoa(JSON.stringify(api_header));
        const base64_payload = btoa(JSON.stringify(payload));
        const appsync_url = url + '?header=' + base64_api_header + '&payload=' + base64_payload;
        
        super(appsync_url, ['graphql-ws']);
        this.wsUrl = "wss://3wbb2yhbkjeetjpozeisw2zhza.appsync-realtime-api.us-east-1.amazonaws.com/graphql"
        this.hostUrl = "3wbb2yhbkjeetjpozeisw2zhza.appsync-api.us-east-1.amazonaws.com"
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
                // console.log('Data Recieved: ', data);
                const notificationId = data.payload.data.onCreateNotification
                this.callback(notificationId);
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
                onCreateNotification(filter: {userNotificationsId: {eq: "${this.userId}"}}) {
                    id
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