/**
 * ExoplanetCatalog.ts
 *
 * The bundled snapshot of the NASA Exoplanet Archive's Planetary Systems Composite Parameters table
 * (one row per confirmed planet), decoded once into typed columns. Empty cells become NaN. The
 * snapshot is written by scripts/archive/fetch-archive.ts; the sim never queries the archive itself.
 */

import { DiscoveryMethod } from "./DiscoveryMethod.js";
import snapshotJson from "./data/pscomppars.json";
import { FacilityGroup } from "./FacilityGroup.js";
import { Quantity, type QuantityColumn } from "./Quantity.js";

/** Shape of data/pscomppars.json. */
export type ArchiveSnapshot = {
  readonly retrieved: string;
  readonly planetCount: number;
  readonly tessCandidates: number;
  readonly keplerCandidates: number;
  // Keys are the archive's own column names (snake_case), so they are written as Record keys.
  readonly categories: Readonly<Record<CategoryColumn, readonly string[]>>;
  readonly columns: Readonly<Record<QuantityColumn | "disc_month", readonly (number | null)[]>> &
    Readonly<Record<"pl_name" | "hostname", readonly string[]>> &
    Readonly<Record<CategoryColumn, readonly (number | null)[]>> &
    Readonly<Record<"calculated", readonly number[]>>;
};

/** Columns stored as indices into a lookup list. */
type CategoryColumn = "discoverymethod" | "disc_facility" | "pl_bmassprov";

const toFloat64 = (values: readonly (number | null)[]): Float64Array =>
  Float64Array.from(values, (value) => (value === null ? Number.NaN : value));

export class ExoplanetCatalog {
  /** Number of confirmed planets. */
  public readonly size: number;

  /** Date the snapshot was taken (ISO yyyy-mm-dd). */
  public readonly retrieved: string;

  /** TESS Objects of Interest still flagged as planet candidates. */
  public readonly tessCandidates: number;

  /** Kepler Objects of Interest still flagged as candidates. */
  public readonly keplerCandidates: number;

  public readonly names: readonly string[];
  public readonly hosts: readonly string[];

  /** The archive's own discoverymethod value for each planet. */
  public readonly archiveMethods: readonly string[];

  /** The sim's method group for each planet. */
  public readonly methods: readonly DiscoveryMethod[];

  /** The archive's disc_facility value for each planet. */
  public readonly facilities: readonly string[];

  public readonly facilityGroups: readonly FacilityGroup[];

  /** Discovery publication date as a decimal year (mid-month), NaN when unknown. */
  public readonly discoveryMonths: Float64Array;

  private readonly massProvenance: readonly string[];
  private readonly calculated: Uint16Array;
  private readonly columns: ReadonlyMap<Quantity, Float64Array>;

  public constructor(snapshot: ArchiveSnapshot) {
    const { columns, categories } = snapshot;
    this.size = columns.pl_name.length;
    this.retrieved = snapshot.retrieved;
    this.tessCandidates = snapshot.tessCandidates;
    this.keplerCandidates = snapshot.keplerCandidates;
    this.names = columns.pl_name;
    this.hosts = columns.hostname;
    const category = (lookup: readonly string[], index: number | null): string =>
      index === null ? "" : (lookup[index] ?? "");
    this.archiveMethods = columns.discoverymethod.map((i) => category(categories.discoverymethod, i));
    this.methods = this.archiveMethods.map((name) => DiscoveryMethod.fromArchiveName(name));
    this.facilities = columns.disc_facility.map((i) => category(categories.disc_facility, i));
    this.facilityGroups = this.facilities.map((name) => FacilityGroup.fromFacility(name));
    this.massProvenance = columns.pl_bmassprov.map((i) => category(categories.pl_bmassprov, i));
    this.discoveryMonths = toFloat64(columns.disc_month);
    this.calculated = Uint16Array.from(columns.calculated);
    this.columns = new Map(Quantity.enumeration.values.map((q) => [q, toFloat64(columns[q.column])]));
  }

  /** All values of a quantity, indexed by planet (NaN where the archive has none). */
  public column(quantity: Quantity): Float64Array {
    const values = this.columns.get(quantity);
    if (!values) {
      throw new Error(`No column for ${quantity.key}`);
    }
    return values;
  }

  public value(index: number, quantity: Quantity): number {
    return this.column(quantity)[index] ?? Number.NaN;
  }

  /** Whether the archive calculated this value (e.g. a mass from a mass–radius relation) rather than measured it. */
  public isCalculated(index: number, quantity: Quantity): boolean {
    return quantity.calculatedBit >= 0 && ((this.calculated[index] ?? 0) & (1 << quantity.calculatedBit)) !== 0;
  }

  /** Whether the listed mass is a minimum mass, M sin i, from radial velocities alone. */
  public isMinimumMass(index: number): boolean {
    return this.massProvenance[index] === "Msini";
  }

  /** Whether the planet's mass was measured (true mass or M sin i), not estimated from its radius. */
  public hasMeasuredMass(index: number): boolean {
    return Number.isFinite(this.value(index, Quantity.MASS)) && !this.isCalculated(index, Quantity.MASS);
  }

  /** Index of the planet with this name, or −1. */
  public indexOf(name: string): number {
    return this.names.indexOf(name);
  }
}

/** The bundled snapshot. */
export const CATALOG = new ExoplanetCatalog(snapshotJson as unknown as ArchiveSnapshot);
