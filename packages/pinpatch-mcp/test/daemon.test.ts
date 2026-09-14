import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { PinPatchBrowserClient } from "../src/browser-client.js";
import { DaemonClient } from "../src/client.js";
import { startDaemon, type RunningDaemon } from "../src/daemon.js";

const resources: Array<{ dir: string; daemon: RunningDaemon }> = [];

afterEach(async () => {
  for (const resource of resources.splice(0)) {
    await resource.daemon.close();
    rmSync(resource.dir, { recursive: true, force: true });
  }
});

describe("PinPatch daemon", () => {
  it("authenticates requests and exposes the annotation workflow", async () => {
    const dir = mkdtempSync(join(tmpdir(), "pinpatch-daemon-"));
    const daemon = await startDaemon({
      port: 0,
      databasePath: join(dir, "store.db"),
      token: "test-token",
      writePid: false,
    });
    resources.push({ dir, daemon });

    const unauthorized = await fetch(`${daemon.baseUrl}/sessions`);
    expect(unauthorized.status).toBe(401);

    const sessionResponse = await fetch(`${daemon.baseUrl}/sessions`, {
      method: "POST",
      headers: {
        Authorization: "Bearer test-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: "http://localhost:3000" }),
    });
    const session = (await sessionResponse.json()) as { id: string };

    const annotationResponse = await fetch(
      `${daemon.baseUrl}/sessions/${session.id}/annotations`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment: "Make this clearer" }),
      },
    );
    expect(annotationResponse.status).toBe(201);

    const client = new DaemonClient(daemon.baseUrl, "test-token");
    const pending = await client.getPending();
    expect(pending.count).toBe(1);
    await client.updateAnnotation(pending.annotations[0].id, {
      status: "resolved",
    });
    expect((await client.getPending()).count).toBe(0);
  });

  it("rejects unknown web origins", async () => {
    const dir = mkdtempSync(join(tmpdir(), "pinpatch-origin-"));
    const daemon = await startDaemon({
      port: 0,
      databasePath: join(dir, "store.db"),
      token: "test-token",
      writePid: false,
    });
    resources.push({ dir, daemon });

    const response = await fetch(`${daemon.baseUrl}/sessions`, {
      headers: {
        Authorization: "Bearer test-token",
        Origin: "https://example.com",
      },
    });
    expect(response.status).toBe(403);
  });

  it("allows the bundled PinPatch extension origin", async () => {
    const dir = mkdtempSync(join(tmpdir(), "pinpatch-extension-origin-"));
    const daemon = await startDaemon({
      port: 0,
      databasePath: join(dir, "store.db"),
      token: "test-token",
      writePid: false,
    });
    resources.push({ dir, daemon });

    const response = await fetch(`${daemon.baseUrl}/health`, {
      headers: {
        Origin: "chrome-extension://iijgjngfnmoipgheplhgoiighnmggfio",
      },
    });
    expect(response.status).toBe(200);
  });

  it("pairs the browser client with a one-time code", async () => {
    const dir = mkdtempSync(join(tmpdir(), "pinpatch-pair-"));
    const daemon = await startDaemon({
      port: 0,
      databasePath: join(dir, "store.db"),
      token: "paired-token",
      writePid: false,
    });
    resources.push({ dir, daemon });

    const admin = new DaemonClient(daemon.baseUrl, "paired-token");
    const pairing = await admin.createPairingCode();
    let storedToken: string | undefined;
    const browser = new PinPatchBrowserClient({
      baseUrl: daemon.baseUrl,
      tokenStorage: {
        async get() {
          return storedToken;
        },
        async set(token) {
          storedToken = token;
        },
      },
    });

    await browser.pair(pairing.code);
    const session = await browser.createSession({
      url: "http://localhost:5173",
    });
    expect(storedToken).toBe("paired-token");
    expect(session.url).toBe("http://localhost:5173");

    const reusedCode = await fetch(`${daemon.baseUrl}/pair`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: pairing.code }),
    });
    expect(reusedCode.status).toBe(401);
  });
});
