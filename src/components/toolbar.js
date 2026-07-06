import { TreeBase } from "./treebase";
import { Stack } from "./stack";
import { PatternGroup } from "components/access/pattern";
import { Page } from "components/page";
import { Layout } from "components/layout";

import "css/toolbar.css";
import db from "app/db";
import { html, render } from "uhtml";
import Globals from "app/globals";
import { Menu, MenuItem } from "./menu";
import { callAfterRender } from "app/render";
import { fileOpen } from "browser-fs-access";
import pleaseWait from "components/wait";
import { DB, unPackDesign } from "app/db";
import { Designer } from "./designer";
import { readSheetFromBlob, saveContent } from "app/spreadsheet";
import { SaveLog, SaveLogXLSX, ClearLog } from "./logger";
import { friendlyName, wikiName } from "./names";
import { showToast } from "./errors";

import { workerUpdateButton } from "components/serviceWorker";
import { monkey } from "components/monkeyTest";

/** Return a list of available Menu items on this component
 *
 * @param {TreeBase} component
 * @param {"add" | "delete" | "move" | "all"} which - which actions to return
 * @param {function} wrapper
 * @returns {MenuItem[]}
 */
export function getComponentMenuItems(component, which = "all", wrapper) {
  /** @type {MenuItem[]} */
  const result = [];

  // add actions
  if (which == "add" || which == "all") {
    for (const className of component.allowedChildren.sort()) {
      result.push(
        new MenuItem({
          label: `${friendlyName(className)}`,
          callback: wrapper(() => {
            const result = TreeBase.create(className, component);
            result.init();
            return result.id;
          }),
        }),
      );
    }
  }
  // delete
  if (which == "delete" || which == "all") {
    result.push(
      new MenuItem({
        label: `Delete`,
        title: `Delete ${friendlyName(component.className)}`,
        callback: wrapper(() => {
          // remove returns the id of the nearest neighbor or the parent
          const nextId = component.remove();
          return nextId;
        }),
        disable: !component.allowDelete,
      }),
    );
  }

  // move
  if (which == "move" || which == "all") {
    const parent = component.parent;
    if (parent) {
      const index = component.index;

      if (index > 0) {
        // moveup
        result.push(
          new MenuItem({
            label: `Move up`,
            title: `Move up ${friendlyName(component.className)}`,
            callback: wrapper(() => {
              component.moveUpDown(true);
              return component.id;
            }),
            disable: !component.allowDelete,
          }),
        );
      }
      if (index < parent.children.length - 1) {
        // movedown
        result.push(
          new MenuItem({
            label: `Move down`,
            title: `Move down ${friendlyName(component.className)}`,
            callback: wrapper(() => {
              component.moveUpDown(false);
              return component.id;
            }),
            disable: !component.allowDelete,
          }),
        );
      }
    }
  }
  return result;
}

/**
 * Determines valid menu items given a menu type.
 * @param {"add" | "delete" | "move" | "all"} type
 * @return {{ child: MenuItem[], parent: MenuItem[]}}
 * */
export function getPanelMenuItems(type) {
  // Figure out which tab is active
  const { designer } = Globals;
  const panel = designer.currentPanel;

  // Ask that tab which component is focused
  if (!panel) {
    return { child: [], parent: [] };
  }
  const component =
    TreeBase.componentFromId(panel.lastFocused) || panel.children[0] || panel;
  if (!component) {
    return { child: [], parent: [] };
  }
  if (component === panel) type = "add";

  /** @param {function():string} arg */
  function itemCallback(arg) {
    return () => {
      let nextId = arg();
      if (!panel) return;
      // we're looking for the settings view but we may have the id of the user view
      if (panel.lastFocused.startsWith(nextId)) {
        nextId = panel.lastFocused;
      }
      if (nextId.match(/^TreeBase-\d+$/)) {
        nextId = nextId + "-settings";
      }
      panel.lastFocused = nextId;
      callAfterRender(() => panel.parent?.restoreFocus());
      panel.update();
    };
  }

  // Ask that component for its menu actions
  let menuItems = getComponentMenuItems(component, type, itemCallback);

  // Add the parent's actions in some cases
  let parent = component.parent;

  let parentItems = new Map();
  for (let i = 0; i < 3; i++) {
    if (
      type !== "add" ||
      !parent ||
      parent instanceof Designer ||
      parent instanceof Layout ||
      (component instanceof Stack && parent instanceof Stack) ||
      (component instanceof PatternGroup && parent instanceof PatternGroup)
    ) {
      break;
    }

    for (const item of getComponentMenuItems(parent, type, itemCallback)) {
      if (!parentItems.has(item.label)) {
        parentItems.set(item.label, item);
      }
    }
    if (parentItems.size > 10) break;
    parent = parent.parent;
    // if (menuItems.length && parentItems.length) {
    //   parentItems[0].divider = "Parent";
    // }
    // menuItems = menuItems.concat(parentItems);
  }

  return { child: menuItems, parent: [...parentItems.values()] };
}

/** @param {ToolBar} bar */
function getFileMenuItems(bar) {
  return [
    new MenuItem({
      label: "Open",
      callback: () => {
        bar.designListDialog.open();
      },
    }),
    new MenuItem({
      label: "New",
      callback: async () => {
        const name = await db.uniqueName("new");
        window.open(`#${name}`, "_blank", `noopener=true`);
      },
    }),
    new MenuItem({
      label: "Import File",
      callback: async () => {
        const local_db = new DB();
        fileOpen({
          mimeTypes: ["application/octet-stream"],
          extensions: [".osdpi", ".zip"],
          description: "OS-DPI designs",
          id: "os-dpi",
        })
          .then((file) => pleaseWait(local_db.readDesignFromFile(file)))
          .then(() => {
            window.open(`#${local_db.designName}`, "_blank", `noopener=true`);
          })
          .catch((e) => {
            if (e?.name !== "AbortError")
              showToast(e?.message || "Import failed");
          });
      },
    }),
    new MenuItem({
      label: "Import URL",
      callback: () => bar.importURLDialog.open(),
    }),
    new MenuItem({
      label: "Download Backup",
      title: "Save a copy of this design to your computer (.osdpi file)",
      callback: () => {
        db.saveDesign();
      },
    }),
    new MenuItem({
      label: "Save & Close",
      title: "Download a backup, remove from browser storage, and close this window",
      callback: async () => {
        const saved = await db.saved();
        if (saved.indexOf(db.designName) < 0) {
          try {
            await db.saveDesign();
          } catch (e) {
            if (e instanceof DOMException) {
              // user canceled the save dialog — ignore
            } else {
              throw e;
            }
          }
        }
        await db.unload(db.designName);
        window.close();
      },
    }),
    new MenuItem({
      label: "Refetch design",
      callback: async () => {
        await db.reloadDesignFromOriginalURL();
      },
    }),
    new MenuItem({
      label: "Load Plugin",
      callback: async () => {
        const file = await fileOpen({
          mimeTypes: ["application/octet-stream"],
          extensions: [".osdpi", ".zip"],
          description: "OS-DPI designs",
          id: "os-dpi",
        });
        const design = await pleaseWait(unPackDesign(file));
        await Globals.designer.merge(design);
      },
    }),
    new MenuItem({
      label: "Load Sheet",
      title: "Load a spreadsheet of content",
      divider: "Content",
      callback: async () => {
        try {
          const blob = await fileOpen({
            extensions: [".csv", ".tsv", ".ods", ".xls", ".xlsx"],
            description: "Spreadsheets",
            id: "os-dpi",
          });
          if (blob) {
            sheet.handle = blob.handle;
            const result = await pleaseWait(readSheetFromBlob(blob));
            await db.write("content", result);
            Globals.data.setContent(result);
            Globals.state.update();
          }
        } catch (e) {
          sheet.handle = undefined;
        }
      },
    }),
    new MenuItem({
      label: "Reload sheet",
      title: "Reload a spreadsheet of content",
      callback:
        sheet.handle && // only offer reload if we have the handle
        (async () => {
          if (!sheet.handle) return;
          let blob;
          blob = await sheet.handle.getFile();
          if (blob) {
            const result = await pleaseWait(readSheetFromBlob(blob));
            await db.write("content", result);
            Globals.data.setContent(result);
            Globals.state.update();
          }
        }),
    }),
    new MenuItem({
      label: "Save sheet",
      title: "Save the content as a spreadsheet",
      callback: () => {
        pleaseWait(
          saveContent(db.designName, Globals.data.contentRows, "xlsx"),
        );
      },
    }),
    new MenuItem({
      label: "Save logs (CSV)",
      title: "Save any logs as a CSV file",
      divider: "Logs",
      callback: async () => {
        SaveLog();
      },
    }),
    new MenuItem({
      label: "Save logs (Excel)",
      title: "Save any logs as an Excel spreadsheet",
      callback: async () => {
        SaveLogXLSX();
      },
    }),
    new MenuItem({
      label: "Clear logs",
      title: "Clear any stored logs",
      callback: async () => {
        ClearLog();
      },
    }),
    new MenuItem({
      label: "Close editor",
      title: "Return to User mode",
      divider: "Editor",
      callback: () => {
        Globals.state.update({ editing: false });
      },
    }),
  ];
}

/** Copy (or cut) a component to the clipboard
 * @param {boolean} cut - true to cut
 */
async function copyComponent(cut = false) {
  const component = Globals.designer.selectedComponent;
  if (component) {
    const parent = component.parent;
    if (!(component instanceof Page) && !(parent instanceof Designer)) {
      const json = JSON.stringify(
        // don't include UID or OneOfGroup props in the copy
        component.toObject({ omittedProps: ["UID", "OneOfGroup"] }),
      );
      await navigator.clipboard.writeText(json);
      // also write to localStorage for cross-board paste
      localStorage.setItem("os-dpi-clipboard", json);
      if (cut) {
        component.remove();
        Globals.designer.currentPanel?.onUpdate();
      }
    }
  }
}

export function getEditMenuItems() {
  // Figure out which tab is active
  const { designer } = Globals;
  const panel = designer.currentPanel;
  const component = Globals.designer.selectedComponent;

  const canEdit = component && component.allowDelete;

  const undoLabel = panel?.changeStack.undoLabel || "";
  const redoLabel = panel?.changeStack.redoLabel || "";

  let items = [
    new MenuItem({
      label: undoLabel ? `Undo: ${undoLabel}` : "Undo",
      callback: panel?.changeStack.canUndo ? () => panel?.undo() : undefined,
      disable: !panel?.changeStack.canUndo,
    }),
    new MenuItem({
      label: redoLabel ? `Redo: ${redoLabel}` : "Redo",
      callback: panel?.changeStack.canRedo ? () => panel?.redo() : undefined,
      disable: !panel?.changeStack.canRedo,
    }),
    new MenuItem({
      label: "Copy",
      callback: copyComponent,
      disable: !canEdit,
    }),
    new MenuItem({
      label: "Cut",
      callback: async () => {
        copyComponent(true);
      },
      disable: !canEdit,
    }),
    new MenuItem({
      label: "Paste",
      callback: async () => {
        let json = await navigator.clipboard.readText().catch(() => "");
        if (!json) json = localStorage.getItem("os-dpi-clipboard") || "";
        // we can't trust this input from the clipboard, catch and report errors

        try {
          var obj = JSON.parse(json);
        } catch (e) {
          showToast("Clipboard does not contain a valid component (invalid JSON)");
          return;
        }
        const className = obj.className;
        if (!className) return;
        // find a place that can accept it
        const designer = Globals.designer;
        const panel = designer.currentPanel;
        if (!panel) return;
        const anchor = designer.selectedComponent;
        if (!anchor) return;
        /** @type {TreeBase | undefined } */
        let current = anchor;
        while (current) {
          if (current.allowedChildren.indexOf(className) >= 0) {
            const result = TreeBase.fromObject(obj, current);
            if (
              anchor.parent === result.parent &&
              result.index != anchor.index + 1
            ) {
              result.moveTo(anchor.index + 1);
            }
            callAfterRender(() => designer.focusOn(result.id));
            panel.onUpdate();
            return;
          }
          current = current.parent;
        }
      },
      disable: !canEdit,
    }),
    new MenuItem({
      label: "Duplicate",
      callback: () => {
        const component = Globals.designer.selectedComponent;
        if (!component?.allowDelete || !component.parent) return;
        const obj = component.toObject({ omittedProps: ["UID", "OneOfGroup"] });
        const clone = TreeBase.fromObject(obj, component.parent);
        clone.moveTo(component.index + 1);
        callAfterRender(() => designer.focusOn(clone.id));
        panel?.onUpdate();
      },
      disable: !canEdit,
    }),
    new MenuItem({
      label: "Paste Into",
      callback: async () => {
        let json = await navigator.clipboard.readText().catch(() => "");
        if (!json) json = localStorage.getItem("os-dpi-clipboard") || "";
        try {
          var obj = JSON.parse(json);
        } catch (e) {
          showToast("Clipboard does not contain a valid component (invalid JSON)");
          return;
        }
        const className = obj.className;
        if (!className) return;
        // find a place that can accept it
        const current = Globals.designer.selectedComponent;
        if (current && current.allowedChildren.indexOf(className) >= 0) {
          TreeBase.fromObject(obj, current);
          Globals.designer.currentPanel?.onUpdate();
        }
      },
      disable: !canEdit,
    }),
  ];
  const deleteItems = getPanelMenuItems("delete");
  const moveItems = getPanelMenuItems("move");
  items = items.concat(moveItems.child, deleteItems.child);
  const parentItems = moveItems.parent.concat(deleteItems.parent);
  if (parentItems.length > 0) {
    parentItems[0].divider = "Parents";
    items = items.concat(parentItems);
  }
  return items;
}

/** Open Wiki documentation in another tab
 * @param {string} name
 */
function openHelpURL(name) {
  const wiki = "https://github.com/unc-project-open-aac/os-dpi/wiki";

  const url = `${wiki}/${name}`;

  window.open(url, "help");
}

function getHelpMenuItems() {
  /** @type {MenuItem[]} */
  const items = [];
  const names = new Set();
  let component =
    Globals.designer.selectedComponent || Globals.designer.currentPanel;
  while (component && component.parent) {
    const className = component.className;
    const menuName = friendlyName(className);
    if (!names.has(menuName)) {
      items.push(
        new MenuItem({
          label: menuName,
          callback: openHelpURL,
          args: [wikiName(className)],
        }),
      );
      names.add(menuName);
    }
    component = component.parent;
  }
  items.push(
    new MenuItem({
      label: "About OS-DPI",
      callback: openHelpURL,
      args: ["About-Project-Open"],
    }),
  );

  if (location.host.match(/^localhost.*$|^bs-local.*$/)) {
    items.push(
      new MenuItem({
        label: "Test",
        callback: monkey,
      }),
    );
  }
  return items;
}

/**
 * @param {Hole} thing
 * @param {string} hint
 */
function hinted(thing, hint) {
  return html`<div hint=${hint}>${thing}</div>`;
}

const sheet = {
  /** @type {FileSystemFileHandle | undefined } */
  handle: undefined,
};

/**
 * Display a card gallery of all saved designs
 */
class DesignListDialog {
  /** Render the board gallery into the dialog (or refresh it if already open) */
  async open() {
    const dialog = /** @type {HTMLDialogElement} */ (
      document.getElementById("OpenDialog")
    );

    const renderGallery = async () => {
      const names = await db.names();
      const saved = await db.saved();

      const cards = names.map((name) => {
        const isCurrent = name === db.designName;
        const isSaved = saved.includes(name);
        // Build 1–2 letter avatar from words / segments in the board name
        const initials = (
          name
            .trim()
            .split(/[\s_-]+/)
            .slice(0, 2)
            .map((w) => w[0] || "")
            .join("") || name.slice(0, 2)
        ).toUpperCase();

        const previewSrc = `${location.pathname}?preview=1#${name}`;

        return html`<div
          class=${"board-card" + (isCurrent ? " board-card-current" : "")}
        >
          <div class="board-thumb-container">
            <iframe
              class="board-thumb"
              src=${previewSrc}
              tabindex="-1"
              aria-hidden="true"
            ></iframe>
          </div>
          <div class="board-card-avatar">${initials}</div>
          <div class="board-card-info">
            <div class="board-card-name">
              ${name}
              ${isCurrent
                ? html`<span class="board-current-badge">current</span>`
                : ""}
            </div>
            <div
              class=${"board-card-status " + (isSaved ? "saved" : "unsaved")}
            >
              ${isSaved ? "✓ Saved to disk" : "⚠ Not saved to disk"}
            </div>
          </div>
          <div class="board-card-actions">
            ${isCurrent
              ? ""
              : html`<a
                    class="board-card-open"
                    href=${"#" + name}
                    @click=${() => dialog.close()}
                    >Open</a
                  >
                  <button
                    class="board-card-remove"
                    title="Remove from browser storage"
                    @click=${async () => {
                      await db.unload(name);
                      renderGallery();
                    }}
                  >
                    Remove
                  </button>`}
          </div>
        </div>`;
      });

      const content = html`<div class="board-gallery-dialog">
        <div class="board-gallery-header">
          <h1>Your Boards</h1>
          <a class="board-gallery-home" href="/" title="Return to home page">← Home</a>
        </div>
        ${names.length === 0
          ? html`<p class="board-gallery-empty">
              No boards in browser storage. Import a file or create a new board.
            </p>`
          : html`<div class="board-gallery">${cards}</div>`}
        <div class="board-gallery-footer">
          <button
            class="board-gallery-new"
            @click=${async () => {
              const name = await db.uniqueName("new");
              window.open(`#${name}`, "_blank", `noopener=true`);
              dialog.close();
            }}
          >+ New Board</button>
          <button @click=${() => dialog.close()}>Close</button>
        </div>
      </div>`;

      render(dialog, content);
    };

    await renderGallery();
    if (!dialog.open) dialog.showModal();
  }

  template() {
    return html`<dialog id="OpenDialog"></dialog>`;
  }
}

class ImportURLDialog {
  /** @type { HTMLDialogElement} */
  current;

  template() {
    return html` <dialog id="ImportURL" ref=${this}>
      <h1>Import from a URL</h1>
      <input
        type="url"
        placeholder="Enter the URL to import"
        name="DesignURL"
      />
      <button
        @click=${() => {
          const input = this.current.querySelector("input");
          if (
            input instanceof HTMLInputElement &&
            !input.validationMessage &&
            input.value
          ) {
            const local_db = new DB();
            pleaseWait(local_db.readDesignFromURL(input.value)).then(
              () => {
                window.open(
                  `#${local_db.designName}`,
                  "_blank",
                  `noopener=true`,
                );
              },
              (e) => showToast(e?.message || "Import from URL failed"),
            );
            this.current.close();
          }
        }}
      >
        Import
      </button>
      <button @click=${() => this.current.close()}>Cancel</button>
    </dialog>`;
  }

  async open() {
    const url = await db.getDesignURL();
    const input = this.current.querySelector("input");
    if (input instanceof HTMLInputElement) input.value = url;
    this.current.showModal();
  }
}

/** Lazily create and open the keyboard shortcuts help dialog */
function showKeyboardHelp() {
  let dialog = /** @type {HTMLDialogElement | null} */ (
    document.getElementById("KeyboardHelp")
  );
  if (!dialog) {
    dialog = document.createElement("dialog");
    dialog.id = "KeyboardHelp";
    dialog.innerHTML = `
      <h1>Keyboard Shortcuts</h1>
      <table class="kbd-help-table">
        <tbody>
          <tr class="kbd-section"><td colspan="2">Navigation</td></tr>
          <tr><td><kbd>F</kbd></td><td>File menu</td></tr>
          <tr><td><kbd>E</kbd></td><td>Edit menu</td></tr>
          <tr><td><kbd>A</kbd></td><td>Add menu</td></tr>
          <tr><td><kbd>H</kbd></td><td>Help menu</td></tr>
          <tr><td><kbd>T</kbd></td><td>Designer tabs</td></tr>
          <tr><td><kbd>N</kbd></td><td>Board name</td></tr>
          <tr class="kbd-section"><td colspan="2">Designer panel</td></tr>
          <tr><td><kbd>↑</kbd> <kbd>↓</kbd></td><td>Move focus between settings</td></tr>
          <tr><td><kbd>Shift</kbd>+<kbd>↑</kbd>/<kbd>↓</kbd></td><td>Move component up / down</td></tr>
          <tr><td><kbd>Ctrl</kbd>+<kbd>Z</kbd></td><td>Undo</td></tr>
          <tr><td><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd></td><td>Redo</td></tr>
          <tr class="kbd-section"><td colspan="2">Buttons</td></tr>
          <tr><td>Click</td><td>Select button</td></tr>
          <tr><td><kbd>Shift</kbd>+Click</td><td>Add button to multi-selection</td></tr>
          <tr><td>Drag</td><td>Reorder button (flex) or snap to cell (grid)</td></tr>
        </tbody>
      </table>
      <button id="KeyboardHelpClose">Close</button>
    `;
    document.body.appendChild(dialog);
    dialog
      .querySelector("#KeyboardHelpClose")
      ?.addEventListener("click", () => dialog?.close());
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) dialog?.close();
    });
  }
  dialog.showModal();
}

export class ToolBar extends TreeBase {
  constructor() {
    super();
    this.fileMenu = new Menu("File", getFileMenuItems, this);
    this.editMenu = new Menu("Edit", getEditMenuItems);
    this.addMenu = new Menu(
      "Add",
      () => {
        const { child, parent } = getPanelMenuItems("add");
        if (parent.length > 0) {
          parent[0].divider = "Parent" + (parent.length > 1 ? "s" : "");
        }
        return child.concat(parent);
      },
      "add",
    );
    this.helpMenu = new Menu("Help", getHelpMenuItems, this);
    this.designListDialog = new DesignListDialog();
    this.importURLDialog = new ImportURLDialog();

    // Ensure only one menu is open at a time: wrap each menu's toggleExpanded
    // so it collapses all sibling menus before opening itself.
    const allMenus = [this.fileMenu, this.editMenu, this.addMenu, this.helpMenu];
    for (const menu of allMenus) {
      const original = menu.toggleExpanded;
      menu.toggleExpanded = (event = null, last = false) => {
        for (const other of allMenus) {
          if (other !== menu && other.expanded) {
            other.expanded = false;
          }
        }
        original(event, last);
      };
    }
  }

  template() {
    return html`
      <div class="toolbar brand">
        <ul>
          <li class="toolbar-breadcrumb">
            <a class="toolbar-home-link" href="/">Home</a>
            <span class="toolbar-sep">/</span>
            ${hinted(
              html`<input
                id="designName"
                type="text"
                aria-label="Board name"
                .value=${db.designName}
                .size=${Math.max(db.designName.length, 10)}
                @change=${(/** @type {InputEventWithTarget} */ event) =>
                  db
                    .renameDesign(event.target.value)
                    .then(() => (window.location.hash = db.designName))}
              />`,
              "N",
            )}
          </li>
          <li>
            ${
              // @ts-ignore
              hinted(this.fileMenu.render(), "F")
            }
          </li>
          <li>
            ${
              // @ts-ignore
              hinted(this.editMenu.render(), "E")
            }
          </li>
          <li>
            ${
              // @ts-ignore
              hinted(this.addMenu.render(), "A")
            }
          </li>
          <li>
            ${
              // @ts-ignore
              hinted(this.helpMenu.render(), "H")
            }
          </li>
          <li>${workerUpdateButton()}</li>
          <li>
            <button
              class="toolbar-kbd-help"
              title="Keyboard shortcuts"
              @click=${showKeyboardHelp}
            >?</button>
          </li>
          <li class="toolbar-preview-item">
            <button
              class="toolbar-preview-btn"
              title="Switch to user mode (Alt+D to return)"
              @click=${() => Globals.state.update({ editing: false })}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Preview
            </button>
          </li>
        </ul>
        ${this.designListDialog.template()} ${this.importURLDialog.template()}
      </div>
    `;
  }
}
TreeBase.register(ToolBar, "ToolBar");
