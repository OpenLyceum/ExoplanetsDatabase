/**
 * RangeCriterion.ts
 *
 * One column's filter: an optional minimum, an optional maximum (both inclusive), and whether
 * planets with no value are hidden. It is the sim's version of the box the archive's table puts
 * under each column header, and it can write itself in that box's syntax.
 */

import { BooleanProperty, Property } from "scenerystack/axon";
import type { Quantity } from "./Quantity.js";

/** Archive filter-box text for a number: plain digits, no grouping, no trailing zeros. */
export const archiveNumber = (value: number): string => String(Number(value.toPrecision(6)));

export class RangeCriterion {
  private settingRange = false;
  public readonly quantity: Quantity;
  public readonly minProperty = new Property<number | null>(null);
  public readonly maxProperty = new Property<number | null>(null);

  /** Hide planets with no value (the archive's "not null"). Implied whenever a bound is set. */
  public readonly requireValueProperty = new BooleanProperty(false);

  public constructor(quantity: Quantity) {
    this.quantity = quantity;
    const normalize = (): void => {
      const min = this.minProperty.value;
      const max = this.maxProperty.value;
      if (!this.settingRange && min !== null && max !== null && min > max) {
        this.setRange(max, min);
      }
    };
    this.minProperty.lazyLink(normalize);
    this.maxProperty.lazyLink(normalize);
  }

  /** Whether this criterion removes any planet. */
  public get isActive(): boolean {
    return this.minProperty.value !== null || this.maxProperty.value !== null || this.requireValueProperty.value;
  }

  public accepts(value: number): boolean {
    const min = this.minProperty.value;
    const max = this.maxProperty.value;
    if (Number.isNaN(value)) {
      return !this.isActive;
    }
    const lower = min !== null && max !== null ? Math.min(min, max) : min;
    const upper = min !== null && max !== null ? Math.max(min, max) : max;
    return (lower === null || value >= lower) && (upper === null || value <= upper);
  }

  /** What to type in the archive's filter box for this column, or null when inactive. */
  public get archiveSyntax(): string | null {
    const min = this.minProperty.value;
    const max = this.maxProperty.value;
    if (min !== null && max !== null) {
      return `between ${archiveNumber(Math.min(min, max))} and ${archiveNumber(Math.max(min, max))}`;
    }
    if (min !== null) {
      return `>=${archiveNumber(min)}`;
    }
    if (max !== null) {
      return `<=${archiveNumber(max)}`;
    }
    return this.requireValueProperty.value ? "not null" : null;
  }

  /** Sets both bounds (null for no bound). */
  public setRange(min: number | null, max: number | null): void {
    this.settingRange = true;
    this.minProperty.value = min !== null && max !== null ? Math.min(min, max) : min;
    this.maxProperty.value = min !== null && max !== null ? Math.max(min, max) : max;
    this.settingRange = false;
  }

  public reset(): void {
    this.minProperty.reset();
    this.maxProperty.reset();
    this.requireValueProperty.reset();
  }
}
