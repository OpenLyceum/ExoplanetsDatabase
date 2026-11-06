/**
 * PlotGalleryScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createPlotGalleryIcon() in src/common/ExoplanetsDatabaseScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createPlotGalleryIcon } from "../common/ExoplanetsDatabaseScreenIcons.js";
import ExoplanetsDatabaseColors from "../ExoplanetsDatabaseColors.js";
import { PlotGalleryModel } from "./model/PlotGalleryModel.js";
import { PlotGalleryKeyboardHelpContent } from "./view/PlotGalleryKeyboardHelpContent.js";
import { PlotGalleryScreenView } from "./view/PlotGalleryScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type PlotGalleryScreenOptions = ScreenOptions & { tandem: Tandem };

export class PlotGalleryScreen extends Screen<PlotGalleryModel, PlotGalleryScreenView> {
  public constructor(options: PlotGalleryScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new PlotGalleryModel(),
      // View factory — receives the model instance
      (model) =>
        new PlotGalleryScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<PlotGalleryScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: ExoplanetsDatabaseColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new PlotGalleryKeyboardHelpContent(),
          homeScreenIcon: createPlotGalleryIcon(),
          navigationBarIcon: createPlotGalleryIcon(),
        },
        options,
      ),
    );
  }
}
