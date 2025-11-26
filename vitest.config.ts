import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    test: {
      globals: true,
      environment: "node",
      setupFiles: ['./src/test/setup.ts'],
      env: env,
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html"],
        exclude: [
          "node_modules/",
          "dist/",
          "src/test/",
          "**/*.test.ts",
          "**/*.spec.ts",
          "scripts/"
        ],
        all: true,
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70
      },
      testTimeout: 10000,
      hookTimeout: 10000
    },
  };
});
