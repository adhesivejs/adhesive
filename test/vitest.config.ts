import { resolve } from "node:path";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import react from "@vitejs/plugin-react";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

const resolvePkg = (name: string) =>
  resolve(import.meta.dirname, `../packages/${name}/src/index.ts`);

export default defineConfig({
  plugins: [react(), svelte(), vue()],
  test: {
    environment: "happy-dom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@adhesivejs/core": resolvePkg("core"),
      "@adhesivejs/react": resolvePkg("react"),
      "@adhesivejs/svelte": resolvePkg("svelte"),
      "@adhesivejs/vue": resolvePkg("vue"),
    },
  },
});
