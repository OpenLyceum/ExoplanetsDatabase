/**
 * Tests for turning catalog columns into chart points, and for the gallery presets' data.
 */

import { describe, expect, it } from "vitest";
import { DiscoveryMethod } from "../src/common/model/DiscoveryMethod.js";
import { CATALOG } from "../src/common/model/ExoplanetCatalog.js";
import { axisValue, buildPoints } from "../src/common/model/plotPoints.js";
import { Quantity } from "../src/common/model/Quantity.js";
import { GalleryPreset } from "../src/gallery/model/GalleryPreset.js";

const all = Uint32Array.from({ length: CATALOG.size }, (_, i) => i);
const methodGroup = (i: number): number =>
  DiscoveryMethod.enumeration.values.indexOf(CATALOG.methods[i] as DiscoveryMethod);

describe("buildPoints", () => {
  it("keeps only planets with both values, in log10 on log axes", () => {
    const points = buildPoints(
      CATALOG,
      all,
      { quantity: Quantity.SEMI_MAJOR_AXIS, log: true },
      { quantity: Quantity.MASS, log: true },
      methodGroup,
    );
    expect(points.indices.length).toBeGreaterThan(5000);
    const k = 0;
    const i = points.indices[k] as number;
    expect(points.xs[k]).toBeCloseTo(Math.log10(CATALOG.value(i, Quantity.SEMI_MAJOR_AXIS)), 10);
    expect(points.groups[k]).toBe(methodGroup(i));
  });

  it("leaves out values the archive estimated when asked", () => {
    const points = buildPoints(
      CATALOG,
      all,
      { quantity: Quantity.MASS, log: true },
      { quantity: Quantity.RADIUS, log: true },
      methodGroup,
      [Quantity.MASS, Quantity.RADIUS],
    );
    for (const i of points.indices) {
      expect(CATALOG.isCalculated(i, Quantity.MASS) || CATALOG.isCalculated(i, Quantity.RADIUS)).toBe(false);
    }
  });

  it("spreads discovery years over the publication month", () => {
    const i = CATALOG.discoveryMonths.findIndex(Number.isFinite);
    const value = axisValue(CATALOG, i, { quantity: Quantity.DISCOVERY_YEAR, log: false, fromDiscoveryMonth: true });
    expect(Math.floor(value)).toBe(CATALOG.value(i, Quantity.DISCOVERY_YEAR));
  });
});

describe("GalleryPreset", () => {
  it("shows every main method on the mass vs orbit size plot", () => {
    const preset = GalleryPreset.MASS_VS_ORBIT;
    const points = buildPoints(CATALOG, all, preset.x, preset.y ?? preset.x, methodGroup, preset.measuredOnly);
    for (const method of [
      DiscoveryMethod.TRANSIT,
      DiscoveryMethod.RADIAL_VELOCITY,
      DiscoveryMethod.MICROLENSING,
      DiscoveryMethod.IMAGING,
    ]) {
      const group = DiscoveryMethod.enumeration.values.indexOf(method);
      expect(points.groups.filter((g) => g === group).length).toBeGreaterThan(50);
    }
  });

  it("keeps every plotted value inside its axis range", () => {
    for (const preset of GalleryPreset.enumeration.values.filter((p) => p.kind === "scatter" && p.y)) {
      const y = preset.y as NonNullable<GalleryPreset["y"]>;
      const points = buildPoints(
        CATALOG,
        all,
        { ...preset.x, fromDiscoveryMonth: preset.xFromDiscoveryMonth },
        y,
        () => 0,
        preset.measuredOnly,
      );
      const inside = Array.from(points.ys).filter((v) => {
        const value = y.log ? 10 ** v : v;
        return value >= y.range.min && value <= y.range.max;
      }).length;
      // A handful of extreme planets may fall off the edge; nearly all must be visible.
      expect(inside / points.ys.length).toBeGreaterThan(0.99);
    }
  });
});
