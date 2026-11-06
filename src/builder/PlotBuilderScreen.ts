/**
 * PlotBuilderScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createPlotBuilderIcon() in src/common/ExoplanetsDatabaseScreenIcons.ts.
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createPlotBuilderIcon } from "../common/ExoplanetsDatabaseScreenIcons.js";
import type { ExoplanetDatabase } from "../common/model/ExoplanetDatabase.js";
import ExoplanetsDatabaseColors from "../ExoplanetsDatabaseColors.js";
import { PlotBuilderModel } from "./model/PlotBuilderModel.js";
import { PlotBuilderKeyboardHelpContent } from "./view/PlotBuilderKeyboardHelpContent.js";
import { PlotBuilderScreenView } from "./view/PlotBuilderScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type PlotBuilderScreenOptions = ScreenOptions & { tandem: Tandem };

export class PlotBuilderScreen extends Screen<PlotBuilderModel, PlotBuilderScreenView> {
  public constructor(database: ExoplanetDatabase, showInTable: () => void, options: PlotBuilderScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new PlotBuilderModel(database, showInTable),
      // View factory — receives the model instance
      (model) =>
        new PlotBuilderScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<PlotBuilderScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: ExoplanetsDatabaseColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new PlotBuilderKeyboardHelpContent(),
          homeScreenIcon: createPlotBuilderIcon(),
          navigationBarIcon: createPlotBuilderIcon(),
        },
        options,
      ),
    );
  }
}
