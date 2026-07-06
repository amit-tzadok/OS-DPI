import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";

/** @type {import('react-dom/client').Root | null} */
let root = null;

export function mountReact(props = {}) {
  if (!root) {
    const container = document.getElementById("react-root");
    if (!container) return;
    root = createRoot(container);
  }
  root.render(<App {...props} />);
}
