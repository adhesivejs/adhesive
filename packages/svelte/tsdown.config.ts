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

      const svelteVersion = pkg.peerDependencies?.svelte;
      if (!svelteVersion) throw new Error("svelte version is missing");

      await writeFile(
        "jsr.json",
        JSON.stringify({
          name: pkg.name,
          version: pkg.version,
          exports: "./src/index.ts",
          include: ["LICENSE", "README.md", "src/**/*.ts"],
          exclude: [
            "CHANGELOG.md",
            "eslint.config.ts",
            "package.json",
            "tsconfig.json",
            "tsdown.config.ts",
          ],
          imports: {
            "@adhesivejs/core": `jsr:@adhesivejs/core@${pkg.version}`,
            svelte: `npm:svelte@${svelteVersion}`,
          },
        }),
      );

      execSync("pnpx prettier --write jsr.json");
    },
  },
});
