/** Synthetic identifiers only. These fixtures never connect to AWS. */
const resources = (name: string) => ({
  userPoolId: `us-east-1_${name}`,
  userPoolClientId: `client-${name}`,
  identityPoolId: `us-east-1:identity-${name}`,
  graphqlUrl: `https://${name}.invalid/graphql`,
  storageBucket: `chip-sync-validation-${name}`,
});
export const registry = {
  development: { bundleIdentifier: 'io.chipsync.validation.dev', scheme: 'chipsync-validation-dev', resources: resources('dev') },
  staging: { bundleIdentifier: 'io.chipsync.validation.staging', scheme: 'chipsync-validation-staging', resources: resources('staging') },
  production: { bundleIdentifier: 'io.chipsync.validation', scheme: 'chipsync-validation', resources: resources('prod') },
};
export const outputs = {
  version: '1.4',
  auth: { aws_region: 'us-east-1', user_pool_id: registry.staging.resources.userPoolId,
    user_pool_client_id: registry.staging.resources.userPoolClientId, identity_pool_id: registry.staging.resources.identityPoolId,
    username_attributes: ['email'], user_verification_types: ['email'], unauthenticated_identities_enabled: false },
  data: { aws_region: 'us-east-1', url: registry.staging.resources.graphqlUrl, default_authorization_type: 'AMAZON_COGNITO_USER_POOLS' },
  storage: { aws_region: 'us-east-1', bucket_name: registry.staging.resources.storageBucket },
};
