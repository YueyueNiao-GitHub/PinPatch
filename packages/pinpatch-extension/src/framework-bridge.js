(() => {
  const READY_ATTRIBUTE = "data-pinpatch-framework-bridge";
  const REQUEST_EVENT = "pinpatch-framework-metadata-request";
  const COMPONENT_ATTRIBUTE = "data-pinpatch-framework-component";
  const SOURCE_ATTRIBUTE = "data-pinpatch-framework-source";

  if (document.documentElement.getAttribute(READY_ATTRIBUTE) === "ready") return;

  function componentName(type) {
    if (!type || typeof type === "string") return "";
    if (typeof type === "function") return type.displayName || type.name || "";
    if (typeof type === "object") {
      return type.displayName || type.name || componentName(type.type) || componentName(type.render) || "";
    }
    return "";
  }

  function inspectFrameworkMetadata(element) {
    let current = element;
    let domDepth = 0;

    while (current && current !== document.body && domDepth < 5) {
      const reactKey = Object.keys(current).find((key) => key.startsWith("__reactFiber$") || key.startsWith("__reactInternalInstance$"));
      if (reactKey) {
        let fiber = current[reactKey];
        let component = "";
        let sourceFile = "";
        let fiberDepth = 0;
        while (fiber && fiberDepth < 20) {
          component ||= componentName(fiber.elementType || fiber.type);
          const source = fiber._debugSource || fiber._debugOwner?._debugSource;
          if (source?.fileName) {
            sourceFile = `${source.fileName}${source.lineNumber ? `:${source.lineNumber}` : ""}${source.columnNumber ? `:${source.columnNumber}` : ""}`;
          }
          if (component && sourceFile) return { component, sourceFile };
          fiber = fiber.return;
          fiberDepth += 1;
        }
        if (component || sourceFile) return { component, sourceFile };
      }

      let instance = current.__vueParentComponent;
      let vueDepth = 0;
      while (instance && vueDepth < 20) {
        const type = instance.type || {};
        const component = type.name || type.__name || "";
        const sourceFile = type.__file || "";
        if (component || sourceFile) return { component, sourceFile };
        instance = instance.parent;
        vueDepth += 1;
      }

      current = current.parentElement;
      domDepth += 1;
    }

    return { component: "", sourceFile: "" };
  }

  document.addEventListener(REQUEST_EVENT, (event) => {
    const element = event.target;
    if (!(element instanceof Element)) return;
    const metadata = inspectFrameworkMetadata(element);
    if (metadata.component) element.setAttribute(COMPONENT_ATTRIBUTE, metadata.component);
    else element.removeAttribute(COMPONENT_ATTRIBUTE);
    if (metadata.sourceFile) element.setAttribute(SOURCE_ATTRIBUTE, metadata.sourceFile);
    else element.removeAttribute(SOURCE_ATTRIBUTE);
  }, true);

  document.documentElement.setAttribute(READY_ATTRIBUTE, "ready");
})();
