/**
 * Quantity.ts
 *
 * The numeric columns of the snapshot that the table, the filters and the plots can show. Each
 * value knows its archive column (pscomppars name and the title the archive's interactive table
 * prints above it), whether a log axis suits it, and which bit of the snapshot's `calculated`
 * mask marks a value the archive estimated rather than took from a paper.
 */

import { Enumeration, EnumerationValue } from "scenerystack/phet-core";

/** pscomppars columns whose value the archive may calculate, in the snapshot's bit order. */
export const CALCULABLE_COLUMNS = [
  "pl_orbper",
  "pl_orbsmax",
  "pl_rade",
  "pl_bmasse",
  "pl_eqt",
  "pl_insol",
  "st_teff",
  "st_rad",
  "st_mass",
] as const;

export type QuantityColumn = (typeof CALCULABLE_COLUMNS)[number] | "pl_orbeccen" | "sy_dist" | "sy_pnum" | "disc_year";

export class Quantity extends EnumerationValue {
  public static readonly PERIOD = new Quantity("period", "pl_orbper", "Orbital Period [days]", true, 4);
  public static readonly SEMI_MAJOR_AXIS = new Quantity(
    "semiMajorAxis",
    "pl_orbsmax",
    "Orbit Semi-Major Axis [au]",
    true,
    3,
  );
  public static readonly ECCENTRICITY = new Quantity("eccentricity", "pl_orbeccen", "Eccentricity", false, 2);
  public static readonly RADIUS = new Quantity("radius", "pl_rade", "Planet Radius [Earth Radius]", true, 3);
  public static readonly MASS = new Quantity("mass", "pl_bmasse", "Planet Mass or Mass*sin(i) [Earth Mass]", true, 3);
  public static readonly TEMPERATURE = new Quantity("temperature", "pl_eqt", "Equilibrium Temperature [K]", false, 4);
  public static readonly INSOLATION = new Quantity("insolation", "pl_insol", "Insolation Flux [Earth Flux]", true, 3);
  public static readonly STAR_TEMPERATURE = new Quantity(
    "starTemperature",
    "st_teff",
    "Stellar Effective Temperature [K]",
    false,
    4,
  );
  public static readonly STAR_RADIUS = new Quantity("starRadius", "st_rad", "Stellar Radius [Solar Radius]", true, 3);
  public static readonly STAR_MASS = new Quantity("starMass", "st_mass", "Stellar Mass [Solar mass]", true, 3);
  public static readonly DISTANCE = new Quantity("distance", "sy_dist", "Distance [pc]", true, 4);
  public static readonly PLANET_COUNT = new Quantity("planetCount", "sy_pnum", "Number of Planets", false, 1, true);
  public static readonly DISCOVERY_YEAR = new Quantity("discoveryYear", "disc_year", "Discovery Year", false, 4, true);

  public static readonly enumeration = new Enumeration(Quantity);

  /** Key into the `quantities` string group. */
  public readonly key: string;

  /** pscomppars column name. */
  public readonly column: QuantityColumn;

  /** Column title in the archive's interactive table (English; it is what students see there). */
  public readonly archiveTitle: string;

  /** Whether the quantity spans decades, so a log axis is the natural default. */
  public readonly prefersLog: boolean;

  /** Significant figures shown in the table and readouts. */
  public readonly significantFigures: number;

  /** Whether values are whole numbers (years, counts). */
  public readonly isInteger: boolean;

  /** Bit of the snapshot's `calculated` mask, or −1 when the archive never calculates it. */
  public readonly calculatedBit: number;

  public constructor(
    key: string,
    column: QuantityColumn,
    archiveTitle: string,
    prefersLog: boolean,
    significantFigures: number,
    isInteger = false,
  ) {
    super();
    this.key = key;
    this.column = column;
    this.archiveTitle = archiveTitle;
    this.prefersLog = prefersLog;
    this.significantFigures = significantFigures;
    this.isInteger = isInteger;
    this.calculatedBit = (CALCULABLE_COLUMNS as readonly string[]).indexOf(column);
  }
}
