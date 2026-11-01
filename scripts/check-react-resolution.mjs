import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const web = createRequire(new URL('../package.json', import.meta.url));
const mobile = createRequire(new URL('../mobile/package.json', import.meta.url));
const version = require => require('react/package.json').version;
assert.match(version(web), /^18\./, 'The web app must keep React 18.');
assert.match(version(mobile), /^19\./, 'The native app must use its Expo-compatible React.');
assert.notEqual(web.resolve('react'), mobile.resolve('react'), 'Web and mobile React versions must be isolated.');
for (const dependency of ['react-native', 'expo-router', '@gorhom/bottom-sheet']) {
  const nativeDependency = createRequire(mobile.resolve(`${dependency}/package.json`));
  assert.equal(nativeDependency.resolve('react'), mobile.resolve('react'), `${dependency} resolves a different React instance.`);
}
const reactDom = createRequire(web.resolve('react-dom/package.json'));
assert.equal(reactDom.resolve('react'), web.resolve('react'), 'React DOM must resolve the web React.');
console.log(`React resolution passed: web ${version(web)}, mobile ${version(mobile)}.`);
