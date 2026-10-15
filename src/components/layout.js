import { html, render } from "uhtml";
import { TreeBase } from "./treebase";
import { DesignerPanel } from "./designer";
import * as Props from "./props";
import "css/layout.css";
import Globals from "app/globals";
import { TabPanel } from "./tabcontrol";
import { callAfterRender } from "app/render";
import { ModalDialog } from "./modal-dialog";
import { clearCues } from "./access/pattern";
import {
  blankLayout,
  pieceKinds,
  pieceAt,
  pieceLabel,
  addPiece,
  addTalkingBoard,
  movePieceTo,
  canDropOn,
  pieceUnit,
  addTab,
  renameTab,
  removePiece,
  toggleClearButton,
  moveTarget,
  movePiece,
  clearButtonFor,
  visualClasses,
} from "./pieces";

// map old names to new for the transition
const typeToClassName = {
  audio: "Audio",
  stack: "Stack",
  page: "Page",
  grid: "Grid",
  speech: "Speech",
  button: "Button",
  logger: "Logger",
  gap: "Gap",
  option: "Option",
  radio: "Radio",
  vsd: "VSD",
  "modal dialog": "ModalDialog",
  "tab control": "TabControl",
  "tab panel": "TabPanel",
  display: "Display",
};

export class Layout extends DesignerPanel {
  allowDelete = false;

  static tableName = "layout";
  static defaultValue = blankLayout;

  uiScale = new Props.Float(0.7);

  /** @type {string} */
  _searchQuery = "";

  /** The piece clicked on the board
   * @type {TreeBase | null} */
  _selected = null;

  /** Where the next piece goes while the Add menu is open
   * @type {{anchor: TreeBase | null, side: "above" | "below" | "left" | "right" | "inside"} | null} */
  _adding = null;


  /** The selected piece, if it is still on the board */
  get selected() {
    const selected = this._selected;
    if (selected && TreeBase.idMap.get(selected.id) === selected) {
      return selected;
    }
    return null;
  }

  /** @param {TreeBase | null} component */
  select(component) {
    if (component === this.selected) return;
    this._selected = component;
    this._adding = null;
    // show the Layout tab, without moving focus off the board (a click
    // on an empty square there opens a text box)
    const designer = Globals.designer;
    const patch = component && designer ? { [designer.stateName.value]: this.name.value } : {};
    Globals.state.update(patch);
  }

  settings() {
    return html`<div class=${this.CSSClasses("layout")} help="Layout tab" id=${this.id}>
      ${this.simpleView()}
    </div>`;
  }

  /** The full component tree, shown in the Advanced → Components tab
   * @param {string} rootId - the id of the element holding it */
  treeView(rootId) {
    return html`<details class="panel-help">
        <summary>About the Components tab</summary>
        <div class="panel-help-body">
          <p>The full tree of every component on the board — pages, containers, buttons, displays, and more. For everyday building, use the Layout tab instead.</p>
          <ul>
            <li>Expand any item to edit its properties.</li>
            <li>Use the <strong>＋ Add…</strong> selector inside a component to add children (Stacks, Grids, Buttons, etc.).</li>
            <li>Use <strong>Edit → Duplicate</strong> or right-click a button on the canvas to copy, move, or delete it.</li>
            <li>Press <kbd>Ctrl+H</kbd> to highlight the selected component on the canvas.</li>
            <li>Use the search box below to filter components by name.</li>
          </ul>
        </div>
      </details>
      <div class="layout-search">
        <input
          type="search"
          placeholder="Search components…"
          aria-label="Search layout components"
          .value=${this._searchQuery}
          @input=${(/** @type {InputEvent} */ e) => {
            const input = /** @type {HTMLInputElement} */ (e.target);
            this._searchQuery = input.value;
            this._applySearch(input.value, rootId);
          }}
        />
      </div>
      ${this.children[0].settings()}`;
  }

  /** The plain-language editor: add pieces, and change the one clicked */
  simpleView() {
    const selected = this.selected;
    const page = this.children[0];
    const empty = !page.children.some((c) => visualClasses.has(c.className));
    // outline the selected piece on the board
    const outline = html`<style
      .textContent=${selected
        ? `body.designing #UI [id="${selected.id}"] {
            outline: 3px solid var(--brand);
            outline-offset: -3px;
          }`
        : ""}
    ></style>`;

    let body;
    if (this._adding) {
      body = this.addMenu();
    } else if (selected) {
      body = this.inspector(selected);
    } else if (empty) {
      this._adding = { anchor: null, side: "below" };
      body = this.addMenu();
    } else {
      body = html`${hasWordGrid(page) ? howToFill() : html``}
        <p class="piece-hint">
          Click a piece on the board to change it. Use the + buttons around
          it to add a piece next to it.
        </p>
        <button
          class="piece-action"
          @click=${() => {
            this._adding = { anchor: null, side: "below" };
            Globals.state.update();
          }}
        >
          + Add a piece at the bottom
        </button>`;
    }
    return html`<div class="layout-simple">${outline}${body}</div>`;
  }

  /** The choice of pieces to add */
  addMenu() {
    const adding = /** @type {NonNullable<Layout["_adding"]>} */ (this._adding);
    const page = this.children[0];
    const empty = !page.children.some((c) => visualClasses.has(c.className));
    const where = adding.anchor
      ? adding.side === "inside"
        ? "inside this tab"
        : `${adding.side === "above" || adding.side === "below" ? adding.side : "to the " + adding.side} of the ${pieceLabel(adding.anchor).toLowerCase()}`
      : "";
    return html`<h3 class="piece-heading">
        ${empty ? "Your board is empty. What do you want to start with?" : `Add a piece ${where}`}
      </h3>
      ${empty
        ? html`<button
            class="piece-choice piece-choice-main"
            @click=${() => {
              this._adding = null;
              this._selected = addTalkingBoard();
            }}
          >
            <span class="piece-icon" aria-hidden="true">💬▦</span>
            <strong>Talking board</strong>
            <span>A message bar with a word grid below it, ready to type words into.</span>
          </button>
          <p class="piece-hint">Or start with one piece:</p>`
        : html``}
      <div class="piece-menu">
        ${pieceKinds.map(
          (piece) => html`<button
            class="piece-choice"
            @click=${() => {
              this._adding = null;
              this._selected = addPiece(piece.kind, adding.anchor, adding.side);
            }}
          >
            <span class="piece-icon" aria-hidden="true">${piece.icon}</span>
            <strong>${piece.label}</strong>
            <span>${piece.about}</span>
          </button>`,
        )}
      </div>
      ${empty
        ? html``
        : html`<button
            class="piece-action"
            @click=${() => {
              this._adding = null;
              Globals.state.update();
            }}
          >
            Cancel
          </button>`}`;
  }

  /** Settings for the selected piece
   * @param {TreeBase} piece */
  inspector(piece) {
    /** @type {["above" | "below" | "left" | "right", string][]} */
    const sides = [
      ["above", "↑ Up"],
      ["below", "↓ Down"],
      ["left", "← Left"],
      ["right", "→ Right"],
    ];
    const isTab = piece.className === "TabPanel";
    const canRemove = !isTab || (piece.parent?.children.length ?? 0) > 1;
    const moveButtons = isTab
      ? html``
      : html`<div class="piece-add">
          <span>Move it (or drag ⠿ on the board):</span>
          <div class="piece-sides">
            ${sides.map(
              ([side, label]) => html`<button
                ?disabled=${!moveTarget(piece, side)}
                aria-label=${`Move ${side === "above" ? "up" : side === "below" ? "down" : side}`}
                @click=${() => movePiece(piece, side)}
              >
                ${label}
              </button>`,
            )}
          </div>
        </div>`;
    return html`<div class="piece-inspector">
      <div class="piece-title">
        <h3>${pieceLabel(piece)}${isTab ? `: ${piece["label"].value}` : ""}</h3>
        <button
          class="piece-done"
          title="Stop changing this piece"
          @click=${() => this.select(null)}
        >
          Done
        </button>
      </div>
      ${this.pieceSettings(piece)}
      ${isTab && !piece.children.length
        ? html`<button
            class="piece-action"
            @click=${() => {
              this._adding = { anchor: piece, side: "inside" };
              Globals.state.update();
            }}
          >
            + Add a piece inside this tab
          </button>`
        : html``}
      ${isTab
        ? html``
        : html`<p class="piece-hint">
            Use the + buttons around it on the board to add a piece next to
            it, and drag the grey bars between pieces to resize them.
          </p>`}
      <details class="piece-more">
        <summary>More options</summary>
        ${this.moreSettings(piece)} ${moveButtons}
      </details>
      ${canRemove
        ? html`<button
            class="piece-action piece-remove"
            @click=${() => {
              const tabs = isTab ? piece.parent : null;
              removePiece(piece);
              this.select(tabs ?? null);
            }}
          >
            ${isTab ? "Remove this tab" : "Remove from the board"}
          </button>`
        : html``}
    </div>`;
  }

  /** The settings few people need, folded under "More options"
   * @param {TreeBase} piece */
  moreSettings(piece) {
    if (piece.className !== "Grid") return html``;
    const fill = piece["fillItems"];
    /** @param {string} label @param {any} prop */
    const number = (label, prop) => html`<label class="piece-field">
      <span>${label}</span>
      <input
        type="number"
        min="1"
        max="12"
        .value=${String(prop.value)}
        @change=${(/** @type {Event} */ e) => {
          const input = /** @type {HTMLInputElement} */ (e.target);
          prop.set(Math.min(12, Math.max(1, Math.round(+input.value || 1))));
          piece.update();
        }}
      />
    </label>`;
    return html`<p class="piece-hint">
        The grid grows by itself as you add words. To set its size yourself:
      </p>
      ${number("Rows", piece["rows"])} ${number("Columns", piece["columns"])}
      <fieldset class="piece-field">
        <legend>Words go</legend>
        <label
          ><input
            type="radio"
            name=${piece.id + "-fill"}
            ?checked=${fill.value}
            @change=${() => {
              fill.set(true);
              piece.update();
            }}
          />
          in order, filling each row</label
        >
        <label
          ><input
            type="radio"
            name=${piece.id + "-fill"}
            ?checked=${!fill.value}
            @change=${() => {
              fill.set(false);
              piece.update();
            }}
          />
          in the square I click</label
        >
      </fieldset>`;
  }

  /** The few settings that matter for each kind of piece
   * @param {TreeBase} piece */
  pieceSettings(piece) {
    /** @param {string} label @param {any} prop */
    const text = (label, prop) => html`<label class="piece-field">
      <span>${label}</span>
      <input
        type="text"
        .value=${String(prop.value)}
        @change=${(/** @type {Event} */ e) => {
          prop.set(/** @type {HTMLInputElement} */ (e.target).value);
          piece.update();
        }}
      />
    </label>`;

    switch (piece.className) {
      case "Grid":
        return howToFill();
      case "Display": {
        const size = piece["fontSize"];
        const sizes = [
          ["Small", 1.5],
          ["Medium", 2],
          ["Large", 3],
          ["Extra large", 4],
        ];
        // a size set elsewhere stays selectable
        if (!sizes.some(([, value]) => value == size.value)) {
          sizes.push([`Custom (${size.value})`, size.value]);
        }
        return html`<label class="piece-field">
            <span>Text size</span>
            <select
              @change=${(/** @type {Event} */ e) => {
                size.set(/** @type {HTMLSelectElement} */ (e.target).value);
                piece.update();
              }}
            >
              ${sizes.map(
                ([label, value]) =>
                  html`<option value=${value} ?selected=${size.value == value}>
                    ${label}
                  </option>`,
              )}
            </select>
          </label>
          <label class="piece-field piece-check">
            <input
              type="checkbox"
              ?checked=${!!clearButtonFor(piece)}
              @change=${() => toggleClearButton(piece)}
            />
            <span>Clear button next to it</span>
          </label>`;
      }
      case "Button":
        return html`${text("Says", piece["label"])}`;
      case "TabControl":
        return html`<div class="piece-field piece-tabs">
            <span>Tabs</span>
            ${piece.children.map(
              (tab) => html`<input
                type="text"
                aria-label="Tab name"
                .value=${String(tab["label"].value)}
                @change=${(/** @type {Event} */ e) =>
                  renameTab(tab, /** @type {HTMLInputElement} */ (e.target).value)}
              />`,
            )}
            <button class="piece-action" @click=${() => addTab(piece)}>
              + Add a tab
            </button>
          </div>
          <p class="piece-hint">
            Click a tab on the board to show it, then click inside it to
            change what it holds.
          </p>`;
      case "TabPanel":
        return html`${text("Tab name", {
          get value() {
            return piece["label"].value;
          },
          set: (/** @type {string} */ value) => renameTab(piece, value),
        })}`;
      default:
        return html`<p class="piece-hint">
          This piece's settings are in Advanced → Components.
        </p>`;
    }
  }

  /**
   * Show/hide .settings elements based on search query
   * @param {string} query
   * @param {string} rootId - the element holding the tree
   */
  _applySearch(query, rootId) {
    const panel = document.getElementById(rootId);
    if (!panel) return;
    const q = query.trim().toLowerCase();
    const allSettings = /** @type {NodeListOf<HTMLElement>} */ (
      panel.querySelectorAll(".settings")
    );
    if (!q) {
      // Show everything
      for (const el of allSettings) {
        el.style.display = "";
      }
      return;
    }
    // First pass: determine which elements match
    const matches = new Set();
    for (const el of allSettings) {
      const summary = el.querySelector("summary");
      const text = (summary?.textContent || el.textContent || "").toLowerCase();
      if (text.includes(q)) {
        matches.add(el);
        // Also mark all ancestors
        let parent = el.parentElement;
        while (parent && parent !== panel) {
          if (parent.classList.contains("settings")) matches.add(parent);
          parent = parent.parentElement;
        }
      }
    }
    // Second pass: show/hide
    for (const el of allSettings) {
      el.style.display = matches.has(el) ? "" : "none";
    }
  }

  allowedChildren = ["Page"];

  /**
   * An opportunity to upgrade the format if needed
   * @param {any} obj
   * @returns {Object}
   */
  static upgrade(obj) {
    /** @param {Object} obj */
    function oldToNew(obj) {
      if ("type" in obj) {
        // convert to new representation
        const newObj = {
          children: obj.children.map((/** @type {Object} */ child) =>
            oldToNew(child),
          ),
        };
        if ("filters" in obj.props) {
          for (const filter of obj.props.filters) {
            newObj.children.push({
              className: "GridFilter",
              props: { ...filter },
              children: [],
            });
          }
        }
        newObj.className = typeToClassName[obj.type];
        const { filters, ...props } = obj.props;
        newObj.props = props;
        obj = newObj;
      }
      return obj;
    }
    obj = oldToNew(obj);
    // make sure it begins with Layout
    if (obj.className != "Layout" && obj.className == "Page") {
      obj = {
        className: "Layout",
        props: { name: "Layout" },
        children: [obj],
      };
    }
    return obj;
  }

  /** Allow highlighting the current component in the UI
   */
  highlight() {
    // clear any existing highlight
    for (const element of document.querySelectorAll("#UI [highlight]")) {
      element.removeAttribute("highlight");
    }
    // find the selection in the panel
    let selected = document.querySelector("#designer .layout [aria-selected]");
    if (!selected) return;
    selected = selected.closest("[id]");
    if (!selected) return;
    const id = selected.id;
    if (!id) return;
    let component = TreeBase.componentFromId(id);
    if (component) {
      const element = document.getElementById(component.id);
      if (element) {
        element.setAttribute("highlight", "component");
        return;
      }
      // the component is not currently visible. Find its nearest visible parent
      component = component.parent;
      while (component) {
        const element = document.getElementById(component.id);
        if (element) {
          element.setAttribute("highlight", "parent");
          return;
        }
        component = component.parent;
      }
    }
  }

  makeVisible() {
    let component = Globals.designer.selectedComponent;
    if (component) {
      const element = document.getElementById(component.id);
      if (element) {
        return; // already visible
      }
      // climb the tree scheduling updates to parent to make this component visible
      component = component.parent;
      let patch = {};
      while (component) {
        if (
          component instanceof TabPanel &&
          component.parent &&
          component.parent.currentPanel != component
        ) {
          patch[component.parent.stateName.value] = component.name.value;
        } else if (component instanceof ModalDialog) {
          patch[component.stateName.value] = 1;
        }
        component = component.parent;
      }
      callAfterRender(() => this.highlight());
      Globals.state.update(patch);
    }
  }
  /**
   * Merge an object into the panel contents
   * @param {ExternalRep} obj
   * @returns {Promise<void>}
   */
  async merge(obj) {
    console.assert(obj.className == "Layout", obj);
    const toMerge = obj.children[0].children;
    const page = this.children[0];
    for (let newChild of toMerge) {
      if (newChild.className == "Speech") continue;
      TreeBase.fromObject(newChild, page);
    }
    this.onUpdate();
  }
}
TreeBase.register(Layout, "Layout");

/** The full component tree, as a tab of its own under Advanced, so the
 * Layout tab stays simple */
export class ComponentsPanel extends DesignerPanel {
  settings() {
    return html`<div
      class=${this.CSSClasses("layout components")}
      help="Components tab"
      id=${this.id}
      @keydown=${(/** @type {KeyboardEvent} */ event) => {
        if (event.key.toLowerCase() == "h" && event.ctrlKey) {
          event.preventDefault();
          Globals.layout.highlight();
        }
      }}
    >
      ${Globals.layout.treeView(this.id)}
    </div>`;
  }

  // the tree is the layout's, and so is its undo history
  async undo() {
    await Globals.layout.undo();
  }

  async redo() {
    await Globals.layout.redo();
  }
}
TreeBase.register(ComponentsPanel, "ComponentsPanel");

// ── On the board: + buttons around the selected piece, and a grip to drag
// it somewhere else (designer only) ──────────────────────────────────────

/** @typedef {"above" | "below" | "left" | "right"} Side */

/** The side whose piece menu is open, and the piece it is for */
let overlayMenu = /** @type {Side | null} */ (null);
let overlayFor = /** @type {TreeBase | null} */ (null);

/** @param {string} id */
function fixedElement(id) {
  let element = document.getElementById(id);
  if (!element) {
    element = document.createElement("div");
    element.id = id;
    document.body.append(element);
  }
  return element;
}

/** Draw the + buttons and grip over the selected piece */
function drawOverlay() {
  const overlay = fixedElement("piece-overlay");
  const layout = Globals.layout;
  const piece = Globals.state?.get("editing") ? layout?.selected : null;
  const unit = piece && pieceUnit(piece);
  const element = unit && document.getElementById(unit.id);
  if (!piece || !element || piece.className === "TabPanel" || layout._adding) {
    overlay.hidden = true;
    overlayMenu = null;
    return;
  }
  if (overlayFor !== piece) {
    overlayMenu = null;
    overlayFor = piece;
  }
  const box = element.getBoundingClientRect();
  overlay.hidden = false;
  Object.assign(overlay.style, {
    left: `${box.left}px`,
    top: `${box.top}px`,
    width: `${box.width}px`,
    height: `${box.height}px`,
  });
  /** @type {[Side, string][]} */
  const sides = [
    ["above", "Add a piece above"],
    ["below", "Add a piece below"],
    ["left", "Add a piece to the left"],
    ["right", "Add a piece to the right"],
  ];
  // each + sits on the middle of its edge, in the gap between pieces, and
  // moves in only where the piece meets the edge of the board
  const board = document.getElementById("UI")?.getBoundingClientRect() ?? box;
  const size = 24;
  const half = size / 2;
  /** @param {number} at @param {number} least @param {number} most */
  const clamp = (at, least, most) => Math.min(Math.max(at, least), most);
  const across = (/** @type {number} */ length) => length / 2 - half;
  const minX = board.left + 2 - box.left;
  const maxX = board.right - size - 2 - box.left;
  const minY = board.top + 2 - box.top;
  const maxY = board.bottom - size - 2 - box.top;
  /** @type {Record<Side, {left: number, top: number}>} */
  const spots = {
    above: { left: across(box.width), top: clamp(-half, minY, maxY) },
    below: { left: across(box.width), top: clamp(box.height - half, minY, maxY) },
    left: { left: clamp(-half, minX, maxX), top: across(box.height) },
    right: { left: clamp(box.width - half, minX, maxX), top: across(box.height) },
  };
  const menu = overlayMenu
    ? html`<div class=${`overlay-menu ${overlayMenu}`} role="menu">
        ${pieceKinds.map(
          (kind) => html`<button
            role="menuitem"
            @click=${() => {
              const side = /** @type {Side} */ (overlayMenu);
              overlayMenu = null;
              layout._selected = addPiece(kind.kind, piece, side);
            }}
          >
            <span aria-hidden="true">${kind.icon}</span> ${kind.label}
          </button>`,
        )}
      </div>`
    : html``;
  render(
    overlay,
    html`${sides.map(
        ([side, label]) => html`<button
          class=${`overlay-add ${side}${overlayMenu === side ? " open" : ""}`}
          style=${`left: ${spots[side].left}px; top: ${spots[side].top}px`}
          aria-label=${label}
          title=${label}
          aria-expanded=${overlayMenu === side}
          @click=${() => {
            overlayMenu = overlayMenu === side ? null : side;
            Globals.state.update();
          }}
        >
          +
        </button>`,
      )}
      <button
        class=${box.top > 30 ? "overlay-grip" : "overlay-grip inside"}
        title="Drag to move it"
        aria-label="Drag to move it"
        @pointerdown=${(/** @type {PointerEvent} */ e) => startDrag(e, piece)}
      >
        ⠿ Move
      </button>
      ${menu}`,
  );
}

/**
 * Drag the selected piece by its grip; dropping it on another piece puts
 * it on the side of that piece nearest the pointer.
 * @param {PointerEvent} event
 * @param {TreeBase} piece
 */
function startDrag(event, piece) {
  if (!event.isPrimary) return;
  event.preventDefault();
  const board = document.getElementById("UI");
  const indicator = fixedElement("piece-drop");
  indicator.hidden = true;
  document.body.classList.add("piece-dragging");
  clearCues(); // no hover highlight left on the board while dragging
  overlayMenu = null;
  /** @type {{target: TreeBase, side: Side | "inside"} | null} */
  let drop = null;

  const move = (/** @type {PointerEvent} */ e) => {
    e.stopPropagation(); // the board doesn't react while a piece is dragged
    const under = document
      .elementsFromPoint(e.clientX, e.clientY)
      .find((el) => board?.contains(el));
    const target = under ? pieceAt(under) : null;
    const element = target && document.getElementById(pieceUnit(target).id);
    if (!target || !element || !canDropOn(piece, target)) {
      drop = null;
      indicator.hidden = true;
      return;
    }
    const box = element.getBoundingClientRect();
    /** @type {Side | "inside"} */
    let side = "inside";
    if (target.className !== "TabPanel") {
      const x = (e.clientX - box.left) / box.width;
      const y = (e.clientY - box.top) / box.height;
      /** @type {[Side, number][]} */
      const distances = [
        ["above", y],
        ["below", 1 - y],
        ["left", x],
        ["right", 1 - x],
      ];
      side = distances.reduce((a, b) => (b[1] < a[1] ? b : a))[0];
    }
    drop = { target, side };
    indicator.hidden = false;
    indicator.className = side;
    Object.assign(indicator.style, {
      left: `${box.left}px`,
      top: `${box.top}px`,
      width: `${box.width}px`,
      height: `${box.height}px`,
    });
  };
  const end = (/** @type {Event} */ e) => {
    e.stopPropagation();
    window.removeEventListener("pointerover", quiet, true);
    window.removeEventListener("pointerout", quiet, true);
    window.removeEventListener("pointermove", move, true);
    window.removeEventListener("pointerup", end, true);
    window.removeEventListener("pointercancel", end, true);
    document.body.classList.remove("piece-dragging");
    indicator.hidden = true;
    if (drop && e.type === "pointerup") movePieceTo(piece, drop.target, drop.side);
  };
  // the board's hover highlight (switch access) watches these; it stays
  // quiet while a piece is dragged
  const quiet = (/** @type {Event} */ e) => e.stopPropagation();
  // on the window, ahead of the board's own pointer handling
  window.addEventListener("pointerover", quiet, true);
  window.addEventListener("pointerout", quiet, true);
  window.addEventListener("pointermove", move, true);
  window.addEventListener("pointerup", end, true);
  window.addEventListener("pointercancel", end, true);
}

document.addEventListener("rendercomplete", drawOverlay);
window.addEventListener("resize", drawOverlay);
document.addEventListener("scroll", drawOverlay, true);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && overlayMenu) {
    overlayMenu = null;
    drawOverlay();
  }
});

/** @param {TreeBase} node @returns {boolean} */
function hasWordGrid(node) {
  return (
    (node.className === "Grid" && node["name"]?.value !== "suggestions") ||
    node.children.some(hasWordGrid)
  );
}

/** How to put words and pictures into a word grid, shown prominently */
function howToFill() {
  return html`<div class="piece-howto" role="note">
    <strong>Fill the grid on the board:</strong>
    <div class="howto-row">
      <span class="howto-gesture">Click</span>
      <span>a square to type a word</span>
    </div>
    <div class="howto-row">
      <span class="howto-gesture">Click a picture</span>
      <span>to choose a better one</span>
    </div>
    <div class="howto-row">
      <span class="howto-gesture">Double-click</span>
      <span>to use a picture from your computer</span>
    </div>
    <small>Enter moves on to the next square. Paste a list to fill many.</small>
  </div>`;
}

// In the designer, clicking a piece on the board selects it for the
// Layout tab (capture phase, before the piece handles the click itself)
document.addEventListener(
  "click",
  (event) => {
    if (!Globals.state?.get("editing") || !Globals.layout) return;
    const board = document.getElementById("UI");
    if (!board || !board.contains(/** @type {Node} */ (event.target))) return;
    if (event.target instanceof Element && event.target.closest(".resize-handle")) return;
    Globals.layout.select(pieceAt(event.target));
  },
  true,
);
