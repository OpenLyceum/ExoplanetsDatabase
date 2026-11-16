import { EXOPLANETS_DATABASE_CONTROL_OPTIONS_SETTINGS } from "../ExoplanetsDatabaseConstants.js";
/**
 * ExoplanetsDatabaseControlOptions.ts
 *
 * Shared sizing and layout for panel controls (sliders, checkboxes, NumberControls).
 * Import these instead of repeating scale / track-size values in each screen view.
 *
 * Template-owned toolkit: each sim uses only some of these, so every export is tagged
 * `@public` to tell dead-code checkers (knip) that an unused one is not dead code.
 */

import { Dimension2 } from "scenerystack/dot";
import { NumberControl } from "scenerystack/scenery-phet";
import type { CheckboxOptions, HSliderOptions } from "scenerystack/sun";
import ExoplanetsDatabaseColors from "../ExoplanetsDatabaseColors.js";
import { FLAT_RECTANGULAR_BUTTON_OPTIONS } from "./ExoplanetsDatabaseButtonOptions.js";

const SLIDER_THUMB_SIZE = new Dimension2(
  EXOPLANETS_DATABASE_CONTROL_OPTIONS_SETTINGS.SLIDER_THUMB_SIZE_WIDTH,
  EXOPLANETS_DATABASE_CONTROL_OPTIONS_SETTINGS.SLIDER_THUMB_SIZE_HEIGHT,
);
const STANDALONE_SLIDER_TRACK_SIZE = new Dimension2(
  EXOPLANETS_DATABASE_CONTROL_OPTIONS_SETTINGS.STANDALONE_SLIDER_TRACK_SIZE_WIDTH,
  EXOPLANETS_DATABASE_CONTROL_OPTIONS_SETTINGS.STANDALONE_SLIDER_TRACK_SIZE_HEIGHT,
);
const NUMBER_CONTROL_SLIDER_TRACK_SIZE = new Dimension2(
  EXOPLANETS_DATABASE_CONTROL_OPTIONS_SETTINGS.NUMBER_CONTROL_SLIDER_TRACK_SIZE_WIDTH,
  EXOPLANETS_DATABASE_CONTROL_OPTIONS_SETTINGS.NUMBER_CONTROL_SLIDER_TRACK_SIZE_HEIGHT,
);
const CHECKBOX_BOX_WIDTH: number = EXOPLANETS_DATABASE_CONTROL_OPTIONS_SETTINGS.CHECKBOX_BOX_WIDTH;

/** Options for standalone HSlider instances in control panels. @public */
export const EXOPLANETS_DATABASE_SLIDER_OPTIONS = {
  trackSize: STANDALONE_SLIDER_TRACK_SIZE,
  thumbSize: SLIDER_THUMB_SIZE,
  trackFillEnabled: ExoplanetsDatabaseColors.textColorProperty,
} satisfies HSliderOptions;

/** Base NumberControl options; spread into each instance and add titleNodeOptions as needed. @public */
export const EXOPLANETS_DATABASE_NUMBER_CONTROL_OPTIONS = {
  arrowButtonOptions: {
    ...FLAT_RECTANGULAR_BUTTON_OPTIONS,
    scale: EXOPLANETS_DATABASE_CONTROL_OPTIONS_SETTINGS.EXOPLANETS_DATABASE_NUMBER_CONTROL_OPTIONS_SCALE,
  },
  layoutFunction: NumberControl.createLayoutFunction4({
    sliderPadding:
      EXOPLANETS_DATABASE_CONTROL_OPTIONS_SETTINGS.EXOPLANETS_DATABASE_NUMBER_CONTROL_OPTIONS_SLIDER_PADDING,
    arrowButtonSpacing:
      EXOPLANETS_DATABASE_CONTROL_OPTIONS_SETTINGS.EXOPLANETS_DATABASE_NUMBER_CONTROL_OPTIONS_ARROW_BUTTON_SPACING,
    verticalSpacing:
      EXOPLANETS_DATABASE_CONTROL_OPTIONS_SETTINGS.EXOPLANETS_DATABASE_NUMBER_CONTROL_OPTIONS_VERTICAL_SPACING,
  }),
  sliderOptions: {
    trackSize: NUMBER_CONTROL_SLIDER_TRACK_SIZE,
    thumbSize: SLIDER_THUMB_SIZE,
    trackFillEnabled: ExoplanetsDatabaseColors.textColorProperty,
  },
};

/**
 * Themed checkbox chrome on dark panel backgrounds.
 *
 * The box fill matches the panel so the control reads as part of the panel, and
 * the tick/border use {@link ExoplanetsDatabaseColors.textColorProperty} (near-white in default
 * mode). Do not use {@link ExoplanetsDatabaseColors.controlSurfaceColorProperty} here — that
 * colour is for white chrome (push buttons, combo lists, Preferences).
 *
 * @public
 */
export const EXOPLANETS_DATABASE_CHECKBOX_OPTIONS = {
  boxWidth: CHECKBOX_BOX_WIDTH,
  spacing: EXOPLANETS_DATABASE_CONTROL_OPTIONS_SETTINGS.EXOPLANETS_DATABASE_CHECKBOX_OPTIONS_SPACING,
  checkboxColor: ExoplanetsDatabaseColors.textColorProperty,
  checkboxColorBackground: ExoplanetsDatabaseColors.panelBackgroundColorProperty,
} satisfies CheckboxOptions;
