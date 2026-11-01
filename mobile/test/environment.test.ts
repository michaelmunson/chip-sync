import { describe, expect, it } from 'vitest';
import { validateEnvironment } from '../config/environment';
import { registry, outputs } from './fixtures';

describe('explicit mobile AWS configuration', () => {
  it('requires an environment, registry, and outputs without fallback', () => {
    expect(() => validateEnvironment(undefined, registry, outputs)).toThrow('APP_ENV');
    expect(() => validateEnvironment('staging', undefined, outputs)).toThrow('registry');
    expect(() => validateEnvironment('staging', registry, undefined)).toThrow('Amplify outputs');
  });
  it('exposes the selected environment and strips API model metadata', () => {
    const result = validateEnvironment('staging', registry, { ...outputs, extraSecret: 'never bundled' });
    expect(result.environment).toBe('staging');
    expect(result.outputs).not.toHaveProperty('extraSecret');
  });
  it.each(['userPoolId', 'userPoolClientId', 'identityPoolId', 'graphqlUrl', 'storageBucket'] as const)(
    'rejects production %s in staging, even if other resources are isolated', key => {
      const changed = structuredClone(registry);
      changed.staging.resources[key] = changed.production.resources[key];
      expect(() => validateEnvironment('staging', changed, outputs)).toThrow('production resource');
    });
  it('rejects the preserved production Cognito pool despite its legacy staging name', () => {
    const changed = structuredClone(registry);
    changed.staging.resources.userPoolId = 'us-east-1_kVC315fXa';
    expect(() => validateEnvironment('staging', changed, outputs)).toThrow('production resource');
  });
  it('rejects outputs from another branch and shared install identities', () => {
    expect(() => validateEnvironment('staging', registry, { ...outputs, storage: { ...outputs.storage, bucket_name: 'other' } })).toThrow('does not match');
    const changed = structuredClone(registry);
    changed.staging.bundleIdentifier = changed.production.bundleIdentifier;
    expect(() => validateEnvironment('staging', changed, outputs)).toThrow('separate bundle identifiers');
  });
});
