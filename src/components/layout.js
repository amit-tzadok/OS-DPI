import { html } from "uhtml";
import { TreeBase } from "./treebase";
import { DesignerPanel } from "./designer";
import * as Props from "./props";
import "css/layout.css";
import Globals from "app/globals";
import { TabPanel } from "./tabcontrol";
import { callAfterRender } from "app/render";
import { ModalDialog } from "./modal-dialog";
import {
  blankLayout,
  pieceKinds,
  pieceAt,
  pieceLabel,
  addPiece,
  addTab,
  renameTab,
  removePiece,
  toggleClearButton,
  moveTarget,
  movePiece,
  clearButtonFor,
  visualClasses,
} from "./pieces";
import { PictureChooser } from "./pictureChooser";

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

  /** Whether the full component tree is showing */
  _showTree = false;

  /** The "Find pictures" view, while it is open
   * @type {PictureChooser | null} */
  _pictures = null;

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
    this._pictures = null;
    // show the Layout tab, without moving focus off the board (a click
    // on an empty square there opens a text box)
    const designer = Globals.designer;
    const patch = component && designer ? { [designer.stateName.value]: this.name.value } : {};
    Globals.state.update(patch);
  }

  settings() {
    const self = this;
    return html`<div
      class=${this.CSSClasses("layout")}
      help="Layout tab"
      id=${this.id}
      @keydown=${(/** @type {KeyboardEvent} */ event) => {
        const { key, ctrlKey } = event;
        if ((key == "H" || key == "h") && ctrlKey) {
          event.preventDefault();
          this.highlight();
        }
      }}
    >
      ${this.simpleView()}
      <details
        class="layout-tree"
        ?open=${this._showTree}
        @toggle=${(/** @type {Event} */ e) => {
          this._showTree = /** @type {HTMLDetailsElement} */ (e.target).open;
        }}
      >
        <summary>All components (advanced)</summary>
      <details class="panel-help">
        <summary>About the Layout tab</summary>
        <div class="panel-help-body">
          <p>The full tree of every component on the board — pages, containers, buttons, displays, and more. For everyday building, use the pieces above instead.</p>
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
            self._searchQuery = input.value;
            self._applySearch(input.value);
          }}
        />
      </div>
      ${this.children[0].settings()}
      </details>
    </div>`;
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
    if (this._pictures && selected === this._pictures.grid) {
      body = this._pictures.template();
    } else if (this._adding) {
      body = this.addMenu();
    } else if (selected) {
      body = this.inspector(selected);
    } else if (empty) {
      this._adding = { anchor: null, side: "below" };
      body = this.addMenu();
    } else {
      const hasGrid = hasWordGrid(page);
      body = html`${hasGrid ? howToFill() : html``}
        <p class="piece-hint">Click a piece on the board to change it.</p>
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
        ${empty ? "Your board is empty. Add a first piece:" : `Add a piece ${where}`}
      </h3>
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
        ? html`<p class="piece-hint">
            Tip: start with a Message bar, then add a Word grid below it.
          </p>`
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
    /** @param {"above" | "below" | "left" | "right" | "inside"} side */
    const startAdding = (side) => {
      this._adding = { anchor: piece, side };
      Globals.state.update();
    };
    /** @type {["above" | "below" | "left" | "right", string][]} */
    const sides = [
      ["above", "↑ Up"],
      ["below", "↓ Down"],
      ["left", "← Left"],
      ["right", "→ Right"],
    ];
    const isTab = piece.className === "TabPanel";
    const canRemove = !isTab || (piece.parent?.children.length ?? 0) > 1;
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
      ${isTab
        ? piece.children.length
          ? html``
          : html`<button class="piece-action" @click=${() => startAdding("inside")}>
              + Add a piece inside this tab
            </button>`
        : html`<div class="piece-add">
            <span>Move it:</span>
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
          </div>
          <div class="piece-add">
            <span>Add a piece next to it:</span>
            <div class="piece-sides">
              <button @click=${() => startAdding("above")} aria-label="Add above">↑ Above</button>
              <button @click=${() => startAdding("below")} aria-label="Add below">↓ Below</button>
              <button @click=${() => startAdding("left")} aria-label="Add to the left">← Left</button>
              <button @click=${() => startAdding("right")} aria-label="Add to the right">→ Right</button>
            </div>
          </div>`}
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
      <p class="piece-hint">Drag the grey bars between pieces on the board to resize them.</p>
    </div>`;
  }

  /** The few settings that matter for each kind of piece
   * @param {TreeBase} piece */
  pieceSettings(piece) {
    /** @param {string} label @param {any} prop @param {number} min @param {number} max */
    const number = (label, prop, min, max) => html`<label class="piece-field">
      <span>${label}</span>
      <input
        type="number"
        min=${min}
        max=${max}
        .value=${String(prop.value)}
        @change=${(/** @type {Event} */ e) => {
          const input = /** @type {HTMLInputElement} */ (e.target);
          const value = Math.min(max, Math.max(min, Math.round(+input.value || min)));
          prop.set(value);
          piece.update();
        }}
      />
    </label>`;
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
      case "Grid": {
        const fill = piece["fillItems"];
        const findPictures = html`<button
          class="piece-action piece-ai"
          @click=${() => {
            this._pictures = new PictureChooser(piece, () => {
              this._pictures = null;
              Globals.state.update();
            });
            Globals.state.update();
          }}
        >
          ✨ Let AI pick pictures
        </button>`;
        return html`${howToFill(findPictures)} ${number("Rows", piece["rows"], 1, 12)}
          ${number("Columns", piece["columns"], 1, 12)}
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
          This piece's settings are in “All components (advanced)” below.
        </p>`;
    }
  }

  /**
   * Show/hide .settings elements based on search query
   * @param {string} query
   */
  _applySearch(query) {
    const panel = document.getElementById(this.id);
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

/** @param {TreeBase} node @returns {boolean} */
function hasWordGrid(node) {
  return (
    (node.className === "Grid" && node["name"]?.value !== "suggestions") ||
    node.children.some(hasWordGrid)
  );
}

/** How to put words and pictures into a word grid, shown prominently
 * @param {Hole} [extra] - shown at the end, e.g. the Find pictures button */
function howToFill(extra = html``) {
  return html`<div class="piece-howto" role="note">
    <strong>Fill the grid on the board:</strong>
    <div class="howto-row">
      <span class="howto-gesture">Click</span>
      <span>a square to type a word</span>
    </div>
    <div class="howto-row">
      <span class="howto-gesture">Double-click</span>
      <span>a square to add a picture</span>
    </div>
    <small>Enter moves on to the next square. Paste a list to fill many.</small>
    ${extra}
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
