import { TreeBase } from "./treebase";
import { html } from "uhtml";
import Globals from "app/globals";
import * as Props from "./props";
import { toString } from "./slots";
import { cursor } from "./notes";

/**
 * Board designs from other OS-DPI forks sometimes bind pitch/rate/volume to
 * a state name (e.g. "$Rate") rather than a number; this app's Speech props
 * are plain floats, so that comes through as NaN. Assigning a non-finite
 * value to SpeechSynthesisUtterance's rate/pitch/volume throws, so fall back
 * to the neutral default instead of letting one bad value silence speech.
 * @param {number} value
 * @param {number} fallback
 */
function finiteOr(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

/**
 * @param {string} message
 * @param {string} voiceURI
 * @param {number} pitch
 * @param {number} rate
 * @param {number} volume
 */
export async function speak(message, voiceURI, pitch, rate, volume) {
  if (!message) return;
  const voices = await getVoices();
  const voice = voiceURI && voices.find((voice) => voice.voiceURI == voiceURI);
  const utterance = new SpeechSynthesisUtterance(message);
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = "en-US";
  }
  utterance.pitch = finiteOr(pitch, 1);
  utterance.rate = finiteOr(rate, 1);
  utterance.volume = finiteOr(volume, 1);
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

class Speech extends TreeBase {
  stateName = new Props.String("$Speak");
  voiceURI = new Props.Voice("", { label: "Voice" });
  pitch = new Props.Float(1);
  rate = new Props.Float(1);
  volume = new Props.Float(1);

  async speak() {
    const { state } = Globals;
    const voiceURI = this.voiceURI.value;
    const message = toString(state.get(this.stateName.value)).replace(
      cursor,
      "",
    );
    const voices = await getVoices();
    const voice =
      voiceURI && voices.find((voice) => voice.voiceURI == voiceURI);
    const utterance = new SpeechSynthesisUtterance(message);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = "en-US";
    }
    utterance.pitch = finiteOr(this.pitch.value, 1);
    utterance.rate = finiteOr(this.rate.value, 1);
    utterance.volume = finiteOr(this.volume.value, 1);
    utterance.addEventListener("boundary", (event) => {
      document.dispatchEvent(
        new SpeechSynthesisEvent("boundary", {
          utterance: event.utterance,
          charIndex: event.charIndex,
        }),
      );
    });
    utterance.addEventListener("end", (event) => {
      document.dispatchEvent(
        new SpeechSynthesisEvent("end", {
          utterance: event.utterance,
          charIndex: event.charIndex,
        }),
      );
    });
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }

  template() {
    const { state } = Globals;
    if (state.hasBeenUpdated(this.stateName.value)) {
      const message = toString(state.get(this.stateName.value));
      speak(
        message,
        this.voiceURI.value,
        this.pitch.value,
        this.rate.value,
        this.volume.value,
      );
    }
    return html`<div />`;
  }
}
TreeBase.register(Speech, "Speech");

/** Only voices with a United States English accent are offered
 * @param {SpeechSynthesisVoice} voice */
function isUSEnglish(voice) {
  return /^en[-_]US/i.test(voice.lang);
}

/** macOS ships novelty voices (Bells, Boing, Zarvox, …), legacy robotic
 * voices (Fred, Junior, …), and cartoonish character voices (Grandma,
 * Rocko, …). None are appropriate for an AAC user's voice, so keep them
 * out of the picker and out of the default-voice selection. */
const NOVELTY_VOICES = new Set([
  "Albert", "Bad News", "Bahh", "Bells", "Boing", "Bubbles", "Cellos",
  "Deranged", "Good News", "Jester", "Organ", "Superstar", "Trinoids",
  "Whisper", "Wobble", "Zarvox",
  "Fred", "Junior", "Kathy", "Ralph",
  "Eddy", "Flo", "Grandma", "Grandpa", "Reed", "Rocko", "Sandy", "Shelley",
]);

/** @param {SpeechSynthesisVoice} voice */
function isGenericVoice(voice) {
  // names may carry a locale suffix, e.g. "Eddy (English (US))"
  const baseName = voice.name.split("(")[0].trim();
  return !NOVELTY_VOICES.has(baseName);
}

/** Keep the generic US voices; fall back rather than offer nothing on
 * systems where the filters would leave an empty list
 * @param {SpeechSynthesisVoice[]} all */
function usOnly(all) {
  const generic = all.filter(isGenericVoice);
  const candidates = generic.length ? generic : all;
  const us = candidates.filter(isUSEnglish);
  return us.length ? us : candidates;
}

/** @type{SpeechSynthesisVoice[]} */
let voices = [];

// Pre-load voices as early as possible so speakSync() can use them.
// Chrome fires "voiceschanged" asynchronously; this ensures the cache is warm.
if (typeof speechSynthesis !== "undefined") {
  voices = usOnly(speechSynthesis.getVoices());
  speechSynthesis.addEventListener("voiceschanged", () => {
    voices = usOnly(speechSynthesis.getVoices());
  });
}

/** The preferred US-accent voice, or null when none have loaded yet */
export function preferredVoice() {
  return voices.find((voice) => voice.default) || voices[0] || null;
}

/**
 * Speak text synchronously inside a user-gesture handler.
 *
 * Unlike speak(), this does NOT await voice loading, so it stays within
 * Chrome's transient user-activation context and works without "await".
 * Call this directly from pointerup / click handlers.
 *
 * @param {string} text
 */
export function speakSync(text) {
  if (!text) return;
  const utterance = new SpeechSynthesisUtterance(text);
  // Attach the best pre-loaded voice if available (improves Chrome reliability)
  const voice = preferredVoice();
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = "en-US";
  }
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

/**
 * Promise to return voices
 *
 * @return {Promise<SpeechSynthesisVoice[]>} Available voices
 */
function getVoices() {
  return new Promise(function (resolve) {
    // iOS won't fire the voiceschanged event so we have to poll for them
    function f() {
      voices = (voices.length && voices) || usOnly(speechSynthesis.getVoices());
      if (voices.length) resolve(voices);
      else setTimeout(f, 100);
    }
    f();
  });
}

class VoiceSelect extends HTMLSelectElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.addVoices();
  }

  async addVoices() {
    const voices = await getVoices();
    /** @param {SpeechSynthesisVoice} a
     * @param {SpeechSynthesisVoice} b
     */
    function compareVoices(a, b) {
      return a.lang.localeCompare(b.lang) || a.name.localeCompare(b.name);
    }
    voices.sort(compareVoices);
    const current = this.getAttribute("value");
    for (const voice of voices) {
      const item = document.createElement("option");
      item.value = voice.voiceURI;
      if (voice.voiceURI == current) item.setAttribute("selected", "");
      item.innerText = `${voice.name} ${voice.lang}`;
      this.add(item);
    }
  }
}
customElements.define("select-voice", VoiceSelect, { extends: "select" });
