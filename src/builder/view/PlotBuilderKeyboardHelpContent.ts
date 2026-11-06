/**
 * PlotBuilderKeyboardHelpContent.ts
 *
 * Keyboard help for the Plot Builder: stepping through the plotted planets, the axis combo
 * boxes, typing filter values, and the standard controls.
 */

import {
  BasicActionsKeyboardHelpSection,
  ComboBoxKeyboardHelpSection,
  KeyboardHelpIconFactory,
  KeyboardHelpSection,
  KeyboardHelpSectionRow,
  TextKeyNode,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";
import { StringManager } from "../../i18n/StringManager.js";

export class PlotBuilderKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    const strings = StringManager.getInstance().getCommonStrings().keyboardHelp;
    const plotSection = new KeyboardHelpSection(strings.plotHeadingStringProperty, [
      KeyboardHelpSectionRow.labelWithIcon(
        strings.stepPlanetsStringProperty,
        KeyboardHelpIconFactory.leftRightArrowKeysRowIcon(),
      ),
    ]);
    const keypadSection = new KeyboardHelpSection(strings.keypadHeadingStringProperty, [
      KeyboardHelpSectionRow.labelWithIcon(strings.keypadTypeStringProperty, TextKeyNode.enter()),
    ]);
    super(
      [plotSection, new ComboBoxKeyboardHelpSection(), keypadSection],
      [new BasicActionsKeyboardHelpSection({ withCheckboxContent: true })],
    );
  }
}
