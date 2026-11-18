/**
 * CountsKeyboardHelpContent.ts
 *
 * Keyboard help for the Counts screen: the starting year is a NumberSpinner, so it gets the
 * stock spinner section; the rest are standard controls.
 */

import {
  BasicActionsKeyboardHelpSection,
  SpinnerControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";

export class CountsKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    super([new BasicActionsKeyboardHelpSection()], [new SpinnerControlsKeyboardHelpSection()]);
  }
}
