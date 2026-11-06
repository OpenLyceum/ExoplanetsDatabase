/**
 * PlanetFilter.ts
 *
 * Every filter the table and the Plot Builder apply: a range criterion per quantity, which
 * discovery methods to show, and whether planets whose mass was estimated from their radius are
 * hidden. `changedEmitter` fires after any change.
 */

import { BooleanProperty, Emitter, type TReadOnlyProperty } from "scenerystack/axon";
import { DiscoveryMethod } from "./DiscoveryMethod.js";
import type { ExoplanetCatalog } from "./ExoplanetCatalog.js";
import type { FilterPreset } from "./FilterPreset.js";
import { Quantity } from "./Quantity.js";
import { RangeCriterion } from "./RangeCriterion.js";

/** One line of "what to type in the archive". */
export type ArchiveFilter = {
  /** Column title in the archive's table. */
  readonly column: string;
  /** Text for that column's filter box. */
  readonly text: string;
};

/** Archive column that holds a planet's mass reference ("Calculated Value" when estimated). */
export const MASS_REFERENCE_COLUMN = "Planet Mass or Mass*sin(i) Reference";

export class PlanetFilter {
  public readonly criteria: ReadonlyMap<Quantity, RangeCriterion>;
  public readonly methodVisibleProperties: ReadonlyMap<DiscoveryMethod, BooleanProperty>;

  /** Hide planets whose mass the archive estimated from a mass–radius relation. */
  public readonly measuredMassOnlyProperty = new BooleanProperty(false);

  /** Fires after any criterion, method or the mass toggle changes. */
  public readonly changedEmitter = new Emitter();

  public constructor() {
    this.criteria = new Map(Quantity.enumeration.values.map((q) => [q, new RangeCriterion(q)]));
    this.methodVisibleProperties = new Map(
      DiscoveryMethod.enumeration.values.map((m) => [m, new BooleanProperty(true)]),
    );
    const changed = (): void => this.changedEmitter.emit();
    const properties: TReadOnlyProperty<unknown>[] = [this.measuredMassOnlyProperty];
    for (const criterion of this.criteria.values()) {
      properties.push(criterion.minProperty, criterion.maxProperty, criterion.requireValueProperty);
    }
    properties.push(...this.methodVisibleProperties.values());
    for (const property of properties) {
      property.lazyLink(changed);
    }
  }

  public criterion(quantity: Quantity): RangeCriterion {
    const criterion = this.criteria.get(quantity);
    if (!criterion) {
      throw new Error(`No criterion for ${quantity.key}`);
    }
    return criterion;
  }

  public methodVisibleProperty(method: DiscoveryMethod): BooleanProperty {
    const property = this.methodVisibleProperties.get(method);
    if (!property) {
      throw new Error(`No method toggle for ${method.key}`);
    }
    return property;
  }

  /** The active range criteria, in Quantity order. */
  public get activeCriteria(): RangeCriterion[] {
    return [...this.criteria.values()].filter((criterion) => criterion.isActive);
  }

  /** Whether any filter at all is applied. */
  public get isActive(): boolean {
    return (
      this.activeCriteria.length > 0 ||
      this.measuredMassOnlyProperty.value ||
      [...this.methodVisibleProperties.values()].some((property) => !property.value)
    );
  }

  /** Indices of the catalog's planets that pass every filter, in catalog order. */
  public matches(catalog: ExoplanetCatalog): Uint32Array {
    const active = this.activeCriteria.map((criterion) => ({ criterion, column: catalog.column(criterion.quantity) }));
    const visibleMethods = new Set(
      [...this.methodVisibleProperties].filter(([, property]) => property.value).map(([method]) => method),
    );
    const measuredOnly = this.measuredMassOnlyProperty.value;
    const result: number[] = [];
    for (let i = 0; i < catalog.size; i++) {
      if (!visibleMethods.has(catalog.methods[i] as DiscoveryMethod)) {
        continue;
      }
      if (measuredOnly && !catalog.hasMeasuredMass(i)) {
        continue;
      }
      if (active.every(({ criterion, column }) => criterion.accepts(column[i] ?? Number.NaN))) {
        result.push(i);
      }
    }
    return Uint32Array.from(result);
  }

  /** The same filters written for the archive's interactive table, one line per column. */
  public get archiveFilters(): ArchiveFilter[] {
    const lines: ArchiveFilter[] = [];
    const shown = [...this.methodVisibleProperties].filter(([, property]) => property.value).map(([method]) => method);
    if (shown.length < DiscoveryMethod.enumeration.values.length) {
      // The archive filters one method at a time; Other has no single value to type.
      const named = shown.filter((method) => method.archiveName !== null).map((method) => `'${method.archiveName}'`);
      if (named.length > 0) {
        lines.push({ column: "Discovery Method", text: named.join(" / ") });
      }
    }
    for (const criterion of this.activeCriteria) {
      lines.push({ column: criterion.quantity.archiveTitle, text: criterion.archiveSyntax ?? "" });
    }
    if (this.measuredMassOnlyProperty.value) {
      lines.push({ column: MASS_REFERENCE_COLUMN, text: "!=calculated" });
    }
    return lines;
  }

  /** Replaces every range criterion with the preset's (methods and the mass toggle are kept). */
  public applyPreset(preset: FilterPreset): void {
    for (const criterion of this.criteria.values()) {
      criterion.reset();
    }
    for (const range of preset.ranges) {
      const criterion = this.criterion(range.quantity);
      criterion.setRange(range.min, range.max);
      criterion.requireValueProperty.value = range.requireValue ?? false;
    }
  }

  /** Removes every filter. */
  public reset(): void {
    for (const criterion of this.criteria.values()) {
      criterion.reset();
    }
    for (const property of this.methodVisibleProperties.values()) {
      property.reset();
    }
    this.measuredMassOnlyProperty.reset();
  }
}
