import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = await readFile(join(root, "src", "popup.js"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
  process.stdout.write(`✓ ${message}\n`);
}

async function runScenario({ url, response, error }) {
  const elements = {
    "#title": { textContent: "" },
    "#message": { textContent: "" },
  };
  const body = { hidden: true };
  const calls = [];
  let closed = false;
  const document = {
    body,
    querySelector(selector) {
      return elements[selector];
    },
  };
  const chrome = {
    tabs: {
      async query() {
        return [{ id: 7, url }];
      },
      async sendMessage(tabId, request) {
        calls.push({ tabId, request });
        if (error) throw error;
        return response;
      },
    },
  };
  const window = {
    close() {
      closed = true;
    },
  };

  new Function("document", "chrome", "window", source)(document, chrome, window);
  await new Promise((resolveDelay) => setTimeout(resolveDelay, 0));
  return { body, elements, calls, closed };
}

const ready = await runScenario({
  url: "http://localhost:3000/dashboard",
  response: { ok: true, state: { annotationActive: true } },
});
assert(ready.closed && ready.body.hidden, "可用页面直接进入标注且不展示提示面板");
assert(ready.calls[0]?.request?.type === "pinpatch-start-annotation", "可用页面发送开始标注指令");

const unsupported = await runScenario({ url: "https://example.com/" });
assert(!unsupported.closed && !unsupported.body.hidden, "不支持的页面保留提示面板");
assert(unsupported.elements["#title"].textContent.includes("无法使用"), "不支持页面显示明确原因");

const unloaded = await runScenario({
  url: "http://127.0.0.1:3000/",
  error: new Error("Receiving end does not exist"),
});
assert(!unloaded.closed && !unloaded.body.hidden, "插件未加载时保留提示面板");
assert(unloaded.elements["#message"].textContent.includes("刷新"), "插件未加载时提示刷新页面");
