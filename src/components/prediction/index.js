/**
 * Pluggable word prediction.
 *
 * A predictor turns "what has been typed so far" into a ranked list of
 * words. The Prediction component (component.js) runs the predictor a
 * board has chosen and puts the words where the board can show them.
 *
 * To plug in another predictor, call registerPredictor() with an object
 * shaped like the built-in ones below; it then appears in the Prediction
 * component's picker.
 */
import { COMMON_WORDS } from "./wordlist";
import { aiJSON } from "../ai";

/**
 * @typedef {Object} PredictContext
 * @property {string} text - everything typed so far
 * @property {string} prefix - the partial word being typed ("" when the
 *   text ends in a space and the next whole word is wanted)
 * @property {string[]} previous - finished words before the prefix, lower case
 * @property {number} count - how many words are wanted
 * @property {string[]} vocabulary - single words that appear on the board
 * @property {AbortSignal} signal - aborted when the text changes again
 */

/**
 * @typedef {Object} Predictor
 * @property {string} id
 * @property {string} name - shown in the picker
 * @property {string} description - one line shown under the picker
 * @property {(ctx: PredictContext) => string[] | Promise<string[]>} predict
 * @property {boolean} [slow] - true for network predictors: the board
 *   shows the "learns from the user" words at once and swaps these in
 *   when they arrive
 */

/** @type {Map<string, Predictor>} */
const predictors = new Map();

/** @param {Predictor} predictor */
export function registerPredictor(predictor) {
  predictors.set(predictor.id, predictor);
}

/** @returns {Map<string, string>} id → name, for the picker */
export function predictorChoices() {
  return new Map([...predictors.values()].map((p) => [p.id, p.name]));
}

/** @param {string} id */
export function getPredictor(id) {
  return predictors.get(id) || /** @type {Predictor} */ (predictors.get("adaptive"));
}

/** Split typed text into the finished words and the partial last word
 * @param {string} text
 */
export function splitText(text) {
  const words = text.match(/[\w']+/g) || [];
  const atBoundary = !text || /[^\w']$/.test(text);
  const prefix = atBoundary ? "" : words.pop() || "";
  return { prefix, previous: words.map((w) => w.toLowerCase()) };
}

// ── ranking helpers ─────────────────────────────────────────────────────

/** Score for the nth most common word: high for the top words, tapering off
 * @param {number} rank */
const commonScore = (rank) => 100 / (rank + 10);

/** @type {Map<string, number>} */
const commonScores = new Map(COMMON_WORDS.map((w, i) => [w.toLowerCase(), commonScore(i)]));

/** Words that are always capitalized (I, I'm, Monday, …) */
const properCase = new Map(
  COMMON_WORDS.filter((w) => /[A-Z]/.test(w)).map((w) => [w.toLowerCase(), w]),
);

/** Add a score to a candidate word
 * @param {Map<string, number>} scores
 * @param {string} word
 * @param {number} score
 */
function add(scores, word, score) {
  const key = word.toLowerCase();
  scores.set(key, (scores.get(key) || 0) + score);
}

/** Make a word look right in place: "I" stays capital, a capitalized
 * prefix or the start of a sentence capitalizes the word
 * @param {string} word
 * @param {PredictContext} ctx
 */
function fitCase(word, ctx) {
  const proper = properCase.get(word);
  if (proper) return proper;
  if (/^i('|$)/.test(word)) return "I" + word.slice(1);
  const sentenceStart = !ctx.text.trim() || /[.!?]\s*$/.test(ctx.text);
  const capital = ctx.prefix
    ? /^[A-Z]/.test(ctx.prefix)
    : sentenceStart;
  return capital ? word[0].toUpperCase() + word.slice(1) : word;
}

/** The best `count` candidates that extend the prefix, in display form
 * @param {Map<string, number>} scores
 * @param {PredictContext} ctx
 */
export function topWords(scores, ctx) {
  const prefix = ctx.prefix.toLowerCase();
  return [...scores.entries()]
    .filter(([w]) => w.startsWith(prefix) && w !== prefix)
    .sort((a, b) => b[1] - a[1])
    .slice(0, ctx.count)
    .map(([w]) => fitCase(w, ctx));
}

/** Common words plus the words on the board, which get a boost since the
 * board's author chose them for this user
 * @param {PredictContext} ctx
 */
function baseScores(ctx) {
  const scores = new Map(commonScores);
  for (const word of ctx.vocabulary) add(scores, word, 5);
  return scores;
}

// ── what the user has said (device-local) ───────────────────────────────

const LEARNED_KEY = "os-dpi-learned-words";
/** Keep localStorage small: past this many pairs, drop the ones seen once */
const MAX_PAIRS = 20000;

/** @type {{words: Object<string, number>, pairs: Object<string, number>} | null} */
let learned = null;

function loadLearned() {
  if (!learned) {
    try {
      learned = JSON.parse(localStorage.getItem(LEARNED_KEY) || "");
    } catch {
      // nothing saved yet
    }
    if (!learned?.words || !learned?.pairs) learned = { words: {}, pairs: {} };
  }
  return learned;
}

/** Remember the words in something the user said, and which word followed
 * which, so they are predicted sooner next time
 * @param {string} utterance
 */
export function learn(utterance) {
  const words = (String(utterance).match(/[\w']+/g) || []).map((w) =>
    w.toLowerCase(),
  );
  if (!words.length) return;
  const data = loadLearned();
  words.forEach((word, i) => {
    data.words[word] = (data.words[word] || 0) + 1;
    if (i > 0) {
      const pair = `${words[i - 1]} ${word}`;
      data.pairs[pair] = (data.pairs[pair] || 0) + 1;
    }
  });
  const pairs = Object.keys(data.pairs);
  if (pairs.length > MAX_PAIRS) {
    for (const pair of pairs) if (data.pairs[pair] <= 1) delete data.pairs[pair];
  }
  try {
    localStorage.setItem(LEARNED_KEY, JSON.stringify(data));
  } catch {
    // storage full or blocked: keep learning for this session only
  }
}

/** How many different words have been learned on this device */
export function learnedWordCount() {
  return Object.keys(loadLearned().words).length;
}

export function forgetLearned() {
  learned = { words: {}, pairs: {} };
  localStorage.removeItem(LEARNED_KEY);
}

// ── built-in predictors ─────────────────────────────────────────────────

registerPredictor({
  id: "common",
  name: "Common words",
  description:
    "Frequent everyday English words plus the words on this board. Never changes.",
  predict: (ctx) => topWords(baseScores(ctx), ctx),
});

/** @param {PredictContext} ctx */
function adaptive(ctx) {
  const scores = baseScores(ctx);
  const data = loadLearned();
  for (const [word, n] of Object.entries(data.words)) add(scores, word, 3 * n);
  const last = ctx.previous[ctx.previous.length - 1];
  if (last) {
    const lead = last + " ";
    for (const [pair, n] of Object.entries(data.pairs)) {
      if (pair.startsWith(lead)) add(scores, pair.slice(lead.length), 40 * n);
    }
  }
  return topWords(scores, ctx);
}

registerPredictor({
  id: "adaptive",
  name: "Learns from the user",
  description:
    "Starts with common words and the board's words, then favors the words this user actually says and what they usually say next. Stored on this device only.",
  predict: adaptive,
});

registerPredictor({
  id: "ai",
  name: "AI",
  description:
    "Asks the AI service for likely next words, using the whole sentence so far. Shows the learned words instantly while it waits. Needs the AI service set up.",
  slow: true,
  async predict(ctx) {
    const words = ctx.previous.join(" ");
    const prompt =
      `An AAC user is typing a message one word at a time.\n` +
      `Typed so far: "${ctx.text}"\n` +
      (ctx.prefix
        ? `They are in the middle of a word that starts with "${ctx.prefix}". ` +
          `Give the ${ctx.count} most likely complete words starting with "${ctx.prefix}" that fit here.\n`
        : `Give the ${ctx.count} most likely next words` +
          (words ? ` after "${words}"` : ` to start a message`) +
          `.\n`) +
      `Prefer short everyday words. One word each (a contraction like "don't" counts as one).\n` +
      `Return JSON: {"words": ["word1", "word2", ...]}`;
    const parsed = await aiJSON({
      prompt,
      effort: "low",
      maxTokens: 400,
      signal: ctx.signal,
    });
    const list = Array.isArray(parsed.words) ? parsed.words : [];
    const scores = new Map();
    list.forEach((/** @type {unknown} */ w, /** @type {number} */ i) => {
      if (typeof w === "string" && w.trim()) add(scores, w.trim(), list.length - i);
    });
    return topWords(scores, ctx);
  },
});
