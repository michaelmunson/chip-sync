import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 9999,
    watch: {
      // These trees do not contribute to the web app. Keep packages/ watched
      // so changes to shared workspace code still trigger updates.
      ignored: [
        "**/mobile/**",
        "**/.amplify/**",
        "**/amplify-gen1-backup/**",
        "**/build/**",
        "**/coverage/**",
      ],
    },
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}", "amplify/**/*.test.ts"],
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
  },
});
