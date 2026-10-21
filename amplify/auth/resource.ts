import { defineAuth, referenceAuth } from '@aws-amplify/backend';

/** Branch deployed by Amplify Hosting that serves www.chipsync.io. */
export const PRODUCTION_BRANCH = 'main';

/**
 * Production keeps the Gen 1 Cognito user pool, identity pool and IAM roles so
 * existing accounts (email + Google) and their user ids carry over unchanged.
 * Sandboxes and other branches get their own throwaway pool: referencing the
 * production roles from them would attach dev policies to production users.
 */
const gen1Auth = () =>
  referenceAuth({
    userPoolId: 'us-east-1_kVC315fXa',
    identityPoolId: 'us-east-1:af647c7d-3c07-4724-ad11-7018aa92d5e5',
    userPoolClientId: 'bffcf7tt8t9c3g7dufa963ak1',
    authRoleArn: 'arn:aws:iam::611118723662:role/amplify-amplifya630058f54114-staging-220138-authRole',
    unauthRoleArn: 'arn:aws:iam::611118723662:role/amplify-amplifya630058f54114-staging-220138-unauthRole',
  });

/**
 * Email sign-in only until Google OAuth secrets are set for this sandbox branch.
 * Then switch to `authWithGoogle` (see amplify/auth/resource.google.ts).
 */
const devAuth = () =>
  defineAuth({
    loginWith: {
      email: true,
    },
  });

// Only one of these may be constructed per backend.
export const auth = process.env.AWS_BRANCH === PRODUCTION_BRANCH ? gen1Auth() : devAuth();
