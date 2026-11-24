/** Live screen-reader summary of the confirmed total and the filtered method chart. */
import { DerivedProperty } from "scenerystack/axon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { formatCount } from "../../common/view/format.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { CountsModel } from "../model/CountsModel.js";

export class CountsScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: CountsModel) {
    const a11y = StringManager.getInstance().getCountsA11yStrings();
    const currentDetailsProperty = new DerivedProperty(
      [model.methodCountsProperty, model.sinceYearProperty, a11y.currentDetailsPatternStringProperty],
      (presentation, year, pattern) =>
        pattern
          .replace("{{confirmed}}", formatCount(model.headlines.confirmed))
          .replace("{{count}}", formatCount(presentation.total))
          .replace("{{year}}", String(year)),
    );
    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: currentDetailsProperty,
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
    this.disposeEmitter.addListener(() => currentDetailsProperty.dispose());
  }
}
