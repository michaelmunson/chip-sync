import { getUrl, remove, uploadData } from "aws-amplify/storage";

namespace S3Types {
    export interface PutArgs {
        organizationId:string,
        images:File[]
    }
}

const MAX_IMAGE_EDGE = 1800;

/** Phone photos are often 5-10 MB; re-encode them as JPEG no larger than MAX_IMAGE_EDGE. */
export async function compressImage(file: File): Promise<Blob> {
    if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
    try {
        const bitmap = await createImageBitmap(file);
        const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);
        canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close?.();
        const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, "image/jpeg", 0.82),
        );
        return blob && blob.size < file.size ? blob : file;
    } catch {
        return file;
    }
}

const safeName = (name: string) =>
    name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9-_]+/gi, "-").slice(0, 40) || "photo";

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
    /** Uploads (compressed) service-request photos; resolves to their keys in input order. */
    async putRequestImages({userId, images}:{userId:string, images:File[]}):Promise<string[]>{
        return Promise.all(images.map(async (image, index) => {
            const key = `request-images/${userId}/${Date.now()}-${index}-${safeName(image.name)}.jpg`;
            const data = await compressImage(image);
            await uploadData({
                path: key,
                data,
                options: { contentType: data.type || "image/jpeg" },
            }).result;
            return key;
        }));
    },
    async removeImages(keys:string[]){
        await Promise.allSettled(keys.map((path) => remove({ path })));
    },
    async getImages({images}:{images:string[]}):Promise<string[]>{
        const imageUrls = await Promise.all(images.map(async (key) => {
            const { url } = await getUrl({ path: key });
            return url.toString();
        }));
        return imageUrls; 
    }
}
