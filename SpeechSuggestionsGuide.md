# Student Guide: AI Speech Suggestions

This build of OS-DPI can listen to the conversation around the device,
send the partner's speech to an AI, and offer the AAC user quick-tap
response suggestions. This guide covers setup, the three ways to put
suggestions on **your own board**, and how to export the research log.

## Requirements

- **Chrome or Edge.** Speech recognition uses the browser's Web Speech
  API, which Safari and Firefox don't provide. It also needs an internet
  connection (recognition runs on Google's servers) and a secure origin
  (**https** or `localhost`) or the microphone will be blocked.
- **A Groq API key** (free). Create one at <https://console.groq.com/keys>,
  then in the designer open the AI panel (Content tab) and paste it into
  the **API key** field. The key is stored only on your device — it is
  never saved inside a board file, so each computer you use needs the key
  entered once.

> **Privacy note for data collection:** while listening, the partner's
> speech is transcribed by Google (Chrome's speech service) and the
> transcript is sent to Groq to generate suggestions. If you are
> collecting data with real conversation partners, make sure your
> consent language covers this, and note the red **Listening** pill /
> pulsing mic shown while the microphone is live.

## Level 1 — no setup: the floating bar

Any board gets this for free. In user mode a round mic button floats in
the corner. Tap it to start listening; the bar expands to show what was
heard and a row of tappable suggestion chips. Tapping a chip speaks it
and the AI then offers follow-up suggestions to keep the conversation
going. The pencil button returns to the designer.

## Level 2 — a suggestions region on your board

Name a **Grid** on your board exactly `suggestions` and give it a filter
`#suggestion equals '1'`. While listening, the live suggestions are
written into your board's content as rows tagged `suggestion=1` (with
ARASAAC pictograms when one matches) and appear in that grid; they are
removed again when listening stops. Set the grid's `scale` to `0` if you
want it to collapse while idle — the system expands it when suggestions
arrive.

Add an **Action** with the grid's name as its origin to speak a tapped
suggestion, e.g. updates: `$Speak` ← `#label`.

## Level 3 — full native integration (the DEAN pattern)

For complete control, bind board components directly to the suggestion
states:

- `$Suggestion1` … `$Suggestion6` always hold the current suggestion
  texts (empty strings when idle). Bind **Display** components to them
  and they update live.
- To speak one on press, give the Display a `Name` and add an Action
  with that name as origin, condition `$SuggestionN != ''`, update
  `$Speak` ← `$SuggestionN`. When the spoken text matches a live
  suggestion, the exchange is archived automatically and follow-up
  suggestions are generated.
- Wire your own on-board button to start/stop listening with the eval
  function `toggle_speech_suggestions()` — use it as the new value of
  any state update, e.g. `$ignored` ← `toggle_speech_suggestions()`.
- **Steer the AI from your board's keyboard** by writing typed text to
  `$SuggestionHint` (e.g. letter keys update it with
  `add_letter(#label)`, backspace with `replace_last_letter('')`).
  While listening, suggestions regenerate built around whatever the
  user has typed, exactly like the floating bar's "type to steer"
  input. The hint is cleared automatically when a response is spoken.
- `$asr_status` is set to `"on"`/`"off"` for boards that include an
  **Indicator** component.

When a board binds any `$SuggestionN` state (or has a `suggestions`
grid), the floating bar hides itself except for the back-to-editor
pencil and a **Listening** pill while the mic is live.

See `examples/DEAN.osdpi` for a complete working example of this level.

## Exporting your data

Every listening session is logged to the design's log store:

| Event | Meaning | Extra columns |
| --- | --- | --- |
| `listen_start` / `listen_stop` | mic toggled | `Session` id |
| `heard` | a partner utterance triggered suggestions | `Text` (transcript), `Hint`, `LatencyMs` |
| `followup_prompt` | suggestions generated after the user spoke | same |
| `suggestion` | one offered suggestion | `Text`, `Rank` 1–6 |
| `chosen` | the user spoke a response | `Text`, `Source` (`chip`/`board`/`label`), `Rank` |
| `quick_phrase` | a floor-holding phrase ("Just a second") | `Text` |

Export with **File → Save Log** (CSV) or **Save Log XLSX** in the
designer toolbar; **Clear Log** empties it. The log lives in this
browser on this computer — export it before switching machines or
clearing browser data.

## Back up your board

Boards are stored only in your browser. **File → Download Backup**
saves a `.osdpi` file; do it after every serious editing session. A
cleared cache, a lab-machine reimage, or a different browser profile
means starting over without one.
