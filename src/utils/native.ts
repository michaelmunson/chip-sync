import { AnyObject } from "../types/generalTypes";

export interface NativeMessage {
    messageType: "payment",
    data: AnyObject
}

const Native = {
    get isNative(){
        return !!window.ReactNativeWebView;
    },
    sendMessage(message:NativeMessage){
        window?.ReactNativeWebView?.postMessage(
            JSON.stringify(message)
        );
    },
    listen(onData:(data:any)=>void){
        return window.addEventListener("message", onData); 
    }
}

export default Native 