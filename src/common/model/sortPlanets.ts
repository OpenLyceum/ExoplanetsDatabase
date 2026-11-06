/**
 * sortPlanets.ts
 *
 * Orders planet indices by a table column. Names sort naturally ("Kepler-2 b" before
 * "Kepler-10 b"); planets with no value always go last, whichever way the column is sorted, as
 * they do in the archive.
 */

import { DiscoveryMethod } from "./DiscoveryMethod.js";
import type { ExoplanetCatalog } from "./ExoplanetCatalog.js";
import { TableColumn } from "./TableColumn.js";

const nameRanks = new WeakMap<ExoplanetCatalog, Uint32Array>();

/** Each planet's position in natural name order, computed once per catalog. */
function nameRank(catalog: ExoplanetCatalog): Uint32Array {
  let ranks = nameRanks.get(catalog);
  if (!ranks) {
    const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });
    const order = Array.from({ length: catalog.size }, (_, i) => i).sort((a, b) =>
      collator.compare(catalog.names[a] ?? "", catalog.names[b] ?? ""),
    );
    ranks = new Uint32Array(catalog.size);
    order.forEach((planet, rank) => {
      (ranks as Uint32Array)[planet] = rank;
    });
    nameRanks.set(catalog, ranks);
  }
  return ranks;
}

export function sortPlanets(
  catalog: ExoplanetCatalog,
  indices: Uint32Array,
  column: TableColumn,
  ascending: boolean,
): Uint32Array {
  const ranks = nameRank(catalog);
  const sign = ascending ? 1 : -1;
  const byName = (a: number, b: number): number => (ranks[a] ?? 0) - (ranks[b] ?? 0);
  let key: (i: number) => number;
  if (column === TableColumn.NAME) {
    key = (i) => ranks[i] ?? 0;
  } else if (column === TableColumn.METHOD) {
    key = (i) => DiscoveryMethod.enumeration.values.indexOf(catalog.methods[i] as DiscoveryMethod);
  } else {
    const values = catalog.column(column.quantity as NonNullable<TableColumn["quantity"]>);
    key = (i) => values[i] ?? Number.NaN;
  }
  const sorted = Array.from(indices);
  sorted.sort((a, b) => {
    const ka = key(a);
    const kb = key(b);
    const aMissing = Number.isNaN(ka);
    const bMissing = Number.isNaN(kb);
    if (aMissing || bMissing) {
      return aMissing === bMissing ? byName(a, b) : aMissing ? 1 : -1;
    }
    return ka === kb ? byName(a, b) : sign * (ka - kb);
  });
  return Uint32Array.from(sorted);
}
