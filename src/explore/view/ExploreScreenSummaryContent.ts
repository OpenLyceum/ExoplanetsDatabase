/**
 * ExploreScreenSummaryContent.ts
 *
 * Screen-reader summary for the Explore screen. The current details say how many planets pass
 * the filters and which planet is selected, and update as they change.
 */

import { DerivedProperty } from "scenerystack/axon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { formatCount } from "../../common/view/format.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { ExploreModel } from "../model/ExploreModel.js";

export class ExploreScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: ExploreModel) {
    const a11y = StringManager.getInstance().getExploreA11yStrings();
    const database = model.database;
    const currentDetails = new DerivedProperty(
      [
        database.matchingPlanetsProperty,
        database.selectedPlanetProperty,
        a11y.currentDetailsPatternStringProperty,
        a11y.selectedPatternStringProperty,
        a11y.noSelectionStringProperty,
      ],
      (matches, selected, pattern, selectedPattern, none) =>
        pattern
          .replace("{{count}}", formatCount(matches.length))
          .replace(
            "{{selection}}",
            selected === null ? none : selectedPattern.replace("{{name}}", database.catalog.names[selected] ?? ""),
          ),
    );
    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: currentDetails,
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
