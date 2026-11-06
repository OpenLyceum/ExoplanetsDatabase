/**
 * PlotBuilderScreenSummaryContent.ts
 *
 * Screen-reader summary for the Plot Builder. The current details name the two plotted
 * quantities, the number of planets passing the filters, and the selected planet.
 */

import { DerivedProperty } from "scenerystack/axon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { quantityName } from "../../common/view/dataStyles.js";
import { formatCount } from "../../common/view/format.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { PlotBuilderModel } from "../model/PlotBuilderModel.js";

export class PlotBuilderScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: PlotBuilderModel) {
    const strings = StringManager.getInstance();
    const a11y = strings.getPlotBuilderA11yStrings();
    const explore = strings.getExploreA11yStrings();
    const database = model.database;
    const currentDetails = new DerivedProperty(
      [
        model.xQuantityProperty,
        model.yQuantityProperty,
        database.matchingPlanetsProperty,
        database.selectedPlanetProperty,
        a11y.currentDetailsPatternStringProperty,
        explore.selectedPatternStringProperty,
        explore.noSelectionStringProperty,
      ],
      (x, y, matches, selected, pattern, selectedPattern, none) =>
        pattern
          .replace("{{x}}", quantityName(x).value)
          .replace("{{y}}", quantityName(y).value)
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
