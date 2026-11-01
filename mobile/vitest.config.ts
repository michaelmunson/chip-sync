import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { include: ['mobile/test/**/*.test.ts'], environment: 'node' } });
