/**
 * pointColorings.ts
 *
 * The ways the plots colour planets: by discovery method, discovery facility, discovery year, or
 * host-star mass. Each coloring gives the point styles, the group of each planet, and its legend.
 */

import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { Color, type ProfileColorProperty } from "scenerystack/scenery";
import { DiscoveryMethod } from "../../common/model/DiscoveryMethod.js";
import type { ExoplanetCatalog } from "../../common/model/ExoplanetCatalog.js";
import { FacilityGroup } from "../../common/model/FacilityGroup.js";
import { Quantity } from "../../common/model/Quantity.js";
import ExoplanetsDatabaseColors from "../../ExoplanetsDatabaseColors.js";
import { StringManager } from "../../i18n/StringManager.js";
import { facilityColor, facilityMarker, facilityName, methodColor, methodMarker, methodName } from "./dataStyles.js";
import { MarkerShape } from "./MarkerShape.js";
import type { PointStyle } from "./PointCloudNode.js";

export type LegendEntry = {
  readonly label: TReadOnlyProperty<string>;
  readonly color: TReadOnlyProperty<Color>;
  readonly marker: MarkerShape;
  /** Style groups this entry stands for (for counting plotted points). */
  readonly groups: readonly number[];
};

export type PointColoring = {
  readonly styles: readonly PointStyle[];
  readonly groupOf: (catalog: ExoplanetCatalog, index: number) => number;
  readonly legend: readonly LegendEntry[];
};

const css = (color: ProfileColorProperty) => (): string => color.value.toCSS();

export const METHOD_COLORING: PointColoring = {
  styles: DiscoveryMethod.enumeration.values.map((m) => ({ css: css(methodColor(m)), marker: methodMarker(m) })),
  groupOf: (catalog, i) => DiscoveryMethod.enumeration.values.indexOf(catalog.methods[i] as DiscoveryMethod),
  legend: DiscoveryMethod.enumeration.values.map((m, group) => ({
    label: methodName(m),
    color: methodColor(m),
    marker: methodMarker(m),
    groups: [group],
  })),
};

export const FACILITY_COLORING: PointColoring = {
  styles: FacilityGroup.enumeration.values.map((g) => ({ css: css(facilityColor(g)), marker: facilityMarker(g) })),
  groupOf: (catalog, i) => FacilityGroup.enumeration.values.indexOf(catalog.facilityGroups[i] as FacilityGroup),
  legend: FacilityGroup.enumeration.values.map((g, group) => ({
    label: facilityName(g),
    color: facilityColor(g),
    marker: facilityMarker(g),
    groups: [group],
  })),
};

/** Host-star mass bins, M☉: below 0.6 (M dwarfs and small K stars), 0.6–1.4 (Sun-like), above. */
const STAR_MASS_LIMITS = [0.6, 1.4] as const;
const STAR_MASS_COLORS = [
  ExoplanetsDatabaseColors.smallStarColorProperty,
  ExoplanetsDatabaseColors.sunLikeStarColorProperty,
  ExoplanetsDatabaseColors.massiveStarColorProperty,
];

export const STAR_MASS_COLORING: PointColoring = {
  styles: STAR_MASS_COLORS.map((color) => ({ css: css(color), marker: MarkerShape.CIRCLE })),
  groupOf: (catalog, i) => {
    const mass = catalog.value(i, Quantity.STAR_MASS);
    if (!Number.isFinite(mass)) {
      return 255;
    }
    return mass < STAR_MASS_LIMITS[0] ? 0 : mass <= STAR_MASS_LIMITS[1] ? 1 : 2;
  },
  legend: (() => {
    const strings = StringManager.getInstance().getCommonStrings().starMassGroups;
    return [strings.smallStringProperty, strings.sunLikeStringProperty, strings.massiveStringProperty].map(
      (label, group) => ({
        label,
        color: STAR_MASS_COLORS[group] as ProfileColorProperty,
        marker: MarkerShape.CIRCLE,
        groups: [group],
      }),
    );
  })(),
};

/** First and last years of the year colour scale. */
const FIRST_YEAR = 1990;
const LAST_YEAR = 2030;
const YEAR_STEP = 2;
const YEAR_GROUPS = (LAST_YEAR - FIRST_YEAR) / YEAR_STEP;

const yearColor = (t: number): Color =>
  Color.interpolateRGBA(
    ExoplanetsDatabaseColors.oldestYearColorProperty.value,
    ExoplanetsDatabaseColors.newestYearColorProperty.value,
    Math.max(0, Math.min(1, t)),
  );

export const YEAR_COLORING: PointColoring = {
  styles: Array.from({ length: YEAR_GROUPS }, (_, group) => ({
    css: () => yearColor(group / (YEAR_GROUPS - 1)).toCSS(),
    marker: MarkerShape.CIRCLE,
  })),
  groupOf: (catalog, i) => {
    const year = catalog.value(i, Quantity.DISCOVERY_YEAR);
    return Number.isFinite(year)
      ? Math.max(0, Math.min(YEAR_GROUPS - 1, Math.floor((year - FIRST_YEAR) / YEAR_STEP)))
      : 255;
  },
  legend: [1990, 2000, 2010, 2020].map((decade) => {
    const first = Math.floor((decade - FIRST_YEAR) / YEAR_STEP);
    const groups = Array.from({ length: 10 / YEAR_STEP }, (_, k) => first + k);
    return {
      label: new DerivedProperty(
        [StringManager.getInstance().getCommonStrings().decadePatternStringProperty],
        (pattern) => pattern.replace("{{decade}}", String(decade)),
      ),
      color: new DerivedProperty(
        [ExoplanetsDatabaseColors.oldestYearColorProperty, ExoplanetsDatabaseColors.newestYearColorProperty],
        () => yearColor((first + 2) / (YEAR_GROUPS - 1)),
      ),
      marker: MarkerShape.CIRCLE,
      groups,
    };
  }),
};
