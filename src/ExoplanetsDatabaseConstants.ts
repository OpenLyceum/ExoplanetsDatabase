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
const CONTROL_SPACING = 8;

/** Size of a plot marker, px. */
export const MARKER_SIZE = 5;

// ── Model ────────────────────────────────────────────────────────────────────
// The model uses the archive's own units (days, au, Earth and solar units), not SI,
// because those are the numbers students compare with the archive.

/** Year the archive's confirmed count first passed 4,000 planets (June 2019, IPAC news release). */
export const FOUR_THOUSAND_PLANETS_YEAR = 2019 + 5.5 / 12;

/** Settings for builder/view/PlotBuilderScreenView.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const PLOT_BUILDER_SCREEN_VIEW_SETTINGS = {
  HEADING_MAX_WIDTH_OFFSET: 20, // px
  QUANTITY_ITEMS_MAX_WIDTH_OFFSET: 60, // px
  CONSTRUCTOR_LEFT_PANEL_SPACING: 6, // px
  CONSTRUCTOR_TOP_OFFSET: 6, // px
  MATCH_COUNT_MAX_WIDTH_OFFSET: 20, // px
  FILTER_BUTTON_MIN_WIDTH_OFFSET: 24, // px
  CLEAR_BUTTON_MIN_WIDTH_OFFSET: 24, // px
  SELECTED_TEXT_MAX_WIDTH_OFFSET: 24, // px
  SHOW_IN_TABLE_BUTTON_MIN_WIDTH_OFFSET: 24, // px
  CREDIT_BOTTOM_OFFSET: 6, // px

  MARGIN: 10,
  LEFT_WIDTH: 200,
  RIGHT_WIDTH: 236,
  CHART_LEFT: 290,
  CHART_WIDTH: 425,
  CHART_HEIGHT: 330,
  /** Data range min (in the source module’s documented units). */
  DATA_RANGE_MIN: 1989,
  /** Data range max (in the source module’s documented units). */
  DATA_RANGE_MAX: 2027,
  AXIS_CONTROLS_SPACING: 6,
  COLOR_BY_GROUP_SPACING: 7,
  COLOR_BY_GROUP_RADIUS: 7,
  LEFT_PANEL_SPACING: 12,
  LEGEND_BOX_SPACING: 6,
  RIGHT_PANEL_SPACING: 8,
  CREDIT_MAX_WIDTH: 680,
} as const;

/** Settings for common/ExoplanetsDatabaseControlOptions.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const EXOPLANETS_DATABASE_CONTROL_OPTIONS_SETTINGS = {
  SLIDER_THUMB_SIZE_WIDTH: 12,
  SLIDER_THUMB_SIZE_HEIGHT: 22,
  STANDALONE_SLIDER_TRACK_SIZE_WIDTH: 150,
  STANDALONE_SLIDER_TRACK_SIZE_HEIGHT: 3,
  NUMBER_CONTROL_SLIDER_TRACK_SIZE_WIDTH: 110,
  NUMBER_CONTROL_SLIDER_TRACK_SIZE_HEIGHT: 3,
  CHECKBOX_BOX_WIDTH: 16,
  /** Exoplanets database number control options scale (dimensionless). */
  EXOPLANETS_DATABASE_NUMBER_CONTROL_OPTIONS_SCALE: 0.75,
  EXOPLANETS_DATABASE_NUMBER_CONTROL_OPTIONS_SLIDER_PADDING: 4,
  EXOPLANETS_DATABASE_NUMBER_CONTROL_OPTIONS_ARROW_BUTTON_SPACING: 3,
  EXOPLANETS_DATABASE_NUMBER_CONTROL_OPTIONS_VERTICAL_SPACING: 4,
  EXOPLANETS_DATABASE_CHECKBOX_OPTIONS_SPACING: 4,
} as const;

/** Settings for common/ExoplanetsDatabasePanel.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const EXOPLANETS_DATABASE_PANEL_SETTINGS = {
  OPTIONS_X_MARGIN: 12,
  OPTIONS_Y_MARGIN: 10,
} as const;

/** Settings for common/ExoplanetsDatabaseScreenIcons.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const EXOPLANETS_DATABASE_SCREEN_ICONS_SETTINGS = {
  CLUSTERS_ITEM_3_X: 0.58, // px
  CLUSTERS_ITEM_3_Y: 0.5, // px
  CLUSTERS_ITEM_4_X: 0.85, // px
  CLUSTERS_ITEM_4_Y: 0.15, // px
  CREATE_EXPLORE_ICON_X_VARIANT_2: 70, // px
  CREATE_EXPLORE_ICON_HEIGHT_SEGMENT_2: 12, // px

  SCATTER_POINTS_CLUSTERS_X: 0.4, // px
  SCATTER_POINTS_CLUSTERS_Y: 0.4, // px
  CREATE_EXPLORE_ICON_Y_OFFSET: 99, // px
  CREATE_EXPLORE_ICON_Y_FACTOR: 38, // dimensionless

  CLUSTERS_X: 0.2,
  CLUSTERS_Y: 0.55,
  OPTIONS_LINE_WIDTH: 6,
  BARS_X: 60,
  BARS_HEIGHT: 44,
  BARS_CORNER_RADIUS: 4,
  ROWS_X: 40,
  ROWS_Y: 30,
  ROWS_HEIGHT: 50,
  CREATE_EXPLORE_ICON_X: 40,
  CREATE_EXPLORE_ICON_HEIGHT: 38,
  CREATE_EXPLORE_ICON_CORNER_RADIUS: 3,
  CHOOSER_X: 30,
  CHOOSER_WIDTH: 120,
  CHOOSER_HEIGHT: 44,
  CHOOSER_LINE_WIDTH: 3,
  CHOOSER_CORNER_RADIUS: 6,
} as const;

/** Settings for common/model/physics.ts. */
export const PHYSICS_SETTINGS = {
  /** Days in a Julian year. */
  DAYS_PER_YEAR: 365.25,
  /** The Sun's effective temperature, K (IAU 2015 nominal value). */
  SUN_TEMPERATURE_K: 5772,
  /** Earth's mean density, g/cm³. */
  EARTH_DENSITY_G_CM3: 5.51,
  /** Light years in a parsec. */
  LIGHT_YEARS_PER_PARSEC: 3.2616,
  /** Core mass fraction of an Earth-like rocky planet (Zeng, Sasselov & Jacobsen 2016). */
  EARTH_LIKE_CORE_MASS_FRACTION: 0.325,
} as const;

/** Settings for common/model/plotPoints.ts. */
export const PLOT_POINTS_SETTINGS = {
  /** Group index of a point that is not drawn. */
  HIDDEN_GROUP: 255,
} as const;

/** Settings for common/view/DataCreditNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const DATA_CREDIT_NODE_SETTINGS = {
  CONSTRUCTOR_MAX_WIDTH: 700,
} as const;

/** Settings for common/view/FilterDialog.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const FILTER_DIALOG_SETTINGS = {
  TEXT_MAX_WIDTH_OFFSET: 16, // px
  ARCHIVE_TEXT_LINE_WRAP: 380, // px
  CONSTRUCTOR_CLEAR_BUTTON_MAX_WIDTH: 200, // px

  /** Width of a value field, px. */
  FIELD_WIDTH: 110,
  CONSTRUCTOR_X_MARGIN: 8,
  CONSTRUCTOR_Y_MARGIN: 4,
  TITLE_MAX_WIDTH: 380,
  CLEAR_BUTTON_MAX_WIDTH: 60,
  BOUND_ROW_SPACING: 10,
  BOUND_ROW_MAX_WIDTH: 90,
  REQUIRE_VALUE_CHECKBOX_MAX_WIDTH: 300,
  REQUIRE_VALUE_CHECKBOX_BOX_WIDTH: 16,
  REQUIRE_VALUE_CHECKBOX_SPACING: 6,
  ARCHIVE_TEXT_MAX_WIDTH: 380,
  CONTENT_SPACING: 12,
} as const;

/** Settings for common/view/FilterSummaryNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const FILTER_SUMMARY_NODE_SETTINGS = {
  FORMAT_DIGITS: 4, // digits

  /** Most filter lines shown; the rest are summarised as "…". */
  MAX_LINES: 5,
  CONTENT_SPACING: 4,
  CONSTRUCTOR_X_MARGIN: 10,
  CONSTRUCTOR_Y_MARGIN: 6,
  REBUILD_X_SPACING: 12,
  REBUILD_Y_SPACING: 3,
} as const;

/** Settings for common/view/LegendNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const LEGEND_NODE_SETTINGS = {
  SPACING: 5, // px

  LABEL_WIDTH: 140,
  COUNT_WIDTH: 44,
  CONSTRUCTOR_SPACING: 6,
} as const;

/** Settings for common/view/MatchCountNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const MATCH_COUNT_NODE_SETTINGS = {
  CONSTRUCTOR_MAX_WIDTH: 400,
} as const;

/** Settings for common/view/MethodCheckboxGroup.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const METHOD_CHECKBOX_GROUP_SETTINGS = {
  CHECKBOXES_MAX_WIDTH_OFFSET: 50, // px
  MEASURED_MASS_CHECKBOX_MAX_WIDTH_OFFSET: 30, // px

  CHECKBOXES_SPACING: 6,
  CONSTRUCTOR_SPACING: 5,
} as const;

/** Settings for common/view/PlotFrameNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const PLOT_FRAME_NODE_SETTINGS = {
  PLACE_AXIS_LABELS_TOP_OFFSET: 20, // px
  PLACE_AXIS_LABELS_RIGHT_OFFSET: 6, // px

  MINOR_GRID_LINE_WIDTH: 0.5,
  /** Minor grid opacity (dimensionless). */
  MINOR_GRID_OPACITY: 0.5,
} as const;

/** Settings for common/view/PointCloudNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const POINT_CLOUD_NODE_SETTINGS = {
  LINE_WIDTH_LINE_WIDTH: 2,
} as const;

/** Settings for common/view/ScatterChartNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const SCATTER_CHART_NODE_SETTINGS = {
  UPDATE_HIGHLIGHT_LEFT_OFFSET: 12, // px
  UPDATE_HIGHLIGHT_RIGHT_OFFSET: 12, // px
  UPDATE_HIGHLIGHT_BOTTOM_OFFSET: 8, // px
  UPDATE_HIGHLIGHT_TOP_OFFSET: 8, // px

  /** How close (px) the pointer must be to a planet to pick it. */
  PICK_DISTANCE: 9,
  TOOLTIP_X_MARGIN: 6,
  TOOLTIP_Y_MARGIN: 4,
  CIRCLES_LINE_WIDTH: 1.5,
} as const;

/** Settings for common/view/StackedBarChartNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const STACKED_BAR_CHART_NODE_SETTINGS = {
  SHOW_TOOLTIP_BOTTOM_OFFSET: 6, // px

  TOOLTIP_X_MARGIN: 6,
  TOOLTIP_Y_MARGIN: 4,
  LEFT_LEFT: 2,
} as const;

/** Settings for common/view/format.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const FORMAT_SETTINGS = {
  DEFAULT_DIGITS: 3,
} as const;

/** Settings for common/view/guides.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const GUIDES_SETTINGS = {
  FIT_X_DILATION: 3, // px

  LABEL_RIGHT_OFFSET: 4, // px
  LABEL_BOTTOM_OFFSET: 4, // px
  LABEL_TOP_OFFSET: 4, // px
  LINE_OPTIONS_LINE_DASH_DASH: 6, // px

  /** Rocky curves stop here, Earth masses (the fit's range, generously). */
  ROCKY_MAX_MASS: 30,
  /** Density of water, g/cm³. */
  SAMPLES: 60,
  TEXT_NODE_MAX_WIDTH: 120,
  /** Backdrop opacity (dimensionless). */
  BACKDROP_OPACITY: 0.8,
  BACKDROP_CORNER_RADIUS: 2,
  LINE_OPTIONS_LINE_WIDTH: 1.5,
} as const;

/** Settings for common/view/pointColorings.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const POINT_COLORINGS_SETTINGS = {
  /** First and last years of the year colour scale. */
  FIRST_YEAR: 1990,
  /** First and last years of the year colour scale. */
  LAST_YEAR: 2030,
  /** First and last years of the year colour scale. */
  YEAR_STEP: 2,
} as const;

/** Settings for counts/view/CountsScreenView.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const COUNTS_SCREEN_VIEW_SETTINGS = {
  GROWTH_TEXT_DECIMAL_PLACES: 2, // digits

  CAPTION_LINE_WRAP_OFFSET: 24, // px
  CAPTION_MAX_WIDTH_OFFSET: 24, // px
  CANDIDATE_NOTE_TOP_OFFSET: 22, // px
  OTHER_LIST_LINE_WRAP_OFFSET: 24, // px
  OTHER_LIST_MAX_WIDTH_OFFSET: 24, // px
  TOTAL_TEXT_MAX_WIDTH_OFFSET: 24, // px
  CONSTRUCTOR_METHODS_PANEL_SPACING: 10, // px
  METHODS_PANEL_TOP_OFFSET: 12, // px
  MARKER_OPTIONS_LINE_DASH_DASH: 5, // px
  CONSTRUCTOR_MARKER_OPTIONS_LINE_DASH_DASH: 4, // px
  MARKER_RIGHT_OFFSET: 6, // px
  MARKER_BOTTOM_OFFSET: 4, // px
  MARKER_MAX_WIDTH_OFFSET: 10, // px
  GROWTH_TEXT_MAX_WIDTH_OFFSET: 60, // px
  CONSTRUCTOR_GROWTH_PANEL_SPACING: 16, // px
  CREDIT_BOTTOM_OFFSET: 6, // px

  MARGIN: 10,
  TILE_HEIGHT: 92,
  METHODS_WIDTH: 440,
  BAR_MAX_WIDTH: 190,
  BAR_HEIGHT: 20,
  CHART_WIDTH: 400,
  CHART_HEIGHT: 270,
  /** The archive's confirmed count first passed this in June 2019. */
  FOUR_THOUSAND: 4000,
  TILES_SPACING: 4,
  ROW_SPACING: 8,
  ROW_MAX_WIDTH: 110,
  ROW_MAX_X: 110,
  METHODS_PANEL_SPACING: 8,
  METHODS_PANEL_MAX_WIDTH: 200,
  METHOD_LINES_LINE_WIDTH: 2,
  TOTAL_LINE_LINE_WIDTH: 2.5,
  TOTAL_LEGEND_SPACING: 6,
  TOTAL_LEGEND_END_X: 18,
  TOTAL_LEGEND_LINE_WIDTH: 2.5,
  GROWTH_PANEL_SPACING: 8,
  CREDIT_MAX_WIDTH: 680,
} as const;

/** Settings for explore/model/ExploreModel.ts. */
export const EXPLORE_MODEL_SETTINGS = {
  /** Most columns that fit across the table. */
  MAX_VISIBLE_COLUMNS: 9,
} as const;

/** Settings for explore/view/ColumnsDialog.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const COLUMNS_DIALOG_SETTINGS = {
  LABEL_MAX_WIDTH: 260,
  CHECKBOXES_BOX_WIDTH: 16,
  CHECKBOXES_SPACING: 6,
  HINT_MAX_WIDTH: 300,
  CONSTRUCTOR_SPACING: 6,
} as const;

/** Settings for explore/view/ExploreScreenView.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const EXPLORE_SCREEN_VIEW_SETTINGS = {
  BUTTON_MAX_WIDTH_OFFSET: 12, // px
  CONSTRUCTOR_TOP_OFFSET: 6, // px
  CREDIT_BOTTOM_OFFSET: 6, // px

  MARGIN: 10,
  SIDEBAR_WIDTH: 152,
  TABLE_WIDTH: 566,
  CARD_WIDTH: 268,
  TABLE_ROWS: 17,
  BUTTON_X_MARGIN: 6,
  BUTTON_Y_MARGIN: 4,
  SIDEBAR_SPACING: 6,
  SIDEBAR_X_MARGIN: 10,
  CREDIT_MAX_WIDTH: 680,
} as const;

/** Settings for explore/view/PlanetCardNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const PLANET_CARD_NODE_SETTINGS = {
  PERIOD_SQUARED_FORMAT_VALUE_DIGITS: 3, // digits
  A_CUBED_OVER_MASS_FORMAT_VALUE_DIGITS: 3, // digits
  DERIVED_LINES_DIGITS: 3, // digits
  DERIVED_LINES_DIGITS_SEGMENT_2: 2, // digits
  EARTH_REFERENCE_DIGITS: 4, // digits
  REBUILD_DIGITS: 4, // digits
  REBUILD_DIGITS_SEGMENT_2: 3, // digits

  CONTENT_WIDTH: 244,
  LABEL_WIDTH: 112,
  VALUE_WIDTH: 82,
  REFERENCE_WIDTH: 38,
  CONTENT_SPACING: 6,
  GRID_X_SPACING: 6,
  GRID_Y_SPACING: 2,
} as const;

/** Settings for explore/view/PlanetTableNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const PLANET_TABLE_NODE_SETTINGS = {
  FUNNEL_SHAPE_X_SEGMENT_2: 6, // px
  FUNNEL_SHAPE_Y_SEGMENT_2: 10, // px
  FUNNEL_SHAPE_X_SEGMENT_3: 4, // px
  FUNNEL_SHAPE_Y_SEGMENT_3: 9, // px
  DIMENSION2_WIDTH: 4, // px

  LAYOUT_MAX_WIDTH_OFFSET: 8, // px
  LAYOUT_MAX_WIDTH: 10, // px
  LAYOUT_BOTTOM_OFFSET: 4, // px
  CONSTRUCTOR_TOP_OFFSET: 6, // px
  CONSTRUCTOR_LEFT_OFFSET: 4, // px

  ROW_HEIGHT: 22,
  HEADER_HEIGHT: 40,
  SCROLL_BAR_WIDTH: 18,
  NAME_COLUMN_WIDTH: 138,
  METHOD_COLUMN_WIDTH: 72,
  CELL_PADDING: 5,
  FILTER_BUTTON_SIZE: 14,
  FUNNEL_SHAPE_X: 10,
  FUNNEL_SHAPE_Y: 5,
  SORT_INDICATOR_FONT_SIZE: 9,
  FILTER_BUTTON_X_MARGIN: 2,
  FILTER_BUTTON_Y_MARGIN: 2,
  TOP_TOP: 4,
  SCROLL_BAR_HEIGHT: 24,
  /** Scroll bar keyboard step (dimensionless). */
  SCROLL_BAR_KEYBOARD_STEP: 0.02,
  /** Scroll bar shift keyboard step (dimensionless). */
  SCROLL_BAR_SHIFT_KEYBOARD_STEP: 0.005,
  /** Scroll bar page keyboard step (dimensionless). */
  SCROLL_BAR_PAGE_KEYBOARD_STEP: 0.1,
} as const;

/** Settings for gallery/model/GalleryPreset.ts. */
export const GALLERY_PRESET_SETTINGS = {
  /** Period axis range min (days). */
  PERIOD_AXIS_RANGE_MIN: 0.1,
  /** Period axis range max (days). */
  PERIOD_AXIS_RANGE_MAX: 1e7,
  /** Mass axis range min (Earth masses). */
  MASS_AXIS_RANGE_MIN: 0.05,
  /** Mass axis range max (Earth masses). */
  MASS_AXIS_RANGE_MAX: 1e5,
  /** Radius axis range min (Earth radii). */
  RADIUS_AXIS_RANGE_MIN: 0.3,
  /** Radius axis range max (Earth radii). */
  RADIUS_AXIS_RANGE_MAX: 30,
  /** Year axis range min (calendar year). */
  YEAR_AXIS_RANGE_MIN: 1989,
  /** Year axis range max (calendar year). */
  YEAR_AXIS_RANGE_MAX: 2027,
  /** Mass vs orbit range min (AU). */
  MASS_VS_ORBIT_RANGE_MIN: 0.003,
  /** Mass vs orbit range max (AU). */
  MASS_VS_ORBIT_RANGE_MAX: 1e4,
  /** Radius vs period range min (days). */
  RADIUS_VS_PERIOD_RANGE_MIN: 0.1,
  /** Radius vs period range max (days). */
  RADIUS_VS_PERIOD_RANGE_MAX: 1e5,
  /** Mass vs radius range min (Earth masses). */
  MASS_VS_RADIUS_RANGE_MIN: 0.1,
  /** Mass vs radius range max (Earth masses). */
  MASS_VS_RADIUS_RANGE_MAX: 1e4,
  /** Keplers third law range min (AU). */
  KEPLERS_THIRD_LAW_RANGE_MIN: 0.003,
  /** Keplers third law range max (AU). */
  KEPLERS_THIRD_LAW_RANGE_MAX: 1e4,
  /** Distance histogram range max (pc). */
  DISTANCE_HISTOGRAM_RANGE_MAX: 1e4,
} as const;

/** Settings for gallery/view/PlotGalleryScreenView.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const PLOT_GALLERY_SCREEN_VIEW_SETTINGS = {
  SHOW_BARS_DIGITS: 2, // digits

  PRESET_LIST_MAX_WIDTH_OFFSET: 50, // px
  SOLAR_SYSTEM_CHECKBOX_MAX_WIDTH_OFFSET: 50, // px
  CONSTRUCTOR_TOP_OFFSET: 6, // px
  PLOTTED_TEXT_MAX_WIDTH_OFFSET: 20, // px
  CAPTION_PANEL_TOP_OFFSET: 62, // px
  CAPTION_PANEL_MIN_WIDTH_OFFSET: 24, // px
  CAPTION_PANEL_MAX_WIDTH_OFFSET: 24, // px
  CREDIT_BOTTOM_OFFSET: 6, // px

  MARGIN: 10,
  LIST_WIDTH: 190,
  CHART_LEFT: 268,
  CHART_WIDTH: 500,
  CHART_HEIGHT: 340,
  KEY_WIDTH: 220,
  /** Distance histogram: bins 0.2 dex wide. */
  DISTANCE_BIN_DEX: 0.2,
  PRESET_LIST_SPACING: 10,
  PRESET_LIST_RADIUS: 7,
  LIST_PANEL_SPACING: 10,
  KEY_PANEL_SPACING: 8,
  CAPTION_PANEL_SPACING: 4,
  CREDIT_MAX_WIDTH: 680,
} as const;

/** Settings for preferences/ExoplanetsDatabasePreferencesNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const EXOPLANETS_DATABASE_PREFERENCES_NODE_SETTINGS = {
  HEADER_FONT_SIZE: 18,
  ARCHIVE_SYNTAX_CHECKBOX_FONT_SIZE: 14,
  ARCHIVE_SYNTAX_CHECKBOX_SPACING: 8,
  CONSTRUCTOR_SPACING: 12,
} as const;

ExoplanetsDatabaseNamespace.register("ExoplanetsDatabaseConstants", {
  SCREEN_VIEW_MARGIN,
  PANEL_CORNER_RADIUS,
  CONTROL_SPACING,
  MARKER_SIZE,
  FOUR_THOUSAND_PLANETS_YEAR,
});
