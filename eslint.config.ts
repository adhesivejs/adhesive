import { danielwaltz } from "@danielwaltz/eslint-config";
import { defineConfig } from "eslint/config";

const globalIgnoresConfig = defineConfig({
  ignores: ["pnpm-workspace.yaml"],
});

export default danielwaltz({ pnpm: true }).append(globalIgnoresConfig);
