export interface Coordinates { latitude: number; longitude: number }

/** Payload references are opaque to shared code; adapters own File objects/native URIs. */
export interface PhotoDescriptor<Payload = unknown> {
  id: string;
  name: string;
  mimeType: string;
  payload: Payload;
}

export const MAX_PHOTOS = 8;

export interface PhotoService<Payload> {
  pick(remaining: number): Promise<PhotoDescriptor<Payload>[]>;
  upload(photo: PhotoDescriptor<Payload>, path: string, onProgress?: (fraction: number) => void): Promise<string>;
  resolve(path: string): Promise<string>;
  remove(path: string): Promise<void>;
}

export interface LocationService {
  current(): Promise<Coordinates | null>;
  watch(onLocation: (location: Coordinates) => void): Promise<() => void>;
}

export interface LifecycleService {
  subscribe(onActive: (active: boolean) => void): () => void;
}

export interface ConnectivityService {
  subscribe(onConnected: (connected: boolean) => void): () => void;
}

export interface CancellationSignal {
  readonly aborted: boolean;
  addEventListener(type: "abort", listener: () => void): void;
  removeEventListener(type: "abort", listener: () => void): void;
}

export interface AddressPrediction { id: string; label: string }
export interface AddressResult extends Coordinates { address: string }
export interface AddressService {
  autocomplete(input: string, sessionToken: string, signal?: CancellationSignal): Promise<AddressPrediction[]>;
  place(id: string, sessionToken: string, signal?: CancellationSignal): Promise<AddressResult>;
  geocode(address: string, signal?: CancellationSignal): Promise<AddressResult>;
  reverseGeocode(location: Coordinates, signal?: CancellationSignal): Promise<AddressResult>;
}

export interface ExternalNavigation { open(url: string): Promise<void> }
