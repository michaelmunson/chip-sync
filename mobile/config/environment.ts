export type AppEnvironment = 'development' | 'staging' | 'production';
export interface Resources {
  userPoolId: string;
  userPoolClientId: string;
  identityPoolId: string;
  graphqlUrl: string;
  storageBucket: string;
}
export interface EnvironmentDefinition {
  bundleIdentifier: string;
  scheme: string;
  resources: Resources;
}
export type EnvironmentRegistry = Record<AppEnvironment, EnvironmentDefinition>;
export interface MobileOutputs {
  version: string;
  auth: {
    aws_region: string;
    user_pool_id: string;
    user_pool_client_id: string;
    identity_pool_id: string;
    [key: string]: unknown;
  };
  data: { url: string; aws_region: string; default_authorization_type: string };
  storage: { bucket_name: string; aws_region: string };
}

// Production preserves this Cognito pool even though the legacy resources say "staging".
const legacyProduction: Partial<Resources> = {
  userPoolId: 'us-east-1_kVC315fXa',
  userPoolClientId: 'bffcf7tt8t9c3g7dufa963ak1',
  identityPoolId: 'us-east-1:af647c7d-3c07-4724-ad11-7018aa92d5e5',
  graphqlUrl: 'https://3wbb2yhbkjeetjpozeisw2zhza.appsync-api.us-east-1.amazonaws.com/graphql',
  storageBucket: 'chip-sync-storage220138-staging',
};

function object(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`Missing ${label}. See docs/expo-foundation.md.`);
  return value as Record<string, unknown>;
}
function string(value: unknown, label: string): string {
  if (typeof value !== 'string' || !value.trim() || /REPLACE|TODO|<|>/i.test(value)) throw new Error(`Missing or invalid ${label}.`);
  return value;
}
function definition(value: unknown, label: string): EnvironmentDefinition {
  const config = object(value, `${label} environment registration`);
  const resources = object(config.resources, `${label} resource registration`);
  const keys: (keyof Resources)[] = ['userPoolId', 'userPoolClientId', 'identityPoolId', 'graphqlUrl', 'storageBucket'];
  const checked = Object.fromEntries(keys.map(key => [key, string(resources[key], `${label}.${key}`)])) as unknown as Resources;
  const bundleIdentifier = string(config.bundleIdentifier, `${label}.bundleIdentifier`);
  if (!/^[a-zA-Z][\w-]*(\.[a-zA-Z][\w-]*)+$/.test(bundleIdentifier)) throw new Error('Invalid iOS bundle identifier.');
  const scheme = string(config.scheme, `${label}.scheme`);
  if (!/^[a-z][a-z0-9+.-]*$/.test(scheme)) throw new Error('Invalid mobile callback scheme.');
  return { bundleIdentifier, scheme, resources: checked };
}

/** Validate at build time; never use the web application's generated/fallback output selection. */
export function validateEnvironment(environment: unknown, registryInput: unknown, outputsInput: unknown) {
  if (environment !== 'development' && environment !== 'staging' && environment !== 'production') {
    throw new Error('APP_ENV must explicitly be development, staging, or production.');
  }
  const registry = object(registryInput, 'mobile environment registry');
  const selected = definition(registry[environment], environment);
  const production = definition(registry.production, 'production');
  if (environment !== 'production') {
    if (selected.bundleIdentifier === production.bundleIdentifier || selected.scheme === production.scheme) {
      throw new Error('Nonproduction apps must use separate bundle identifiers and callback schemes.');
    }
    for (const key of Object.keys(selected.resources) as (keyof Resources)[]) {
      if (selected.resources[key] === production.resources[key] || selected.resources[key] === legacyProduction[key]) {
        throw new Error(`Nonproduction ${key} points at a production resource.`);
      }
    }
  }
  const raw = object(outputsInput, `${environment} Amplify outputs`);
  const auth = object(raw.auth, 'Amplify auth outputs');
  const data = object(raw.data, 'Amplify data outputs');
  const storage = object(raw.storage, 'Amplify storage outputs');
  const actual: Resources = {
    userPoolId: string(auth.user_pool_id, 'auth.user_pool_id'),
    userPoolClientId: string(auth.user_pool_client_id, 'auth.user_pool_client_id'),
    identityPoolId: string(auth.identity_pool_id, 'auth.identity_pool_id'),
    graphqlUrl: string(data.url, 'data.url'),
    storageBucket: string(storage.bucket_name, 'storage.bucket_name'),
  };
  for (const key of Object.keys(actual) as (keyof Resources)[]) {
    if (actual[key] !== selected.resources[key]) throw new Error(`Amplify ${key} does not match the registered ${environment} environment.`);
  }
  if (!actual.graphqlUrl.startsWith('https://') || !actual.graphqlUrl.endsWith('/graphql')) throw new Error('AppSync URL must use HTTPS and end in /graphql.');
  if (data.default_authorization_type !== 'AMAZON_COGNITO_USER_POOLS') throw new Error('Mobile requires Cognito user-pool API authorization.');
  const outputs: MobileOutputs = {
    version: string(raw.version, 'outputs.version'),
    auth: { ...auth, aws_region: string(auth.aws_region, 'auth.aws_region'), user_pool_id: actual.userPoolId,
      user_pool_client_id: actual.userPoolClientId, identity_pool_id: actual.identityPoolId },
    data: { url: actual.graphqlUrl, aws_region: string(data.aws_region, 'data.aws_region'), default_authorization_type: data.default_authorization_type },
    storage: { bucket_name: actual.storageBucket, aws_region: string(storage.aws_region, 'storage.aws_region') },
  };
  return { environment, ...selected, outputs };
}
