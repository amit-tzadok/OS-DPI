import { html } from "uhtml";
import { TreeBase } from "./treebase";
import * as Props from "./props";
import { styleString } from "./style";
import { imageOrVideo } from "./grid";
import "css/button.css";
import Globals from "app/globals";

// ── Right-click context menu ──────────────────────────────────────────────────

/** Remove the context menu if it exists */
function removeContextMenu() {
  const existing = document.getElementById("btn-ctx-menu");
  if (existing) existing.remove();
}

// Dismiss on any click outside
document.addEventListener("pointerdown", (e) => {
  const menu = document.getElementById("btn-ctx-menu");
  if (menu && !menu.contains(/** @type {Node} */ (e.target))) {
    removeContextMenu();
  }
});

/**
 * Show a context menu for a button in design mode
 * @param {Button} component
 * @param {number} x
 * @param {number} y
 */
function showButtonContextMenu(component, x, y) {
  removeContextMenu();
  const menu = document.createElement("div");
  menu.id = "btn-ctx-menu";
  menu.setAttribute("role", "menu");

  const parent = component.parent;
  const index = component.index;

  /** @param {string} label
   * @param {() => void} action
   * @param {boolean} [disabled]
   */
  function addItem(label, action, disabled = false) {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.disabled = disabled;
    btn.addEventListener("click", () => {
      removeContextMenu();
      action();
    });
    menu.appendChild(btn);
  }

  addItem("Delete", () => {
    component.remove();
    Globals.layout.update();
  });

  addItem("Move up", () => {
    component.moveUpDown(true);
    Globals.layout.update();
  }, index === 0);

  addItem("Move down", () => {
    component.moveUpDown(false);
    Globals.layout.update();
  }, !parent || index >= (parent.children.length - 1));

  addItem("Duplicate", () => {
    if (!parent) return;
    const obj = component.toObject({ omittedProps: ["UID", "OneOfGroup"] });
    const clone = TreeBase.fromObject(obj, parent);
    clone.moveTo(index + 1);
    Globals.layout.update();
  });

  // Position the menu within the viewport
  document.body.appendChild(menu);
  const menuW = menu.offsetWidth;
  const menuH = menu.offsetHeight;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  menu.style.left = Math.min(x, vw - menuW - 8) + "px";
  menu.style.top = Math.min(y, vh - menuH - 8) + "px";
}

// ── Pointer-drag state for layout reordering ─────────────────────────────────
// Using module-level state avoids closure issues with uhtml re-renders.

/** @type {{ el: HTMLElement, x0: number, y0: number, active: boolean } | null} */
let drag = null;

function onDragMove(/** @type {PointerEvent} */ e) {
  if (!drag) return;
  const dx = e.clientX - drag.x0;
  const dy = e.clientY - drag.y0;
  if (!drag.active && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
    drag.active = true;
    drag.el.classList.add("btn-dragging");
    document.body.classList.add("btn-reordering");
  }
  if (!drag.active) return;

  // Clear all reorder indicators
  document.querySelectorAll(".btn-drop-before, .btn-drop-after").forEach((el) => {
    el.classList.remove("btn-drop-before");
    el.classList.remove("btn-drop-after");
  });
  document.querySelectorAll(".grid-drop-target").forEach((el) =>
    el.classList.remove("grid-drop-target"),
  );

  const gridEl = /** @type {HTMLElement | null} */ (
    drag.el.closest(".stack.grid-mode")
  );
  if (gridEl) {
    // Feature 3: snap-to-grid — compute target cell from pointer position
    const style = getComputedStyle(gridEl);
    const cols = style.gridTemplateColumns.trim().split(/\s+/).length;
    const rows = style.gridTemplateRows.trim().split(/\s+/).length;
    const rect = gridEl.getBoundingClientRect();
    const targetCol = Math.max(
      1,
      Math.min(cols, Math.ceil(((e.clientX - rect.left) / rect.width) * cols)),
    );
    const targetRow = Math.max(
      1,
      Math.min(rows, Math.ceil(((e.clientY - rect.top) / rect.height) * rows)),
    );
    gridEl.dataset.gridTarget = `${targetRow},${targetCol}`;
    const cell = gridEl.querySelector(`[data-cell="${targetRow},${targetCol}"]`);
    if (cell) cell.classList.add("grid-drop-target");
    return;
  }

  // Feature 2: show before/after insertion indicator
  const hit = document.elementFromPoint(e.clientX, e.clientY);
  const target = /** @type {Element | null} */ (hit)?.closest("button.button");
  if (target && target !== drag.el) {
    const targetRect = target.getBoundingClientRect();
    const ratio = (e.clientX - targetRect.left) / targetRect.width;
    if (ratio < 0.5) {
      target.classList.add("btn-drop-before");
    } else {
      target.classList.add("btn-drop-after");
    }
  }
}

/** Find the ChangeStack on the nearest ancestor that has one
 * @param {TreeBase} component
 * @returns {import("./undo").ChangeStack | null}
 */
function findChangeStack(component) {
  let p = component.parent;
  while (p) {
    if ("changeStack" in p) return /** @type {any} */ (p).changeStack;
    p = p.parent;
  }
  return null;
}

function onDragEnd(/** @type {PointerEvent} */ e) {
  if (!drag) return;
  document.removeEventListener("pointermove", onDragMove);
  document.removeEventListener("pointerup", onDragEnd);
  document.removeEventListener("pointercancel", onDragCancel);

  const wasActive = drag.active;
  drag.el.classList.remove("btn-dragging");
  document.body.classList.remove("btn-reordering");

  if (wasActive) {
    const gridEl = /** @type {HTMLElement | null} */ (
      drag.el.closest(".stack.grid-mode")
    );
    if (gridEl) {
      // Feature 3: snap-to-grid drop — apply the stored target row/col
      const targetPos = gridEl.dataset.gridTarget;
      delete gridEl.dataset.gridTarget;
      if (targetPos) {
        const [targetRow, targetCol] = targetPos.split(",").map(Number);
        const source = TreeBase.componentFromId(drag.el.id);
        if (source && source["row"] && source["column"]) {
          const cs = findChangeStack(source);
          if (cs) cs.pendingLabel = "Move button";
          source["row"].set(String(targetRow));
          source["column"].set(String(targetCol));
          source.update();
        }
      }
    } else {
      // Feature 2: before/after insertion drop
      const hit = document.elementFromPoint(e.clientX, e.clientY);
      const target = /** @type {Element | null} */ (hit)?.closest("button.button");
      if (target && target !== drag.el) {
        const isBefore = target.classList.contains("btn-drop-before");
        const source = TreeBase.componentFromId(drag.el.id);
        const dest = TreeBase.componentFromId(
          /** @type {HTMLElement} */ (target).id,
        );
        if (source && dest && source.parent === dest.parent) {
          const parent = /** @type {TreeBase} */ (dest.parent);
          const i = parent.children.indexOf(source);
          const j = parent.children.indexOf(dest);
          if (i >= 0 && j >= 0) {
            const cs = findChangeStack(source);
            if (cs) cs.pendingLabel = "Move button";
            parent.moveChild(i, j, isBefore ? "before" : "after");
            source.update();
          }
        }
      }
    }
  }

  // Clean up all indicators after reading their state
  document.querySelectorAll(".btn-drop-before, .btn-drop-after").forEach((el) => {
    el.classList.remove("btn-drop-before");
    el.classList.remove("btn-drop-after");
  });
  document.querySelectorAll(".grid-drop-target").forEach((el) =>
    el.classList.remove("grid-drop-target"),
  );

  drag = null;
}

function onDragCancel() {
  if (!drag) return;
  document.removeEventListener("pointermove", onDragMove);
  document.removeEventListener("pointerup", onDragEnd);
  document.removeEventListener("pointercancel", onDragCancel);
  drag.el.classList.remove("btn-dragging");
  document.body.classList.remove("btn-reordering");
  document.querySelectorAll(".btn-drop-before, .btn-drop-after").forEach((el) => {
    el.classList.remove("btn-drop-before");
    el.classList.remove("btn-drop-after");
  });
  document.querySelectorAll(".grid-drop-target").forEach((el) =>
    el.classList.remove("grid-drop-target"),
  );
  // Clear any pending grid-target data attributes
  document.querySelectorAll("[data-grid-target]").forEach((el) => {
    delete /** @type {HTMLElement} */ (el).dataset.gridTarget;
  });
  drag = null;
}

// ─────────────────────────────────────────────────────────────────────────────

class Button extends TreeBase {
  label = new Props.String("click me", { title: "Text shown on the button" });
  symbol = new Props.String("", {
    title: "Image or audio file — or drag a file from the Content tab directly onto this button",
    placeholder: "drag media from Content tab…",
  });
  name = new Props.String("button");
  background = new Props.Color("");
  scale = new Props.Float(1);
  row = new Props.Integer(0, {
    min: 0,
    title: "Matrix row position (only used when the parent Stack has Grid columns set). 0 = auto-place.",
  });
  column = new Props.Integer(0, {
    min: 0,
    title: "Matrix column position (only used when the parent Stack has Grid columns set). 0 = auto-place.",
  });
  allowedChildren = ["Speech"];

  template() {
    const style = styleString({ backgroundColor: this.background.value });
    const name = this.name.value;
    const label = this.label.value;
    const symbol = this.symbol.value;
    const self = this;
    const editing = !!(Globals.state?.get("editing"));

    /** @type {import("uhtml").Hole} */
    let content;
    if (symbol) {
      content = html`<div>
        <figure>
          ${imageOrVideo(symbol, label)}
          <figcaption>${label}</figcaption>
        </figure>
      </div>`;
    } else {
      content = html`<span>${label}</span>`;
    }

    const multiSelected = TreeBase.selectedIds.has(this.id);
    return html`<button
      class=${"button" + (multiSelected ? " multi-selected" : "")}
      id=${this.id}
      name=${name}
      style=${style}
      data=${{
        ComponentType: this.className,
        ComponentName: name,
        name: name,
        label: label,
      }}
      @contextmenu=${editing
        ? function (/** @type {MouseEvent} */ e) {
            e.preventDefault();
            showButtonContextMenu(self, e.clientX, e.clientY);
          }
        : null}
      @pointerdown=${editing
        ? function (/** @type {PointerEvent} */ e) {
            if (!e.isPrimary) return;
            // Feature 9: shift+click toggles multi-selection
            if (e.shiftKey) {
              if (TreeBase.selectedIds.has(self.id)) {
                TreeBase.selectedIds.delete(self.id);
              } else {
                TreeBase.selectedIds.add(self.id);
              }
              Globals.layout.update();
              return;
            }
            drag = {
              el: /** @type {HTMLElement} */ (e.currentTarget),
              x0: e.clientX,
              y0: e.clientY,
              active: false,
            };
            document.addEventListener("pointermove", onDragMove);
            document.addEventListener("pointerup", onDragEnd);
            document.addEventListener("pointercancel", onDragCancel);
          }
        : null}
      @pointerup=${!editing
        ? function (/** @type {PointerEvent} */ e) {
            const el = /** @type {HTMLElement} */ (e.currentTarget);
            el.classList.add("btn-activated");
            setTimeout(() => el.classList.remove("btn-activated"), 200);
          }
        : null}
      @dragover=${function (/** @type {DragEvent} */ e) {
        if (!Globals.state?.get("editing")) return;
        if (!e.dataTransfer?.types.includes("application/x-osdpi-media"))
          return;
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
      }}
      @dragenter=${function (/** @type {DragEvent} */ e) {
        if (!Globals.state?.get("editing")) return;
        if (!e.dataTransfer?.types.includes("application/x-osdpi-media"))
          return;
        /** @type {HTMLElement} */ (e.currentTarget).classList.add(
          "btn-drag-over",
        );
      }}
      @dragleave=${function (/** @type {DragEvent} */ e) {
        const el = /** @type {HTMLElement} */ (e.currentTarget);
        if (!el.contains(/** @type {Node} */ (e.relatedTarget))) {
          el.classList.remove("btn-drag-over");
        }
      }}
      @drop=${function (/** @type {DragEvent} */ e) {
        e.preventDefault();
        /** @type {HTMLElement} */ (e.currentTarget).classList.remove(
          "btn-drag-over",
        );
        if (!Globals.state?.get("editing")) return;
        const mediaName = e.dataTransfer?.getData("application/x-osdpi-media");
        if (mediaName) {
          self.symbol.set(mediaName);
          self.update();
        }
      }}
    >
      ${content}${this.children.map((c) => c.safeTemplate())}
    </button>`;
  }
}
TreeBase.register(Button, "Button");
