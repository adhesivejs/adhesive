import { defineConfig } from "tsdown";
import Vue from "unplugin-vue/rolldown";

export default defineConfig({
  entry: "src/index.ts",
  platform: "neutral",
  exports: {
    customExports: (exports) => ({
      ...exports,
      ".": {
        jsr: "./src/index.ts",
        types: "./dist/index.d.ts",
        import: "./dist/index.js",
      },
    }),
  },
  plugins: [Vue({ isProduction: true })],
  dts: { vue: true },
});
