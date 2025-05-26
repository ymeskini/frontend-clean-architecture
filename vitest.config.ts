import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      include: ["src/**/*.(test|spec).ts"],
      setupFiles: ['./vitest.setup.ts']
    },
  })
);
