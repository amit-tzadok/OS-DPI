import { html } from "uhtml";
import Globals from "app/globals";
import db from "app/db";
import { TreeBase } from "./treebase";
import { speakSync, preferredVoice } from "./speech";
import { getGroqKey } from "./groq";
import "css/speechSuggestions.css";

/**
 * Ambient speech recognition + AI-powered AAC response suggestions.
 *
 * Listens to conversation, sends transcript to Groq, and:
 *   1. Renders a row of quick-tap suggestion chips at the bottom of the board.
 *   2. Pushes those same suggestions into the board's data rows so they appear
 *      as full grid buttons the AAC user can also tap.
 *
 * Rendered via safeRender("suggestions", …) inside renderUI() so it stays in
 * sync with the main render cycle.
 */
/** Find a Grid with the given name anywhere in the layout tree
 * @param {any} node @param {string} name */
function findGridNamed(node, name) {
  if (node?.className === "Grid" && node.name?.value === name) return node;
  for (const child of node?.children || []) {
    const found = findGridNamed(child, name);
    if (found) return found;
  }
  return null;
}

/** True if some component in the layout binds directly to one of the
 * $Suggestion1.."N" states — the signal that a board displays live
 * suggestions itself (e.g. through its own Display components) rather than
 * needing the generic floating bar or a dedicated suggestions grid.
 * @param {any} node */
function usesSuggestionStates(node) {
  if (!node) return false;
  for (const prop of Object.values(node.props || {})) {
    if (/^\$Suggestion\d+$/.test(/** @type {any} */ (prop).text || "")) {
      return true;
    }
  }
  for (const child of node.children || []) {
    if (usesSuggestionStates(child)) return true;
  }
  return false;
}

export class SpeechSuggestions {
  className = "SpeechSuggestions";

  /** Live suggestions are also exposed as these state names (padded with ""
   * past the end) so a board's own Display/Grid components can bind to a
   * specific slot directly, instead of relying on the floating chip bar or
   * the generic "suggestions" grid convention. */
  static MAX_SUGGESTION_SLOTS = 6;

  /**
   * Floor-holding phrases: spoken immediately so the partner knows the
   * user is composing a reply. Deliberately do NOT reset the exchange —
   * the partner's question still stands and the suggestions stay put.
   */
  static QUICK_PHRASES = [
    "Just a second",
    "I'm thinking about it",
    "Give me a moment",
  ];

  /** @type {SpeechRecognition | null} */
  _recognition = null;

  _listening = false;
  _transcript = "";

  /** True while a quick phrase is being spoken: blocks the auto-restart
   * in onend so the mic doesn't transcribe our own TTS */
  _pausedForSpeech = false;

  /** Transcript accumulated before recognition was paused for a quick
   * phrase; new session results are appended after it */
  _resumePrefix = "";

  /** Partial text typed by the AAC user to steer the AI suggestions */
  _userHint = "";

  /**
   * Rolling conversation history across exchanges: what the partner said
   * and which response the AAC user chose. Gives the AI context even
   * though the live transcript resets after every exchange.
   * @type {{speaker: "Partner" | "User", text: string}[]}
   */
  _history = [];

  /** @type {string[]} */
  _suggestions = [];

  /** @type {"" | "loading" | "error"} */
  _aiStatus = "";

  /** @type {number | null} */
  _debounceTimer = null;

  /** Increments per fetch so stale responses can't overwrite newer ones */
  _fetchSeq = 0;

  /** Input signature of the last successful fetch — identical inputs are
   * not refetched, so settled suggestions don't get shuffled under the
   * user's finger */
  _lastSignature = "";

  /**
   * keyword → ARASAAC pictogram URL ("" when no match) so repeated
   * concepts never refetch
   * @type {Map<string, string>}
   */
  _symbolCache = new Map();

  /** True after a first tap on the Reset board button; a second tap
   * within 4 s actually clears the board */
  _resetArmed = false;

  /** @type {number | null} */
  _resetArmTimer = null;

  get isSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  /** Identifies one listening session in the research log; set on _start */
  _sessionId = "";

  /** Dedupe for resetExchange: the same press can be reported by both the
   * tap router and the $Speak observer */
  _lastSpoken = "";
  _lastSpokenAt = 0;

  /**
   * Append a structured record to the design's log (the same store the
   * Logger component uses), so File → Save Log exports the suggestion
   * data alongside any board-defined logging:
   * what was heard, what the AI offered, and what the user chose.
   * @param {string} event
   * @param {Object} [fields]
   */
  _logEvent(event, fields = {}) {
    db.writeLog({
      DateTime: new Date().toISOString(),
      Event: event,
      Session: this._sessionId,
      ...fields,
    });
  }

  /** @param {string[]} texts */
  _publishSuggestionStates(texts) {
    /** @type {Object<string, string>} */
    const patch = {};
    for (let i = 0; i < SpeechSuggestions.MAX_SUGGESTION_SLOTS; i++) {
      patch[`$Suggestion${i + 1}`] = texts[i] || "";
    }
    Globals.state?.update(patch);
  }

  /** A user-facing notice ("mic blocked", "needs Chrome", …) shown near
   * the bar; cleared automatically */
  _userMessage = "";
  /** @type {number | null} */
  _noticeTimer = null;
  /** Missing-key notice already shown this listening session */
  _keyNoticeShown = false;

  /** @param {string} message */
  _notify(message) {
    this._userMessage = message;
    if (this._noticeTimer !== null) clearTimeout(this._noticeTimer);
    this._noticeTimer = window.setTimeout(() => {
      this._userMessage = "";
      this._noticeTimer = null;
      Globals.state?.update();
    }, 8000);
    Globals.state?.update();
  }

  toggle() {
    if (this._listening) {
      this._stop();
      return;
    }
    if (!this.isSupported) {
      this._notify(
        "Speech recognition isn't available in this browser — use Chrome or Edge.",
      );
      return;
    }
    if (!window.isSecureContext) {
      this._notify(
        "The microphone only works on a secure (https) connection.",
      );
      return;
    }
    this._start();
  }

  /**
   * No-op — speech is now handled by direct @pointerup handlers on each
   * grid cell button in grid.js, which is more reliable in Chrome.
   */
  _setupDirectSpeech() {}

  _start() {
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Rec) return;
    this._recognition = new Rec();
    this._recognition.continuous = true;
    this._recognition.interimResults = true;
    this._recognition.lang = "en-US";

    this._recognition.onresult = (/** @type {SpeechRecognitionEvent} */ event) => {
      if (!this._listening) return;
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join(" ")
        .trim();
      this._transcript = this._resumePrefix
        ? `${this._resumePrefix} ${transcript}`.trim()
        : transcript;
      this._scheduleSuggest();
      Globals.state?.update();
    };

    this._recognition.onerror = (/** @type {SpeechRecognitionErrorEvent} */ event) => {
      // "not-allowed" / "network" — give up; no-speech auto-restarts via onend
      if (event.error === "not-allowed") {
        this._listening = false;
        this._notify(
          "Microphone access is blocked. Allow the microphone for this site (click the icon in the address bar) and try again.",
        );
      } else if (event.error === "network") {
        this._listening = false;
        this._notify(
          "Speech recognition needs an internet connection — check the network and try again.",
        );
      }
    };

    // The browser stops after silence; restart automatically to stay continuous.
    this._recognition.onend = () => {
      if (!this._listening || this._pausedForSpeech) return;
      try {
        this._recognition?.start();
      } catch {
        // Already started or replaced — ignore
      }
    };

    this._recognition.start();
    this._listening = true;
    this._keyNoticeShown = false;
    this._sessionId = new Date().toISOString();
    this._logEvent("listen_start");
    // $asr_status drives the Indicator component's status dot on boards
    // that include one (the CADL designs do)
    Globals.state?.update({ $asr_status: "on" });
  }

  _stop() {
    if (this._listening) this._logEvent("listen_stop");
    this._listening = false;
    Globals.state?.update({ $asr_status: "off" });
    if (this._debounceTimer !== null) {
      clearTimeout(this._debounceTimer);
      this._debounceTimer = null;
    }
    try {
      this._recognition?.stop();
    } catch {}
    this._recognition = null;
    this._transcript = "";
    this._userHint = "";
    this._pausedForSpeech = false;
    this._resumePrefix = "";
    this._history = [];
    this._suggestions = [];
    this._aiStatus = "";
    this._lastSignature = "";
    this._publishSuggestionStates([]);
    if (Globals.state?.get("$SuggestionHint")) {
      Globals.state.update({ $SuggestionHint: "" });
    }
    // remove any live suggestions from the board, keeping the vocabulary
    if (Globals.data?.contentRows.some((row) => row.suggestion)) {
      const baseRows = Globals.data.contentRows.filter(
        (row) => !row.suggestion,
      );
      Globals.data.setContent(baseRows);
      db.write("content", baseRows);
    }
    // collapse the (now empty) suggestions strip so the board reclaims
    // its space until the next listening session
    const strip = findGridNamed(Globals.layout, "suggestions");
    if (strip && +strip.scale.value !== 0) {
      strip.scale.set(0);
      db.write("layout", Globals.layout.toObject({ omittedProps: [] }));
    }
    Globals.state?.update();
  }

  /** @param {number} [delay] */
  _scheduleSuggest(delay = 800) {
    if (this._debounceTimer !== null) clearTimeout(this._debounceTimer);
    this._debounceTimer = window.setTimeout(() => this._fetchSuggestions(), delay);
  }

  /**
   * The AAC user typed into the steering input — refetch suggestions
   * biased toward completing what they're typing.
   * @param {InputEvent} event
   */
  _onHintInput(event) {
    this._userHint = /** @type {HTMLInputElement} */ (event.target).value;
    // Shorter debounce while typing so completions feel responsive.
    this._scheduleSuggest(500);
  }

  /**
   * @param {boolean} [followUp] suggest questions to ask back after the
   * AAC user has just spoken a response, instead of replies to the partner
   */
  async _fetchSuggestions(followUp = false) {
    const key = getGroqKey();
    const transcript = this._transcript.trim();
    const hint = this._userHint.trim();
    if (!this._listening) return;
    if (!key) {
      // once per listening session, not on every debounced transcript update
      if (!this._keyNoticeShown) {
        this._keyNoticeShown = true;
        this._notify(
          "AI suggestions need a Groq API key — add one in the designer's AI panel.",
        );
      }
      return;
    }
    if (!followUp && !transcript && !hint) return;

    // Same inputs as the suggestions already on screen? Leave them alone.
    // Normalized so an interim transcript being re-finalized with different
    // casing/punctuation ("how are you" → "How are you?") — or recognition
    // restarts re-delivering the same audio — doesn't reshuffle options the
    // user is already aiming for.
    /** @param {string} s */
    const normalize = (s) =>
      s.toLowerCase().replace(/[^a-z0-9']+/g, " ").trim();
    const signature = followUp
      ? `followup:${this._history.length}`
      : `${normalize(transcript)}\u0000${normalize(hint)}`;
    if (signature === this._lastSignature && this._suggestions.length > 0) {
      return;
    }

    const seq = ++this._fetchSeq;

    const history = this._history
      .map((t) => `${t.speaker === "User" ? "AAC user" : "Partner"}: ${t.text}`)
      .join("\n");

    const task = followUp
      ? `The AAC user just gave the last response in the conversation. ` +
        `Suggest 6 short things they could say next to keep the conversation ` +
        `going — mostly questions to ask their partner back.\n`
      : (transcript ? `The partner just said: "${transcript}"\n` : "") +
        (hint
          ? `The AAC user typed a hint about what they want to say: "${hint}"\n` +
            `Every suggestion MUST be built around "${hint}", but phrase each ` +
            `one the way a person would naturally say it in reply — add ` +
            `whatever words come before or after the hint to make it natural. ` +
            `For example, if the partner asked about weekend plans and the ` +
            `hint is "Washington DC", suggest "I'm going to Washington DC", ` +
            `NOT "Washington DC is where I'm going". If the hint reads like ` +
            `the start of a sentence, complete it.\n`
          : "") +
        `\nSuggest 6 short phrases the AAC user might want to say` +
        (transcript ? ` in response` : "") +
        `.\n`;

    const styleRules =
      `Keep each suggestion to 1–8 words of natural spoken language. ` +
      `Each suggestion must be a complete, natural-sounding thing a person ` +
      `would actually say out loud — never clipped or telegraphic. ` +
      `For example say "What did you have?" or "How about you?", ` +
      `NOT "What's yours?" or "Bad lunch today". ` +
      `Vary the sentiment: include negative and neutral options as well as ` +
      `positive ones (e.g. for "How are you?" include something like ` +
      `"Not doing great today", not only upbeat answers). ` +
      `Make at least two suggestions end with a question back to the partner ` +
      `(e.g. "I'm good, how about you?"). ` +
      `For each suggestion also give a "keyword": ONE simple, concrete English ` +
      `word capturing its core concept, suitable for looking up an AAC ` +
      `pictogram (e.g. "happy", "eat", "yes", "question"). ` +
      `Return JSON: {"suggestions": [{"text": "phrase1", "keyword": "word1"}, ...]}`;

    this._aiStatus = "loading";
    Globals.state?.update();
    const fetchStarted = performance.now();

    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "user",
                content:
                  `You are helping an AAC (Augmentative and Alternative Communication) ` +
                  `user participate in a conversation.\n` +
                  (history ? `Conversation so far:\n${history}\n\n` : "") +
                  task +
                  styleRules,
              },
            ],
            response_format: { type: "json_object" },
            max_tokens: 300,
          }),
        },
      );

      if (!response.ok) {
        // A class sharing one key will hit per-key rate limits; students
        // with a mistyped key get 401s. Neither should read as a mystery.
        if (response.status === 429) {
          this._notify(
            "AI suggestion rate limit reached — wait a minute and try again (or use your own Groq API key).",
          );
        } else if (response.status === 401 || response.status === 403) {
          this._notify(
            "The Groq API key was rejected — check it in the designer's AI panel.",
          );
        }
        throw new Error(`API error ${response.status}`);
      }

      // a newer fetch started (or listening stopped) while we waited
      if (seq !== this._fetchSeq || !this._listening) return;

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error("Empty response");

      const parsed = JSON.parse(text);
      // tolerate both the new {text, keyword} shape and plain strings
      const items = (parsed.suggestions ?? [])
        .slice(0, 6)
        .map((/** @type {string | {text?: string, keyword?: string}} */ s) =>
          typeof s === "string" ? { text: s, keyword: "" } : { text: s.text ?? "", keyword: s.keyword ?? "" },
        )
        .filter((/** @type {{text: string}} */ s) => s.text);

      const texts = items.map((/** @type {{text: string}} */ s) => s.text);
      // AI returned the same set we're already showing — don't touch the
      // chips or rewrite the board, just clear the loading state.
      const unchanged =
        texts.length === this._suggestions.length &&
        texts.every((t, i) => t === this._suggestions[i]);
      this._lastSignature = signature;
      if (unchanged) {
        this._aiStatus = "";
        Globals.state?.update();
        return;
      }

      this._suggestions = texts;
      this._aiStatus = "";
      this._publishSuggestionStates(texts);

      // research log: the stimulus and each offered response, with rank
      const latencyMs = Math.round(performance.now() - fetchStarted);
      this._logEvent(followUp ? "followup_prompt" : "heard", {
        Text: transcript,
        Hint: hint,
        LatencyMs: latencyMs,
      });
      texts.forEach((t, i) =>
        this._logEvent("suggestion", { Text: t, Rank: i + 1 }),
      );

      // look up a pictogram for each suggestion (cached per keyword)
      const symbols = await Promise.all(
        items.map((/** @type {{keyword: string}} */ s) => this._findPictogram(s.keyword)),
      );

      // a newer fetch started (or listening stopped) while we waited
      if (seq !== this._fetchSeq || !this._listening) return;

      // ── Push suggestions into the board ──────────────────────────────────
      if (items.length > 0 && Globals.data) {
        const suggestionRows = items.map(
          (/** @type {{text: string}} */ s, /** @type {number} */ i) =>
            symbols[i]
              ? { label: s.text, symbol: symbols[i], suggestion: "1" }
              : { label: s.text, suggestion: "1" },
        );
        const strip = findGridNamed(Globals.layout, "suggestions");
        if (strip) {
          // The board has a dedicated live-suggestions region (AI-generated
          // boards do): refresh only those rows and leave the vocabulary,
          // layout, and grid sizes alone so the board keeps working.
          const baseRows = Globals.data.contentRows.filter(
            (row) => !row.suggestion,
          );
          const rows = [...baseRows, ...suggestionRows];
          Globals.data.setContent(rows);
          await db.write("content", rows);
          // expand the strip (it sits collapsed at scale 0 while idle)
          if (+strip.scale.value !== 1.5) {
            strip.scale.set(1.5);
            await db.write(
              "layout",
              Globals.layout.toObject({ omittedProps: [] }),
            );
          }
        } else if (Globals.data.contentRows.length === 0) {
          // Blank canvas (e.g. right after Reset) and no suggestions region —
          // the suggestions become the whole board. A board that already has
          // real content just doesn't get a tappable grid version; the
          // floating chips above still work regardless.
          Globals.data.setContent(suggestionRows);
          await db.write("content", suggestionRows);
          await this._fitGrid(suggestionRows.length);
        }
      }
    } catch {
      this._aiStatus = "error";
      this._suggestions = [];
    }

    Globals.state?.update();
  }

  /**
   * Find an ARASAAC pictogram URL for a keyword. Returns "" when the
   * keyword is empty or has no match. Results (including misses) are
   * cached so the same concept is only looked up once per session.
   * @param {string} keyword
   * @returns {Promise<string>}
   */
  async _findPictogram(keyword) {
    keyword = keyword.trim().toLowerCase();
    if (!keyword) return "";
    const cached = this._symbolCache.get(keyword);
    if (cached !== undefined) return cached;

    let url = "";
    try {
      const response = await fetch(
        `https://api.arasaac.org/api/pictograms/en/bestsearch/${encodeURIComponent(keyword)}`,
      );
      if (response.ok) {
        const results = await response.json();
        const id = results?.[0]?._id;
        if (id) {
          url = `https://static.arasaac.org/pictograms/${id}/${id}_300.png`;
        }
      }
    } catch {
      // no image for this button — the label alone still works
    }
    this._symbolCache.set(keyword, url);
    return url;
  }

  /**
   * Ensure the layout has a Grid sized to fit `count` items.
   * Creates one if absent; resizes it if present.
   * @param {number} count
   */
  async _fitGrid(count) {
    /** @param {any} node @param {string} cls */
    function findNode(node, cls) {
      if (node.className === cls) return node;
      for (const child of node.children || []) {
        const found = findNode(child, cls);
        if (found) return found;
      }
      return null;
    }

    if (!Globals.layout) return;

    const columns = Math.min(6, Math.ceil(Math.sqrt(count)));
    const rows = Math.ceil(count / columns);

    // enlarge the button text; the whole board scales from uiScale (in vw)
    if (Globals.layout.uiScale.value < 2) Globals.layout.uiScale.set(2);

    const grid = findNode(Globals.layout, "Grid");
    if (grid) {
      grid.rows.set(rows);
      grid.columns.set(columns);
    } else {
      const page = findNode(Globals.layout, "Page");
      if (!page) return;
      const visualClasses = new Set(["Stack", "Display", "TabControl"]);
      for (const child of [...page.children]) {
        if (visualClasses.has(child.className)) child.remove();
      }
      TreeBase.fromObject(
        {
          className: "Grid",
          props: {
            rows,
            columns,
            name: "grid",
            background: "white",
            fillItems: true,
            scale: 1,
          },
          children: [{ className: "GridFilter", props: {}, children: [] }],
        },
        page,
      );
    }

    await db.write("layout", Globals.layout.toObject({ omittedProps: [] }));
    Globals.layout.update();
  }

  /**
   * First tap arms the button (it turns red); a second tap within 4 s
   * clears the board. Guards an AAC user against a stray tap wiping
   * everything.
   */
  _onResetClick() {
    if (this._resetArmTimer !== null) {
      clearTimeout(this._resetArmTimer);
      this._resetArmTimer = null;
    }
    if (!this._resetArmed) {
      this._resetArmed = true;
      this._resetArmTimer = window.setTimeout(() => {
        this._resetArmed = false;
        this._resetArmTimer = null;
        Globals.state?.update();
      }, 4000);
      Globals.state?.update();
      return;
    }
    this._resetArmed = false;
    this._resetBoard();
  }

  /**
   * Wipe the board back to the initial state of a new design: no content
   * rows and the default empty page (same shape as Layout.defaultValue —
   * duplicated here to avoid importing the designer chain), then restart
   * so everything reloads from the db.
   */
  async _resetBoard() {
    this._stop();
    await db.write("content", []);
    await db.write("layout", {
      className: "Page",
      props: {},
      children: [{ className: "Speech", props: {}, children: [] }],
    });
    Globals.restart?.();
  }

  /**
   * Called after the AAC user speaks a response: archive the exchange into
   * the conversation history, clear the heard sentence and typed steering
   * text, then restart recognition so the next round of suggestions
   * responds to whatever is said next — with full context.
   * @param {string} [spokenText] the response the AAC user just spoke
   * @param {string} [source] how it was chosen, for the research log:
   *   "chip" (floating bar), "board" (a board button bound to a
   *   suggestion), "label" (a plain vocabulary button)
   */
  resetExchange(spokenText = "", source = "") {
    // One press can arrive twice: directly from the tap router and again
    // from the render-cycle $Speak observer. Treat an identical spoken text
    // within a couple seconds as the same turn.
    if (spokenText) {
      const now = Date.now();
      if (spokenText === this._lastSpoken && now - this._lastSpokenAt < 2000) {
        return;
      }
      this._lastSpoken = spokenText;
      this._lastSpokenAt = now;
    }
    if (this._debounceTimer !== null) {
      clearTimeout(this._debounceTimer);
      this._debounceTimer = null;
    }
    const heard = this._transcript.trim();
    if (heard) this._history.push({ speaker: "Partner", text: heard });
    if (spokenText) this._history.push({ speaker: "User", text: spokenText });
    if (spokenText && this._listening) {
      this._logEvent("chosen", {
        Text: spokenText,
        Source: source,
        Rank: this._suggestions.indexOf(spokenText) + 1 || "",
      });
    }
    // keep the prompt small: only the most recent turns
    if (this._history.length > 12) {
      this._history = this._history.slice(-12);
    }
    this._transcript = "";
    this._userHint = "";
    this._resumePrefix = "";
    this._lastSignature = "";
    // the steering text belongs to the finished exchange
    if (Globals.state?.get("$SuggestionHint")) {
      Globals.state.update({ $SuggestionHint: "" });
    }
    if (this._listening && this._recognition) {
      try {
        // abort drops the accumulated results; onend auto-restarts
        // a fresh session because _listening is still true
        this._recognition.abort();
      } catch {}
    }
    // keep the conversation going: right after responding, offer
    // questions the user can ask back
    if (spokenText) this._fetchSuggestions(true);
    Globals.state?.update();
  }

  /**
   * Speak a floor-holding phrase without ending the exchange.
   * Recognition is paused while the phrase plays so the mic doesn't
   * transcribe our own TTS; the transcript heard so far is preserved
   * and new speech is appended after it.
   * @param {string} text
   */
  _quick(text) {
    if (!text) return;
    this._logEvent("quick_phrase", { Text: text });
    this._pausedForSpeech = true;
    this._resumePrefix = this._transcript;
    try {
      this._recognition?.abort();
    } catch {}

    const resume = () => {
      if (!this._pausedForSpeech) return;
      this._pausedForSpeech = false;
      if (this._listening) {
        try {
          this._recognition?.start();
        } catch {}
      }
    };

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = preferredVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = "en-US";
    }
    utterance.onend = resume;
    utterance.onerror = resume;
    // safety net in case end/error never fires
    setTimeout(resume, 5000);
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }

  /** @param {string} text */
  _select(text) {
    // speakSync only — patching $Speak here too would make any Speech
    // component on the board speak the same text a second time.
    speakSync(text);
    this.resetExchange(text, "chip");
    Globals.state?.update();
  }

  safeTemplate() {
    try {
      return this.template();
    } catch {
      return html`<div />`;
    }
  }

  /** A board with its own "suggestions" grid is expected to also provide
   * its own control (like DEAN's on-board "ASR On/Off" button, wired via
   * the toggle_speech_suggestions() eval function) — the generic floating
   * bar would just be a redundant second way to do the same thing. */
  get _hasNativeIntegration() {
    return (
      !!findGridNamed(Globals.layout, "suggestions") ||
      usesSuggestionStates(Globals.layout)
    );
  }

  template() {
    // Rendered every state cycle (via safeRender), so this doubles as our
    // observer: when a board-native button press speaks one of the live
    // suggestions ($Speak was just set to it, and the board's Speech
    // component handles the audio), close out the exchange exactly like
    // tapping the equivalent floating chip — archive it to the history and
    // fetch follow-up suggestions.
    const spoken = String(Globals.state?.get("$Speak") || "").trim();
    if (
      this._listening &&
      spoken &&
      Globals.state?.hasBeenUpdated("$Speak") &&
      this._suggestions.includes(spoken)
    ) {
      this.resetExchange(spoken, "board");
    }

    // A board can steer the AI from its own keyboard by writing typed text
    // into $SuggestionHint (DEAN's QWERTY tab does): mirror it into the
    // hint the same way the floating bar's steering input does.
    if (this._listening && Globals.state?.hasBeenUpdated("$SuggestionHint")) {
      const hint = String(Globals.state.get("$SuggestionHint") || "");
      if (hint !== this._userHint) {
        this._userHint = hint;
        this._scheduleSuggest(500);
      }
    }

    const editIcon = html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>`;

    // Problems that would otherwise fail silently (no Chrome speech API,
    // mic blocked, insecure origin) surface here for either branch below.
    const notice = this._userMessage
      ? html`<div class="ss-notice" role="alert">${this._userMessage}</div>`
      : html``;

    // A board with native integration drives listening and shows suggestions
    // through its own buttons; keep the way back to the editor, and — since
    // the pulsing mic of the full bar is hidden — a plainly visible
    // "Listening" pill so conversation partners know the mic is live.
    if (this._hasNativeIntegration) {
      return html`
        <div class="ss-bar ss-bar--solo">
          <button
            class="ss-edit"
            title="Back to editor"
            aria-label="Back to editor"
            @click=${() => Globals.state?.update({ editing: true })}
          >
            ${editIcon}
          </button>
          ${this._listening
            ? html`<span class="ss-listening-pill" role="status">
                <span class="ss-listening-dot"></span> Listening
              </span>`
            : html``}
          ${notice}
        </div>
      `;
    }

    const micIcon = html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="9" y="2" width="6" height="13" rx="3"/>
      <path d="M5 10a7 7 0 0 0 14 0"/>
      <line x1="12" y1="20" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>`;

    const resetIcon = html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polyline points="1 4 1 10 7 10"/>
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
    </svg>`;

    return html`
      <div class=${this._listening ? "ss-bar ss-bar--active" : "ss-bar"}>
        <button
          class="ss-edit"
          title="Back to editor"
          aria-label="Back to editor"
          @click=${() => Globals.state?.update({ editing: true })}
        >
          ${editIcon}
        </button>

        <button
          class=${this._listening ? "ss-mic ss-mic--on" : "ss-mic"}
          title=${this._listening ? "Stop listening" : "Suggest responses from speech"}
          aria-label=${this._listening ? "Stop listening" : "Start listening for suggestions"}
          aria-pressed=${this._listening}
          @click=${() => this.toggle()}
        >
          ${micIcon}
        </button>

        <button
          class=${this._resetArmed ? "ss-reset ss-reset--armed" : "ss-reset"}
          title=${this._resetArmed ? "Tap again to clear the board" : "Reset board"}
          aria-label=${this._resetArmed
            ? "Tap again to clear the board"
            : "Reset board to a blank design"}
          @click=${() => this._onResetClick()}
        >
          ${resetIcon}
        </button>

        ${notice}
        ${this._listening
          ? html`
            <div class="ss-content">
              <div class="ss-row">
                <span class="ss-label">Heard</span>
                ${this._transcript
                  ? html`<span class="ss-transcript" title=${this._transcript}>${this._transcript}</span>`
                  : html`<span class="ss-hint">Listening…</span>`}
                ${this._aiStatus === "loading"
                  ? html`<span class="ss-loading" aria-live="polite">Thinking…</span>`
                  : html``}
                ${this._aiStatus === "error"
                  ? html`<span class="ss-error">Could not get suggestions.</span>`
                  : html``}
              </div>

              ${this._suggestions.length > 0
                ? html`<div class="ss-row">
                    <span class="ss-label">Tap to say</span>
                    <div class="ss-chips" role="list" aria-label="Suggested responses">
                      ${this._suggestions.map((s) =>
                        html`<button
                          class="ss-chip"
                          role="listitem"
                          @click=${() => this._select(s)}
                        >${s}</button>`,
                      )}
                    </div>
                  </div>`
                : html``}

              <div class="ss-row ss-row--tools">
                <input
                  class="ss-steer"
                  type="text"
                  placeholder="Type to steer suggestions…"
                  aria-label="Type to steer suggestions"
                  autocomplete="off"
                  .value=${this._userHint}
                  @input=${(/** @type {InputEvent} */ e) => this._onHintInput(e)}
                  @keydown=${(/** @type {KeyboardEvent} */ e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      // explicit request: bypass the unchanged-input guard
                      this._lastSignature = "";
                      this._fetchSuggestions();
                    } else if (e.key === "Escape") {
                      this._userHint = "";
                      /** @type {HTMLInputElement} */ (e.target).value = "";
                      this._scheduleSuggest(0);
                    }
                  }}
                />
                <div class="ss-quick" role="list" aria-label="Hold the conversation">
                  ${SpeechSuggestions.QUICK_PHRASES.map((p) =>
                    html`<button
                      class="ss-quick-chip"
                      role="listitem"
                      @click=${() => this._quick(p)}
                    >${p}</button>`,
                  )}
                </div>
              </div>
            </div>`
          : html``}
      </div>
    `;
  }
}

/** Shared instance used by start.js (rendering) and grid.js (reset on speak) */
export const speechSuggestions = new SpeechSuggestions();
