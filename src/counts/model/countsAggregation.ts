/**
 * countsAggregation.ts
 *
 * Pure helpers for the Counts screen: planets-per-method tallies and the growth
 * series used by the cumulative discovery chart. CountsModel turns these into
 * Properties; the view only paints.
 */

import { DiscoveryMethod } from "../../common/model/DiscoveryMethod.js";
import type { ExoplanetCatalog } from "../../common/model/ExoplanetCatalog.js";
import { FacilityGroup } from "../../common/model/FacilityGroup.js";
import { Quantity } from "../../common/model/Quantity.js";

/** Headline tile numbers across the top of the Counts screen. */
export type HeadlineCounts = {
  confirmed: number;
  tessCandidates: number;
  keplerCandidates: number;
  byTess: number;
  byKepler: number;
};

/** Method-bar presentation: counts in DiscoveryMethod order, plus total and max. */
export type MethodCountsPresentation = {
  counts: number[];
  total: number;
  max: number;
};

/**
 * Sorted discovery times (year as a decimal) for the cumulative step chart:
 * one series per DiscoveryMethod, plus the all-planets series.
 */
export type GrowthChartData = {
  /** Left edge of the year axis. */
  firstYear: number;
  /** Right edge of the year axis (half a year past the latest discovery). */
  lastYear: number;
  /** Top of the count axis (rounded up to the next thousand). */
  yMax: number;
  /** DiscoveryMethod-order series of sorted discovery times. */
  methodTimes: number[][];
  /** All planets' sorted discovery times. */
  allTimes: number[];
};

/** Headline tiles: confirmed + candidates + facility group counts. */
export function headlineCounts(catalog: ExoplanetCatalog): HeadlineCounts {
  const facilityCount = (group: FacilityGroup): number => catalog.facilityGroups.filter((g) => g === group).length;
  return {
    confirmed: catalog.size,
    tessCandidates: catalog.tessCandidates,
    keplerCandidates: catalog.keplerCandidates,
    byTess: facilityCount(FacilityGroup.TESS),
    byKepler: facilityCount(FacilityGroup.KEPLER),
  };
}

/** Planets per method discovered in `sinceYear` or later. */
export function methodCountsPresentation(catalog: ExoplanetCatalog, sinceYear: number): MethodCountsPresentation {
  const years = catalog.column(Quantity.DISCOVERY_YEAR);
  const counts = DiscoveryMethod.enumeration.values.map(
    (method) => catalog.methods.filter((m, i) => m === method && (years[i] ?? 0) >= sinceYear).length,
  );
  const total = counts.reduce((a, b) => a + b, 0);
  return { counts, total, max: Math.max(1, ...counts) };
}

/** Discovery date as a year fraction for catalog index `i`. */
function discoveryDate(catalog: ExoplanetCatalog, i: number): number {
  const month = catalog.discoveryMonths[i] ?? Number.NaN;
  return Number.isFinite(month) ? month : catalog.value(i, Quantity.DISCOVERY_YEAR) + 0.5;
}

/** Precomputes the growth chart's sorted series from the frozen catalog. */
export function growthChartData(catalog: ExoplanetCatalog, firstYear = 1990): GrowthChartData {
  const dates = Array.from({ length: catalog.size }, (_, i) => discoveryDate(catalog, i));
  const finiteMonths = Array.from(catalog.discoveryMonths).filter(Number.isFinite);
  const lastYear = Math.ceil(Math.max(...finiteMonths)) + 0.5;
  const yMax = Math.ceil((catalog.size * 1.08) / 1000) * 1000;
  const methods = DiscoveryMethod.enumeration.values;
  const methodTimes = methods.map((method) =>
    dates.filter((_, i) => catalog.methods[i] === method).sort((a, b) => a - b),
  );
  const allTimes = [...dates].sort((a, b) => a - b);
  return { firstYear, lastYear, yMax, methodTimes, allTimes };
}
