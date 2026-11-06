/**
 * FacilityGroup.ts
 *
 * Discovery facilities grouped for colouring: the three survey missions that found most transiting
 * planets, other space telescopes, and everything on the ground.
 */

import { Enumeration, EnumerationValue } from "scenerystack/phet-core";

/** Archive disc_facility values that are spacecraft but not Kepler, K2 or TESS. */
const OTHER_SPACE_FACILITIES = new Set([
  "CoRoT",
  "CHaracterising ExOPlanets Satellite (CHEOPS)",
  "European Space Agency (ESA) Gaia Satellite",
  "Hubble Space Telescope",
  "James Webb Space Telescope (JWST)",
  "Spitzer Space Telescope",
  "Wide-field Infrared Survey Explorer (WISE) Satellite Mission",
]);

export class FacilityGroup extends EnumerationValue {
  public static readonly KEPLER = new FacilityGroup("kepler");
  public static readonly K2 = new FacilityGroup("k2");
  public static readonly TESS = new FacilityGroup("tess");
  public static readonly OTHER_SPACE = new FacilityGroup("otherSpace");
  public static readonly GROUND = new FacilityGroup("ground");

  public static readonly enumeration = new Enumeration(FacilityGroup);

  /** Key into the `facilities` string group and the facility colour map. */
  public readonly key: string;

  public constructor(key: string) {
    super();
    this.key = key;
  }

  /** The group an archive disc_facility value belongs to. */
  public static fromFacility(name: string): FacilityGroup {
    if (name === "Kepler") {
      return FacilityGroup.KEPLER;
    }
    if (name === "K2") {
      return FacilityGroup.K2;
    }
    if (name === "Transiting Exoplanet Survey Satellite (TESS)") {
      return FacilityGroup.TESS;
    }
    return OTHER_SPACE_FACILITIES.has(name) ? FacilityGroup.OTHER_SPACE : FacilityGroup.GROUND;
  }
}
