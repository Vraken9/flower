import { defineConfig } from "vitest/config";
import path from "path";

/**
 * Vitest config for integration tests.
 * Run: npx vitest run --config vitest.integration.config.ts
 */
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/__tests__/**/*.integration.test.ts"],
    testTimeout: 30000,
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
