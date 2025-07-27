import { defineConfig } from "tsdown";

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
});
