import { execSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "src/index.ts",
  platform: "neutral",
  exports: true,
  hooks: {
    "build:done": async (ctx) => {
      const pkg = ctx.options.pkg;
      if (!pkg) throw new Error("Package information is missing");

      await writeFile(
        "jsr.json",
        JSON.stringify({
          name: pkg.name,
          version: pkg.version,
          exports: {
            ".": "./src/index.ts",
          },
          include: ["LICENSE", "README.md", "src/**/*.ts"],
        }),
      );

      execSync("pnpx prettier --write jsr.json");
    },
  },
});
