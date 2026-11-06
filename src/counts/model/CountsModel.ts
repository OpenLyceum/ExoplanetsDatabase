/**
 * CountsModel.ts
 *
 * Model for the Counts screen: the headline numbers come straight from the catalog; the only
 * state is the first discovery year the method chart counts from.
 */

import { NumberProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { DiscoveryMethod } from "../../common/model/DiscoveryMethod.js";
import { CATALOG, type ExoplanetCatalog } from "../../common/model/ExoplanetCatalog.js";
import { Quantity } from "../../common/model/Quantity.js";

export class CountsModel implements TModel {
  public readonly catalog: ExoplanetCatalog;

  /** Earliest and latest discovery years in the snapshot. */
  public readonly yearRange: Range;

  /** The method chart counts planets discovered in this year or later. */
  public readonly sinceYearProperty: NumberProperty;

  public constructor(catalog: ExoplanetCatalog = CATALOG) {
    this.catalog = catalog;
    const years = Array.from(catalog.column(Quantity.DISCOVERY_YEAR)).filter(Number.isFinite);
    this.yearRange = new Range(Math.min(...years), Math.max(...years));
    this.sinceYearProperty = new NumberProperty(this.yearRange.min, { range: this.yearRange, numberType: "Integer" });
  }

  /** Planets per method discovered in `sinceYear` or later, in DiscoveryMethod order. */
  public methodCounts(sinceYear: number): number[] {
    const years = this.catalog.column(Quantity.DISCOVERY_YEAR);
    return DiscoveryMethod.enumeration.values.map(
      (method) => this.catalog.methods.filter((m, i) => m === method && (years[i] ?? 0) >= sinceYear).length,
    );
  }

  public reset(): void {
    this.sinceYearProperty.reset();
  }

  public step(_dt: number): void {
    // Nothing evolves in time.
  }
}
