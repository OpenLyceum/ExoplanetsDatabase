/**
 * ExploreKeyboardHelpContent.ts
 *
 * Keyboard help for the Explore screen: moving through the table, typing filter values, and the
 * standard controls (checkboxes, buttons, the scroll bar).
 */

import {
  BasicActionsKeyboardHelpSection,
  KeyboardHelpIconFactory,
  KeyboardHelpSection,
  KeyboardHelpSectionRow,
  SliderControlsKeyboardHelpSection,
  TextKeyNode,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";
import { StringManager } from "../../i18n/StringManager.js";

export class ExploreKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    const strings = StringManager.getInstance().getCommonStrings().keyboardHelp;
    const tableSection = new KeyboardHelpSection(strings.tableHeadingStringProperty, [
      KeyboardHelpSectionRow.labelWithIcon(
        strings.nextPlanetStringProperty,
        KeyboardHelpIconFactory.upDownArrowKeysRowIcon(),
      ),
      KeyboardHelpSectionRow.labelWithIcon(
        strings.pagePlanetStringProperty,
        KeyboardHelpIconFactory.pageUpPageDownRowIcon(),
      ),
      KeyboardHelpSectionRow.labelWithIcon(
        strings.firstLastPlanetStringProperty,
        KeyboardHelpIconFactory.iconOrIcon(TextKeyNode.home(), TextKeyNode.end()),
      ),
    ]);
    const keypadSection = new KeyboardHelpSection(strings.keypadHeadingStringProperty, [
      KeyboardHelpSectionRow.labelWithIcon(strings.keypadTypeStringProperty, TextKeyNode.enter()),
    ]);
    super(
      [tableSection, keypadSection],
      [new BasicActionsKeyboardHelpSection({ withCheckboxContent: true }), new SliderControlsKeyboardHelpSection()],
    );
  }
}
