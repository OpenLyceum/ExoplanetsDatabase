/**
 * CountsScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createCountsIcon() in src/common/ExoplanetsDatabaseScreenIcons.ts.
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createCountsIcon } from "../common/ExoplanetsDatabaseScreenIcons.js";
import ExoplanetsDatabaseColors from "../ExoplanetsDatabaseColors.js";
import { CountsModel } from "./model/CountsModel.js";
import { CountsKeyboardHelpContent } from "./view/CountsKeyboardHelpContent.js";
import { CountsScreenView } from "./view/CountsScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type CountsScreenOptions = ScreenOptions & { tandem: Tandem };

export class CountsScreen extends Screen<CountsModel, CountsScreenView> {
  public constructor(options: CountsScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new CountsModel(),
      // View factory — receives the model instance
      (model) =>
        new CountsScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<CountsScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: ExoplanetsDatabaseColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new CountsKeyboardHelpContent(),
          homeScreenIcon: createCountsIcon(),
          navigationBarIcon: createCountsIcon(),
        },
        options,
      ),
    );
  }
}
