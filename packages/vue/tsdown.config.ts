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
      if (!pkg) throw new Error("pkg is missing");

      const vueVersion = pkg.peerDependencies?.vue;
      if (!vueVersion) throw new Error("vue version is missing");

      await writeFile(
        "jsr.json",
        JSON.stringify({
          name: pkg.name,
          version: pkg.version,
          exports: "./src/index.ts",
          include: ["LICENSE", "README.md", "src/**/*.ts"],
          exclude: [
            "CHANGELOG.md",
            "eslint.config.mjs",
            "package.json",
            "tsconfig.json",
            "tsdown.config.ts",
          ],
          imports: {
            "@adhesivejs/core": `jsr:@adhesivejs/core@${pkg.version}`,
            vue: `npm:vue@${vueVersion}`,
          },
        }),
      );

      execSync("pnpx prettier --write jsr.json");
    },
  },
});
