import { closeSync, existsSync, openSync, readFileSync, unlinkSync } from "node:fs";
import { spawn } from "node:child_process";
import { DaemonClient } from "./client.js";
import {
  ensureHomeDir,
  getBaseUrl,
  getLogPath,
  getPidPath,
} from "./config.js";
import { ensureToken } from "./auth.js";

export function createDaemonClient(): DaemonClient {
  return new DaemonClient(getBaseUrl(), ensureToken());
}

export async function ensureDaemonRunning(
  cliEntry = process.argv[1],
): Promise<DaemonClient> {
  const client = createDaemonClient();
  if (await client.health()) return client;

  ensureHomeDir();
  const logFd = openSync(getLogPath(), "a");
  const child = spawn(process.execPath, [cliEntry, "daemon"], {
    detached: true,
    stdio: ["ignore", logFd, logFd],
    env: process.env,
  });
  child.unref();
  closeSync(logFd);

  const deadline = Date.now() + 8_000;
  while (Date.now() < deadline) {
    if (await client.health()) return client;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error(`PinPatch daemon did not start. Check ${getLogPath()}`);
}

export function stopDaemon(): boolean {
  const pidPath = getPidPath();
  if (!existsSync(pidPath)) return false;
  const pid = Number(readFileSync(pidPath, "utf8").trim());
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, "SIGTERM");
    unlinkSync(pidPath);
    return true;
  } catch {
    return false;
  }
}
