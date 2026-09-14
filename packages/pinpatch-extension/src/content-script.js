const ROOT_ID = "pinpatch-extension-root";
const STYLE_ID = "pinpatch-extension-style";
const FRAMEWORK_BRIDGE_ID = "pinpatch-framework-bridge-script";
let injectPromise = null;

async function ensureStylesLoaded() {
  let style = document.getElementById(STYLE_ID);
  if (style?.dataset.pinpatchLoaded === "true") return;
  let created = false;
  if (!style) {
    style = document.createElement("link");
    style.id = STYLE_ID;
    style.rel = "stylesheet";
    style.href = chrome.runtime.getURL("annotation.css");
    created = true;
  }
  await new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error("标注样式加载超时")), 5000);
    style.addEventListener("load", () => {
      window.clearTimeout(timer);
      style.dataset.pinpatchLoaded = "true";
      resolve();
    }, { once: true });
    style.addEventListener("error", () => {
      window.clearTimeout(timer);
      reject(new Error("标注样式加载失败"));
    }, { once: true });
    if (created) (document.head || document.documentElement).appendChild(style);
  });
  await document.fonts?.load?.('18px "remixicon"', "\uef1c").catch(() => {});
}

async function ensureFrameworkBridgeLoaded() {
  if (document.documentElement.dataset.pinpatchFrameworkBridge === "ready") return;
  let script = document.getElementById(FRAMEWORK_BRIDGE_ID);
  let created = false;
  if (!script) {
    script = document.createElement("script");
    script.id = FRAMEWORK_BRIDGE_ID;
    script.src = chrome.runtime.getURL("framework-bridge.js");
    created = true;
  }
  await new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error("框架元数据桥接加载超时")), 3000);
    script.addEventListener("load", () => {
      window.clearTimeout(timer);
      script.remove();
      resolve();
    }, { once: true });
    script.addEventListener("error", () => {
      window.clearTimeout(timer);
      script.remove();
      reject(new Error("框架元数据桥接加载失败"));
    }, { once: true });
    if (created) (document.head || document.documentElement).appendChild(script);
  });
}

async function inject() {
  if (window.__PINPATCH__?.ready) return window.__PINPATCH__;
  await ensureStylesLoaded();
  await ensureFrameworkBridgeLoaded().catch((error) => console.warn("[PinPatch]", error.message));
  if (document.getElementById(ROOT_ID)) {
    await import(chrome.runtime.getURL("annotation-app.js"));
    return window.__PINPATCH__;
  }
  const root = document.createElement("div");
  root.id = ROOT_ID;
  root.className = "pinpatch-extension-root";
  root.dataset.feedbackToolbar = "";
  const shellUrl = chrome.runtime.getURL("annotation-shell.html");
  const shellResponse = await fetch(shellUrl);
  if (!shellResponse.ok) throw new Error(`无法加载标注界面：${shellResponse.status}`);
  const shell = await shellResponse.text();
  root.innerHTML = shell;
  document.documentElement.appendChild(root);

  await import(chrome.runtime.getURL("annotation-app.js"));
  await window.__PINPATCH__?.whenReady;
  return window.__PINPATCH__;
}

function ensureInjected() {
  if (!injectPromise) {
    injectPromise = inject().catch((error) => {
      injectPromise = null;
      throw error;
    });
  }
  return injectPromise;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message?.type?.startsWith("pinpatch-")) return false;
  ensureInjected()
    .then((api) => {
      if (!api) throw new Error("标注界面尚未就绪");
      if (message.type === "pinpatch-get-state") return api.getState();
      if (message.type === "pinpatch-start-annotation") return api.command("start-annotation");
      if (message.type === "pinpatch-open-panel") return api.command("open-panel");
      throw new Error("未知指令");
    })
    .then((state) => sendResponse({ ok: true, state }))
    .catch((error) => sendResponse({ ok: false, error: error.message }));
  return true;
});

ensureInjected().catch((error) => console.warn("[PinPatch] injection failed", error));
