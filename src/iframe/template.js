export function generateSrcdoc({ importMap, importStatements, compiledCode, componentName }) {
  const importMapJson = JSON.stringify(importMap, null, 2)

  // Escape </script> and </style> inside JS strings to prevent HTML parser from
  // prematurely closing the <script> tag. This is a classic web security issue:
  // the HTML parser runs BEFORE the JS parser, so even "</script>" inside a JS
  // string literal will close the surrounding <script> element.
  const safeCode = compiledCode.replace(/<\/(script|style)/gi, '<\\/$1')
  const safeImports = importStatements.replace(/<\/(script|style)/gi, '<\\/$1')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; }
    #root { min-height: 100vh; }
    #__error__ {
      position: fixed; inset: 0;
      background: rgba(20,0,0,0.95);
      color: #ff6b6b;
      padding: 24px;
      font-family: monospace;
      font-size: 14px;
      white-space: pre-wrap;
      overflow: auto;
      z-index: 99999;
    }
    #__error__ h3 { color: #ff4444; margin: 0 0 12px; font-size: 18px; }
  </style>
  <script type="importmap">
${importMapJson}
  </script>
</head>
<body>
  <div id="root"></div>
  <script type="module">
${safeImports}
import { createRoot } from "react-dom/client";

try {
${safeCode}

  const _component = typeof ${componentName} === 'function' ? ${componentName} : null;
  if (!_component) {
    throw new Error("No valid component found: '${componentName}' is not a function");
  }
  const _root = createRoot(document.getElementById("root"));
  _root.render(React.createElement(_component));

  window.parent.postMessage({ type: "render-success" }, "*");
} catch(err) {
  console.error(err);
  const el = document.createElement("div");
  el.id = "__error__";
  el.innerHTML = "<h3>Runtime Error</h3>" + err.message + "\\n\\n" + (err.stack || "");
  document.body.appendChild(el);
  window.parent.postMessage({
    type: "render-error",
    message: err.message,
    stack: err.stack || ""
  }, "*");
}
  </script>
</body>
</html>`
}
