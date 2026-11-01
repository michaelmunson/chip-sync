import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';

const mobile = createRequire(new URL('../mobile/package.json', import.meta.url));
const web = createRequire(new URL('../package.json', import.meta.url));
const resolution = spawnSync(process.execPath, [new URL('./check-react-resolution.mjs', import.meta.url).pathname], { stdio: 'inherit' });
if (resolution.status !== 0) process.exit(resolution.status ?? 1);

const doctorPackage = mobile('expo-doctor/package.json');
const doctorPath = resolve(dirname(mobile.resolve('expo-doctor/package.json')), doctorPackage.bin['expo-doctor']);
const result = spawnSync(process.execPath, [doctorPath], {
  cwd: new URL('../mobile', import.meta.url), encoding: 'utf8', env: { ...process.env, NO_COLOR: '1' },
});
const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
process.stdout.write(output);
if (result.status === 0) process.exit(0);

// Doctor traverses peers into the root web application. Accept only its precise,
// intentional React split diagnostic; every other failed check still fails CI.
const plain = output.replace(/\x1b\[[0-9;]*m/g, '');
const duplicateNames = [...plain.matchAll(/Found duplicates for ([^:]+):/g)].map(match => match[1]);
const rows = plain.split('\n').filter(line => /[├└]─ react@/.test(line)).map(line => line.trim());
const mobileVersion = mobile('react/package.json').version;
const webVersion = web('react/package.json').version;
const summary = plain.match(/(\d+)\/(\d+) checks passed\. 1 checks failed/);
const expectedSplit = result.status === 1 && summary && Number(summary[1]) === Number(summary[2]) - 1
  && duplicateNames.length === 1 && duplicateNames[0] === 'react'
  && rows.length === 2
  && rows.some(line => line.endsWith(`react@${mobileVersion} (at: node_modules/react)`))
  && rows.some(line => line.endsWith(`react@${webVersion} (at: ../node_modules/react)`));
if (!expectedSplit) process.exit(result.status ?? 1);
console.log('\nAccepted the intentional web/mobile React split. CI also verifies one React implementation in the exported iOS bundle.');
