import { defineConfig } from "vitest/config";
export default defineConfig({ test: { include: ["packages/api/src/**/*.test.ts"], environment: "node", globals: true } });
