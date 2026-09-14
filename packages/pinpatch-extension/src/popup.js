const title = document.querySelector("#title");
const message = document.querySelector("#message");

function supportedUrl(url = "") {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "file:"
      || ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
  } catch {
    return false;
  }
}

function showFallback(nextTitle, nextMessage) {
  title.textContent = nextTitle;
  message.textContent = nextMessage;
  document.body.hidden = false;
}

async function start() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url || "";

  if (!supportedUrl(url)) {
    showFallback(
      "当前页面无法使用 PinPatch",
      "请打开 localhost、127.0.0.1、[::1] 或本地 HTML 页面后再试。",
    );
    return;
  }

  if (!tab?.id) {
    showFallback("未找到当前页面", "请切换到需要标注的本地页面后重试。");
    return;
  }

  try {
    const result = await chrome.tabs.sendMessage(tab.id, { type: "pinpatch-start-annotation" });
    if (!result?.ok) throw new Error(result?.error || "插件未就绪");
    window.close();
  } catch {
    showFallback(
      "PinPatch 尚未在当前页面生效",
      url.startsWith("file:")
        ? "请在扩展详情中开启“允许访问文件网址”，然后刷新页面。"
        : "请刷新当前页面，让 PinPatch 完成加载。",
    );
  }
}

start().catch(() => {
  showFallback("PinPatch 暂时无法启动", "请刷新当前页面后重试。");
});
