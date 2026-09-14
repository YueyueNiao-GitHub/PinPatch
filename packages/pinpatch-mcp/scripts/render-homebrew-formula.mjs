import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const [version, sha256, tarballUrl] = process.argv.slice(2);
if (!version || !/^[a-f0-9]{64}$/i.test(sha256 || "") || !tarballUrl) {
  console.error(
    "Usage: npm run homebrew:formula -- <version> <sha256> <tarball-url>",
  );
  process.exit(1);
}

const scriptDir = dirname(fileURLToPath(import.meta.url));
const template = readFileSync(
  join(scriptDir, "../packaging/homebrew/pinpatch-mcp.rb.template"),
  "utf8",
);

process.stdout.write(
  template
    .replaceAll("__VERSION__", version)
    .replaceAll("__SHA256__", sha256)
    .replaceAll("__TARBALL_URL__", tarballUrl),
);
