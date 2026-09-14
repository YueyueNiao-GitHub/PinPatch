import { access, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "dist");
const source = join(root, "src");
const assets = join(root, "assets");

function scopeCss(css) {
  return css.replace(/(^|})(\s*)([^@{}][^{}]+)\{/g, (match, boundary, whitespace, rawSelector) => {
    const header = rawSelector.trim();
    if (header.startsWith("@")) return `${boundary}${whitespace}${rawSelector}{`;
    const selectors = [];
    let current = "";
    let depth = 0;
    for (const character of rawSelector) {
      if (character === "(") depth += 1;
      if (character === ")") depth -= 1;
      if (character === "," && depth === 0) {
        selectors.push(current.trim());
        current = "";
      } else {
        current += character;
      }
    }
    if (current.trim()) selectors.push(current.trim());
    const scoped = selectors.map((selector) => {
      if (/^(from|to|\d+%)(\s|$)/.test(selector)) return selector;
      if (selector === ":root") return ".pinpatch-extension-root";
      if (selector === "*") return ".pinpatch-extension-root *";
      if (selector.startsWith("body.annotation-active")) return selector.replace(/^body\.annotation-active/, "body.pinpatch-annotation-active");
      if (selector.startsWith("body.quick-scrubbing")) return selector.replace(/^body\.quick-scrubbing/, "body.pinpatch-quick-scrubbing");
      if (selector.startsWith("body.popup-dragging")) return selector.replace(/^body\.popup-dragging/, "body.pinpatch-popup-dragging");
      if (selector.startsWith("body")) return selector.replace(/^body/, ".pinpatch-extension-root");
      if (selector.startsWith("html")) return selector.replace(/^html/, ".pinpatch-extension-root");
      return `.pinpatch-extension-root ${selector}`;
    });
    return `${boundary}${whitespace}${scoped.join(", ")} {`;
  });
}

async function build() {
  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });
  await cp(join(source, "manifest.json"), join(out, "manifest.json"));
  await cp(join(source, "annotation-shell.html"), join(out, "annotation-shell.html"));
  await cp(join(source, "content-script.js"), join(out, "content-script.js"));
  await cp(join(source, "framework-bridge.js"), join(out, "framework-bridge.js"));
  await cp(join(source, "popup.html"), join(out, "popup.html"));
  await cp(join(source, "popup.css"), join(out, "popup.css"));
  await cp(join(source, "popup.js"), join(out, "popup.js"));
  await cp(join(assets, "remixicon.woff2"), join(out, "remixicon.woff2"));
  await cp(join(assets, "fonts.css"), join(out, "fonts.css"));
  for (const font of ["inter-variable", "ibm-plex-serif-400", "ibm-plex-serif-500", "ibm-plex-serif-600"]) {
    await cp(join(assets, `${font}.woff2`), join(out, `${font}.woff2`));
  }
  for (const size of [16, 32, 48, 128]) {
    await cp(join(assets, `icon-${size}.png`), join(out, `icon-${size}.png`));
  }

  let app = await readFile(join(assets, "annotation-app.js"), "utf8");
  app = app.replace(
    'document.body.classList.toggle("annotation-active", state.annotationActive);',
    'document.body.classList.toggle("pinpatch-annotation-active", state.annotationActive);',
  );
  app = app.replaceAll('document.body.classList.add("quick-scrubbing")', 'document.body.classList.add("pinpatch-quick-scrubbing")');
  app = app.replaceAll('document.body.classList.remove("quick-scrubbing")', 'document.body.classList.remove("pinpatch-quick-scrubbing")');
  app = app.replaceAll('document.body.classList.add("popup-dragging")', 'document.body.classList.add("pinpatch-popup-dragging")');
  app = app.replaceAll('document.body.classList.remove("popup-dragging")', 'document.body.classList.remove("pinpatch-popup-dragging")');
  await writeFile(join(out, "annotation-app.js"), app);
  const css = await readFile(join(assets, "annotation.css"), "utf8");
  const icons = await readFile(join(assets, "remixicon.css"), "utf8");
  const fonts = await readFile(join(assets, "fonts.css"), "utf8");
  const localIcons = icons
    .replace(/src:[\s\S]*?font-display: swap;/, 'src: url("remixicon.woff2") format("woff2");\n  font-display: swap;')
    .replace(/^\s*\/\*[\s\S]*?\*\//, "");
  await writeFile(join(out, "annotation.css"), `${scopeCss(localIcons)}\n${scopeCss(fonts)}\n${scopeCss(css)}`);

  if (process.argv.includes("--check")) {
    const manifest = JSON.parse(await readFile(join(out, "manifest.json"), "utf8"));
    for (const required of ["manifest.json", "content-script.js", "framework-bridge.js", "annotation-app.js", "annotation.css", "popup.html", "popup.js", "icon-128.png"]) {
      await access(join(out, required));
    }
    if (manifest.manifest_version !== 3) throw new Error("Manifest V3 is required");
    if (manifest.background) throw new Error("1.0 must not ship a background service worker");
    if (manifest.action?.default_popup !== "popup.html") throw new Error("Browser action must use the conditional fallback popup");
    if (JSON.stringify(manifest.permissions || []) !== JSON.stringify(["activeTab"])) {
      throw new Error("Manifest must only request activeTab for the conditional fallback popup");
    }
    if ((manifest.permissions || []).some((permission) => ["storage", "tabs", "nativeMessaging"].includes(permission))) {
      throw new Error("Manifest contains unnecessary permissions");
    }
    const generatedCss = await readFile(join(out, "annotation.css"), "utf8");
    if (/\.pinpatch-extension-root\s+@(keyframes|media|font-face)/.test(generatedCss)) {
      throw new Error("Scoped CSS contains an invalid at-rule selector");
    }
    if (generatedCss.includes(".pinpatch-extension-root /*")) {
      throw new Error("Scoped CSS contains a selector-prefixed comment");
    }
    const forbidden = /pinpatch-mcp|127\.0\.0\.1:4765|MCP\s*直连|pinpatch-sync-annotations|pinpatch-get-session/i;
    for (const file of ["manifest.json", "content-script.js", "annotation-app.js", "popup.html", "popup.js"]) {
      const contents = await readFile(join(out, file), "utf8");
      if (forbidden.test(contents)) throw new Error(`${file} contains removed MCP functionality`);
    }
    for (const file of ["content-script.js", "framework-bridge.js", "annotation-app.js", "popup.js"]) {
      const result = spawnSync(process.execPath, ["--check", join(out, file)], { encoding: "utf8" });
      if (result.status !== 0) throw new Error(result.stderr || `${file} syntax check failed`);
    }
    const referenced = new Set([
      manifest.action?.default_popup,
      ...(manifest.content_scripts || []).flatMap((entry) => entry.js || []),
      ...(manifest.web_accessible_resources || []).flatMap((entry) => entry.resources || []).filter((name) => !name.includes("*")),
      ...Object.values(manifest.icons || {}),
    ].filter(Boolean));
    for (const file of referenced) {
      await access(join(out, file));
    }
  }
}

await build();
