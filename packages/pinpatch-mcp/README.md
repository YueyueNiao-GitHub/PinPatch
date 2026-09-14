# @pinpatch/mcp

Local bridge between the PinPatch Chrome extension and MCP-compatible coding
agents. The package keeps annotations on the user's machine and supports Codex,
Claude Code, Cursor, and MyFlicker through one MCP command.

## Architecture

```text
Chrome extension
    | HTTP + SSE, bearer token
    v
PinPatch daemon + SQLite (one process per machine)
    ^
    | authenticated local HTTP
MCP stdio adapters (one process per agent)
    |
    +-- Codex
    +-- Claude Code
    +-- Cursor
    +-- MyFlicker
```

The daemon listens on `127.0.0.1:4765`. Each agent starts its own short-lived
MCP stdio adapter; adapters connect to the single daemon and never compete for
the HTTP port.

## Install

```bash
npm install -g @pinpatch/mcp
pinpatch-mcp install
```

The same package can be used without a global install:

```bash
npx -y @pinpatch/mcp install
```

Agent command:

```bash
npx -y @pinpatch/mcp mcp
```

The `mcp` command starts the local daemon automatically when needed.

## Chrome extension pairing

The official unpacked extension uses the fixed ID
`iijgjngfnmoipgheplhgoiighnmggfio` and is allowed by the local daemon by
default. For a separately built or published extension, add its ID with
`configure-extension` before pairing.

1. Restrict the daemon to the production extension ID:

   ```bash
   pinpatch-mcp configure-extension <chrome-extension-id>
   ```

2. Create a one-time pairing code:

   ```bash
   pinpatch-mcp pair
   ```

3. The extension exchanges the code for a bearer token:

   ```http
   POST http://127.0.0.1:4765/pair
   Content-Type: application/json

   {"code":"123456"}
   ```

4. Store the returned token in `chrome.storage.local`, then include it with
   every request:

   ```http
   Authorization: Bearer <token>
   ```

The extension needs this host permission:

```json
{
  "host_permissions": ["http://127.0.0.1:4765/*"]
}
```

The browser entry can be bundled directly into the extension service worker:

```ts
import { PinPatchBrowserClient } from "@pinpatch/mcp/browser";

const client = new PinPatchBrowserClient({
  tokenStorage: {
    async get() {
      const value = await chrome.storage.local.get("pinpatchToken");
      return value.pinpatchToken;
    },
    async set(token) {
      await chrome.storage.local.set({ pinpatchToken: token });
    },
  },
});
```

## Browser API

Create a session when the local development tab connects:

```http
POST /sessions
{"url":"http://localhost:3000","projectId":"project-a","title":"Dashboard"}
```

Submit an annotation:

```http
POST /sessions/:sessionId/annotations
{
  "comment":"Reduce this spacing",
  "element":"button.primary",
  "elementPath":"#app > header > button.primary",
  "sourceFile":"src/components/Header.tsx",
  "sourceLine":42
}
```

Subscribe to status and replies:

```http
GET /sessions/:sessionId/events?token=<token>
Accept: text/event-stream
```

The query token is supported for `EventSource`, which cannot set custom request
headers. All non-SSE requests should use the authorization header.

## MCP tools

- `pinpatch_list_sessions`
- `pinpatch_get_session`
- `pinpatch_get_pending`
- `pinpatch_get_annotation`
- `pinpatch_acknowledge`
- `pinpatch_reply`
- `pinpatch_resolve`
- `pinpatch_dismiss`

## CLI

```text
pinpatch-mcp daemon
pinpatch-mcp mcp
pinpatch-mcp pair
pinpatch-mcp configure-extension <id>
pinpatch-mcp install [--apply]
pinpatch-mcp doctor
pinpatch-mcp stop
```

Configuration and local data are stored under `~/.pinpatch/`. Override this
directory with `PINPATCH_HOME`; override the port with `PINPATCH_PORT`.

## Homebrew distribution

Publish the npm package first, then make the Homebrew formula install the npm
tarball and expose `pinpatch-mcp`. Homebrew is a distribution channel for this
same CLI, not a separate implementation.

Generate the release formula after publishing the npm tarball:

```bash
npm run homebrew:formula -- \
  0.1.0 \
  <sha256> \
  https://registry.npmjs.org/@pinpatch/mcp/-/mcp-0.1.0.tgz \
  > pinpatch-mcp.rb
```
