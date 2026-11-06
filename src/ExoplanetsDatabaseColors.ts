/**
 * ExoplanetsDatabaseColors.ts
 *
 * Defines all dynamic colors for the simulation using ProfileColorProperty.
 *
 * Each color has two profiles:
 *   - "default"   — used in standard (dark) mode
 *   - "projector" — used when the user enables Projector Mode in Preferences
 *
 * SceneryStack switches profiles automatically; no manual toggling is needed.
 *
 * ── Usage ─────────────────────────────────────────────────────────────────────
 * Import ExoplanetsDatabaseColors and pass properties directly to Node's fillProperty or
 * strokeProperty options:
 *
 *   import ExoplanetsDatabaseColors from "../../ExoplanetsDatabaseColors.js";
 *
 *   new Rectangle( 0, 0, 100, 50, {
 *     fillProperty: ExoplanetsDatabaseColors.backgroundColorProperty,
 *   });
 *
 * ── How to add a color ────────────────────────────────────────────────────────
 * Add a new ProfileColorProperty entry to the ExoplanetsDatabaseColors object below.
 * Always provide both "default" and "projector" values.
 */
import { ProfileColorProperty } from "scenerystack/scenery";
import ExoplanetsDatabaseNamespace from "./ExoplanetsDatabaseNamespace.js";

const ExoplanetsDatabaseColors = {
  /**
   * Background color for the simulation screen.
   * Deep navy in default mode; white in projector mode.
   */
  backgroundColorProperty: new ProfileColorProperty(ExoplanetsDatabaseNamespace, "background", {
    default: "#1a1a2e",
    projector: "#ffffff",
  }),

  /**
   * Primary accent color for highlights, selected items, and key UI elements.
   * Sky blue in default mode; dark navy in projector mode.
   */
  accentColorProperty: new ProfileColorProperty(ExoplanetsDatabaseNamespace, "accent", {
    default: "#4fc3f7",
    projector: "#1a1a2e",
  }),

  /**
   * Background fill for control panels and dialogs.
   * Deep blue in default mode; light gray in projector mode.
   */
  panelBackgroundColorProperty: new ProfileColorProperty(ExoplanetsDatabaseNamespace, "panelBackground", {
    default: "#16213e",
    projector: "#f5f5f5",
  }),

  /**
   * Border/stroke color for control panels and dialogs.
   * Teal-navy in default mode; medium gray in projector mode.
   */
  panelBorderColorProperty: new ProfileColorProperty(ExoplanetsDatabaseNamespace, "panelBorder", {
    default: "#0f3460",
    projector: "#999999",
  }),

  /**
   * Text color for labels, readouts, and general UI text.
   * Near-white in default mode; near-black in projector mode.
   */
  textColorProperty: new ProfileColorProperty(ExoplanetsDatabaseNamespace, "text", {
    default: "#e0e0e0",
    projector: "#1a1a1a",
  }),

  // ── Light control surfaces ───────────────────────────────────────────────────
  // White chrome (combo boxes, flat push buttons, editable input fields) stays light
  // in both profiles; its text stays dark. Same values in default and projector mode,
  // but defined here so every color lives in one themeable place.

  /** Fill of light control surfaces: combo-box button/list, editable input fields. */
  controlSurfaceColorProperty: new ProfileColorProperty(ExoplanetsDatabaseNamespace, "controlSurface", {
    default: "#ffffff",
    projector: "#ffffff",
  }),

  /** Fill of a disabled control surface (grayed-out editable input field). */
  controlSurfaceDisabledColorProperty: new ProfileColorProperty(ExoplanetsDatabaseNamespace, "controlSurfaceDisabled", {
    default: "#cccccc",
    projector: "#cccccc",
  }),

  /** Text on light control surfaces: combo items, flat-button labels, field values, preferences. */
  controlSurfaceTextColorProperty: new ProfileColorProperty(ExoplanetsDatabaseNamespace, "controlSurfaceText", {
    default: "#1a1a1a",
    projector: "#1a1a1a",
  }),
  // ── Data ─────────────────────────────────────────────────────────────────────
  // Discovery-method and facility colours follow the Okabe–Ito colour-blind-safe palette;
  // projector mode uses darker variants that read on white. Plots add marker shapes too, so
  // colour is never the only cue.

  transitColorProperty: new ProfileColorProperty(ExoplanetsDatabaseNamespace, "transit", {
    default: "#56b4e9",
    projector: "#0072b2",
  }),
  radialVelocityColorProperty: new ProfileColorProperty(ExoplanetsDatabaseNamespace, "radialVelocity", {
    default: "#e69f00",
    projector: "#d55e00",
  }),
  microlensingColorProperty: new ProfileColorProperty(ExoplanetsDatabaseNamespace, "microlensing", {
    default: "#2fd3a0",
    projector: "#008060",
  }),
  imagingColorProperty: new ProfileColorProperty(ExoplanetsDatabaseNamespace, "imaging", {
    default: "#f28cc8",
    projector: "#b8468a",
  }),
  otherMethodColorProperty: new ProfileColorProperty(ExoplanetsDatabaseNamespace, "otherMethod", {
    default: "#f0e442",
    projector: "#6b6b6b",
  }),

  keplerColorProperty: new ProfileColorProperty(ExoplanetsDatabaseNamespace, "kepler", {
    default: "#56b4e9",
    projector: "#0072b2",
  }),
  k2ColorProperty: new ProfileColorProperty(ExoplanetsDatabaseNamespace, "k2", {
    default: "#a5d8f5",
    projector: "#5aa6d6",
  }),
  tessColorProperty: new ProfileColorProperty(ExoplanetsDatabaseNamespace, "tess", {
    default: "#f28cc8",
    projector: "#b8468a",
  }),
  otherSpaceColorProperty: new ProfileColorProperty(ExoplanetsDatabaseNamespace, "otherSpace", {
    default: "#2fd3a0",
    projector: "#008060",
  }),
  groundColorProperty: new ProfileColorProperty(ExoplanetsDatabaseNamespace, "ground", {
    default: "#e69f00",
    projector: "#d55e00",
  }),

  /** Discovery-year colour scale ends (oldest → newest), interpolated in between. */
  oldestYearColorProperty: new ProfileColorProperty(ExoplanetsDatabaseNamespace, "oldestYear", {
    default: "#7b5cff",
    projector: "#3b1f9e",
  }),
  newestYearColorProperty: new ProfileColorProperty(ExoplanetsDatabaseNamespace, "newestYear", {
    default: "#ffe14d",
    projector: "#e07b00",
  }),

  /** Solar System reference markers and labels. */
  solarSystemColorProperty: new ProfileColorProperty(ExoplanetsDatabaseNamespace, "solarSystem", {
    default: "#ffffff",
    projector: "#000000",
  }),

  /** Guide curves and reference lines on the plots. */
  guideLineColorProperty: new ProfileColorProperty(ExoplanetsDatabaseNamespace, "guideLine", {
    default: "#c0c8e0",
    projector: "#555555",
  }),

  // ── Charts and table chrome ─────────────────────────────────────────────────

  chartBackgroundColorProperty: new ProfileColorProperty(ExoplanetsDatabaseNamespace, "chartBackground", {
    default: "#10182e",
    projector: "#ffffff",
  }),
  gridLineColorProperty: new ProfileColorProperty(ExoplanetsDatabaseNamespace, "gridLine", {
    default: "#2c3a5e",
    projector: "#dddddd",
  }),
  axisColorProperty: new ProfileColorProperty(ExoplanetsDatabaseNamespace, "axis", {
    default: "#9aa6c4",
    projector: "#333333",
  }),
  tableHeaderColorProperty: new ProfileColorProperty(ExoplanetsDatabaseNamespace, "tableHeader", {
    default: "#22305a",
    projector: "#e3e8f2",
  }),
  tableRowColorProperty: new ProfileColorProperty(ExoplanetsDatabaseNamespace, "tableRow", {
    default: "#16213e",
    projector: "#ffffff",
  }),
  tableAlternateRowColorProperty: new ProfileColorProperty(ExoplanetsDatabaseNamespace, "tableAlternateRow", {
    default: "#1b2848",
    projector: "#f3f5f9",
  }),
  tableSelectedRowColorProperty: new ProfileColorProperty(ExoplanetsDatabaseNamespace, "tableSelectedRow", {
    default: "#2f5f8f",
    projector: "#c8def5",
  }),

  /** Values the archive estimated (e.g. masses from a mass–radius relation). */
  estimatedTextColorProperty: new ProfileColorProperty(ExoplanetsDatabaseNamespace, "estimatedText", {
    default: "#8d96ad",
    projector: "#7a7a7a",
  }),

  /** Secondary text: notes, captions, units. */
  secondaryTextColorProperty: new ProfileColorProperty(ExoplanetsDatabaseNamespace, "secondaryText", {
    default: "#b6bfd6",
    projector: "#4a4a4a",
  }),

  /** Active-filter highlight (filter buttons with a filter set, filter chips). */
  activeFilterColorProperty: new ProfileColorProperty(ExoplanetsDatabaseNamespace, "activeFilter", {
    default: "#ffd166",
    projector: "#b36b00",
  }),

  /** Archive syntax text (monospace). */
  codeTextColorProperty: new ProfileColorProperty(ExoplanetsDatabaseNamespace, "codeText", {
    default: "#9be7ff",
    projector: "#004f80",
  }),
};

export default ExoplanetsDatabaseColors;
