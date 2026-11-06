/**
 * FilterPreset.ts
 *
 * One-press filters that match the steps of the classroom activity ("Exploring Exoplanets with
 * the NASA Exoplanet Archive").
 */

import { Enumeration, EnumerationValue } from "scenerystack/phet-core";
import { Quantity } from "./Quantity.js";

export type PresetRange = {
  readonly quantity: Quantity;
  readonly min: number | null;
  readonly max: number | null;
  readonly requireValue?: boolean;
};

export class FilterPreset extends EnumerationValue {
  /** Stars within 5 % of the Sun's mass. */
  public static readonly SUN_LIKE_STARS = new FilterPreset("sunLikeStars", [
    { quantity: Quantity.STAR_MASS, min: 0.95, max: 1.05 },
  ]);

  /** Discoveries from 2024 on. */
  public static readonly RECENT = new FilterPreset("recent", [
    { quantity: Quantity.DISCOVERY_YEAR, min: 2024, max: null },
  ]);

  /** Planets whose orbit size, period and star mass are all listed (for the Kepler's-law part). */
  public static readonly ORBIT_KNOWN = new FilterPreset("orbitKnown", [
    { quantity: Quantity.SEMI_MAJOR_AXIS, min: null, max: null, requireValue: true },
    { quantity: Quantity.PERIOD, min: null, max: null, requireValue: true },
    { quantity: Quantity.STAR_MASS, min: null, max: null, requireValue: true },
  ]);

  /** Roughly Sun-like stars, planets between Venus's and Mars's distances. */
  public static readonly EARTH_LIKE_ORBITS = new FilterPreset("earthLikeOrbits", [
    { quantity: Quantity.SEMI_MAJOR_AXIS, min: 0.72, max: 1.5 },
    { quantity: Quantity.STAR_MASS, min: 0.9, max: 1.1 },
  ]);

  public static readonly enumeration = new Enumeration(FilterPreset);

  /** Key into the `presets` string group. */
  public readonly key: string;
  public readonly ranges: readonly PresetRange[];

  public constructor(key: string, ranges: readonly PresetRange[]) {
    super();
    this.key = key;
    this.ranges = ranges;
  }
}
