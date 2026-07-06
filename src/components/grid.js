import { html } from "uhtml";
import * as Props from "./props";
import { TreeBase } from "./treebase";
import { GridFilter } from "./gridFilter";
import { styleString } from "./style";
import { formatSlottedString } from "./slots";
import Globals from "app/globals";
import db from "app/db";
import { speakSync } from "./speech";
import { speechSuggestions } from "./speechSuggestions";
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
      @pointerup=${function (/** @type {PointerEvent} */ e) {
        if (!e.isPrimary || Globals.state?.get("editing")) return;
        const label = /** @type {HTMLElement} */ (e.currentTarget).dataset.label;
        if (label) {
          speakSync(label);
          // archive this exchange and listen fresh for the next sentence
          speechSuggestions.resetExchange(label);
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

  emptyCell() {
    const self = this;
    return html`<button
      tabindex="-1"
      disabled
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
      rows = maxRow;
      columns = maxColumn;
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
              result.push(this.emptyCell());
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
        result.push(this.emptyCell());
      }
      // draw the page selector if needed
      if (maxPage > 1) {
        result.push(this.pageSelector(maxPage, { row: rows, column: columns }));
      }
    }

    // empty result provokes a crash from uhtmlV4
    if (!result.length) {
      rows = columns = 1;
      result.push(this.emptyCell());
    }

    style.gridTemplate = `repeat(${rows}, calc(100% / ${rows})) / repeat(${columns}, 1fr)`;

    const body = html`<div style=${styleString(style)}>${result}</div>`;

    return this.component({}, body);
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
