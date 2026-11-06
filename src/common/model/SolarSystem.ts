/**
 * SolarSystem.ts
 *
 * Solar System reference values for the plots and the planet card (NASA Planetary Fact Sheet;
 * temperatures are the fact sheet's black-body temperatures).
 */

import { Quantity } from "./Quantity.js";

export type SolarSystemPlanet = {
  /** Key into the `solarSystem` string group. */
  readonly key: string;
  readonly values: ReadonlyMap<Quantity, number>;
};

const planet = (
  key: string,
  periodDays: number,
  semiMajorAxisAu: number,
  eccentricity: number,
  radiusEarth: number,
  massEarth: number,
  temperatureK: number,
  insolationEarth: number,
): SolarSystemPlanet => ({
  key,
  values: new Map([
    [Quantity.PERIOD, periodDays],
    [Quantity.SEMI_MAJOR_AXIS, semiMajorAxisAu],
    [Quantity.ECCENTRICITY, eccentricity],
    [Quantity.RADIUS, radiusEarth],
    [Quantity.MASS, massEarth],
    [Quantity.TEMPERATURE, temperatureK],
    [Quantity.INSOLATION, insolationEarth],
    [Quantity.STAR_MASS, 1],
    [Quantity.STAR_RADIUS, 1],
    [Quantity.STAR_TEMPERATURE, 5772],
    [Quantity.PLANET_COUNT, 8],
  ]),
});

export const SOLAR_SYSTEM: readonly SolarSystemPlanet[] = [
  planet("mercury", 87.969, 0.387, 0.2056, 0.383, 0.0553, 440, 6.67),
  planet("venus", 224.7, 0.723, 0.0068, 0.949, 0.815, 227, 1.91),
  planet("earth", 365.256, 1.0, 0.0167, 1, 1, 254, 1),
  planet("mars", 686.98, 1.524, 0.0934, 0.532, 0.107, 210, 0.431),
  planet("jupiter", 4332.6, 5.204, 0.0489, 11.21, 317.8, 110, 0.0369),
  planet("saturn", 10759, 9.573, 0.0565, 9.45, 95.2, 81, 0.0109),
  planet("uranus", 30685, 19.165, 0.0457, 4.01, 14.5, 58, 0.00272),
  planet("neptune", 60190, 30.18, 0.0113, 3.88, 17.1, 47, 0.0011),
];

/** Earth, the reference the planet card compares against. */
export const EARTH = SOLAR_SYSTEM[2] as SolarSystemPlanet;
