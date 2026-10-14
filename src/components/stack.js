import { TreeBase } from "./treebase";
import * as Props from "./props";
import { html } from "uhtml";
import { styleString } from "./style";
import "css/stack.css";
import Globals from "app/globals";

/**
 * Let the bar between two pieces be dragged to share the room between
 * them differently (designer only). Their scales change but keep their
 * total, so the rest of the row or column stays put.
 * @param {PointerEvent} event
 * @param {StackContainer} container
 * @param {TreeBase} before
 * @param {TreeBase} after
 */
function startResize(event, container, before, after) {
  if (!event.isPrimary) return;
  event.preventDefault();
  event.stopPropagation();
  const element = document.getElementById(container.id);
  if (!element) return;
  const horizontal = container.direction.value == "row";
  const length = horizontal ? element.clientWidth : element.clientHeight;
  const total = container.children.reduce(
    (sum, child) => sum + Math.max(0, +child["scale"]?.value || 0),
    0,
  );
  const a = +before["scale"].value;
  const b = +after["scale"].value;
  const start = horizontal ? event.clientX : event.clientY;
  const handle = /** @type {HTMLElement} */ (event.currentTarget);
  handle.setPointerCapture(event.pointerId);
  handle.classList.add("dragging");
  // neither piece shrinks away to nothing
  const least = (a + b) * 0.1;

  const move = (/** @type {PointerEvent} */ e) => {
    const moved = ((horizontal ? e.clientX : e.clientY) - start) / length;
    const shift = Math.min(b - least, Math.max(least - a, moved * total));
    before["scale"].set(Math.round((a + shift) * 100) / 100);
    after["scale"].set(Math.round((b - shift) * 100) / 100);
    Globals.state.update();
  };
  const end = () => {
    handle.classList.remove("dragging");
    handle.removeEventListener("pointermove", move);
    handle.removeEventListener("pointerup", end);
    handle.removeEventListener("pointercancel", end);
    container.update(); // save, with undo
  };
  handle.addEventListener("pointermove", move);
  handle.addEventListener("pointerup", end);
  handle.addEventListener("pointercancel", end);
}

export class StackContainer extends TreeBase {
  direction = new Props.Select(["row", "column"], {
    defaultValue: "column",
    title: "row = side-by-side (horizontal columns) · column = stacked (vertical rows)",
  });
  background = new Props.Color("");
  columns = new Props.Integer(0, {
    min: 0,
    title:
      "Grid columns — set to 2 or more to arrange children in a matrix grid. Each Button can then have its own Row and Column position.",
  });
  rows = new Props.Integer(0, {
    min: 0,
    title:
      "Grid rows — defines how many rows the matrix has (used with Grid columns). Leave 0 to auto-size.",
  });

  allowedChildren = [
    "Stack",
    "Gap",
    "Grid",
    "Display",
    "Radio",
    "TabControl",
    "VSD",
    "Button",
  ];

  /** @returns {Hole} */
  template() {
    const columns = this.columns.value;

    // ── Matrix / CSS-grid mode ─────────────────────────────────────────────
    if (columns > 0) {
      const rows = this.rows.value;
      const empty = this.children.length === 0 ? "empty" : "";
      /** @type {Partial<CSSStyleDeclaration>} */
      const style = {
        backgroundColor: this.background.value,
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
      };
      if (rows > 0) {
        style.gridTemplateRows = `repeat(${rows}, 1fr)`;

        // Build a map of explicitly-placed children
        /** @type {Map<string, import("./treebase").TreeBase>} */
        const cellMap = new Map();
        /** @type {import("./treebase").TreeBase[]} */
        const autoPlaced = [];
        for (const child of this.children) {
          const rowVal = +/** @type {any} */ (child)["row"]?.value || 0;
          const colVal = +/** @type {any} */ (child)["column"]?.value || 0;
          if (rowVal > 0 && colVal > 0) {
            cellMap.set(`${rowVal},${colVal}`, child);
          } else {
            autoPlaced.push(child);
          }
        }

        // Render all rows × columns cells; fill empties with placeholder
        const cells = [];
        for (let r = 1; r <= rows; r++) {
          for (let c = 1; c <= columns; c++) {
            const key = `${r},${c}`;
            const child = cellMap.get(key);
            const cellStyle = { gridRow: String(r), gridColumn: String(c) };
            if (child) {
              cells.push(
                html`<div data-cell=${key} style=${styleString(cellStyle)}>
                  ${child.safeTemplate()}
                </div>`,
              );
            } else {
              cells.push(
                html`<div
                  class="empty-cell"
                  data-cell=${key}
                  style=${styleString(cellStyle)}
                ></div>`,
              );
            }
          }
        }
        const autoHoles = autoPlaced.map(
          (child) => html`<div>${child.safeTemplate()}</div>`,
        );
        return this.component({ classes: ["grid-mode", empty], style }, [
          ...cells,
          ...autoHoles,
        ]);
      }

      return this.component(
        { classes: ["grid-mode", empty], style },
        this.children.map((child) => {
          const rowVal = +/** @type {any} */ (child)["row"]?.value || 0;
          const colVal = +/** @type {any} */ (child)["column"]?.value || 0;
          /** @type {Partial<CSSStyleDeclaration>} */
          const cellStyle = {};
          if (rowVal > 0) cellStyle.gridRow = String(rowVal);
          if (colVal > 0) cellStyle.gridColumn = String(colVal);
          return html`<div style=${styleString(cellStyle)}>
            ${child.safeTemplate()}
          </div>`;
        }),
      );
    }

    // ── Normal flex mode ───────────────────────────────────────────────────
    /** return the scale of the child making sure it isn't zero or undefined.
     * @param {TreeBase } child
     * @returns {number}
     */
    function getScale(child) {
      const SCALE_MIN = 0.0;
      let scale = +child["scale"]?.value;
      if (!scale || scale < SCALE_MIN) {
        scale = SCALE_MIN;
      }
      return scale;
    }
    const scaleSum = this.children.reduce(
      (sum, child) => sum + getScale(child),
      0,
    );
    const empty = this.children.length && scaleSum ? "" : "empty";
    const direction = this.direction.value;
    const dimension = direction == "row" ? "width" : "height";
    const editing = !!Globals.state?.get("editing");

    return this.component(
      {
        classes: [this.CSSClasses(direction, empty)],
        style: {
          backgroundColor: this.background.value,
        },
      },
      this.children.map((child, index) => {
        let size = (100 * getScale(child)) / scaleSum;
        if (Number.isNaN(size)) size = 0;

        // in the designer, a bar to drag between this piece and the next
        // one that has room (pieces sized 0 are hidden)
        const next = this.children
          .slice(index + 1)
          .find((other) => getScale(other) > 0);
        const handle =
          editing && next && getScale(child) > 0
            ? html`<div
                class="resize-handle"
                title="Drag to resize"
                @pointerdown=${(/** @type {PointerEvent} */ e) =>
                  startResize(e, this, child, next)}
              ></div>`
            : html``;

        return html`<div
          style=${styleString({
            [dimension]: `${size}%`,
          })}
        >
          ${child.safeTemplate()}${handle}
        </div>`;
      }),
    );
  }
}

export class Stack extends StackContainer {
  scale = new Props.Float(1);
}
TreeBase.register(Stack, "Stack");
