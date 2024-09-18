import { Organization } from "../types/dataTypes";
import { DB } from "./database";
import Native from "./native";

const payment = {
    isRequirePayment(tier:Organization["tier"]["plan"]) : boolean {
        return tier === "trial"; 
    },
    registerPayment({organizationId, tier}:{organizationId:string, tier:Organization["tier"]}){
        if (Native.isNative){
            Native.sendMessage({
                messageType: "payment",
                data: tier
            });
            return new Promise((resolve, reject) => {
                setTimeout(() => resolve("native"), 1000);
            })
        } else {
            return new Promise((resolve, reject) => {
                DB.updateOrganization({organizationId, tier})
                .then(res => resolve(res))
                .catch(err => reject(err))
            });
        }
    }
}

export default payment