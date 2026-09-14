import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { PinPatchStore } from "../src/store.js";

const tempDirs: string[] = [];

function createStore(): PinPatchStore {
  const dir = mkdtempSync(join(tmpdir(), "pinpatch-store-"));
  tempDirs.push(dir);
  return new PinPatchStore(join(dir, "store.db"));
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("PinPatchStore", () => {
  it("persists sessions and completes an annotation workflow", () => {
    const store = createStore();
    const session = store.createSession({ url: "http://localhost:3000" });
    const annotation = store.addAnnotation(session.id, {
      comment: "Shorten this copy",
      sourceFile: "src/App.tsx",
      sourceLine: 12,
    });

    expect(annotation?.status).toBe("pending");
    expect(store.getPending()).toHaveLength(1);

    store.updateAnnotation(annotation!.id, { status: "acknowledged" });
    store.addThreadMessage(annotation!.id, "agent", "Working on it");
    const resolved = store.updateAnnotation(annotation!.id, {
      status: "resolved",
      resolvedBy: "agent",
    });

    expect(resolved?.resolvedAt).toBeTruthy();
    expect(store.getPending()).toHaveLength(0);
    expect(store.getAnnotation(annotation!.id)?.thread).toHaveLength(1);
    store.close();
  });
});
