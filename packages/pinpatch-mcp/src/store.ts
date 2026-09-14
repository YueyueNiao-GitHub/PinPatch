import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";
import { dirname } from "node:path";
import { mkdirSync } from "node:fs";
import type {
  Annotation,
  AnnotationStatus,
  CreateAnnotationInput,
  CreateSessionInput,
  Session,
  ThreadMessage,
  ThreadRole,
} from "./types.js";

type JsonRow = {
  id: string;
  data_json: string;
};

function now(): string {
  return new Date().toISOString();
}

function parseRow<T>(row: JsonRow | undefined): T | undefined {
  if (!row) return undefined;
  return JSON.parse(row.data_json) as T;
}

export class PinPatchStore {
  private readonly db: Database.Database;

  constructor(path: string) {
    mkdirSync(dirname(path), { recursive: true });
    this.db = new Database(path);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("busy_timeout = 5000");
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        status TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        data_json TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS annotations (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        status TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        data_json TEXT NOT NULL,
        FOREIGN KEY(session_id) REFERENCES sessions(id)
      );
      CREATE INDEX IF NOT EXISTS idx_annotations_session
        ON annotations(session_id);
      CREATE INDEX IF NOT EXISTS idx_annotations_status
        ON annotations(status);
    `);
  }

  close(): void {
    this.db.close();
  }

  createSession(input: CreateSessionInput): Session {
    const timestamp = now();
    const session: Session = {
      ...input,
      id: randomUUID(),
      url: input.url,
      status: "active",
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.db
      .prepare(
        "INSERT INTO sessions (id, status, updated_at, data_json) VALUES (?, ?, ?, ?)",
      )
      .run(session.id, session.status, session.updatedAt, JSON.stringify(session));
    return session;
  }

  listSessions(): Session[] {
    const rows = this.db
      .prepare("SELECT id, data_json FROM sessions ORDER BY updated_at DESC")
      .all() as JsonRow[];
    return rows.map((row) => parseRow<Session>(row)!);
  }

  getSession(id: string, includeAnnotations = true): Session | undefined {
    const row = this.db
      .prepare("SELECT id, data_json FROM sessions WHERE id = ?")
      .get(id) as JsonRow | undefined;
    const session = parseRow<Session>(row);
    if (!session) return undefined;
    if (includeAnnotations) {
      session.annotations = this.getAnnotationsBySession(id);
    }
    return session;
  }

  addAnnotation(
    sessionId: string,
    input: CreateAnnotationInput,
  ): Annotation | undefined {
    const session = this.getSession(sessionId, false);
    if (!session) return undefined;
    const timestamp = now();
    const annotation: Annotation = {
      ...input,
      id: input.id || randomUUID(),
      sessionId,
      comment: input.comment,
      status: "pending",
      thread: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.db.transaction(() => {
      this.db
        .prepare(
          "INSERT INTO annotations (id, session_id, status, updated_at, data_json) VALUES (?, ?, ?, ?, ?)",
        )
        .run(
          annotation.id,
          sessionId,
          annotation.status,
          annotation.updatedAt,
          JSON.stringify(annotation),
        );
      const updatedSession = { ...session, updatedAt: timestamp };
      this.db
        .prepare(
          "UPDATE sessions SET updated_at = ?, data_json = ? WHERE id = ?",
        )
        .run(timestamp, JSON.stringify(updatedSession), sessionId);
    })();
    return annotation;
  }

  getAnnotation(id: string): Annotation | undefined {
    const row = this.db
      .prepare("SELECT id, data_json FROM annotations WHERE id = ?")
      .get(id) as JsonRow | undefined;
    return parseRow<Annotation>(row);
  }

  getAnnotationsBySession(sessionId: string): Annotation[] {
    const rows = this.db
      .prepare(
        "SELECT id, data_json FROM annotations WHERE session_id = ? ORDER BY updated_at ASC",
      )
      .all(sessionId) as JsonRow[];
    return rows.map((row) => parseRow<Annotation>(row)!);
  }

  getPending(sessionId?: string): Annotation[] {
    const rows = sessionId
      ? (this.db
          .prepare(
            "SELECT id, data_json FROM annotations WHERE status = 'pending' AND session_id = ? ORDER BY updated_at ASC",
          )
          .all(sessionId) as JsonRow[])
      : (this.db
          .prepare(
            "SELECT id, data_json FROM annotations WHERE status = 'pending' ORDER BY updated_at ASC",
          )
          .all() as JsonRow[]);
    return rows.map((row) => parseRow<Annotation>(row)!);
  }

  updateAnnotation(
    id: string,
    patch: Partial<Annotation>,
  ): Annotation | undefined {
    const existing = this.getAnnotation(id);
    if (!existing) return undefined;
    const timestamp = now();
    const status = (patch.status || existing.status) as AnnotationStatus;
    const updated: Annotation = {
      ...existing,
      ...patch,
      id: existing.id,
      sessionId: existing.sessionId,
      status,
      updatedAt: timestamp,
    };
    if (
      (status === "resolved" || status === "dismissed") &&
      !updated.resolvedAt
    ) {
      updated.resolvedAt = timestamp;
    }
    this.db
      .prepare(
        "UPDATE annotations SET status = ?, updated_at = ?, data_json = ? WHERE id = ?",
      )
      .run(status, timestamp, JSON.stringify(updated), id);
    return updated;
  }

  addThreadMessage(
    id: string,
    role: ThreadRole,
    content: string,
  ): Annotation | undefined {
    const annotation = this.getAnnotation(id);
    if (!annotation) return undefined;
    const message: ThreadMessage = {
      id: randomUUID(),
      role,
      content,
      timestamp: now(),
    };
    return this.updateAnnotation(id, {
      thread: [...(annotation.thread || []), message],
    });
  }

  deleteAnnotation(id: string): boolean {
    return this.db.prepare("DELETE FROM annotations WHERE id = ?").run(id)
      .changes > 0;
  }
}
