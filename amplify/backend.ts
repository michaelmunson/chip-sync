import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';

/**
 * Amplify Gen 2 backend. Deploy with `npm run sandbox`.
 * To migrate existing Gen 1 cloud resources in-place, use the Gen 1 CLI:
 * `amplify gen2-migration generate` (see amplify-gen1-backup/).
 */
defineBackend({
  auth,
  data,
  storage,
});

