import { spawnSync } from "node:child_process";

export const UNIVERSAL_MCP_CONFIG = {
  mcpServers: {
    pinpatch: {
      command: "npx",
      args: ["-y", "@pinpatch/mcp", "mcp"],
    },
  },
};

export function printInstallGuide(): void {
  console.log("PinPatch MCP configuration:\n");
  console.log(JSON.stringify(UNIVERSAL_MCP_CONFIG, null, 2));
  console.log("\nCodex:");
  console.log(
    "  codex mcp add pinpatch -- npx -y @pinpatch/mcp mcp",
  );
  console.log("\nClaude Code:");
  console.log(
    "  claude mcp add pinpatch -- npx -y @pinpatch/mcp mcp",
  );
  console.log("\nCursor / MyFlicker:");
  console.log("  Add the JSON configuration shown above.");
}

export function runUniversalInstaller(): number {
  const command = "npx -y add-mcp \"npx -y @pinpatch/mcp mcp\"";
  console.log(`Running: ${command}`);
  const result = spawnSync(
    "npx",
    ["-y", "add-mcp", "npx -y @pinpatch/mcp mcp"],
    { stdio: "inherit" },
  );
  if (result.error) {
    console.error(result.error.message);
    return 1;
  }
  return result.status ?? 1;
}
