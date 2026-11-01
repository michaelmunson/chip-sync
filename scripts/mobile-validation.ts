import { spawnSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { registry, outputs } from '../mobile/test/fixtures';

// Synthetic configuration only. These commands never connect to AWS, sign, or submit builds.
const operations: Record<string, string> = {
  export: 'export:ios',
  dependencies: 'check:dependencies',
  health: 'health',
  prebuild: 'prebuild:ios',
};
const operation = operations[process.argv[2] ?? 'export'];
if (!operation) throw new Error('Choose export, dependencies, health, or prebuild.');
const nativeDirectory = new URL('../mobile/ios/', import.meta.url);
const temporaryPrebuild = operation === 'prebuild:ios';
if (temporaryPrebuild && existsSync(nativeDirectory)) {
  throw new Error('Validation prebuild requires mobile/ios to be absent so it cannot overwrite an existing native project.');
}
try {
  const result = spawnSync('npm', ['run', operation, '--workspace', '@chip-sync/mobile'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      CI: '1',
      APP_ENV: 'staging',
      EAS_PROJECT_ID: '00000000-0000-4000-8000-000000000001',
      GOOGLE_MAPS_IOS_API_KEY: 'validation-only-key',
      MOBILE_ENVIRONMENTS_JSON: JSON.stringify(registry),
      MOBILE_AMPLIFY_OUTPUTS_JSON: JSON.stringify(outputs),
    },
  });
  if (result.status === 0 && operation === 'export:ios') {
    const check = spawnSync(process.execPath, ['scripts/check-ios-bundle.mjs'], { stdio: 'inherit' });
    process.exitCode = check.status ?? 1;
  } else if (result.status === 0 && operation === 'prebuild:ios') {
    const check = spawnSync(process.execPath, ['scripts/check-ios-prebuild.mjs'], { stdio: 'inherit' });
    process.exitCode = check.status ?? 1;
  } else {
    process.exitCode = result.status ?? 1;
  }
} finally {
  // Only remove the synthetic project created by this invocation.
  if (temporaryPrebuild) rmSync(nativeDirectory, { recursive: true, force: true });
}
