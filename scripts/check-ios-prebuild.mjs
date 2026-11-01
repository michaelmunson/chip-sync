import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const directory = new URL('../mobile/ios/', import.meta.url);
const app = readdirSync(directory, { withFileTypes: true }).find(entry => entry.isDirectory() && entry.name === 'ChipSyncstaging');
assert.ok(app, 'Expected the synthetic staging iOS target.');
const plist = readFileSync(new URL(`${app.name}/Info.plist`, directory), 'utf8');
const delegate = readFileSync(new URL(`${app.name}/AppDelegate.swift`, directory), 'utf8');
const podfile = readFileSync(new URL('Podfile', directory), 'utf8');
assert.match(delegate, /GMSServices\.provideAPIKey\("validation-only-key"\)/);
assert.match(podfile, /react-native-maps\/Google/);
assert.match(plist, /NSLocationWhenInUseUsageDescription/);
assert.match(plist, /NSPhotoLibraryUsageDescription/);
assert.doesNotMatch(plist, /NSLocationAlways|NSCameraUsageDescription|NSMicrophoneUsageDescription|UIBackgroundModes/);
console.log('iOS prebuild configuration passed: Google Maps, foreground location, selected photos.');
