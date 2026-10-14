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
