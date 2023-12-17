import { AnyObject } from "../types/generalTypes"

namespace Logger {
    export interface LogDataOptional {
        timestamp?  :number
        error?: {
            type   :string
            message:string
        }
        data?: AnyObject
    }
    
    export interface LogData {
        timestamp:number
        data:AnyObject
        error: {
            type:string
            message:string
        }
    }
}


const getData = (data?:Logger.LogDataOptional) : Logger.LogData =>  {
    const defaultData = {
        timestamp: Date.now(),
        data: {},
        error: {
            type: "RequestError",
            message: "Failed to Fetch"
        }
    }

    if (!data) return defaultData

    return {
        ...defaultData,
        ...data
    }
}

const logger = {
    history: {
        errors: ([] as Logger.LogData[]),
        logs: ([] as Logger.LogDataOptional[])
    },
    logRequest(response:any, data?:Logger.LogDataOptional){
        const logData = getData(data);
        if (!response){ 
            this.record(logData, "error", true);
        } else {
            this.record(logData, "log"); 
        }
    },
    record(logData:Logger.LogData, type?:"error"|"log", log=false){
        if (type === "error"){
            if (log)
                console.error(`${logData.error.type}: ${logData.error.message}`, logData)
            this.history.errors.push(logData); 
        }
        else if (type === "log" || !type){
            if (log)    
                console.log(logData);
            this.history.logs.push(logData);
        }
    }
}

export default logger; 