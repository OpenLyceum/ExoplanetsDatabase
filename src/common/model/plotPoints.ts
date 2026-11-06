/**
 * plotPoints.ts
 *
 * Turns catalog columns into chart points: the planets with a usable value on both axes, in the
 * chart's coordinates (log10 on a log axis), each tagged with a style group.
 */

import type { ExoplanetCatalog } from "./ExoplanetCatalog.js";
import { Quantity } from "./Quantity.js";

/** Group index of a point that is not drawn. */
export const HIDDEN_GROUP = 255;

/** Points in chart coordinates, the catalog index of each, and its style group. */
export type PointSet = {
  readonly indices: Uint32Array;
  readonly xs: Float64Array;
  readonly ys: Float64Array;
  readonly groups: Uint8Array;
};

export const EMPTY_POINTS: PointSet = {
  indices: new Uint32Array(0),
  xs: new Float64Array(0),
  ys: new Float64Array(0),
  groups: new Uint8Array(0),
};

export type AxisRequest = {
  readonly quantity: Quantity;
  readonly log: boolean;
  /** For the discovery-year axis: use the publication month, which spreads points within a year. */
  readonly fromDiscoveryMonth?: boolean;
};

/** A planet's value on an axis in data units (NaN if missing). */
export function axisValue(catalog: ExoplanetCatalog, index: number, axis: AxisRequest): number {
  if (axis.fromDiscoveryMonth && axis.quantity === Quantity.DISCOVERY_YEAR) {
    const month = catalog.discoveryMonths[index] ?? Number.NaN;
    return Number.isFinite(month) ? month : catalog.value(index, Quantity.DISCOVERY_YEAR) + 0.5;
  }
  return catalog.value(index, axis.quantity);
}

/**
 * Chart points for the candidate planets. A planet is left out when either value is missing, not
 * positive on a log axis, or estimated by the archive for a quantity listed in `measuredOnly`.
 */
export function buildPoints(
  catalog: ExoplanetCatalog,
  candidates: ArrayLike<number>,
  x: AxisRequest,
  y: AxisRequest,
  groupOf: (index: number) => number,
  measuredOnly: readonly Quantity[] = [],
): PointSet {
  const indices: number[] = [];
  const xs: number[] = [];
  const ys: number[] = [];
  const groups: number[] = [];
  const transform = (axis: AxisRequest, value: number): number =>
    axis.log ? (value > 0 ? Math.log10(value) : Number.NaN) : value;
  for (const i of Array.from(candidates)) {
    if (measuredOnly.some((q) => catalog.isCalculated(i, q))) {
      continue;
    }
    const u = transform(x, axisValue(catalog, i, x));
    const v = transform(y, axisValue(catalog, i, y));
    if (Number.isFinite(u) && Number.isFinite(v)) {
      indices.push(i);
      xs.push(u);
      ys.push(v);
      groups.push(groupOf(i));
    }
  }
  return {
    indices: Uint32Array.from(indices),
    xs: Float64Array.from(xs),
    ys: Float64Array.from(ys),
    groups: Uint8Array.from(groups),
  };
}
