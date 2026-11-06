/**
 * PlotGalleryScreenSummaryContent.ts
 *
 * Screen-reader summary for the Plot Gallery. The current details name the plot shown; its
 * caption is read with the plot.
 */

import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { StringManager } from "../../i18n/StringManager.js";
import { GalleryPreset } from "../model/GalleryPreset.js";
import type { PlotGalleryModel } from "../model/PlotGalleryModel.js";

type PresetStrings = Readonly<Record<string, { titleStringProperty: TReadOnlyProperty<string> }>>;

export class PlotGalleryScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: PlotGalleryModel) {
    const strings = StringManager.getInstance();
    const a11y = strings.getPlotGalleryA11yStrings();
    const presets = strings.getPlotGalleryStrings().presets as unknown as PresetStrings;
    const titles = GalleryPreset.enumeration.values.map(
      (preset) => presets[preset.key]?.titleStringProperty as TReadOnlyProperty<string>,
    );
    const currentDetails = DerivedProperty.deriveAny(
      [model.presetProperty, a11y.currentDetailsPatternStringProperty, ...titles],
      () => {
        const preset = model.presetProperty.value;
        const title = presets[preset.key]?.titleStringProperty.value ?? "";
        return a11y.currentDetailsPatternStringProperty.value.replace("{{plot}}", title);
      },
    );
    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: currentDetails,
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
