import { TreeBase } from "./treebase";
import * as Props from "./props";
import { html } from "uhtml";
import { styleString } from "./style";
import "css/stack.css";

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

    return this.component(
      {
        classes: [this.CSSClasses(direction, empty)],
        style: {
          backgroundColor: this.background.value,
        },
      },
      this.children.map((child) => {
        let size = (100 * getScale(child)) / scaleSum;
        if (Number.isNaN(size)) size = 0;

        return html`<div
          style=${styleString({
            [dimension]: `${size}%`,
          })}
        >
          ${child.safeTemplate()}
        </div>`;
      }),
    );
  }
}

export class Stack extends StackContainer {
  scale = new Props.Float(1);
}
TreeBase.register(Stack, "Stack");
