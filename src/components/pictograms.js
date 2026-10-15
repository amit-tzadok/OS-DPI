import { aiJSON, aiReady } from "./ai";

/**
 * keyword → ARASAAC pictogram URL ("" when no match) so repeated concepts
 * are only looked up once per session
 * @type {Map<string, string>}
 */
const cache = new Map();

/** @typedef {{_id: number, sex?: boolean, violence?: boolean,
 *   categories?: string[], tags?: string[], keywords?: {keyword?: string}[]}} Pictogram */

/** Categories and words for pictures that never belong on a student's
 * board. ARASAAC's own sex/violence flags miss some (a close-up of a
 * vulva is not flagged), so its categories and keywords are checked too. */
const unsafeCategory =
  /reproduct|sexual|sexuality|genital|obstetric|crime|violence|weapon|drug|naked|nudity|disruptive behavior|bullying|accident|war\b|terror/i;
const unsafeWord =
  /\b(genitals?|genitalia|vagina|vulva|clitoris|labia|penis|testicles?|scrotum|anus|rectum|buttocks?|butt|bum|backside|gluteus|pelvis|groin|crotch|bladder|urethra|uterus|womb|ovar(y|ies)|prostate|breasts?|boobs?|tits?|teats?|nipples?|naked|nude|nudity|sex|sexual|masturbat\w*|mutilation|circumcision|erection|intercourse|pubic|condom|self.?harm\w*|suicid\w*|kill\w*|murder\w*|blood|bleed\w*|wounds?|injur\w*|corpse|dead body|guns?|rifle|pistol|bombs?)\b/i;

/** The only body pictures allowed: everyday parts a student talks about
 * ("my head hurts"). Any other anatomy picture is left out, as many show
 * an unclothed body. */
const everydayBodyPart =
  /^(head|face|hair|eyes?|ears?|nose|mouth|lips|teeth|tooth|tongue|chin|cheeks?|forehead|eyebrows?|eyelash(es)?|neck|shoulders?|arms?|elbows?|wrists?|hands?|fingers?|thumbs?|nails?|legs?|knees?|ankles?|foot|feet|toes?|heel|belly|tummy|stomach|throat|heart|brain|bones?|skin|hurt|pain|ache|sore|suffer)$/i;

/** Subjects where ARASAAC has unflagged pictures with nudity or
 * underwear (toileting, bathing, dressing, swimwear, babies). Pictures on
 * these subjects are shown only if a person has looked at them and
 * approved them (reviewedPictures); every other one is left out. */
const reviewOnly =
  /\b(undress\w*|strip|underwear|underpants|pants|panties|knickers|bra|bikini|swimsuit|swimming costume|trunks|diapers?|nappy|nappies|potty|pee|urinat\w*|poo+p?|defecat\w*|shit|ca-ca|toilet|wc|w\.c\.|bath|bathe|bathing|bathtub|shower\w*|naked|childcare|babycare|baby|babies|newborn|toddler|dress|dressed|get dressed|change clothes)\b/i;

/** Pictures on review-only subjects that were looked at one by one
 * (2026-10-14) and are clothed and fine for students: toilets, bathroom
 * doors and signs, stick-figure toileting, clothed children asking for the
 * bathroom, bathtubs and showers, clothes, clothed babies. Pictures of
 * underwear, undressing, nudity, bare bottoms or children on the toilet
 * with their clothes down were left off on purpose. */
const reviewedPictures = new Set([
  5921, 2430, 6929, 6930, 15810, 15814, 15812, 15927, 27475, 27561, 27559,
  33936, 33935, 33934, 37331, 37710, 37904, 38603, 38625, 38626, 38627, 39122,
  10144, 10168, 10183, 36601, 39547, 6912, 15905, 16143, 16145, 10184, 30524,
  38541, 37261, 37401, 10147, 9145, 38602, 2862, 38035, 39089, 16889, 21840,
  16713, 37457, 34141, 37686, 28613, 33004, 38409, 28614, 8050, 2272, 25845,
  32142, 39398, 34294, 25227, 32683, 36119, 36121, 38782, 15904, 37263,
  34902, 6058, 39397, 36612, 25429, 2749, 37156, 26803, 2370, 2371, 11244,
  15907, 27728, 32162, 3335, 27529, 27802, 32426, 38587, 38582, 38588, 36825,
  6627, 2613, 34569, 5986, 36471, 38866, 30425, 15842, 36423, 2601, 7193,
  2275, 36887, 36886, 34094,
]);

/**
 * True when a pictogram is fine to show a student. Strict on purpose: a
 * good picture left out is better than an inappropriate one shown.
 * @param {Pictogram} pictogram
 */
export function isSafe(pictogram) {
  if (pictogram.sex || pictogram.violence) return false;
  const labels = [...(pictogram.categories ?? []), ...(pictogram.tags ?? [])];
  if (labels.some((label) => unsafeCategory.test(label))) return false;
  const words = (pictogram.keywords ?? []).map(({ keyword = "" }) => keyword);
  if (words.some((word) => unsafeWord.test(word))) return false;
  if ([...words, ...labels].some((text) => reviewOnly.test(text))) {
    return reviewedPictures.has(pictogram._id);
  }
  const anatomy = labels.some((label) => /anatomy/i.test(label));
  return !anatomy || words.some((word) => everydayBodyPart.test(word.trim()));
}

/** pictogram id → whether it passed isSafe, for checking saved boards
 * @type {Map<number, Promise<boolean>>} */
const checked = new Map();

/** @param {number} id */
function checkPictogram(id) {
  let result = checked.get(id);
  if (!result) {
    result = fetch(`https://api.arasaac.org/api/pictograms/en/${id}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((pictogram) => (pictogram ? isSafe(pictogram) : true))
      .catch(() => {
        checked.delete(id); // offline: try again another time
        return true;
      });
    checked.set(id, result);
  }
  return result;
}

/**
 * Take any picture that fails the check off a board's words: boards made
 * before the check (or edited elsewhere) may hold one.
 * @param {Row[]} rows
 * @returns {Promise<Row[] | null>} the cleaned rows, or null when all are fine
 */
export async function removeUnsafePictures(rows) {
  const idOf = (/** @type {Row} */ row) =>
    Number(/\/pictograms\/(\d+)\//.exec(String(row.symbol ?? ""))?.[1] ?? 0);
  const ids = [...new Set(rows.map(idOf).filter(Boolean))];
  if (!ids.length) return null;
  const verdicts = new Map(
    await Promise.all(
      ids.map(async (id) => /** @type {[number, boolean]} */ ([id, await checkPictogram(id)])),
    ),
  );
  if ([...verdicts.values()].every(Boolean)) return null;
  return rows.map((row) => {
    if (verdicts.get(idOf(row)) !== false) return row;
    const { symbol: _unsafe, ...rest } = row;
    return rest;
  });
}

/** @param {number} id */
const pictogramURL = (id) =>
  `https://static.arasaac.org/pictograms/${id}/${id}_300.png`;

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
      /** @type {Pictogram[]} */
      const results = await response.json();
      const best = results.find(isSafe);
      if (best) url = pictogramURL(best._id);
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
      .then((/** @type {Pictogram[]} */ found) =>
        found.filter(isSafe).map(({ _id }) => pictogramURL(_id)),
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
          'give "hungry", "eat"). The board is for children and students: ' +
          "use everyday, child-appropriate words, never anatomy below the " +
          "waist, nudity or anything sexual. Reply with JSON only: " +
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
