/**
 * ExoplanetsDatabasePanel.ts
 *
 * A pre-themed Panel that automatically uses ExoplanetsDatabaseColors for background and
 * border. Use this for all control panels and info boxes in the sim so that
 * default / projector mode switching is handled automatically.
 *
 * ── Basic usage ───────────────────────────────────────────────────────────────
 *
 *   import { ExoplanetsDatabasePanel } from "../../common/ExoplanetsDatabasePanel.js";
 *   import { VBox, Text } from "scenerystack/scenery";
 *
 *   const content = new VBox({
 *     children: [ new Text("label"), slider ],
 *     spacing: 8,
 *   });
 *   const panel = new ExoplanetsDatabasePanel(content);
 *
 * ── Overriding defaults ───────────────────────────────────────────────────────
 *
 *   // Wider margins, sharper corners, custom stroke
 *   const panel = new ExoplanetsDatabasePanel(content, { xMargin: 20, cornerRadius: 0 });
 *
 *   // Transparent background (decorative border only)
 *   const panel = new ExoplanetsDatabasePanel(content, { fill: "transparent" });
 */

import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { Node } from "scenerystack/scenery";
import { Panel, type PanelOptions } from "scenerystack/sun";
import ExoplanetsDatabaseColors from "../ExoplanetsDatabaseColors.js";
import { PANEL_CORNER_RADIUS } from "../ExoplanetsDatabaseConstants.js";

export type ExoplanetsDatabasePanelOptions = PanelOptions;

export class ExoplanetsDatabasePanel extends Panel {
  public constructor(content: Node, providedOptions?: ExoplanetsDatabasePanelOptions) {
    const options = optionize<ExoplanetsDatabasePanelOptions, EmptySelfOptions, PanelOptions>()(
      {
        fill: ExoplanetsDatabaseColors.panelBackgroundColorProperty,
        stroke: ExoplanetsDatabaseColors.panelBorderColorProperty,
        cornerRadius: PANEL_CORNER_RADIUS,
        xMargin: 12,
        yMargin: 10,
      },
      providedOptions,
    );
    super(content, options);
  }
}
