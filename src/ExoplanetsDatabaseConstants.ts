/**
 * ExoplanetsDatabaseConstants.ts
 *
 * Central repository for every named numeric constant used across the
 * simulation. Bare numbers that carry semantic meaning (sizes, margins,
 * physics defaults, ranges) belong here rather than inline in model or view
 * code, so they are named, documented, and changed in one place.
 *
 * Conventions
 * ───────────
 *  - Physics / model values use SI units (metres, seconds, kilograms, …);
 *    note the unit in a comment on each value.
 *  - Layout / chrome values are in screen pixels.
 *  - Colour strings live in ExoplanetsDatabaseColors.ts, not here.
 *  - Computed expressions (e.g. `2 * Math.PI`) may stay inline.
 *
 * Remove the example constants below and replace them with the sim's own.
 */

import { PhetFont } from "scenerystack/scenery-phet";
import ExoplanetsDatabaseNamespace from "./ExoplanetsDatabaseNamespace.js";

// ── Layout / chrome (screen pixels) ───────────────────────────────────────────

/** Margin between the screen edge and edge-anchored controls (e.g. Reset All). */
export const SCREEN_VIEW_MARGIN = 20;

/** Corner radius shared by control panels and dialogs. */
export const PANEL_CORNER_RADIUS = 6;

/** Fonts shared by every screen. */
export const FONTS = {
  TITLE: new PhetFont({ size: 15, weight: "bold" }),
  HEADING: new PhetFont({ size: 13, weight: "bold" }),
  LABEL: new PhetFont(13),
  SMALL: new PhetFont(11),
  TABLE: new PhetFont(12),
  TABLE_HEADER: new PhetFont({ size: 11, weight: "bold" }),
  BIG_NUMBER: new PhetFont({ size: 26, weight: "bold" }),
  MATCH_COUNT: new PhetFont({ size: 18, weight: "bold" }),
  CODE: new PhetFont({ size: 12, family: "Menlo, Consolas, 'Courier New', monospace" }),
  TICK_LABEL: new PhetFont(11),
  AXIS_LABEL: new PhetFont(13),
  CAPTION: new PhetFont(13),
} as const;

/** Vertical space between controls in a panel, px. */
export const CONTROL_SPACING = 8;

/** Size of a plot marker, px. */
export const MARKER_SIZE = 5;

// ── Model ────────────────────────────────────────────────────────────────────
// The model uses the archive's own units (days, au, Earth and solar units), not SI,
// because those are the numbers students compare with the archive.

/** Year the archive's confirmed count first passed 4,000 planets (June 2019, IPAC news release). */
export const FOUR_THOUSAND_PLANETS_YEAR = 2019 + 5.5 / 12;

ExoplanetsDatabaseNamespace.register("ExoplanetsDatabaseConstants", {
  SCREEN_VIEW_MARGIN,
  PANEL_CORNER_RADIUS,
  CONTROL_SPACING,
  MARKER_SIZE,
  FOUR_THOUSAND_PLANETS_YEAR,
});
