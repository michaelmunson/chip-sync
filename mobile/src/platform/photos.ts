import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { getUrl, remove, uploadData } from 'aws-amplify/storage';
import type { PhotoDescriptor, PhotoService } from '@chip-sync/domain';

interface NativePhoto { uri: string; width: number; height: number }
export type PreparedPhoto = PhotoDescriptor<NativePhoto>;

export function createNativePhotos() {
  let disposed = false;
  const uploads = new Set<{ cancel(): void }>();
  const service: PhotoService<NativePhoto> = {
    async pick(remaining) {
      if (remaining <= 0) return [];
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) throw new Error('Photo access was denied. Enable photo access in iOS Settings to choose a photo.');
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: remaining > 1, selectionLimit: remaining, quality: 1 });
      if (result.canceled) return [];
      return result.assets.slice(0, remaining).map(asset => ({
        id: asset.assetId ?? asset.uri,
        name: asset.fileName ?? 'photo.jpg',
        mimeType: asset.mimeType ?? 'image/jpeg',
        payload: { uri: asset.uri, width: asset.width, height: asset.height },
      }));
    },
    async upload(photo, path, onProgress) {
      const scale = Math.min(1, 1800 / Math.max(photo.payload.width, photo.payload.height));
      const prepared = await manipulateAsync(photo.payload.uri, [{ resize: {
        width: Math.max(1, Math.round(photo.payload.width * scale)),
        height: Math.max(1, Math.round(photo.payload.height * scale)),
      } }], { compress: 0.82, format: SaveFormat.JPEG });
      const response = await fetch(prepared.uri);
      const data = await response.blob();
      if (disposed) throw new Error('Photo upload cancelled.');
      const task = uploadData({ path, data, options: { contentType: 'image/jpeg', onProgress: progress => {
        if (progress.totalBytes) onProgress?.(progress.transferredBytes / progress.totalBytes);
      } } });
      uploads.add(task);
      try { await task.result; return path; }
      finally { uploads.delete(task); }
    },
    async resolve(path) {
      const result = await getUrl({ path, options: { expiresIn: 900, validateObjectExistence: true } });
      return result.url.toString();
    },
    async remove(path) { await remove({ path }); },
  };
  return { ...service, dispose() { disposed = true; uploads.forEach(task => task.cancel()); uploads.clear(); } };
}
