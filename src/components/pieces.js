/**
 * The pieces a student builds a board from in the Layout tab — a message
 * bar, a word grid, a button and tabs — and the plumbing that makes each
 * one work as soon as it is added: it gets a unique name, the Actions rules
 * that make tapping it do the obvious thing, and a Speech component on the
 * page so there is a voice.
 *
 * Pieces are ordinary layout components (Grid, Display, Button,
 * TabControl, …) arranged in Stacks, so boards built here open in the full
 * component tree and everything else (switch scanning, AI generation)
 * keeps working.
 */
import { TreeBase } from "./treebase";
import Globals from "app/globals";

/** A brand-new board: an empty page */
export const blankLayout = {
  className: "Layout",
  // text big enough to read on a tablet; the whole board scales from this
  props: { name: "Layout", uiScale: "1.6" },
  children: [{ className: "Page", props: {}, children: [] }],
};

export const blankActions = { className: "Actions", props: {}, children: [] };

/** @param {string} origin @param {string} condition @param {[string, string][]} updates */
export function rule(origin, condition, updates) {
  return {
    className: "Action",
    props: { origin },
    children: [
      {
        className: "ActionCondition",
        props: { Condition: condition },
        children: [],
      },
      ...updates.map(([stateName, newValue]) => ({
        className: "ActionUpdate",
        props: { stateName, newValue },
        children: [],
      })),
    ],
  };
}

/** @typedef {"message" | "grid" | "button" | "tabs"} PieceKind */

/** What the Add menu offers, in order
 * @type {{kind: PieceKind, label: string, icon: string, about: string}[]} */
export const pieceKinds = [
  {
    kind: "message",
    label: "Message bar",
    icon: "💬",
    about: "Shows the sentence being built. Tap it to say it all.",
  },
  {
    kind: "grid",
    label: "Word grid",
    icon: "▦",
    about: "Rows of word buttons. Tap a word to say it.",
  },
  {
    kind: "button",
    label: "Button",
    icon: "▢",
    about: "One button that says a word or phrase.",
  },
  {
    kind: "tabs",
    label: "Tabs",
    icon: "🗂",
    about: "Pages of words to switch between, like Food and People.",
  },
];

/** How much room each kind of piece takes next to others to start with */
const defaultScale = { message: 1, grid: 4, button: 1, tabs: 4, clear: 1 };

/** Components a student can click on and change */
const selectable = new Set([
  "Grid",
  "Display",
  "Button",
  "TabControl",
  "TabPanel",
  "Radio",
  "VSD",
  "Gap",
  "Prediction",
]);

/** Components that take up room on the board */
export const visualClasses = new Set([
  "Stack",
  "Gap",
  "Grid",
  "Display",
  "Radio",
  "TabControl",
  "VSD",
  "Button",
  "Prediction",
]);

/** The friendly name for what a component is
 * @param {TreeBase} component */
export function pieceLabel(component) {
  switch (component.className) {
    case "Grid":
      return "Word grid";
    case "Display":
      return "Message bar";
    case "Button":
      return isClearButton(component) ? "Clear button" : "Button";
    case "TabControl":
      return "Tabs";
    case "TabPanel":
      return "Tab";
    case "VSD":
      return "Picture scene";
    case "Radio":
      return "Choices";
    case "Gap":
      return "Space";
    case "Prediction":
      return "Word prediction";
    default:
      return component.className;
  }
}

/** The piece under a click on the board, or null for the background
 * @param {EventTarget | null} target */
export function pieceAt(target) {
  if (!(target instanceof Element)) return null;
  const element = target.closest('[id^="TreeBase-"]');
  let component = element ? TreeBase.componentFromId(element.id) : undefined;
  while (component && !selectable.has(component.className)) {
    component = component.parent;
  }
  return component || null;
}

/** @param {TreeBase} component */
export function isClearButton(component) {
  return (
    component.className === "Button" &&
    /^clear\d*$/.test(String(component["name"]?.value))
  );
}

/** The board's page
 * @returns {TreeBase} */
function page() {
  return Globals.layout.children[0];
}

/** @param {TreeBase} node @returns {TreeBase[]} */
function allComponents(node) {
  return [node, ...node.children.flatMap(allComponents)];
}

/** A name no other component uses: grid, grid2, grid3, …
 * @param {string} base */
function uniqueName(base) {
  const used = new Set();
  for (const component of allComponents(Globals.layout)) {
    for (const prop of ["name", "Name", "stateName"]) {
      const value = component[prop]?.value;
      if (value) used.add(String(value).replace(/^\$/, ""));
    }
  }
  if (!used.has(base)) return base;
  for (let i = 2; ; i++) if (!used.has(base + i)) return base + i;
}

function gridSpec() {
  return {
    className: "Grid",
    props: {
      name: uniqueName("grid"),
      rows: "3",
      columns: "4",
      fillItems: "true",
      background: "white",
      scale: String(defaultScale.grid),
    },
    children: [],
  };
}

/** @param {string} label */
function tabSpec(label) {
  return {
    className: "TabPanel",
    props: { name: label, label, direction: "column" },
    children: [gridSpec()],
  };
}

/** The layout for a new piece of the given kind
 * @param {PieceKind | "clear"} kind */
function spec(kind) {
  switch (kind) {
    case "message":
      return {
        className: "Stack",
        props: { direction: "row", scale: String(defaultScale.message) },
        children: [
          {
            className: "Display",
            props: {
              stateName: "$Display",
              Name: uniqueName("display"),
              background: "white",
              fontSize: "2",
              scale: "5",
            },
            children: [],
          },
          spec("clear"),
        ],
      };
    case "clear":
      return {
        className: "Button",
        props: { label: "Clear", name: uniqueName("clear"), scale: "1" },
        children: [],
      };
    case "grid":
      return gridSpec();
    case "button":
      return {
        className: "Button",
        props: {
          label: "Hello",
          name: uniqueName("button"),
          scale: String(defaultScale.button),
        },
        children: [],
      };
    case "tabs": {
      // the tabs themselves are added once this is on the board, so their
      // grids get names that differ from each other (addPiece)
      const name = uniqueName("tabs");
      return {
        className: "TabControl",
        props: {
          name,
          stateName: "$" + name,
          tabEdge: "top",
          scale: String(defaultScale.tabs),
        },
        children: [],
      };
    }
  }
}

/** True for containers that line their children up in a row or column
 * @param {TreeBase | undefined} node */
function isFlexContainer(node) {
  return (
    !!node &&
    ["Page", "Stack", "TabPanel"].includes(node.className) &&
    !(node["columns"]?.value > 0)
  );
}

/**
 * Add a piece to the board.
 *
 * With no anchor it goes at the end of the page; "inside" puts it in an
 * (empty) tab; otherwise it goes above, below, left or right of the
 * anchor, wrapping the anchor in a new row or column when needed.
 *
 * @param {PieceKind | "clear"} kind
 * @param {TreeBase | null} anchor
 * @param {"above" | "below" | "left" | "right" | "inside"} [side]
 * @returns {TreeBase} the component to select afterwards
 */
export function addPiece(kind, anchor = null, side = "below") {
  let container = page();
  let index = container.children.length;

  // next to a message bar means next to it and its Clear button together
  if (anchor && kind !== "clear" && side !== "inside") {
    anchor = messageBar(anchor) ?? anchor;
  }

  if (anchor && side === "inside") {
    container = anchor;
    index = anchor.children.length;
  } else if (anchor && isFlexContainer(anchor.parent)) {
    const parent = /** @type {TreeBase} */ (anchor.parent);
    const axis = side === "above" || side === "below" ? "column" : "row";
    const after = side === "below" || side === "right" ? 1 : 0;
    const visualSiblings = parent.children.filter((c) =>
      visualClasses.has(c.className),
    );
    if (visualSiblings.length <= 1) parent["direction"].set(axis);
    if (parent["direction"].value === axis) {
      container = parent;
      index = anchor.index + after;
    } else {
      container = wrap(anchor, axis);
      anchor["scale"]?.set(defaultScale[kindOf(anchor)] ?? 1);
      index = after;
    }
  }

  const created = TreeBase.fromObject(spec(kind), container);
  created.moveTo(index);
  if (kind === "tabs") {
    for (const label of ["Tab 1", "Tab 2"]) {
      TreeBase.fromObject(tabSpec(label), created);
    }
  }
  setUp(allComponents(created));
  Globals.layout.update();
  // select the part a student would change next
  return created.className === "Stack" ? created.children[0] : created;
}

/** Put a component in a new row (or column) that takes its place
 * @param {TreeBase} component
 * @param {"row" | "column"} direction
 * @returns {TreeBase} the new row or column */
function wrap(component, direction) {
  const parent = /** @type {TreeBase} */ (component.parent);
  const wrapper = TreeBase.create("Stack", null, {
    direction,
    scale: component["scale"]?.value ?? 1,
  });
  parent.children[component.index] = wrapper;
  wrapper.parent = parent;
  component.parent = wrapper;
  wrapper.children = [component];
  return wrapper;
}

/** @param {TreeBase} component
 * @returns {PieceKind | "other"} */
function kindOf(component) {
  return (
    /** @type {Record<string, PieceKind>} */ ({
      Grid: "grid",
      Display: "message",
      Button: "button",
      TabControl: "tabs",
    })[component.className] ?? "other"
  );
}

/** Add a tab (with its own word grid) to a Tabs piece
 * @param {TreeBase} tabs
 * @returns {TreeBase} the new tab */
export function addTab(tabs) {
  const labels = new Set(tabs.children.map((tab) => tab["label"].value));
  let n = tabs.children.length + 1;
  while (labels.has(`Tab ${n}`)) n++;
  const tab = TreeBase.fromObject(tabSpec(`Tab ${n}`), tabs);
  setUp(allComponents(tab));
  Globals.state.update({ [tabs["stateName"].value]: tab["name"].value });
  Globals.layout.update();
  return tab;
}

/** Rename a tab, keeping it the one showing if it was
 * @param {TreeBase} tab
 * @param {string} label */
export function renameTab(tab, label) {
  label = label.trim();
  const tabs = tab.parent;
  if (!label || !tabs) return;
  const showing = Globals.state.get(tabs["stateName"].value) === tab["name"].value;
  tab["label"].set(label);
  tab["name"].set(label);
  if (showing) Globals.state.update({ [tabs["stateName"].value]: label });
  Globals.layout.update();
}

/**
 * Where a piece goes when moved one step up, down, left or right: past its
 * neighbor in that direction, or out of the row (or column) it shares with
 * others to sit beside that row. Null when it can't go that way.
 * @param {TreeBase} component
 * @param {"above" | "below" | "left" | "right"} side
 * @returns {{container: TreeBase, index: number, swap: boolean} | null}
 */
export function moveTarget(component, side) {
  const unit = messageBar(component) ?? component;
  const axis = side === "above" || side === "below" ? "column" : "row";
  const step = side === "above" || side === "left" ? -1 : 1;
  let child = unit;
  let container = unit.parent;
  while (container && isFlexContainer(container)) {
    if (container["direction"].value === axis) {
      const peers = container.children;
      const at = peers.indexOf(child);
      if (child !== unit) {
        return { container, index: step < 0 ? at : at + 1, swap: false };
      }
      let next = at + step;
      while (peers[next] && !visualClasses.has(peers[next].className)) {
        next += step;
      }
      if (peers[next]) return { container, index: next, swap: true };
    }
    child = container;
    container = container.parent;
  }
  return null;
}

/** Move a piece one step up, down, left or right (see moveTarget)
 * @param {TreeBase} component
 * @param {"above" | "below" | "left" | "right"} side */
export function movePiece(component, side) {
  const target = moveTarget(component, side);
  if (!target) return;
  const unit = messageBar(component) ?? component;
  if (target.swap) {
    unit.moveTo(target.index);
  } else {
    const from = /** @type {TreeBase} */ (unit.parent);
    from.children.splice(unit.index, 1);
    target.container.children.splice(target.index, 0, unit);
    unit.parent = target.container;
    tidy(from);
  }
  Globals.layout.update();
}

/**
 * Remove a piece and tidy up: a message bar goes with its Clear button,
 * and rows or columns left holding one piece are dissolved.
 * @param {TreeBase} component
 */
export function removePiece(component) {
  const target = messageBar(component) ?? component;
  const container = target.parent;
  target.remove();
  tidy(container);
  Globals.layout.update();
}

/** The row holding a message bar and its Clear button, if that is what
 * this display sits in
 * @param {TreeBase} component */
function messageBar(component) {
  const parent = component.parent;
  if (
    component.className === "Display" &&
    parent?.className === "Stack" &&
    parent.children.every((c) => c === component || isClearButton(c))
  ) {
    return parent;
  }
  return null;
}

/** Show or hide the Clear button next to a message bar
 * @param {TreeBase} display */
export function toggleClearButton(display) {
  const clear = clearButtonFor(display);
  if (clear) {
    removePiece(clear);
    return;
  }
  // the bar and its button share a row of their own
  const row = wrap(display, "row");
  display["scale"].set(5);
  TreeBase.fromObject(spec("clear"), row);
  setUp(row.children);
  Globals.layout.update();
}

/** @param {TreeBase} display */
export function clearButtonFor(display) {
  return display.parent?.children.find(isClearButton) ?? null;
}

/** Dissolve rows and columns that hold one piece or none
 * @param {TreeBase | undefined} node */
function tidy(node) {
  while (
    node &&
    node.className === "Stack" &&
    node.children.length <= 1 &&
    node.parent
  ) {
    const parent = node.parent;
    if (node.children.length === 1) {
      const only = node.children[0];
      only["scale"]?.set(node["scale"].value);
      parent.children[node.index] = only;
      only.parent = parent;
      node.children = [];
      TreeBase.idMap.delete(node.id);
    } else {
      node.remove();
    }
    node = parent;
  }
}

/**
 * Make new components work: rules so tapping does the obvious thing,
 * a voice on the page, and separate words for each word grid.
 * @param {TreeBase[]} added
 */
function setUp(added) {
  const actions = Globals.actions;
  const origins = new Set(actions.children.map((r) => r["origin"].value));
  /** @param {string} origin @param {string} condition @param {[string, string][]} updates */
  const addRule = (origin, condition, updates) => {
    if (!origin || origins.has(origin)) return;
    origins.add(origin);
    TreeBase.fromObject(rule(origin, condition, updates), actions);
  };
  const speakAndAdd = /** @type {[string, string][]} */ ([
    ["$Speak", "#label"],
    ["$Display", "add_word(#label)"],
  ]);
  for (const component of added) {
    if (component.className === "Grid") {
      addRule(component["name"].value, "", speakAndAdd);
    } else if (component.className === "Display") {
      const state = component["stateName"].value;
      addRule(component["Name"].value, state, [["$Speak", state]]);
    } else if (isClearButton(component)) {
      addRule(component["name"].value, "", [["$Display", "''"]]);
    } else if (component.className === "Button") {
      addRule(component["name"].value, "", speakAndAdd);
    }
  }
  actions.update();

  const board = page();
  if (!board.children.some((c) => c.className === "Speech")) {
    TreeBase.fromObject(
      { className: "Speech", props: { stateName: "$Speak" }, children: [] },
      board,
    );
  }

  separateGrids(added.filter((c) => c.className === "Grid"));
}

/**
 * With more than one word grid, each needs its own words: new grids show
 * words marked with their name (words typed into a grid are marked that
 * way, grid.js), and the grids already there keep the unmarked words, so
 * words loaded from a spreadsheet stay where they were.
 * @param {TreeBase[]} newGrids
 */
function separateGrids(newGrids) {
  const grids = allComponents(Globals.layout).filter(
    (c) => c.className === "Grid" && c["name"].value !== "suggestions",
  );
  if (grids.length < 2) return;
  for (const grid of grids) {
    if (grid.children.some((f) => f["field"].value === "#grid")) continue;
    const props = newGrids.includes(grid)
      ? { field: "#grid", operator: "equals", value: `'${grid["name"].value}'` }
      : { field: "#grid", operator: "empty", value: "" };
    TreeBase.fromObject({ className: "GridFilter", props, children: [] }, grid);
  }
}
