import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { timingSafeEqual } from "node:crypto";
import { unlinkSync, writeFileSync } from "node:fs";
import type { AddressInfo } from "node:net";
import { ensureToken, PairingCodes } from "./auth.js";
import {
  ensureHomeDir,
  DEFAULT_EXTENSION_IDS,
  getDatabasePath,
  getPidPath,
  getPort,
  readUserConfig,
} from "./config.js";
import { PinPatchStore } from "./store.js";
import type { Annotation, PinPatchEvent } from "./types.js";

const MAX_BODY_BYTES = 2 * 1024 * 1024;

type Subscriber = {
  sessionId?: string;
  response: ServerResponse;
};

class EventStream {
  private readonly subscribers = new Set<Subscriber>();
  private sequence = 0;

  subscribe(response: ServerResponse, sessionId?: string): () => void {
    const subscriber = { response, sessionId };
    this.subscribers.add(subscriber);
    return () => this.subscribers.delete(subscriber);
  }

  emit(type: string, payload: unknown, sessionId?: string): PinPatchEvent {
    const event: PinPatchEvent = {
      id: String(++this.sequence),
      type,
      sessionId,
      timestamp: new Date().toISOString(),
      payload,
    };
    const data = `id: ${event.id}\nevent: ${type}\ndata: ${JSON.stringify(event)}\n\n`;
    for (const subscriber of this.subscribers) {
      if (subscriber.sessionId && subscriber.sessionId !== sessionId) continue;
      subscriber.response.write(data);
    }
    return event;
  }
}

export interface DaemonOptions {
  host?: string;
  port?: number;
  databasePath?: string;
  token?: string;
  writePid?: boolean;
}

export interface RunningDaemon {
  baseUrl: string;
  close: () => Promise<void>;
}

function json(
  response: ServerResponse,
  status: number,
  body: unknown,
): void {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function requestToken(request: IncomingMessage, url: URL): string | undefined {
  const authorization = request.headers.authorization;
  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }
  return url.searchParams.get("token") || undefined;
}

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    return true;
  }
  const extensionMatch = origin.match(/^chrome-extension:\/\/([a-p]{32})$/);
  if (!extensionMatch) return false;
  const allowedIds = [
    ...DEFAULT_EXTENSION_IDS,
    ...(readUserConfig().extensionIds || []),
  ];
  return allowedIds.includes(extensionMatch[1]);
}

function applyCors(request: IncomingMessage, response: ServerResponse): boolean {
  const origin = request.headers.origin;
  if (!isAllowedOrigin(origin)) return false;
  if (origin) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
  }
  response.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS",
  );
  response.setHeader(
    "Access-Control-Allow-Headers",
    "Authorization, Content-Type",
  );
  return true;
}

async function readJson(request: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buffer.length;
    if (total > MAX_BODY_BYTES) throw new Error("Request body is too large");
    chunks.push(buffer);
  }
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<
    string,
    unknown
  >;
}

function requireString(
  body: Record<string, unknown>,
  key: string,
): string {
  const value = body[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${key} is required`);
  }
  return value.trim();
}

function startSse(
  request: IncomingMessage,
  response: ServerResponse,
  stream: EventStream,
  sessionId?: string,
): void {
  response.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });
  response.write(": connected\n\n");
  const unsubscribe = stream.subscribe(response, sessionId);
  const keepAlive = setInterval(() => response.write(": ping\n\n"), 25_000);
  request.on("close", () => {
    clearInterval(keepAlive);
    unsubscribe();
  });
}

function annotationSessionId(annotation: Annotation | undefined): string | undefined {
  return annotation?.sessionId;
}

export async function startDaemon(
  options: DaemonOptions = {},
): Promise<RunningDaemon> {
  ensureHomeDir();
  const host = options.host || "127.0.0.1";
  const port = options.port ?? getPort();
  const token = options.token || ensureToken();
  const store = new PinPatchStore(options.databasePath || getDatabasePath());
  const pairingCodes = new PairingCodes();
  const events = new EventStream();

  const server = createServer(async (request, response) => {
    const url = new URL(request.url || "/", `http://${host}:${port}`);
    const pathname = url.pathname;
    const method = request.method || "GET";

    if (!applyCors(request, response)) {
      return json(response, 403, { error: "Origin is not allowed" });
    }
    if (method === "OPTIONS") {
      response.writeHead(204);
      return response.end();
    }

    if (method === "GET" && pathname === "/health") {
      return json(response, 200, {
        status: "ok",
        service: "pinpatch-mcp",
        mode: "local",
      });
    }

    if (method === "POST" && pathname === "/pair") {
      try {
        const body = await readJson(request);
        const code = requireString(body, "code");
        if (!pairingCodes.consume(code)) {
          return json(response, 401, { error: "Invalid or expired pairing code" });
        }
        return json(response, 200, { token });
      } catch (error) {
        return json(response, 400, { error: (error as Error).message });
      }
    }

    const suppliedToken = requestToken(request, url);
    if (!suppliedToken || !safeEqual(suppliedToken, token)) {
      return json(response, 401, { error: "Unauthorized" });
    }

    try {
      if (method === "POST" && pathname === "/admin/pairing-codes") {
        return json(response, 201, {
          code: pairingCodes.create(),
          expiresInSeconds: 300,
        });
      }

      if (method === "GET" && pathname === "/events") {
        return startSse(request, response, events);
      }

      const sessionEventsMatch = pathname.match(/^\/sessions\/([^/]+)\/events$/);
      if (method === "GET" && sessionEventsMatch) {
        return startSse(request, response, events, sessionEventsMatch[1]);
      }

      if (method === "POST" && pathname === "/sessions") {
        const body = await readJson(request);
        const session = store.createSession({
          ...body,
          url: requireString(body, "url"),
        });
        events.emit("session.created", session, session.id);
        return json(response, 201, session);
      }

      if (method === "GET" && pathname === "/sessions") {
        return json(response, 200, { sessions: store.listSessions() });
      }

      const sessionMatch = pathname.match(/^\/sessions\/([^/]+)$/);
      if (method === "GET" && sessionMatch) {
        const session = store.getSession(sessionMatch[1]);
        return session
          ? json(response, 200, session)
          : json(response, 404, { error: "Session not found" });
      }

      const sessionPendingMatch = pathname.match(
        /^\/sessions\/([^/]+)\/pending$/,
      );
      if (method === "GET" && sessionPendingMatch) {
        const annotations = store.getPending(sessionPendingMatch[1]);
        return json(response, 200, { count: annotations.length, annotations });
      }

      const addAnnotationMatch = pathname.match(
        /^\/sessions\/([^/]+)\/annotations$/,
      );
      if (method === "POST" && addAnnotationMatch) {
        const body = await readJson(request);
        const annotation = store.addAnnotation(addAnnotationMatch[1], {
          ...body,
          comment: requireString(body, "comment"),
        });
        if (!annotation) {
          return json(response, 404, { error: "Session not found" });
        }
        events.emit("annotation.created", annotation, annotation.sessionId);
        return json(response, 201, annotation);
      }

      if (method === "GET" && pathname === "/pending") {
        const annotations = store.getPending();
        return json(response, 200, { count: annotations.length, annotations });
      }

      const annotationMatch = pathname.match(/^\/annotations\/([^/]+)$/);
      if (method === "GET" && annotationMatch) {
        const annotation = store.getAnnotation(annotationMatch[1]);
        return annotation
          ? json(response, 200, annotation)
          : json(response, 404, { error: "Annotation not found" });
      }

      if (method === "PATCH" && annotationMatch) {
        const body = await readJson(request);
        const annotation = store.updateAnnotation(annotationMatch[1], body);
        if (!annotation) {
          return json(response, 404, { error: "Annotation not found" });
        }
        events.emit("annotation.updated", annotation, annotation.sessionId);
        return json(response, 200, annotation);
      }

      if (method === "DELETE" && annotationMatch) {
        const existing = store.getAnnotation(annotationMatch[1]);
        if (!store.deleteAnnotation(annotationMatch[1])) {
          return json(response, 404, { error: "Annotation not found" });
        }
        events.emit(
          "annotation.deleted",
          { annotationId: annotationMatch[1] },
          annotationSessionId(existing),
        );
        return json(response, 200, { deleted: true });
      }

      const threadMatch = pathname.match(/^\/annotations\/([^/]+)\/thread$/);
      if (method === "POST" && threadMatch) {
        const body = await readJson(request);
        const role = requireString(body, "role");
        if (role !== "human" && role !== "agent") {
          return json(response, 400, { error: "role must be human or agent" });
        }
        const annotation = store.addThreadMessage(
          threadMatch[1],
          role,
          requireString(body, "content"),
        );
        if (!annotation) {
          return json(response, 404, { error: "Annotation not found" });
        }
        events.emit("thread.message", annotation, annotation.sessionId);
        return json(response, 201, annotation);
      }

      return json(response, 404, { error: "Not found" });
    } catch (error) {
      const message = (error as Error).message;
      const status = message.includes("required") || message.includes("JSON") ? 400 : 500;
      return json(response, status, { error: message });
    }
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      server.off("error", reject);
      resolve();
    });
  });

  const address = server.address() as AddressInfo;
  const baseUrl = `http://${host}:${address.port}`;
  if (options.writePid !== false) {
    writeFileSync(getPidPath(), `${process.pid}\n`, { mode: 0o600 });
  }

  const close = async (): Promise<void> => {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    store.close();
    if (options.writePid !== false) {
      try {
        unlinkSync(getPidPath());
      } catch {
        // PID file may already be removed by the stop command.
      }
    }
  };

  return { baseUrl, close };
}
