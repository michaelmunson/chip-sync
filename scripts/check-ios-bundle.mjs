import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';

const directory = new URL('../mobile/dist/_expo/static/js/ios/', import.meta.url);
const maps = readdirSync(directory).filter(file => file.endsWith('.map'));
assert.equal(maps.length, 1, 'Expected one iOS bundle source map.');
const map = JSON.parse(readFileSync(new URL(maps[0], directory), 'utf8'));
const implementations = map.sources.filter(source => /(?:^|\/)react\/cjs\/react\.production\.js$/.test(source));
assert.equal(implementations.length, 1, `Native bundle must contain one React implementation: ${implementations.join(', ')}`);
const sourceIndex = map.sources.indexOf(implementations[0]);
assert.ok(map.sourcesContent[sourceIndex].includes('19.2.0'), 'Native React source must match the pinned mobile version.');
assert.ok(!map.sources.some(source => /(?:^|\/)react\/cjs\/react\.production\.min\.js$/.test(source)), 'Web React 18 leaked into the native bundle.');
console.log(`iOS bundle React isolation passed: ${implementations[0]}`);
