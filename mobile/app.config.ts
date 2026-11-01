import 'tsx/cjs';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { ConfigContext, ExpoConfig } from 'expo/config';
import { validateEnvironment } from './config/environment';

function readJson(inline: string | undefined, file: string, label: string): unknown {
  try { return JSON.parse(inline ?? readFileSync(resolve(__dirname, file), 'utf8')); }
  catch { throw new Error(`Missing or invalid ${label}. See docs/expo-foundation.md.`); }
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const environment = process.env.APP_ENV;
  if (!environment || !['development', 'staging', 'production'].includes(environment)) {
    throw new Error('APP_ENV must explicitly be development, staging, or production.');
  }
  const registry = readJson(process.env.MOBILE_ENVIRONMENTS_JSON, 'config/environments.local.json', 'mobile environment registry');
  const outputs = readJson(process.env.MOBILE_AMPLIFY_OUTPUTS_JSON, `config/outputs/${environment}.json`, `${environment} Amplify outputs`);
  const selected = validateEnvironment(environment, registry, outputs);
  const googleMapsApiKey = process.env.GOOGLE_MAPS_IOS_API_KEY;
  if (!googleMapsApiKey) throw new Error('GOOGLE_MAPS_IOS_API_KEY must be an iOS SDK key restricted to this bundle identifier.');
  const projectId = process.env.EAS_PROJECT_ID;
  if (!projectId) throw new Error('EAS_PROJECT_ID is required. Register the mobile app in the organization’s EAS account.');
  return {
    ...config,
    name: selected.environment === 'production' ? 'Chip Sync' : `Chip Sync (${selected.environment})`,
    slug: 'chip-sync',
    version: '0.1.0',
    scheme: selected.scheme,
    platforms: ['ios'],
    orientation: 'portrait',
    userInterfaceStyle: 'automatic',
    ios: { bundleIdentifier: selected.bundleIdentifier, supportsTablet: false },
    plugins: [
      'expo-router',
      ['react-native-maps', { iosGoogleMapsApiKey: googleMapsApiKey }],
      ['expo-location', {
        locationWhenInUsePermission: 'Chip Sync uses your location to center the map and find nearby sites.',
        locationAlwaysPermission: false,
        locationAlwaysAndWhenInUsePermission: false,
      }],
      ['expo-image-picker', { photosPermission: 'Chip Sync uses selected photos for sites and service requests.', cameraPermission: false, microphonePermission: false }],
    ],
    // The fingerprint changes with native dependencies and configuration.
    runtimeVersion: { policy: 'fingerprint' },
    updates: { url: `https://u.expo.dev/${projectId}` },
    extra: { eas: { projectId }, chipSync: { environment: selected.environment, outputs: selected.outputs } },
  };
};
