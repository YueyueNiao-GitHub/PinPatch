import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/cli.ts", "src/browser-client.ts"],
  format: ["esm"],
  target: "node18",
  platform: "node",
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  external: ["better-sqlite3"],
});
