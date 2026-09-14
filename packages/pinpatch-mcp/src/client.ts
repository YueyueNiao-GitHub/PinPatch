import type { Annotation, Session } from "./types.js";

export class DaemonClient {
  constructor(
    readonly baseUrl: string,
    readonly token: string,
  ) {}

  private async request<T>(
    path: string,
    init: RequestInit = {},
  ): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${this.token}`);
    if (init.body) headers.set("Content-Type", "application/json");
    const response = await fetch(`${this.baseUrl}${path}`, { ...init, headers });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Daemon ${response.status}: ${body}`);
    }
    return response.json() as Promise<T>;
  }

  async health(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      if (!response.ok) return false;
      const body = (await response.json()) as { service?: string };
      return body.service === "pinpatch-mcp";
    } catch {
      return false;
    }
  }

  listSessions(): Promise<{ sessions: Session[] }> {
    return this.request("/sessions");
  }

  getSession(sessionId: string): Promise<Session> {
    return this.request(`/sessions/${encodeURIComponent(sessionId)}`);
  }

  getPending(sessionId?: string): Promise<{ count: number; annotations: Annotation[] }> {
    return this.request(
      sessionId
        ? `/sessions/${encodeURIComponent(sessionId)}/pending`
        : "/pending",
    );
  }

  getAnnotation(annotationId: string): Promise<Annotation> {
    return this.request(`/annotations/${encodeURIComponent(annotationId)}`);
  }

  updateAnnotation(
    annotationId: string,
    patch: Partial<Annotation>,
  ): Promise<Annotation> {
    return this.request(`/annotations/${encodeURIComponent(annotationId)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  }

  addReply(
    annotationId: string,
    message: string,
  ): Promise<Annotation> {
    return this.request(
      `/annotations/${encodeURIComponent(annotationId)}/thread`,
      {
        method: "POST",
        body: JSON.stringify({ role: "agent", content: message }),
      },
    );
  }

  createPairingCode(): Promise<{ code: string; expiresInSeconds: number }> {
    return this.request("/admin/pairing-codes", { method: "POST" });
  }
}
