import { getUrl, uploadData } from "aws-amplify/storage";

namespace S3Types {
    export interface PutArgs {
        organizationId:string,
        images:File[]
    }
}

export const S3 = {
    async put({organizationId, images}:S3Types.PutArgs):Promise<string[]>{
        const s3Keys:string[] = []; 
        await Promise.all(images.map(async (image) => {
            const key = `marker-images/${organizationId}/${Date.now()}-${image.name}`;
            s3Keys.push(key);
            await uploadData({
                path: key,
                data: image,
            }).result;
        }));
        return s3Keys; 
    },
    async getImages({images}:{images:string[]}):Promise<string[]>{
        const imageUrls = await Promise.all(images.map(async (key) => {
            const { url } = await getUrl({ path: key });
            return url.toString();
        }));
        return imageUrls; 
    }
}
