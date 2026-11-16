/**
 * CountsModel.ts
 *
 * Model for the Counts screen: headline tile numbers, planets-per-method tallies
 * (driven by the since-year spinner), and the precomputed growth-chart series.
 * Aggregation lives here (and in countsAggregation.ts); the view only paints.
 */

import { DerivedProperty, NumberProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { CATALOG, type ExoplanetCatalog } from "../../common/model/ExoplanetCatalog.js";
import { Quantity } from "../../common/model/Quantity.js";
import {
  type GrowthChartData,
  growthChartData,
  type HeadlineCounts,
  headlineCounts,
  type MethodCountsPresentation,
  methodCountsPresentation,
} from "./countsAggregation.js";

export type { GrowthChartData, HeadlineCounts, MethodCountsPresentation } from "./countsAggregation.js";

export class CountsModel implements TModel {
  public readonly catalog: ExoplanetCatalog;

  /** Earliest and latest discovery years in the snapshot. */
  public readonly yearRange: Range;

  /** The method chart counts planets discovered in this year or later. */
  public readonly sinceYearProperty: NumberProperty;

  /** Headline tile numbers (frozen with the catalog). */
  public readonly headlines: HeadlineCounts;

  /** Precomputed growth-chart series and axis extents. */
  public readonly growth: GrowthChartData;

  /** Method-bar counts / total / max for the current since-year. */
  public readonly methodCountsProperty: TReadOnlyProperty<MethodCountsPresentation>;

  public constructor(catalog: ExoplanetCatalog = CATALOG) {
    this.catalog = catalog;
    const years = Array.from(catalog.column(Quantity.DISCOVERY_YEAR)).filter(Number.isFinite);
    this.yearRange = new Range(Math.min(...years), Math.max(...years));
    this.sinceYearProperty = new NumberProperty(this.yearRange.min, { range: this.yearRange, numberType: "Integer" });
    this.headlines = headlineCounts(catalog);
    this.growth = growthChartData(catalog);
    this.methodCountsProperty = new DerivedProperty([this.sinceYearProperty], (sinceYear) =>
      methodCountsPresentation(catalog, sinceYear),
    );
  }

  /** Planets per method discovered in `sinceYear` or later, in DiscoveryMethod order. */
  public methodCounts(sinceYear: number): number[] {
    return methodCountsPresentation(this.catalog, sinceYear).counts;
  }

  public reset(): void {
    this.sinceYearProperty.reset();
  }

  public step(_dt: number): void {
    // Nothing evolves in time.
  }
}
