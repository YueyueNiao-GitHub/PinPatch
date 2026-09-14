import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { DaemonClient } from "./client.js";

type ToolArguments = Record<string, unknown>;

const TOOLS = [
  {
    name: "pinpatch_list_sessions",
    description: "List local browser annotation sessions.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "pinpatch_get_session",
    description: "Get one session with all annotations.",
    inputSchema: {
      type: "object",
      properties: {
        sessionId: { type: "string", description: "Session ID" },
      },
      required: ["sessionId"],
    },
  },
  {
    name: "pinpatch_get_pending",
    description:
      "Get pending annotations. Omit sessionId to read pending annotations across all sessions.",
    inputSchema: {
      type: "object",
      properties: {
        sessionId: { type: "string", description: "Optional session ID" },
      },
      required: [],
    },
  },
  {
    name: "pinpatch_get_annotation",
    description: "Get one annotation with DOM and source context.",
    inputSchema: {
      type: "object",
      properties: {
        annotationId: { type: "string", description: "Annotation ID" },
      },
      required: ["annotationId"],
    },
  },
  {
    name: "pinpatch_acknowledge",
    description: "Mark an annotation as acknowledged before working on it.",
    inputSchema: {
      type: "object",
      properties: {
        annotationId: { type: "string", description: "Annotation ID" },
      },
      required: ["annotationId"],
    },
  },
  {
    name: "pinpatch_reply",
    description: "Reply to an annotation without closing it.",
    inputSchema: {
      type: "object",
      properties: {
        annotationId: { type: "string", description: "Annotation ID" },
        message: { type: "string", description: "Reply text" },
      },
      required: ["annotationId", "message"],
    },
  },
  {
    name: "pinpatch_resolve",
    description: "Resolve an annotation after the requested change is complete.",
    inputSchema: {
      type: "object",
      properties: {
        annotationId: { type: "string", description: "Annotation ID" },
        summary: { type: "string", description: "Optional completion summary" },
      },
      required: ["annotationId"],
    },
  },
  {
    name: "pinpatch_dismiss",
    description: "Dismiss an annotation and record the reason.",
    inputSchema: {
      type: "object",
      properties: {
        annotationId: { type: "string", description: "Annotation ID" },
        reason: { type: "string", description: "Dismissal reason" },
      },
      required: ["annotationId", "reason"],
    },
  },
] as const;

function requiredString(args: ToolArguments, key: string): string {
  const value = args[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${key} is required`);
  }
  return value.trim();
}

function result(value: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }],
  };
}

function errorResult(error: unknown) {
  return {
    isError: true,
    content: [
      {
        type: "text" as const,
        text: error instanceof Error ? error.message : String(error),
      },
    ],
  };
}

export function createMcpServer(client: DaemonClient): Server {
  const server = new Server(
    { name: "pinpatch", version: "0.1.0" },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const args = (request.params.arguments || {}) as ToolArguments;
    try {
      switch (request.params.name) {
        case "pinpatch_list_sessions":
          return result(await client.listSessions());
        case "pinpatch_get_session":
          return result(await client.getSession(requiredString(args, "sessionId")));
        case "pinpatch_get_pending":
          return result(
            await client.getPending(
              typeof args.sessionId === "string" ? args.sessionId : undefined,
            ),
          );
        case "pinpatch_get_annotation":
          return result(
            await client.getAnnotation(requiredString(args, "annotationId")),
          );
        case "pinpatch_acknowledge": {
          const annotationId = requiredString(args, "annotationId");
          return result(
            await client.updateAnnotation(annotationId, {
              status: "acknowledged",
            }),
          );
        }
        case "pinpatch_reply":
          return result(
            await client.addReply(
              requiredString(args, "annotationId"),
              requiredString(args, "message"),
            ),
          );
        case "pinpatch_resolve": {
          const annotationId = requiredString(args, "annotationId");
          const summary =
            typeof args.summary === "string" ? args.summary.trim() : "";
          const annotation = await client.updateAnnotation(annotationId, {
            status: "resolved",
            resolvedBy: "agent",
          });
          if (summary) {
            await client.addReply(annotationId, `Resolved: ${summary}`);
          }
          return result({ resolved: true, annotationId, summary, annotation });
        }
        case "pinpatch_dismiss": {
          const annotationId = requiredString(args, "annotationId");
          const reason = requiredString(args, "reason");
          const annotation = await client.updateAnnotation(annotationId, {
            status: "dismissed",
            resolvedBy: "agent",
          });
          await client.addReply(annotationId, `Dismissed: ${reason}`);
          return result({ dismissed: true, annotationId, reason, annotation });
        }
        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    } catch (error) {
      return errorResult(error);
    }
  });

  return server;
}

export async function startMcpServer(client: DaemonClient): Promise<void> {
  const server = createMcpServer(client);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

export { TOOLS as PINPATCH_TOOLS };
