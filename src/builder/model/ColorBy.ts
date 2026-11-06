/**
 * ColorBy.ts
 *
 * What the Plot Builder colours points by.
 */

import { Enumeration, EnumerationValue } from "scenerystack/phet-core";

export class ColorBy extends EnumerationValue {
  public static readonly METHOD = new ColorBy("method");
  public static readonly FACILITY = new ColorBy("facility");
  public static readonly YEAR = new ColorBy("year");
  public static readonly STAR_MASS = new ColorBy("starMass");

  public static readonly enumeration = new Enumeration(ColorBy);

  /** Key into the builder's `colorBy` string group. */
  public readonly key: string;

  public constructor(key: string) {
    super();
    this.key = key;
  }
}
