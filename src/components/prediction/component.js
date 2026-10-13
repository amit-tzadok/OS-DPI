import { html } from "uhtml";
import { TreeBase } from "../treebase";
import * as Props from "../props";
import Globals from "app/globals";
import { toString } from "../slots";
import { cursor } from "../notes";
import {
  predictorChoices,
  getPredictor,
  splitText,
  learn,
  learnedWordCount,
  forgetLearned,
} from "./index";
import { aiSettings } from "../ai/settings";
import "css/prediction.css";

/** Grid that the one-click setup creates and wires up */
const GRID_NAME = "predictions";

/**
 * Word prediction for a page. Invisible on the board: it watches the text
 * being built (normally $Display), asks the chosen predictor for words,
 * and publishes them two ways a board can use:
 *
 *  - as rows tagged prediction='1' (best first), so any Grid with the filter
 *    `#prediction equals '1'` shows them as buttons;
 *  - as the states $Prediction1, $Prediction2, … for binding one word to a
 *    specific Button or Display.
 */
export class Prediction extends TreeBase {
  predictor = new Props.Select(predictorChoices, {
    defaultValue: "adaptive",
    label: "Predictor",
  });
  stateName = new Props.String("$Display", {
    label: "Predict from",
    title: "The state holding the message being built",
  });
  count = new Props.Integer(6, { min: 1, max: 20, label: "How many words" });
  learnFrom = new Props.String("$Speak", {
    label: "Learn from",
    title:
      "Words spoken through this state are remembered by the 'Learns from the user' and AI predictors. Leave empty to turn learning off.",
  });

  /** Inputs of the last prediction; unchanged inputs aren't recomputed */
  _lastKey = "";
  /** Words currently published */
  /** @type {string[]} */
  _words = [];
  /** @type {AbortController | null} */
  _abort = null;
  /** @type {number | null} */
  _timer = null;
  /** Shown in the settings after the setup button is used */
  _setupNote = "";

  template() {
    const { state } = Globals;
    const learnFrom = this.learnFrom.value.trim();
    if (learnFrom && state.hasBeenUpdated(learnFrom)) {
      learn(toString(state.get(learnFrom)).replace(cursor, ""));
      this._lastKey = ""; // the learned words may change the ranking
    }
    const text = toString(state.get(this.stateName.value)).replace(cursor, "");
    const key = `${this.predictor.value}\u0000${this.count.value}\u0000${text}`;
    if (key !== this._lastKey) {
      this._lastKey = key;
      this._predict(text);
    }
    return html`<div />`;
  }

  /** @param {string} text */
  _predict(text) {
    this._abort?.abort();
    if (this._timer !== null) clearTimeout(this._timer);
    const abort = (this._abort = new AbortController());

    /** @type {import("./index").PredictContext} */
    const ctx = {
      text,
      ...splitText(text),
      count: this.count.value || 6,
      vocabulary: boardVocabulary(),
      signal: abort.signal,
    };
    const predictor = getPredictor(this.predictor.value);
    if (!predictor.slow) {
      Promise.resolve(predictor.predict(ctx)).then((words) => {
        if (!abort.signal.aborted) this._publish(words);
      });
      return;
    }
    // A network predictor: show local words now, then the better words
    // once the user pauses and they arrive
    this._publish(/** @type {string[]} */ (getPredictor("adaptive").predict(ctx)));
    this._timer = window.setTimeout(async () => {
      this._timer = null;
      try {
        const words = await predictor.predict(ctx);
        if (!abort.signal.aborted && words.length) this._publish(words);
      } catch (error) {
        if (!abort.signal.aborted) {
          console.warn("Prediction: keeping local words;", error);
        }
      }
    }, 350);
  }

  /** @param {string[]} words */
  _publish(words) {
    if (
      words.length === this._words.length &&
      words.every((w, i) => w === this._words[i])
    ) {
      return;
    }
    const previousCount = this._words.length;
    this._words = words;
    Globals.data.setPredictionRows(
      words.map((label, i) => ({ label, prediction: "1", rank: i + 1 })),
    );
    /** @type {Object<string, string>} */
    const patch = {};
    const slots = Math.max(this.count.value || 6, previousCount);
    for (let i = 0; i < slots; i++) patch[`$Prediction${i + 1}`] = words[i] || "";
    Globals.state.update(patch);
  }

  /** One click: a predictions grid next to the message display, and the
   * action that puts a tapped word into the message */
  _setUpGrid() {
    // the Page; Prediction is only allowed directly on one
    const page = this.parent;
    if (!page) return;
    const stateName = this.stateName.value;

    if (!findNode(page, (n) => n.className === "Grid" && n.name?.value === GRID_NAME)) {
      // put the grid right below the Display showing the message, so the
      // words sit where the user is already looking
      const display = findNode(
        page,
        (n) => n.className === "Display" && n.stateName?.value === stateName,
      );
      const container =
        display?.parent || findNode(page, (n) => n.className === "Stack") || page;
      const grid = TreeBase.fromObject(
        {
          className: "Grid",
          props: {
            name: GRID_NAME,
            rows: 1,
            columns: this.count.value || 6,
            fillItems: true,
            scale: 1,
            background: "white",
          },
          children: [
            {
              className: "GridFilter",
              props: { field: "#prediction", operator: "equals", value: "'1'" },
              children: [],
            },
          ],
        },
        container,
      );
      grid.moveTo(display ? display.index + 1 : 0);
    }

    const { actions } = Globals;
    if (
      actions &&
      !actions.children.some((rule) => rule.origin?.value === GRID_NAME)
    ) {
      const rule = TreeBase.fromObject(
        {
          className: "Action",
          props: { origin: GRID_NAME },
          children: [
            { className: "ActionCondition", props: { Condition: "" }, children: [] },
            {
              className: "ActionUpdate",
              // complete() replaces the partly typed word, or adds the
              // word when the message ends in a space
              props: { stateName, newValue: "complete(#label + ' ')" },
              children: [],
            },
            {
              // boards built on the keyboard example track the partial
              // word separately; reset it there too
              className: "ActionUpdate",
              props: { stateName: "$prefix", newValue: "''" },
              children: [],
            },
          ],
        },
        actions,
      );
      // only the first matching rule fires; go ahead of any catch-all rule
      rule.moveTo(0);
      actions.update();
    }

    this._setupNote = `Added a "${GRID_NAME}" grid and the action for it. Resize or move the grid like any other.`;
    this.update();
  }

  settingsDetails() {
    const predictor = getPredictor(this.predictor.value);
    const learnedCount = learnedWordCount();
    return [
      ...super.settingsDetails(),
      html`<div class="prediction-help">
        <p>${predictor.description}</p>
        ${predictor.id === "ai" ? aiSettings() : html``}
        <p>
          Show the words with a Grid filtered by
          <code>#prediction equals '1'</code>, or bind a Button to
          <code>$Prediction1</code>, <code>$Prediction2</code>, …
        </p>
        <button type="button" @click=${() => this._setUpGrid()}>
          Add a predictions grid to this page
        </button>
        ${this._setupNote ? html`<p class="prediction-note">${this._setupNote}</p>` : html``}
        <button
          type="button"
          ?disabled=${!learnedCount}
          @click=${() => {
            if (
              window.confirm(
                `Forget the ${learnedCount} words learned on this device?`,
              )
            ) {
              forgetLearned();
              this._lastKey = "";
              Globals.state.update();
            }
          }}
        >
          Forget learned words (${learnedCount})
        </button>
      </div>`,
    ];
  }
}
TreeBase.register(Prediction, "Prediction");

/**
 * Depth-first search of the layout
 * @param {any} node
 * @param {(node: any) => boolean} test
 * @returns {any}
 */
function findNode(node, test) {
  if (test(node)) return node;
  for (const child of node.children || []) {
    const found = findNode(child, test);
    if (found) return found;
  }
  return null;
}

/** @type {{rows: unknown, words: string[]}} */
let vocabularyCache = { rows: null, words: [] };

/** Single words used as labels on this board; refreshed when the content
 * changes */
function boardVocabulary() {
  const rows = Globals.data.contentRows;
  if (vocabularyCache.rows !== rows) {
    const words = new Set();
    for (const row of rows) {
      const label = String(row.label ?? "").trim();
      if (/^[\w']+$/.test(label) && label.length > 1) words.add(label);
    }
    vocabularyCache = { rows, words: [...words] };
  }
  return vocabularyCache.words;
}
