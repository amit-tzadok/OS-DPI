import { html, render } from "uhtml";
import { TreeBase } from "./treebase";
import { DesignerPanel } from "./designer";
import * as Props from "./props";
import db from "app/db";
import "css/content.css";
import pleaseWait from "./wait";
import Globals from "app/globals";
import { fileOpen } from "browser-fs-access";

export class Content extends DesignerPanel {
  name = new Props.String("Content");

  lastFocused = this.id;

  /** @type {{ current: number, total: number } | null} */
  _uploadState = null;

  /** Current page for media list pagination (50 items per page) */
  _mediaPage = 1;

  // ── AI generation state ──────────────────────────────────────────────────
  _aiDescription = "";
  /** @type {"" | "loading" | "error" | "success"} */
  _aiStatus = "";
  _aiError = "";

  /** After AI generation, ensure the board shows all generated rows in a Grid */
  async _fitGridToRows(count) {
    /** @param {any} node @param {string} cls */
    function findNode(node, cls) {
      if (node.className === cls) return node;
      for (const child of node.children || []) {
        const found = findNode(child, cls);
        if (found) return found;
      }
      return null;
    }

    const columns = Math.min(6, Math.ceil(Math.sqrt(count)));
    const rows = Math.ceil(count / columns);

    // If a Grid already exists, just resize it
    const grid = findNode(Globals.layout, "Grid");
    if (grid) {
      grid.rows.set(rows);
      grid.columns.set(columns);
    } else {
      // No Grid — find the Page, remove visual children, insert a Grid
      const page = findNode(Globals.layout, "Page");
      if (!page) return;

      const visualClasses = new Set(["Stack", "Display", "TabControl"]);
      for (const child of [...page.children]) {
        if (visualClasses.has(child.className)) child.remove();
      }

      TreeBase.fromObject(
        {
          className: "Grid",
          props: { rows, columns, name: "grid", background: "white", fillItems: true, scale: 1 },
          children: [{ className: "GridFilter", props: {}, children: [] }],
        },
        page,
      );
    }

    await db.write("layout", Globals.layout.toObject({ omittedProps: [] }));
    Globals.layout.update();
  }

  /** Add a Speech component + speak-on-press action if not already wired up */
  _setupSpeech() {
    /** @param {any} node @param {string} cls */
    function findNode(node, cls) {
      if (node.className === cls) return node;
      for (const child of node.children || []) {
        const found = findNode(child, cls);
        if (found) return found;
      }
      return null;
    }

    // Add Speech component to the Page if absent
    const page = findNode(Globals.layout, "Page");
    if (page && !page.children.some((c) => c.className === "Speech")) {
      TreeBase.fromObject(
        { className: "Speech", props: { stateName: "$Speak" }, children: [] },
        page,
      );
      db.write("layout", Globals.layout.toObject({ omittedProps: [] }));
    }

    // Add a "speak #label on any press" action if absent
    const alreadyHasSpeak = Globals.actions?.children.some(
      (a) =>
        a.className === "Action" &&
        a.origin?.value === "*" &&
        a.children.some(
          (u) =>
            u.className === "ActionUpdate" &&
            "stateName" in u &&
            u.stateName?.value === "$Speak",
        ),
    );
    if (!alreadyHasSpeak && Globals.actions) {
      TreeBase.fromObject(
        {
          className: "Action",
          props: { origin: "*" },
          children: [
            { className: "ActionCondition", props: { Condition: "" }, children: [] },
            { className: "ActionUpdate", props: { stateName: "$Speak", newValue: "#label" }, children: [] },
          ],
        },
        Globals.actions,
      );
      db.write("actions", Globals.actions.toObject({ omittedProps: [] }));
    }
  }

  async _generateWithAI() {
    const key = (import.meta.env.VITE_GROQ_API_KEY || "").trim();
    if (!key || key === "your_groq_api_key_here") {
      this._aiError = "No API key found. Add VITE_GROQ_API_KEY to your .env file and rebuild.";
      this._aiStatus = "error";
      Globals.state.update();
      return;
    }
    if (!this._aiDescription.trim()) {
      this._aiError = "Tell me what board you want to create.";
      this._aiStatus = "error";
      Globals.state.update();
      return;
    }
    if (Globals.data.length > 0) {
      if (
        !window.confirm(
          `This will replace your current ${Globals.data.length} rows with AI-generated content. Continue?`,
        )
      )
        return;
    }

    this._aiStatus = "loading";
    this._aiError = "";
    Globals.state.update();

    try {
      const prompt =
        `You are helping build an AAC (Augmentative and Alternative Communication) board.\n` +
        `The user said: "${this._aiDescription.trim()}"\n\n` +
        `Generate vocabulary items for this board. ` +
        `Unless the user specified a different number, generate about 20 items. ` +
        `Return a JSON object with an "items" array where each object has at minimum a "label" field (1–3 words shown on the button). ` +
        `Add a "category" field when it helps organise the vocabulary. ` +
        `Make vocabulary functional and appropriate for AAC users.`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `API error ${response.status}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error("Empty response from API");

      const parsed = JSON.parse(text);
      // Handle {"items":[...]} or {"vocabulary":[...]} or a direct array
      const rows = Array.isArray(parsed)
        ? parsed
        : parsed.items ?? parsed.vocabulary ?? Object.values(parsed)[0];
      if (!Array.isArray(rows)) throw new Error("AI returned unexpected format");

      Globals.data.setContent(rows);
      await db.write("content", rows);

      await this._fitGridToRows(rows.length);
      this._setupSpeech();

      this._aiStatus = "success";
      Globals.state.update();
    } catch (/** @type {any} */ err) {
      this._aiError = err.message || "Unknown error";
      this._aiStatus = "error";
      Globals.state.update();
    }
  }

  /** Delete the media files that are checked */
  async deleteSelected() {
    // list the names that are checked
    const toDelete = [
      ...document.querySelectorAll(
        "#ContentMedia input[type=checkbox]:checked",
      ),
    ].map((element) => {
      // clear the checks as we go
      const checkbox = /** @type{HTMLInputElement} */ (element);
      checkbox.checked = false;
      return checkbox.name;
    });
    const selectAll = /** @type {HTMLInputElement} */ (
      document.getElementById("ContentSelectAll")
    );
    if (selectAll) selectAll.checked = false;
    // delete them
    await pleaseWait(db.deleteMedia(...toDelete));
    // refresh the page
    Globals.state.update();
  }

  /** Open a file picker and load selected media into the design */
  async loadMedia() {
    try {
      const files = await fileOpen({
        description: "Media files",
        mimeTypes: ["image/*", "audio/*", "video/mp4", "video/webm"],
        multiple: true,
      });
      this._mediaPage = 1; // reset pagination when new media is loaded
      this._uploadState = { current: 0, total: files.length };
      Globals.state.update();
      for (const file of files) {
        await db.addMedia(file, file.name);
        if (file.type.startsWith("image/")) {
          for (const img of document.querySelectorAll(
            `img[dbsrc="${file.name}"]`,
          )) {
            /** @type {ImgDb} */ (img).refresh();
          }
        }
        if (file.type.startsWith("video/")) {
          for (const video of document.querySelectorAll(
            `video[dbsrc="${file.name}"]`,
          )) {
            /** @type {ImgDb} */ (video).refresh();
          }
        }
        this._uploadState.current++;
        Globals.state.update();
      }
      this._uploadState = null;
    } catch {
      // ignore cancel
      this._uploadState = null;
    }
    Globals.state.update();
  }

  /** Check or uncheck all the media file checkboxes */
  selectAll({ target }) {
    for (const element of document.querySelectorAll(
      '#ContentMedia input[type="checkbox"]',
    )) {
      const checkbox = /** @type {HTMLInputElement} */ (element);
      checkbox.checked = target.checked;
    }
  }

  settings() {
    const data = Globals.data;
    return html`<div class=${this.CSSClasses("content")} id=${this.id}>
      <div>
        <h1>Content</h1>
        <details class="panel-help">
          <summary>About the Content tab</summary>
          <div class="panel-help-body">
            <p>The Content tab manages two kinds of data used by your board:</p>
            <ul>
              <li><strong>Spreadsheet rows</strong> — each row drives one button in a Grid component. Load a <code>.csv</code>, <code>.xlsx</code>, or <code>.ods</code> file via <strong>File → Load Sheet</strong>. Fields become available as <code>#fieldName</code> in Actions and Patterns.</li>
              <li><strong>Media files</strong> — images, audio, and video shown on buttons. Load files below, then drag any item onto a button on the canvas to assign it.</li>
            </ul>
            <p>Use <strong>File → Save sheet</strong> to export the current spreadsheet. Use <strong>File → Save logs (CSV)</strong> to export any logger data.</p>
          </div>
        </details>
        <p>
          ${data.length} rows with these fields:
          ${String([...data.allFields].sort()).replaceAll(",", ", ")}
        </p>
        <div class="content-media-tip">
          <strong>How to add images or audio to a button:</strong>
          <ol>
            <li>Click <strong>Load media</strong> below to import image or audio files</li>
            <li>Drag any item from the list onto a button in your board to assign it</li>
          </ol>
        </div>
        <details class="ai-section" ?open=${this._aiStatus === "error"}>
          <summary>✨ Generate with AI</summary>
          <div class="ai-body">
            <textarea
              class="ai-input ai-textarea"
              placeholder="e.g. create a board for a conversation about the Buffalo Bills"
              .value=${this._aiDescription}
              @input=${(/** @type {InputEvent} */ e) => {
                this._aiDescription = /** @type {HTMLTextAreaElement} */ (e.target).value;
              }}
              @keydown=${(/** @type {KeyboardEvent} */ e) => {
                if (e.key === "Enter" && !e.shiftKey && this._aiStatus !== "loading") {
                  e.preventDefault();
                  this._generateWithAI();
                }
              }}
            ></textarea>

            <button
              class="ai-generate-btn"
              ?disabled=${this._aiStatus === "loading"}
              @click=${() => this._generateWithAI()}
            >
              ${this._aiStatus === "loading" ? "Generating…" : "✨ Generate"}
            </button>

            ${this._aiStatus === "error"
              ? html`<p class="ai-error">⚠ ${this._aiError}</p>`
              : html``}
            ${this._aiStatus === "success"
              ? html`<p class="ai-success">
                  ✓ Generated ${Globals.data.length} rows. Check the row count above.
                </p>`
              : html``}
          </div>
        </details>

        <h2>Media files</h2>
        <div class="content-media-actions">
          <button class="content-load-media-btn" @click=${this.loadMedia.bind(this)}>+ Load media</button>
          <button @click=${this.deleteSelected}>Delete checked</button>
        </div>
        ${this._uploadState !== null
          ? html`<div class="content-upload-progress">
              <span
                >Uploading ${this._uploadState.current} of
                ${this._uploadState.total}…</span
              >
              <progress
                max=${this._uploadState.total}
                value=${this._uploadState.current}
              ></progress>
            </div>`
          : html``}
        <label>
          <input
            type="checkbox"
            name="Select all"
            id="ContentSelectAll"
            @input=${this.selectAll}
          />
          Select All
        </label>
        <div
          ref=${(ol) => {
            const self = this;
            db.listMedia().then((names) => {
              const pageSize = 50;
              const visible = names.slice(0, self._mediaPage * pageSize);
              const remaining = names.length - visible.length;
              const list = visible.map((name) => {
                let preview;
                if (/\.(mp3|aac|wav|oga|weba)$/i.test(name)) {
                  preview = html`<div class="media-type-icon">🎵</div>`;
                } else if (/\.(mp4|webm)$/i.test(name)) {
                  preview = html`<div class="media-type-icon">🎬</div>`;
                } else {
                  // .draggable=false prevents the browser's default image-drag
                  // from firing before our li-level handler can set the custom
                  // MIME type.
                  preview = html`<img
                    is="img-db"
                    dbsrc=${name}
                    alt=${name}
                    .draggable=${false}
                  />`;
                }
                return html`<li
                  .draggable=${true}
                  @dragstart=${(/** @type {DragEvent} */ e) => {
                    if (
                      /** @type {HTMLElement} */ (e.target).tagName ===
                      "INPUT"
                    ) {
                      e.preventDefault();
                      return;
                    }
                    if (!e.dataTransfer) return;
                    e.dataTransfer.setData("application/x-osdpi-media", name);
                    e.dataTransfer.effectAllowed = "copy";
                  }}
                >
                  <label>
                    <input type="checkbox" name=${name} />
                    <figure>
                      ${preview}
                      <figcaption title=${name}>${name}</figcaption>
                    </figure>
                  </label>
                </li>`;
              });
              const loadMore =
                remaining > 0
                  ? html`<button
                      class="content-load-more-btn"
                      @click=${() => {
                        self._mediaPage++;
                        Globals.state.update();
                      }}
                    >
                      Load more (${remaining} remaining)
                    </button>`
                  : html``;
              render(ol, html`<ol id="ContentMedia">${list}</ol>${loadMore}`);
            });
          }}
        ></div>
      </div>
    </div>`;
  }
  /**
   * Merge an object into the panel contents
   * @param {ExternalRep} obj
   * @returns {Promise<void>}
   */
  async merge(obj) {
    console.assert(obj.className == "Content", obj);
    const toMerge = obj.children;
    Globals.data.setContent(Globals.data.contentRows.concat(toMerge));
    db.write("content", Globals.data.contentRows);
    this.onUpdate();
  }
}
TreeBase.register(Content, "Content");
