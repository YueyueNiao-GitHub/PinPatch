import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createDaemonClient } from "./runtime.js";
import { getBaseUrl, getDatabasePath, getTokenPath } from "./config.js";

function hasCommand(command: string): boolean {
  const result = spawnSync(command, ["--version"], { stdio: "ignore" });
  return !result.error && result.status === 0;
}

export async function runDoctor(): Promise<boolean> {
  const checks: Array<[string, boolean, string]> = [];
  const nodeMajor = Number(process.versions.node.split(".")[0]);
  checks.push(["Node.js 18+", nodeMajor >= 18, process.version]);
  checks.push(["Local token", existsSync(getTokenPath()), getTokenPath()]);
  checks.push(["SQLite store", existsSync(getDatabasePath()), getDatabasePath()]);
  const daemon = await createDaemonClient().health();
  checks.push(["Local daemon", daemon, getBaseUrl()]);
  checks.push(["Codex CLI", hasCommand("codex"), "codex"]);
  checks.push(["Claude Code", hasCommand("claude"), "claude"]);
  checks.push(["Cursor CLI", hasCommand("cursor"), "cursor"]);

  for (const [name, ok, detail] of checks) {
    console.log(`${ok ? "✓" : "○"} ${name}: ${detail}`);
  }
  return checks.slice(0, 4).every(([, ok]) => ok);
}
