import { defineConfig } from "vitest/config";
export default defineConfig({ test: { include: ["packages/domain/src/**/*.test.ts"], environment: "node", globals: true } });
