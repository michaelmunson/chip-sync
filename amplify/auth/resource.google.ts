import { defineAuth, secret } from '@aws-amplify/backend';

/**
 * Google + email auth. Use this export in amplify/backend.ts after setting secrets:
 *
 *   npx ampx sandbox secret set GOOGLE_CLIENT_ID
 *   npx ampx sandbox secret set GOOGLE_CLIENT_SECRET
 *
 * Values: Google Cloud OAuth client (same app as Cognito hosted UI / Gen 1 pool).
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      google: {
        clientId: secret('GOOGLE_CLIENT_ID'),
        clientSecret: secret('GOOGLE_CLIENT_SECRET'),
      },
      callbackUrls: [
        'http://localhost:9999/',
        'https://www.chipsync.io/',
      ],
      logoutUrls: [
        'http://localhost:9999/',
        'https://www.chipsync.io/signout/',
      ],
    },
  },
});
