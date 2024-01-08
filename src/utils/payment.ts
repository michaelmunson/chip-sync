import { Organization } from "../types/dataTypes";
import Native from "./native";

const payment = {
    isRequirePayment(tier:Organization["tier"]["plan"]) : boolean {
        return tier === "free"; 
    },
    registerPayment(tier:Organization["tier"]){
        if (Native.isNative){
            console.log("is native!")
        } else {
            console.log("is not native :(")
        }
    }
}

export default payment