import Globals from "app/globals";
import { speakSync } from "./speech";
import { speechSuggestions } from "./speechSuggestions";

/**
 * Route plain taps on board buttons into the access system.
 *
 * Actions rules normally fire only through an active access Method
 * (switch scanning, pointer dwell, …). When no Method is active, plain
 * taps would otherwise do nothing. This delegated listener mirrors what
 * pattern activation does (access/pattern/index.js): buttons marked with
 * the `click` attribute (Radio options, tabs, page arrows) get an
 * Activate event; buttons carrying board data go through the Actions
 * rules; labeled buttons with no matching rule just speak their label.
 *
 * @param {HTMLElement} root - the user-mode UI container
 */
export function attachTapRouter(root) {
  root.addEventListener("pointerup", (event) => {
    if (!event.isPrimary) return;
    if (Globals.state?.get("editing")) return;
    // An active access Method owns activation and routes presses itself —
    // responding here too would double-fire.
    if (Globals.methods?.children.some((m) => m.Active.value)) return;

    const target = /** @type {HTMLElement} */ (event.target);
    const button = target.closest("button");
    if (!button || button.disabled || !root.contains(button)) return;

    if (button.hasAttribute("click")) {
      button.dispatchEvent(new Event("Activate"));
      return;
    }

    const componentName = button.dataset.ComponentName;
    if (!componentName) return; // not a board button

    const label = button.dataset.label;
    const handled = Globals.actions?.children.some(
      (rule) =>
        rule.className === "Action" &&
        (rule.origin?.value === "*" || rule.origin?.value === componentName),
    );
    if (handled) {
      Globals.actions.applyRules(componentName, "press", { ...button.dataset });
      // Pressing a Display (speaking the composed sentence) or a suggestion
      // row (a complete reply) is the user taking their conversational turn.
      if (button.dataset.ComponentType === "Display" || button.dataset.suggestion) {
        const spoken = String(Globals.state?.get("$Speak") || "").trim();
        if (spoken) speechSuggestions.resetExchange(spoken);
      }
    } else if (label) {
      speakSync(label);
      // archive this exchange and listen fresh for the next sentence
      speechSuggestions.resetExchange(label);
    }
  });
}
