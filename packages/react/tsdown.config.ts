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

      const reactVersion = pkg.peerDependencies?.react;
      if (!reactVersion) throw new Error("react version is missing");

      const resolvedReactVersion =
        reactVersion
          .split("||")
          .map((v) => v.trim())
          .findLast((v) => v.startsWith("^")) || reactVersion;

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
            react: `npm:react@${resolvedReactVersion}`,
          },
        }),
      );

      execSync("pnpx prettier --write jsr.json");
    },
  },
});
