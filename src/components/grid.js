import { html } from "uhtml";
import * as Props from "./props";
import { TreeBase } from "./treebase";
import { GridFilter } from "./gridFilter";
import { styleString } from "./style";
import { formatSlottedString } from "./slots";
import Globals from "app/globals";
import db from "app/db";
import "css/grid.css";

/**
 * Return an image or video element given the name + parameters
 * like "foo.mp4 autoplay loop".
 * @param {string} src
 * @param {string} title
 * @param {null|function():void} onload
 * @returns {Hole}
 */
export function imageOrVideo(src, title, onload = null) {
  const match = /(?<src>.*\.(?:mp4|webm))(?<options>.*$)/.exec(src);

  if (match && match.groups) {
    // video
    const options = match.groups.options;
    const vsrc = match.groups.src;
    return html`<video
      is="video-db"
      dbsrc=${vsrc}
      title=${title}
      ?loop=${options.indexOf("loop") >= 0}
      ?autoplay=${options.indexOf("autoplay") >= 0}
      ?muted=${options.indexOf("muted") >= 0}
      @load=${onload}
    />`;
  } else {
    // image
    return html`<img
      is="img-db"
      dbsrc=${src}
      title=${title}
      @load=${onload}
    />`;
  }
}

class Grid extends TreeBase {
  fillItems = new Props.Boolean(true, {
    title: "When on, buttons fill left-to-right in order. Turn off to set each button's exact row/column position.",
  });
  rows = new Props.Integer(3, { min: 1, title: "Number of rows in the grid" });
  columns = new Props.Integer(3, { min: 1, title: "Number of columns in the grid" });
  scale = new Props.Float(1);
  name = new Props.String("grid");
  background = new Props.Color("white");

  allowedChildren = ["GridFilter"];

  /** @type {GridFilter[]} */
  children = [];

  page = 1;
  pageBoundaries = { 0: 0 }; //track starting indices of pages

  /** The cell being typed into in the designer: which cell (by position on
   * this page), the row it edits (-1 for a new word) and the text so far
   * @type {{key: string, absIdx: number, row: number, column: number, text: string} | null} */
  _editCell = null;

  /** Open the in-place text box on a cell (designer only)
   * @param {number} row
   * @param {number} column
   * @param {number} absIdx - the row being renamed, or -1 to add a word
   * @param {string} text
   */
  startEditing(row, column, absIdx, text) {
    if (!Globals.state?.get("editing")) return;
    this._editCell = { key: `${row},${column}`, absIdx, row, column, text };
    Globals.state.update();
  }

  /** Save what was typed: a new word becomes a button, a renamed button
   * keeps its picture, and clearing the text removes the button */
  async finishEditing() {
    const edit = this._editCell;
    if (!edit) return;
    this._editCell = null;
    const { data } = Globals;
    const label = edit.text.trim();
    const rows = [...data.contentRows];

    if (edit.absIdx >= 0) {
      const target = data.getMatchingRows(this.children, false)[edit.absIdx];
      const index = rows.indexOf(target);
      // predicted words and notes aren't board content; leave them be
      if (index < 0 || label === String(target.label ?? "")) {
        Globals.state.update();
        return;
      }
      if (label) rows[index] = { ...target, label };
      else rows.splice(index, 1);
    } else if (label) {
      rows.push(this.newRow(label, edit.row, edit.column));
    } else {
      Globals.state.update();
      return;
    }
    data.setContent(rows);
    await db.write("content", rows);
    Globals.state.update();
  }

  /** A content row that will show up in this grid: it satisfies the grid's
   * "equals" filters (e.g. the category being shown) and, when items are
   * placed by position, sits in the cell that was clicked
   * @param {string} label
   * @param {number} row
   * @param {number} column
   * @returns {Row}
   */
  newRow(label, row, column) {
    /** @type {Row} */
    const result = { label, sheetName: "sheet1" };
    for (const filter of this.children) {
      if (filter.operator.value !== "equals") continue;
      const value = filter.value.value;
      const field = filter.field.value.slice(1);
      if (field && value !== "" && value !== "*" && value != null) {
        result[field] = value;
      }
    }
    if (!this.fillItems.value) {
      Object.assign(result, { row, column });
      if (this.page > 1) result.page = this.page;
    }
    return result;
  }

  /** The text box shown in a cell while it is being edited */
  cellEditor() {
    const edit = /** @type {NonNullable<Grid["_editCell"]>} */ (this._editCell);
    return html`<div class="grid-cell-editor">
      <input
        aria-label="Word for this button"
        placeholder="Type a word"
        .value=${edit.text}
        ref=${(/** @type {HTMLInputElement | null} */ el) => {
          if (el && document.activeElement !== el) {
            requestAnimationFrame(() => {
              el.focus();
              el.select();
            });
          }
        }}
        @input=${(/** @type {InputEvent} */ e) => {
          edit.text = /** @type {HTMLInputElement} */ (e.target).value;
        }}
        @keydown=${(/** @type {KeyboardEvent} */ e) => {
          e.stopPropagation();
          if (e.key === "Enter") {
            e.preventDefault();
            this.finishEditing();
          } else if (e.key === "Escape") {
            this._editCell = null;
            Globals.state.update();
          }
        }}
        @blur=${() => {
          if (this._editCell === edit) this.finishEditing();
        }}
      />
    </div>`;
  }

  /**
   * Assign a media file to a grid cell by its absolute index.
   * If absIdx is -1 (empty cell), a new content row is created.
   * @param {number} absIdx
   * @param {string} mediaName
   */
  async assignMediaToCell(absIdx, mediaName) {
    const { data } = Globals;

    if (absIdx >= 0) {
      // Find the existing row and update its symbol field
      const allRows = data.getMatchingRows(this.children, false);
      const targetRow = allRows[absIdx];
      if (targetRow) {
        const contentIdx = data.contentRows.indexOf(targetRow);
        if (contentIdx >= 0) {
          data.contentRows[contentIdx] = {
            ...data.contentRows[contentIdx],
            symbol: mediaName,
          };
          await db.write("content", data.contentRows);
        } else {
          const noteIdx = data.noteRows.indexOf(targetRow);
          if (noteIdx >= 0) {
            data.noteRows[noteIdx] = {
              ...data.noteRows[noteIdx],
              symbol: mediaName,
            };
            await db.write("notes", data.noteRows);
          }
        }
      }
    } else {
      // Empty cell — create a new content row with the media as its symbol
      const label = mediaName.replace(/\.[^.]+$/, "");
      data.contentRows.push({ label, symbol: mediaName, sheetName: "sheet1" });
      await db.write("content", data.contentRows);
    }

    Globals.state.update();
  }

  /**
   * Swap two cells by their absolute index in the filtered rows array.
   * Supports both fillItems modes.
   * @param {number} fromAbsIdx
   * @param {number} toAbsIdx
   */
  async swapCells(fromAbsIdx, toAbsIdx) {
    if (fromAbsIdx === toAbsIdx || isNaN(fromAbsIdx) || isNaN(toAbsIdx)) return;
    const { data } = Globals;

    // clearFields=false preserves object identity so indexOf() works
    const allRows = data.getMatchingRows(this.children, false);
    const fromRow = allRows[fromAbsIdx];
    const toRow = allRows[toAbsIdx];
    if (!fromRow || !toRow) return;

    const fromContentIdx = data.contentRows.indexOf(fromRow);
    const toContentIdx = data.contentRows.indexOf(toRow);
    if (fromContentIdx < 0 || toContentIdx < 0) return;

    if (this.fillItems.value) {
      // Sequential mode: swap positions in the array
      [data.contentRows[fromContentIdx], data.contentRows[toContentIdx]] =
        [data.contentRows[toContentIdx], data.contentRows[fromContentIdx]];
    } else {
      // Explicit positioning mode: swap row/column/page coordinate fields
      const { row: fromR, column: fromC, page: fromP } = fromRow;
      data.contentRows[fromContentIdx] = {
        ...fromRow,
        row: toRow.row,
        column: toRow.column,
        page: toRow.page,
      };
      data.contentRows[toContentIdx] = {
        ...toRow,
        row: fromR,
        column: fromC,
        page: fromP,
      };
    }

    await db.write("content", data.contentRows);
    Globals.state.update();
  }

  /** @param {Row} item */
  gridCell(item) {
    if (this._editCell?.key === `${item.row},${item.column}`) {
      return this.cellEditor();
    }
    const name = this.name.value;
    const hasContent = !!(item.label || item.symbol);
    const absIdx = item._absIndex ?? -1;
    const isDraggable = hasContent && absIdx >= 0;
    const self = this;

    /** @type {Hole[]} */
    let content;
    let msg = formatSlottedString(item.label || "");
    if (item.symbol) {
      content = [
        html`<div>
          <figure>
            ${imageOrVideo(item.symbol, item.label || "")}
            <figcaption>${msg}</figcaption>
          </figure>
        </div>`,
      ];
    } else {
      content = msg;
    }

    // Use data-drag-idx attribute so handlers can read the index at event time
    // rather than relying on closures that may be stale after re-renders.
    return html`<button
      tabindex="-1"
      data-drag-idx=${isDraggable ? String(absIdx) : null}
      .draggable=${isDraggable}
      data=${{
        ...item,
        ComponentName: name,
        ComponentType: this.className,
      }}
      ?disabled=${!item.label && !item.symbol}
      title=${Globals.state?.get("editing") && absIdx >= 0
        ? "Click to change the word (clear it to remove the button)"
        : null}
      @click=${() => {
        if (absIdx >= 0) {
          self.startEditing(item.row, item.column, absIdx, String(item.label ?? ""));
        }
      }}
      @dragstart=${function (/** @type {DragEvent} */ e) {
        if (!Globals.state?.get("editing")) {
          e.preventDefault();
          return;
        }
        const idx = /** @type {HTMLElement} */ (e.currentTarget).dataset.dragIdx;
        if (!idx || !e.dataTransfer) { e.preventDefault(); return; }
        e.dataTransfer.setData("text/plain", idx);
        e.dataTransfer.effectAllowed = "move";
        /** @type {HTMLElement} */ (e.currentTarget).classList.add("grid-dragging");
      }}
      @dragend=${function (/** @type {DragEvent} */ e) {
        /** @type {HTMLElement} */ (e.currentTarget).classList.remove("grid-dragging");
        // Clean up any lingering hover highlights in case dragleave didn't fire
        document.querySelectorAll(".grid-drag-over").forEach(
          (el) => el.classList.remove("grid-drag-over"),
        );
      }}
      @dragover=${function (/** @type {DragEvent} */ e) {
        if (!Globals.state?.get("editing") || !e.dataTransfer) return;
        const isMedia = e.dataTransfer.types.includes(
          "application/x-osdpi-media",
        );
        const idx = /** @type {HTMLElement} */ (e.currentTarget).dataset.dragIdx;
        if (!isMedia && !idx) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = isMedia ? "copy" : "move";
      }}
      @dragenter=${function (/** @type {DragEvent} */ e) {
        if (!Globals.state?.get("editing") || !e.dataTransfer) return;
        const isMedia = e.dataTransfer.types.includes(
          "application/x-osdpi-media",
        );
        const idx = /** @type {HTMLElement} */ (e.currentTarget).dataset.dragIdx;
        if (!isMedia && !idx) return;
        /** @type {HTMLElement} */ (e.currentTarget).classList.add("grid-drag-over");
      }}
      @dragleave=${function (/** @type {DragEvent} */ e) {
        const el = /** @type {HTMLElement} */ (e.currentTarget);
        if (!el.contains(/** @type {Node} */ (e.relatedTarget))) {
          el.classList.remove("grid-drag-over");
        }
      }}
      @drop=${function (/** @type {DragEvent} */ e) {
        e.preventDefault();
        /** @type {HTMLElement} */ (e.currentTarget).classList.remove("grid-drag-over");
        if (!Globals.state?.get("editing") || !e.dataTransfer) return;
        const mediaName = e.dataTransfer.getData("application/x-osdpi-media");
        if (mediaName) {
          const absIdx = parseInt(
            /** @type {HTMLElement} */ (e.currentTarget).dataset.dragIdx ?? "-1",
            10,
          );
          self.assignMediaToCell(isNaN(absIdx) ? -1 : absIdx, mediaName);
          return;
        }
        const toIdx = parseInt(
          /** @type {HTMLElement} */ (e.currentTarget).dataset.dragIdx ?? "",
          10,
        );
        const fromIdx = parseInt(e.dataTransfer.getData("text/plain"), 10);
        self.swapCells(fromIdx, toIdx);
      }}
    >
      ${content}
    </button>`;
  }

  /** @param {number} row @param {number} column */
  emptyCell(row, column) {
    if (this._editCell?.key === `${row},${column}`) return this.cellEditor();
    const self = this;
    // clickable in the designer (to add a word); inert on the board
    const editing = !!Globals.state?.get("editing");
    return html`<button
      tabindex="-1"
      class="grid-empty"
      ?disabled=${!editing}
      title=${editing ? "Click to add a word" : null}
      @click=${() => self.startEditing(row, column, -1, "")}
      @dragover=${function (/** @type {DragEvent} */ e) {
        if (!Globals.state?.get("editing") || !e.dataTransfer) return;
        if (!e.dataTransfer.types.includes("application/x-osdpi-media")) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }}
      @dragenter=${function (/** @type {DragEvent} */ e) {
        if (!Globals.state?.get("editing") || !e.dataTransfer) return;
        if (!e.dataTransfer.types.includes("application/x-osdpi-media")) return;
        /** @type {HTMLElement} */ (e.currentTarget).classList.add("grid-drag-over");
      }}
      @dragleave=${function (/** @type {DragEvent} */ e) {
        const el = /** @type {HTMLElement} */ (e.currentTarget);
        if (!el.contains(/** @type {Node} */ (e.relatedTarget))) {
          el.classList.remove("grid-drag-over");
        }
      }}
      @drop=${function (/** @type {DragEvent} */ e) {
        e.preventDefault();
        /** @type {HTMLElement} */ (e.currentTarget).classList.remove("grid-drag-over");
        if (!Globals.state?.get("editing") || !e.dataTransfer) return;
        const mediaName = e.dataTransfer.getData("application/x-osdpi-media");
        if (mediaName) self.assignMediaToCell(-1, mediaName);
      }}
    ></button>`;
  }

  /**
   * Allow selecting pages in the grid
   *
   * @param {Number} pages
   * @param {Row} info
   */
  pageSelector(pages, info) {
    const { state } = Globals;
    const background = this.background.value;
    const name = this.name.value;

    return html`<div class="page-control">
      <div class="text">Page ${this.page} of ${pages}</div>
      <div class="back-next">
        <button
          style=${styleString({ backgroundColor: background })}
          .disabled=${this.page == 1}
          data=${{
            ...info,
            ComponentName: name,
            ComponentType: this.className,
          }}
          click
          @Activate=${() => {
            this.page = ((((this.page - 2) % pages) + pages) % pages) + 1;
            state.update(); // trigger redraw
          }}
          tabindex="-1"
        >
          &#9754;</button
        ><button
          .disabled=${this.page == pages}
          data=${{
            ...info,
            ComponentName: name,
            ComponentType: this.className,
          }}
          click
          @Activate=${() => {
            this.page = (this.page % pages) + 1;
            state.update(); // trigger redraw
          }}
          tabindex="-1"
        >
          &#9755;
        </button>
      </div>
    </div>`;
  }

  template() {
    /** @type {Partial<CSSStyleDeclaration>} */
    const style = { backgroundColor: this.background.value };
    const { data } = Globals;
    let rows = Math.max(1, this.rows.value);
    let columns = Math.max(1, this.columns.value);
    let fillItems = this.fillItems.value;

    // Tag every item with its absolute index before pagination so drag-and-drop
    // can identify which source rows to swap.
    let items = /** @type {(Row & {_absIndex: number})[]} */ (
      data.getMatchingRows(this.children).map((item, i) => ({
        ...item,
        _absIndex: i,
      }))
    );

    let maxPage = 1;
    const result = [];
    if (!fillItems) {
      // collect the items for the current page and get the dimensions
      let maxRow = 0, maxColumn = 0;
      const itemMap = new Map();
      /**
       * @param {number} row
       * @param {number} column
       */
      const itemKey = (row, column) => row * 1000 + column;

      for (const item of items) {
        // ignore items without row and column
        if (!item.row || !item.column) continue;
        // get the max page value if any
        maxPage = Math.max(maxPage, item.page || 1);
        // collect the items on this page
        if (this.page == (item.page || 1)) {
          maxRow = Math.max(maxRow, item.row);
          maxColumn = Math.max(maxColumn, item.column);
          const key = itemKey(item.row, item.column);
          // only use the first one
          if (!itemMap.has(key)) itemMap.set(key, item);
        }
      }
      // Positioned items set the grid's shape. A grid with none yet uses
      // the rows and columns from the designer, so its empty cells show
      // (boards made before this have content, so their shape is unchanged).
      if (maxRow && maxColumn) {
        rows = maxRow;
        columns = maxColumn;
      }
      for (let row = 1; row <= rows; row++) {
        for (let column = 1; column <= columns; column++) {
          if (maxPage > 1 && row == rows && column == columns) {
            // draw the page selector in the last cell
            result.push(this.pageSelector(maxPage, { row, column }));
          } else {
            const key = itemKey(row, column);
            if (itemMap.has(key)) {
              result.push(this.gridCell(itemMap.get(key)));
            } else {
              result.push(this.emptyCell(row, column));
            }
          }
        }
      }
    } else {
      // fill items sequentially
      let perPage = rows * columns;
      if (items.length > perPage) {
        perPage = perPage - 1;
      }
      maxPage = Math.ceil(items.length / perPage);
      // Slice for the current page. Items retain their _absIndex from before the slice.
      const pageStart = (this.page - 1) * perPage;
      items = items.slice(pageStart, this.page * perPage);
      // render them into the result
      for (let i = 0; i < items.length; i++) {
        const row = Math.floor(i / columns) + 1;
        const column = (i % columns) + 1;
        result.push(this.gridCell({ ...items[i], row, column }));
      }
      // fill any spaces that remain
      for (let i = items.length; i < perPage; i++) {
        result.push(
          this.emptyCell(Math.floor(i / columns) + 1, (i % columns) + 1),
        );
      }
      // draw the page selector if needed
      if (maxPage > 1) {
        result.push(this.pageSelector(maxPage, { row: rows, column: columns }));
      }
    }

    // empty result provokes a crash from uhtmlV4
    if (!result.length) {
      rows = columns = 1;
      result.push(this.emptyCell(1, 1));
    }

    style.gridTemplate = `repeat(${rows}, calc(100% / ${rows})) / repeat(${columns}, 1fr)`;

    const body = html`<div style=${styleString(style)}>${result}</div>`;

    // the live AI suggestions strip (speechSuggestions.js) gets its own
    // larger text
    const classes = this.name.value === "suggestions" ? ["grid-suggestions"] : [];
    return this.component({ classes }, body);
  }

  settingsDetails() {
    const props = this.props;
    const inputs = Object.values(props).map((prop) => prop.input());
    const filters = GridFilter.FilterSettings(this.children);
    return [html`<div>${filters}${inputs}</div>`];
  }

  settingsChildren() {
    return html`<div />`;
  }
}
TreeBase.register(Grid, "Grid");
