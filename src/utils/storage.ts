import { Storage } from "aws-amplify";

namespace S3Types {
    export interface PutArgs {
        organizationId:string,
        images:File[]
    }
}

export const S3 = {
    async put({organizationId, images}:S3Types.PutArgs):Promise<string[]>{
        const s3Keys:string[] = []; 
        await Promise.all(images.map(image => {
            const key = `${organizationId}/${Date.now()}-${image.name}`;
            s3Keys.push(key);
            return Storage.put(key, image);
        }));
        return s3Keys; 
    },
    async getImages({images}:{images:string[]}):Promise<string[]>{
        const imageUrls = await Promise.all(images.map(key => {
            return Storage.get(key); 
        }));
        return imageUrls; 
    }
}