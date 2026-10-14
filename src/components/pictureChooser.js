import { html } from "uhtml";
import Globals from "app/globals";
import db from "app/db";
import { imageOrVideo } from "./grid";
import { pictureChoices } from "./pictograms";
import { aiReady } from "./ai";

/**
 * The Layout tab's "Find pictures" view for one word grid: every word
 * with a few matching symbols to pick from (pictograms.js), so a whole
 * grid gets pictures in a few clicks.
 */
export class PictureChooser {
  /** @type {Map<string, string[]>} label → picture choices */
  choices = new Map();
  loading = true;
  usedAI = false;

  /**
   * @param {import("./treebase").TreeBase} grid
   * @param {() => void} close
   */
  constructor(grid, close) {
    this.grid = grid;
    this.close = close;
    this.load();
  }

  /** The grid's own words (not predictions or notes), in board order */
  rows() {
    const { data } = Globals;
    return data
      .getMatchingRows(
        /** @type {import("./gridFilter").GridFilter[]} */ (this.grid.children),
        false,
      )
      .filter((row) => row.label && data.contentRows.includes(row));
  }

  async load() {
    const labels = [...new Set(this.rows().map((row) => String(row.label)))];
    const { choices, usedAI } = await pictureChoices(labels);
    this.choices = choices;
    this.usedAI = usedAI;
    this.loading = false;
    Globals.state.update();
  }

  /** Give a word this picture, or none
   * @param {Row} row
   * @param {string} symbol */
  async choose(row, symbol) {
    const { data } = Globals;
    const rows = [...data.contentRows];
    const index = rows.indexOf(row);
    if (index < 0) return;
    const { symbol: _old, ...rest } = row;
    rows[index] = symbol ? { ...rest, symbol } : rest;
    data.setContent(rows);
    await db.write("content", rows);
    Globals.state.update();
  }

  template() {
    const rows = this.rows();
    let status;
    if (!rows.length) {
      status = html`<p class="piece-hint">
        This grid has no words yet. Type some on the board first.
      </p>`;
    } else if (this.loading) {
      status = html`<p class="piece-hint" aria-live="polite">
        ${aiReady() ? "Asking the AI and finding pictures…" : "Finding pictures…"}
      </p>`;
    } else if (this.usedAI) {
      status = html`<p class="piece-hint">
        The AI chose what to look for; the pictures are free ARASAAC symbols.
      </p>`;
    } else {
      status = html`<p class="piece-hint">
        Matched by the words themselves. Set up an AI service (Content tab →
        Generate with AI) for smarter matches on phrases.
      </p>`;
    }

    return html`<div class="piece-inspector picture-chooser">
      <div class="piece-title">
        <h3>✨ Pictures for this grid</h3>
        <button class="piece-done" @click=${this.close}>Back</button>
      </div>
      <p class="piece-hint">Click a picture to use it for that word.</p>
      ${status}
      <ul class="picture-list">
        ${rows.map((row) => {
          const options = this.choices.get(String(row.label)) ?? [];
          const current = String(row.symbol ?? "");
          return html`<li>
            <div class="picture-word">
              <span class="picture-current">
                ${current ? imageOrVideo(current, String(row.label)) : html`<span>—</span>`}
              </span>
              <strong>${row.label}</strong>
            </div>
            <div class="picture-options">
              ${options.map(
                (url) => html`<button
                  class=${url === current ? "picture-option chosen" : "picture-option"}
                  aria-pressed=${url === current}
                  title=${`Use this picture for “${row.label}”`}
                  @click=${() => this.choose(row, url)}
                >
                  <img src=${url} alt="" loading="lazy" />
                </button>`,
              )}
              ${current
                ? html`<button
                    class="picture-option picture-none"
                    title="No picture"
                    @click=${() => this.choose(row, "")}
                  >
                    None
                  </button>`
                : html``}
              ${!this.loading && !options.length
                ? html`<span class="piece-hint">No match found</span>`
                : html``}
            </div>
          </li>`;
        })}
      </ul>
    </div>`;
  }
}
