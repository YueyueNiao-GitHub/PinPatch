export type AnnotationStatus =
  | "pending"
  | "acknowledged"
  | "resolved"
  | "dismissed";

export type ThreadRole = "human" | "agent";

export interface ThreadMessage {
  id: string;
  role: ThreadRole;
  content: string;
  timestamp: string;
}

export interface Session {
  id: string;
  url: string;
  projectId?: string;
  title?: string;
  status: "active" | "closed";
  createdAt: string;
  updatedAt: string;
  annotations?: Annotation[];
  [key: string]: unknown;
}

export interface Annotation {
  id: string;
  sessionId: string;
  comment: string;
  element?: string;
  elementPath?: string;
  sourceFile?: string;
  sourceLine?: number;
  url?: string;
  kind?: string;
  status: AnnotationStatus;
  thread: ThreadMessage[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  [key: string]: unknown;
}

export interface CreateSessionInput {
  url: string;
  projectId?: string;
  title?: string;
  [key: string]: unknown;
}

export interface CreateAnnotationInput {
  id?: string;
  comment: string;
  element?: string;
  elementPath?: string;
  sourceFile?: string;
  sourceLine?: number;
  url?: string;
  kind?: string;
  [key: string]: unknown;
}

export interface PinPatchEvent {
  id: string;
  type: string;
  sessionId?: string;
  timestamp: string;
  payload: unknown;
}
