import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'chipSyncStorage',
  access: (allow) => ({
    // Single trailing wildcard only (Gen 2 storage rule). Matches all keys under this prefix.
    'marker-images/*': [
      allow.authenticated.to(['read', 'write', 'delete']),
    ],
  }),
});
