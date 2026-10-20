import { defineAuth } from '@aws-amplify/backend';

/**
 * Email sign-in only until Google OAuth secrets are set for this sandbox branch.
 * Then switch to `authWithGoogle` below (see amplify/auth/resource.google.ts).
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
});
