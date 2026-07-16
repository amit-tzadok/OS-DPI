import { html } from "uhtml";
import { TreeBase } from "./treebase";
import Globals from "app/globals";
import "css/indicator.css";

/**
 * Status indicator bar, ported from the CADL (Buffalo) OS-DPI fork so
 * designs like DEAN load. Shows three small status lights driven by state:
 *   $asr_status        "off" | "starting" | "on" | "error" | "no-mic" | "reconnecting"
 *   $locationTracking  1 when on
 *   $socketStatus      "connected" | "reconnecting"
 * The upstream version used Font Awesome glyphs; this one is
 * self-contained (colored dots) so no font dependency is needed.
 */
class Indicator extends TreeBase {
  template() {
    const asrStatus = Globals.state.get("$asr_status");
    const locOn = Globals.state.get("$locationTracking") === 1;
    const socketStatus = Globals.state.get("$socketStatus");

    const asrOn = asrStatus === "on";
    const asrStarting = asrStatus === "starting" || asrStatus === "reconnecting";

    return this.component(
      {},
      html`
        <div id="indicator-bar">
          <div
            class="asr-indicator"
            title="Speech recognition"
            ?active=${asrOn}
            ?starting=${asrStarting}
          ></div>

          <div
            class="loc-indicator"
            title="Location tracking"
            ?active=${locOn}
          ></div>

          <div
            class="socket-indicator"
            title="Server connection"
            ?connected=${socketStatus === "connected"}
            ?reconnecting=${socketStatus === "reconnecting"}
          ></div>
        </div>
      `,
    );
  }

  getChildren() {
    return [];
  }
}

TreeBase.register(Indicator, "Indicator");
