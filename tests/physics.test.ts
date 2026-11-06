/**
 * Tests for the planet-card formulas.
 */

import { describe, expect, it } from "vitest";
import {
  constantDensityRadius,
  densityFromMassAndRadius,
  keplerCheck,
  keplerSemiMajorAxis,
  luminosityFromRadiusAndTemperature,
  orbitExtremes,
  rockyRadius,
} from "../src/common/model/physics.js";
import { Quantity } from "../src/common/model/Quantity.js";
import { EARTH, SOLAR_SYSTEM } from "../src/common/model/SolarSystem.js";

describe("physics", () => {
  it("Kepler's third law holds for every Solar System planet", () => {
    for (const planet of SOLAR_SYSTEM) {
      const check = keplerCheck(
        planet.values.get(Quantity.PERIOD) ?? 0,
        planet.values.get(Quantity.SEMI_MAJOR_AXIS) ?? 0,
        1,
      );
      // Within 2 %: the law neglects the planet's own mass, which matters at the 1 % level for Jupiter.
      expect(Math.abs(check.fractionalDifference)).toBeLessThan(0.02);
    }
  });

  it("inverts Kepler's law", () => {
    expect(keplerSemiMajorAxis(365.25, 1)).toBeCloseTo(1, 6);
    expect(keplerSemiMajorAxis(365.25, 8)).toBeCloseTo(2, 6);
  });

  it("gives closest and farthest distances from the eccentricity", () => {
    expect(orbitExtremes(1, 0.5)).toEqual({ closest: 0.5, farthest: 1.5 });
  });

  it("scales luminosity as R² T⁴ (Q31)", () => {
    expect(luminosityFromRadiusAndTemperature(1, 5772)).toBeCloseTo(1, 10);
    expect(luminosityFromRadiusAndTemperature(2, 5772)).toBeCloseTo(4, 10);
  });

  it("puts Earth on its own density and rocky curves", () => {
    expect(densityFromMassAndRadius(1, 1)).toBeCloseTo(5.51, 6);
    expect(constantDensityRadius(1, 5.51)).toBeCloseTo(1, 6);
    expect(rockyRadius(1)).toBeCloseTo(EARTH.values.get(Quantity.RADIUS) ?? 0, 1);
  });
});
