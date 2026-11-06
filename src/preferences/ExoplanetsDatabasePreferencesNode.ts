/**
 * ExoplanetsDatabasePreferencesNode.ts
 *
 * Custom preferences UI shown in Preferences → Simulation. Controls are bound
 * to ExoplanetsDatabasePreferencesModel Properties (whose initial values come from
 * exoplanetsDatabaseQueryParameters).
 */

import { Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { Checkbox } from "scenerystack/sun";
import type { Tandem } from "scenerystack/tandem";
import ExoplanetsDatabaseColors from "../ExoplanetsDatabaseColors.js";
import ExoplanetsDatabaseNamespace from "../ExoplanetsDatabaseNamespace.js";
import { StringManager } from "../i18n/StringManager.js";
import type { ExoplanetsDatabasePreferencesModel } from "./ExoplanetsDatabasePreferencesModel.js";

export class ExoplanetsDatabasePreferencesNode extends VBox {
  public constructor(preferencesModel: ExoplanetsDatabasePreferencesModel, tandem?: Tandem) {
    const prefStrings = StringManager.getInstance().getPreferences();

    // The Preferences dialog is always white, so use the dark "light control surface"
    // colors (readable on white in both default and projector profiles), not textColorProperty
    // (which is near-white in default mode and would be invisible on the white dialog).
    const header = new Text(prefStrings.titleStringProperty, {
      font: new PhetFont({ size: 18, weight: "bold" }),
      fill: ExoplanetsDatabaseColors.controlSurfaceTextColorProperty,
    });

    const archiveSyntaxCheckbox = new Checkbox(
      preferencesModel.showArchiveSyntaxProperty,
      new Text(prefStrings.showArchiveSyntaxStringProperty, {
        font: new PhetFont(14),
        fill: ExoplanetsDatabaseColors.controlSurfaceTextColorProperty,
      }),
      {
        checkboxColor: ExoplanetsDatabaseColors.controlSurfaceTextColorProperty,
        checkboxColorBackground: ExoplanetsDatabaseColors.controlSurfaceColorProperty,
        spacing: 8,
        accessibleHelpText: prefStrings.showArchiveSyntaxHelpStringProperty,
        ...(tandem && { tandem: tandem.createTandem("archiveSyntaxCheckbox") }),
      },
    );

    super({
      align: "left",
      spacing: 12,
      children: [header, archiveSyntaxCheckbox],
    });
  }
}

ExoplanetsDatabaseNamespace.register("ExoplanetsDatabasePreferencesNode", ExoplanetsDatabasePreferencesNode);
