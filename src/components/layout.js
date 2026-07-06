import { html } from "uhtml";
import { TreeBase } from "./treebase";
import { DesignerPanel } from "./designer";
import * as Props from "./props";
import "css/layout.css";
import Globals from "app/globals";
import { TabPanel } from "./tabcontrol";
import { callAfterRender } from "app/render";
import { ModalDialog } from "./modal-dialog";

const emptyPage = {
  className: "Page",
  props: {},
  children: [
    {
      className: "Speech",
      props: {},
      children: [],
    },
  ],
};

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
  static defaultValue = emptyPage;

  uiScale = new Props.Float(0.7);

  /** @type {string} */
  _searchQuery = "";

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
      <details class="panel-help">
        <summary>About the Layout tab</summary>
        <div class="panel-help-body">
          <p>Build your board's visual structure here. The tree below shows every component on the board — pages, containers, buttons, displays, and more.</p>
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
    </div>`;
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
