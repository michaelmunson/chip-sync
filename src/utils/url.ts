
export const Url = {
    toSearchParams(paramsObj:{[key:string]:string}){
        const entries = []; 
        for (const param in paramsObj){
            const value = paramsObj[param];
            entries.push([param, value]); 
        }
        return new URLSearchParams(entries).toString(); 
    },
    create(url:string, paramsObj:{[key:string]:string}){
        return `${url}${this.toSearchParams(paramsObj)}`;
    }
}