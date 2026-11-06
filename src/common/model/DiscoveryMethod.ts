/**
 * DiscoveryMethod.ts
 *
 * Discovery methods as the sim groups them: the four that have found almost every planet, and
 * Other for the rest (transit timing variations, eclipse timing, pulsar timing, astrometry, …).
 */

import { Enumeration, EnumerationValue } from "scenerystack/phet-core";

export class DiscoveryMethod extends EnumerationValue {
  public static readonly TRANSIT = new DiscoveryMethod("transit", "Transit");
  public static readonly RADIAL_VELOCITY = new DiscoveryMethod("radialVelocity", "Radial Velocity");
  public static readonly MICROLENSING = new DiscoveryMethod("microlensing", "Microlensing");
  public static readonly IMAGING = new DiscoveryMethod("imaging", "Imaging");
  public static readonly OTHER = new DiscoveryMethod("other", null);

  public static readonly enumeration = new Enumeration(DiscoveryMethod);

  /** Key into the `methods` string group and the method colour map. */
  public readonly key: string;

  /** The archive's discoverymethod value, or null for the Other group. */
  public readonly archiveName: string | null;

  public constructor(key: string, archiveName: string | null) {
    super();
    this.key = key;
    this.archiveName = archiveName;
  }

  /** The group an archive discoverymethod value belongs to. */
  public static fromArchiveName(name: string): DiscoveryMethod {
    return DiscoveryMethod.enumeration.values.find((method) => method.archiveName === name) ?? DiscoveryMethod.OTHER;
  }
}
