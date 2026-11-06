/**
 * physics.ts
 *
 * The few formulas the planet card and the preset plots use, in the units of the archive
 * (days, au, Earth and solar units).
 */

/** Days in a Julian year. */
export const DAYS_PER_YEAR = 365.25;

/** The Sun's effective temperature, K (IAU 2015 nominal value). */
export const SUN_TEMPERATURE_K = 5772;

/** Earth's mean density, g/cm³. */
export const EARTH_DENSITY_G_CM3 = 5.51;

/** Light years in a parsec. */
export const LIGHT_YEARS_PER_PARSEC = 3.2616;

/** Core mass fraction of an Earth-like rocky planet (Zeng, Sasselov & Jacobsen 2016). */
export const EARTH_LIKE_CORE_MASS_FRACTION = 0.325;

export type KeplerCheck = {
  /** Period in years. */
  readonly periodYears: number;
  /** P², years². */
  readonly periodSquared: number;
  /** a³ / M★, au³ per solar mass. */
  readonly aCubedOverMass: number;
  /** (P² − a³/M★) / (a³/M★), as a fraction. */
  readonly fractionalDifference: number;
};

/**
 * Kepler's third law in solar-system units, P² = a³ / M★ (P in years, a in au, M★ in solar
 * masses; the planet's own mass is neglected).
 */
export function keplerCheck(periodDays: number, semiMajorAxisAu: number, starMassSolar: number): KeplerCheck {
  const periodYears = periodDays / DAYS_PER_YEAR;
  const periodSquared = periodYears * periodYears;
  const aCubedOverMass = semiMajorAxisAu ** 3 / starMassSolar;
  return {
    periodYears,
    periodSquared,
    aCubedOverMass,
    fractionalDifference: (periodSquared - aCubedOverMass) / aCubedOverMass,
  };
}

/** Semi-major axis (au) of an orbit with this period (days) around a star of this mass (M☉). */
export function keplerSemiMajorAxis(periodDays: number, starMassSolar: number): number {
  return (starMassSolar * (periodDays / DAYS_PER_YEAR) ** 2) ** (1 / 3);
}

/** Closest and farthest distances from the star, au, for semi-major axis a and eccentricity e. */
export function orbitExtremes(semiMajorAxisAu: number, eccentricity: number): { closest: number; farthest: number } {
  return { closest: semiMajorAxisAu * (1 - eccentricity), farthest: semiMajorAxisAu * (1 + eccentricity) };
}

/** Luminosity in solar units from L ∝ R² T⁴ (R in solar radii, T in K). */
export function luminosityFromRadiusAndTemperature(radiusSolar: number, temperatureK: number): number {
  return radiusSolar ** 2 * (temperatureK / SUN_TEMPERATURE_K) ** 4;
}

/** Bulk density, g/cm³, from mass (M⊕) and radius (R⊕). */
export function densityFromMassAndRadius(massEarth: number, radiusEarth: number): number {
  return (EARTH_DENSITY_G_CM3 * massEarth) / radiusEarth ** 3;
}

/** Density or a one-sided constraint; null when the inputs cannot give a density bound. */
export function densityConstraint(
  massEarth: number,
  radiusEarth: number,
  massLimit: -1 | 0 | 1,
  radiusLimit: -1 | 0 | 1,
  minimumMass: boolean,
): { value: number; limit: -1 | 0 | 1 } | null {
  if (!(massEarth > 0 && radiusEarth > 0 && Number.isFinite(massEarth) && Number.isFinite(radiusEarth))) {
    return null;
  }
  if (minimumMass && massLimit === 1) {
    return null;
  }
  const numeratorLimit = minimumMass ? -1 : massLimit;
  if (numeratorLimit !== 0 && numeratorLimit === radiusLimit) {
    return null;
  }
  const limit = numeratorLimit || -radiusLimit;
  return { value: densityFromMassAndRadius(massEarth, radiusEarth), limit: limit as -1 | 0 | 1 };
}

/** Radius (R⊕) of a uniform planet of this mass (M⊕) and density (g/cm³). */
export function constantDensityRadius(massEarth: number, densityGcm3: number): number {
  return ((EARTH_DENSITY_G_CM3 * massEarth) / densityGcm3) ** (1 / 3);
}

/**
 * Radius (R⊕) of a rocky planet of this mass (M⊕) and core mass fraction:
 * R = (1.07 − 0.21 CMF) M^{1/3.7} (Zeng, Sasselov & Jacobsen 2016, ApJ 819, 127; fitted for about
 * 1–8 M⊕ and still close up to ~20 M⊕). Valid for CMF 0–0.4; use ironRadius for pure iron.
 */
export function rockyRadius(massEarth: number, coreMassFraction = EARTH_LIKE_CORE_MASS_FRACTION): number {
  return (1.07 - 0.21 * coreMassFraction) * massEarth ** (1 / 3.7);
}

export { ironRadius } from "./ironRadius.js";
