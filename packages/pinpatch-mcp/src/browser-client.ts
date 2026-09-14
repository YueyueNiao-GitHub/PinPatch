import type {
  Annotation,
  CreateAnnotationInput,
  CreateSessionInput,
  Session,
} from "./types.js";

export interface TokenStorage {
  get(): Promise<string | undefined>;
  set(token: string): Promise<void>;
}

export interface BrowserClientOptions {
  baseUrl?: string;
  token?: string;
  tokenStorage?: TokenStorage;
}

export class PinPatchBrowserClient {
  readonly baseUrl: string;
  private token?: string;
  private readonly tokenStorage?: TokenStorage;

  constructor(options: BrowserClientOptions = {}) {
    this.baseUrl = options.baseUrl || "http://127.0.0.1:4765";
    this.token = options.token;
    this.tokenStorage = options.tokenStorage;
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

  async pair(code: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/pair`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (!response.ok) {
      throw new Error(`Pairing failed: ${response.status}`);
    }
    const body = (await response.json()) as { token: string };
    this.token = body.token;
    await this.tokenStorage?.set(body.token);
  }

  async createSession(input: CreateSessionInput): Promise<Session> {
    return this.request("/sessions", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async addAnnotation(
    sessionId: string,
    input: CreateAnnotationInput,
  ): Promise<Annotation> {
    return this.request(
      `/sessions/${encodeURIComponent(sessionId)}/annotations`,
      { method: "POST", body: JSON.stringify(input) },
    );
  }

  async getSession(sessionId: string): Promise<Session> {
    return this.request(`/sessions/${encodeURIComponent(sessionId)}`);
  }

  async deleteAnnotation(annotationId: string): Promise<void> {
    await this.request(`/annotations/${encodeURIComponent(annotationId)}`, {
      method: "DELETE",
    });
  }

  async eventsUrl(sessionId: string): Promise<string> {
    const token = await this.resolveToken();
    return `${this.baseUrl}/sessions/${encodeURIComponent(sessionId)}/events?token=${encodeURIComponent(token)}`;
  }

  private async resolveToken(): Promise<string> {
    const token = this.token || (await this.tokenStorage?.get());
    if (!token) throw new Error("PinPatch extension is not paired");
    this.token = token;
    return token;
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = await this.resolveToken();
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${token}`);
    if (init.body) headers.set("Content-Type", "application/json");
    const response = await fetch(`${this.baseUrl}${path}`, { ...init, headers });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`PinPatch daemon ${response.status}: ${body}`);
    }
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  }
}

export type {
  Annotation,
  CreateAnnotationInput,
  CreateSessionInput,
  Session,
} from "./types.js";
