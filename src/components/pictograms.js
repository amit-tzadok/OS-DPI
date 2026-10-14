import { aiJSON, aiReady } from "./ai";

/**
 * keyword → ARASAAC pictogram URL ("" when no match) so repeated concepts
 * are only looked up once per session
 * @type {Map<string, string>}
 */
const cache = new Map();

/**
 * Find an ARASAAC pictogram URL for a keyword. Returns "" when the keyword
 * is empty, has no match, or the lookup fails (e.g. offline). ARASAAC is
 * free and needs no key.
 * @param {string} keyword
 * @returns {Promise<string>}
 */
export async function findPictogram(keyword) {
  keyword = keyword.trim().toLowerCase();
  if (!keyword) return "";
  const cached = cache.get(keyword);
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
    return "";
  }
  cache.set(keyword, url);
  return url;
}

/** True for a picture this module chose (so renaming may replace it) and
 * not one the student added themselves
 * @param {string | undefined} symbol */
export function isPictogram(symbol) {
  return !!symbol && symbol.startsWith("https://static.arasaac.org/");
}

/** keyword → pictogram URLs from a full search, cached for the session
 * @type {Map<string, Promise<string[]>>} */
const searches = new Map();

/**
 * Pictogram URLs matching a keyword, best first ([] when none or offline)
 * @param {string} keyword
 * @returns {Promise<string[]>}
 */
export function searchPictograms(keyword) {
  keyword = keyword.trim().toLowerCase();
  if (!keyword) return Promise.resolve([]);
  let result = searches.get(keyword);
  if (!result) {
    result = fetch(
      `https://api.arasaac.org/api/pictograms/en/search/${encodeURIComponent(keyword)}`,
    )
      .then((response) => (response.ok ? response.json() : []))
      .then((/** @type {{_id: number}[]} */ found) =>
        found.map(
          ({ _id }) => `https://static.arasaac.org/pictograms/${_id}/${_id}_300.png`,
        ),
      )
      .catch(() => {
        searches.delete(keyword); // retry next time
        return [];
      });
    searches.set(keyword, result);
  }
  return result;
}

/** Words that never make a useful picture on their own */
const fillerWords = new Set(
  "a an the i me my you your it is are am be to of and or for in on at with please can do does want".split(" "),
);

/**
 * Picture choices for each button label. When an AI service is set up it
 * suggests what to search for ("bathroom please" → toilet, bathroom), so
 * phrases find good symbols; without one, the label and its main words
 * are searched. All pictures come from ARASAAC, which is free.
 *
 * @param {string[]} labels
 * @param {number} [count] - choices per label
 * @returns {Promise<{choices: Map<string, string[]>, usedAI: boolean}>}
 */
export async function pictureChoices(labels, count = 6) {
  /** @type {Map<string, string[]>} label → search keywords */
  const keywords = new Map(
    labels.map((label) => {
      const words = label
        .toLowerCase()
        .split(/[^\p{L}\p{N}']+/u)
        .filter((word) => word && !fillerWords.has(word));
      return [label, [label, ...words]];
    }),
  );

  let usedAI = false;
  if (labels.length && aiReady()) {
    try {
      const reply = await aiJSON({
        prompt:
          "These are buttons on an AAC communication board. For each label, " +
          "give 1 to 3 short English search words that would find the best " +
          "picture symbol for it in the ARASAAC pictogram library: concrete " +
          "single words or two-word terms for the main meaning (for " +
          '"bathroom please" give "toilet", "bathroom"; for "I am hungry" ' +
          'give "hungry", "eat"). Reply with JSON only: ' +
          '{"items": [{"label": "...", "keywords": ["..."]}]}\n\nLabels:\n' +
          labels.map((label) => JSON.stringify(label)).join("\n"),
        maxTokens: 400 + labels.length * 40,
        effort: "low",
      });
      for (const item of reply?.items ?? []) {
        const label = String(item?.label ?? "");
        if (!keywords.has(label) || !Array.isArray(item.keywords)) continue;
        const suggested = item.keywords.map(String).filter(Boolean).slice(0, 3);
        // the AI's words first, then the label itself
        keywords.set(label, [...suggested, ...(keywords.get(label) ?? [])]);
        usedAI = true;
      }
    } catch {
      // no AI today: the label's own words still find pictures
    }
  }

  /** @param {string[]} terms */
  const choicesFor = async (terms) => {
    const unique = [...new Set(terms.map((term) => term.toLowerCase()))];
    const found = await Promise.all(unique.slice(0, 4).map(searchPictograms));
    // take turns between the search words so each gets a say
    /** @type {string[]} */
    const merged = [];
    for (let i = 0; merged.length < count && found.some((list) => list[i]); i++) {
      for (const list of found) {
        if (list[i] && !merged.includes(list[i])) merged.push(list[i]);
      }
    }
    return merged.slice(0, count);
  };

  /** @type {Map<string, string[]>} */
  const choices = new Map();
  const entries = [...keywords];
  // a few words at a time, to be gentle on the free service
  for (let i = 0; i < entries.length; i += 6) {
    const batch = entries.slice(i, i + 6);
    const results = await Promise.all(batch.map(([, terms]) => choicesFor(terms)));
    batch.forEach(([label], j) => choices.set(label, results[j]));
  }
  return { choices, usedAI };
}
