/**
 * Groq API key management.
 *
 * The key lives in localStorage so it stays on this device and is never
 * exported with a design or baked into the built bundle. The VITE_GROQ_API_KEY
 * env var still works as a fallback for local development, but should not be
 * set for production builds — anything in the bundle is public.
 */

const STORAGE_KEY = "os-dpi-groq-key";

/** Get the Groq API key: the device-local key first, then the dev env var.
 * @returns {string} empty string when no usable key is configured
 */
export function getGroqKey() {
  const stored = (localStorage.getItem(STORAGE_KEY) || "").trim();
  if (stored) return stored;
  const env = (import.meta.env.VITE_GROQ_API_KEY || "").trim();
  if (env && env !== "your_groq_api_key_here") return env;
  return "";
}

/** Save (or clear) the device-local Groq API key
 * @param {string} key
 */
export function setGroqKey(key) {
  key = key.trim();
  if (key) localStorage.setItem(STORAGE_KEY, key);
  else localStorage.removeItem(STORAGE_KEY);
}
