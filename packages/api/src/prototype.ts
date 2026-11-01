import type { Marker, ServiceRequest, User } from '@chip-sync/domain';

export interface GraphQLTransport {
  query<T>(document: string, variables: Record<string, unknown>): Promise<T>;
  subscribe<T>(document: string, variables: Record<string, unknown>, next: (data: T) => void, error: (error: unknown) => void): () => void;
}

export type Profile = Pick<User, 'id' | 'firstName' | 'lastName' | 'role' | 'mapChoice'> & {
  organization: { id: string; name: string } | null;
};
export type Site = Pick<Marker, 'id' | 'name' | 'description' | 'address' | 'latitude' | 'longitude' | 'images' | 'type' | 'kind'>;
export type Request = Pick<ServiceRequest, 'id' | 'services' | 'status' | 'address' | 'latitude' | 'longitude' | 'images' | 'userId'>;

const siteFields = 'id name description address latitude longitude images type kind';
const requestFields = 'id services status address latitude longitude images userId';

/** Explicitly injected: callers configure Amplify before creating their transport. */
export function createPrototypeApi(transport: GraphQLTransport) {
  return {
    async profile(userId: string): Promise<Profile> {
      const { getUser } = await transport.query<{ getUser: Profile | null }>(`
        query MobileProfile($id: ID!) {
          getUser(id: $id) { id firstName lastName role mapChoice organization { id name } }
        }`, { id: userId });
      if (!getUser) throw new Error('This account has no Chip Sync profile. Complete registration on the web app first.');
      if (!['admin', 'member', 'gardner'].includes(getUser.role)) throw new Error('This account has an unsupported role.');
      return getUser;
    },
    async site(id: string): Promise<Site> {
      const { getMarker } = await transport.query<{ getMarker: Site | null }>(`
        query MobileSite($id: ID!) { getMarker(id: $id) { ${siteFields} } }
      `, { id });
      if (!getMarker) throw new Error('Site not found or access denied.');
      return { ...getMarker, images: getMarker.images ?? [], kind: getMarker.kind ?? 'dropSite' };
    },
    async request(id: string): Promise<Request> {
      const { getServiceRequest } = await transport.query<{ getServiceRequest: Request | null }>(`
        query MobileRequest($id: ID!) { getServiceRequest(id: $id) { ${requestFields} } }
      `, { id });
      if (!getServiceRequest) throw new Error('Request not found or access denied.');
      return { ...getServiceRequest, images: getServiceRequest.images ?? [] };
    },
    watchSite(id: string, next: (site: Site) => void, error: (error: unknown) => void) {
      return transport.subscribe<{ onUpdateMarker: Site | null }>(`
        subscription MobileSiteUpdate($filter: ModelSubscriptionMarkerFilterInput) {
          onUpdateMarker(filter: $filter) { ${siteFields} }
        }`, { filter: { id: { eq: id } } }, data => {
        if (data.onUpdateMarker?.id === id) next({ ...data.onUpdateMarker, images: data.onUpdateMarker.images ?? [], kind: data.onUpdateMarker.kind ?? 'dropSite' });
      }, error);
    },
    watchRequest(id: string, next: (request: Request) => void, error: (error: unknown) => void) {
      return transport.subscribe<{ onUpdateServiceRequest: Request | null }>(`
        subscription MobileRequestUpdate($filter: ModelSubscriptionServiceRequestFilterInput) {
          onUpdateServiceRequest(filter: $filter) { ${requestFields} }
        }`, { filter: { id: { eq: id } } }, data => {
        if (data.onUpdateServiceRequest?.id === id) next({ ...data.onUpdateServiceRequest, images: data.onUpdateServiceRequest.images ?? [] });
      }, error);
    },
  };
}
