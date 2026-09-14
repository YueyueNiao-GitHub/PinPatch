import {
  chmodSync,
  existsSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { randomBytes, randomInt } from "node:crypto";
import { ensureHomeDir, getTokenPath } from "./config.js";

export function ensureToken(): string {
  ensureHomeDir();
  const path = getTokenPath();
  if (existsSync(path)) {
    const token = readFileSync(path, "utf8").trim();
    if (token) return token;
  }
  const token = randomBytes(32).toString("base64url");
  writeFileSync(path, `${token}\n`, { mode: 0o600 });
  chmodSync(path, 0o600);
  return token;
}

export function readToken(): string | undefined {
  try {
    return readFileSync(getTokenPath(), "utf8").trim() || undefined;
  } catch {
    return undefined;
  }
}

export class PairingCodes {
  private readonly codes = new Map<string, number>();

  create(ttlMs = 5 * 60_000): string {
    this.cleanup();
    let code = "";
    do {
      code = randomInt(0, 1_000_000).toString().padStart(6, "0");
    } while (this.codes.has(code));
    this.codes.set(code, Date.now() + ttlMs);
    return code;
  }

  consume(code: string): boolean {
    this.cleanup();
    const expiresAt = this.codes.get(code);
    if (!expiresAt || expiresAt < Date.now()) return false;
    this.codes.delete(code);
    return true;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [code, expiresAt] of this.codes) {
      if (expiresAt < now) this.codes.delete(code);
    }
  }
}
