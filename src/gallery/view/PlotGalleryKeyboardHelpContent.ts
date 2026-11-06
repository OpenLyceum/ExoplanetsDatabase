/**
 * PlotGalleryKeyboardHelpContent.ts
 *
 * Keyboard help for the Plot Gallery: stepping through planets on a scatter plot or bars on a
 * bar chart, and the standard controls (radio buttons, checkbox).
 */

import {
  BasicActionsKeyboardHelpSection,
  KeyboardHelpIconFactory,
  KeyboardHelpSection,
  KeyboardHelpSectionRow,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";
import { StringManager } from "../../i18n/StringManager.js";

export class PlotGalleryKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    const strings = StringManager.getInstance().getCommonStrings().keyboardHelp;
    const plotSection = new KeyboardHelpSection(strings.plotHeadingStringProperty, [
      KeyboardHelpSectionRow.labelWithIcon(
        strings.stepPlanetsStringProperty,
        KeyboardHelpIconFactory.leftRightArrowKeysRowIcon(),
      ),
    ]);
    const barsSection = new KeyboardHelpSection(strings.barsHeadingStringProperty, [
      KeyboardHelpSectionRow.labelWithIcon(
        strings.stepBarsStringProperty,
        KeyboardHelpIconFactory.leftRightArrowKeysRowIcon(),
      ),
    ]);
    super([plotSection, barsSection], [new BasicActionsKeyboardHelpSection({ withCheckboxContent: true })]);
  }
}
