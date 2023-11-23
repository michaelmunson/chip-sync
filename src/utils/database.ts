import { API, Auth } from "aws-amplify";
import { User } from "../types/dataTypes";
import {
    getUser as getUserQuery
} from "../graphql/queries"; 


export const DB = {
    get userId(){
        const authObj:any = {...Auth}
        return authObj.user.username; 
    },
    async getUser():Promise<User|void>{
        const id = this.userId; 
        const res:any = await API.graphql({
            query:getUserQuery,
            variables:{
                id:this.userId
            }
        });
        
        if (res?.data?.getUser){
            return res?.data?.getUser; 
        } 
    }
}