import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export const DEFAULT_PORT = 4765;
export const DEFAULT_EXTENSION_IDS = ["iijgjngfnmoipgheplhgoiighnmggfio"];

export interface UserConfig {
  port?: number;
  extensionIds?: string[];
}

export function getHomeDir(): string {
  return process.env.PINPATCH_HOME || join(homedir(), ".pinpatch");
}

export function ensureHomeDir(): string {
  const dir = getHomeDir();
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  return dir;
}

export function getConfigPath(): string {
  return join(getHomeDir(), "config.json");
}

export function getTokenPath(): string {
  return join(getHomeDir(), "token");
}

export function getDatabasePath(): string {
  return process.env.PINPATCH_DB || join(getHomeDir(), "store.db");
}

export function getPidPath(): string {
  return join(getHomeDir(), "daemon.pid");
}

export function getLogPath(): string {
  return join(getHomeDir(), "daemon.log");
}

export function readUserConfig(): UserConfig {
  const path = getConfigPath();
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, "utf8")) as UserConfig;
  } catch {
    return {};
  }
}

export function writeUserConfig(config: UserConfig): void {
  ensureHomeDir();
  writeFileSync(getConfigPath(), `${JSON.stringify(config, null, 2)}\n`, {
    mode: 0o600,
  });
}

export function getPort(): number {
  const envPort = Number(process.env.PINPATCH_PORT);
  if (Number.isInteger(envPort) && envPort > 0 && envPort < 65536) {
    return envPort;
  }
  const configPort = readUserConfig().port;
  if (
    Number.isInteger(configPort) &&
    Number(configPort) > 0 &&
    Number(configPort) < 65536
  ) {
    return Number(configPort);
  }
  return DEFAULT_PORT;
}

export function getBaseUrl(): string {
  return process.env.PINPATCH_HTTP_URL || `http://127.0.0.1:${getPort()}`;
}
