/**
 * Tests for the bundled archive snapshot and the filters, checked against the raw JSON so they
 * keep passing after the snapshot is refreshed. The handout questions they mirror are noted.
 */

import { describe, expect, it } from "vitest";
import { DiscoveryMethod } from "../src/common/model/DiscoveryMethod.js";
import snapshotJson from "../src/common/model/data/pscomppars.json";
import { CATALOG } from "../src/common/model/ExoplanetCatalog.js";
import { ExoplanetDatabase } from "../src/common/model/ExoplanetDatabase.js";
import { FacilityGroup } from "../src/common/model/FacilityGroup.js";
import { FilterPreset } from "../src/common/model/FilterPreset.js";
import { MASS_REFERENCE_COLUMN, PlanetFilter } from "../src/common/model/PlanetFilter.js";
import { keplerCheck } from "../src/common/model/physics.js";
import { Quantity } from "../src/common/model/Quantity.js";
import { sortPlanets } from "../src/common/model/sortPlanets.js";
import { TableColumn } from "../src/common/model/TableColumn.js";

const raw = snapshotJson as unknown as {
  planetCount: number;
  categories: { discoverymethod: string[] };
  columns: Record<string, (number | null)[]> & Record<"pl_name", string[]>;
};
const rawNumber = (column: string, i: number): number => raw.columns[column]?.[i] ?? Number.NaN;
const rawMethod = (i: number): string =>
  raw.categories.discoverymethod[raw.columns["discoverymethod"]?.[i] ?? -1] ?? "";
const rawCount = (predicate: (i: number) => boolean): number =>
  raw.columns.pl_name.filter((_, i) => predicate(i)).length;
const between = (x: number, lo: number, hi: number): boolean => x >= lo && x <= hi;

describe("ExoplanetCatalog", () => {
  it("decodes every planet of the snapshot", () => {
    expect(CATALOG.size).toBe(raw.planetCount);
    expect(CATALOG.size).toBeGreaterThan(6000);
    expect(CATALOG.retrieved).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("turns empty cells into NaN", () => {
    const masses = CATALOG.column(Quantity.MASS);
    const missing = rawCount((i) => raw.columns["pl_bmasse"]?.[i] === null);
    expect(masses.filter((m) => Number.isNaN(m)).length).toBe(missing);
  });

  it("groups methods so the four main ones plus Other cover every planet (Part 2 table)", () => {
    const counts = DiscoveryMethod.enumeration.values.map(
      (method) => CATALOG.methods.filter((m) => m === method).length,
    );
    expect(counts.reduce((a, b) => a + b, 0)).toBe(CATALOG.size);
    expect(counts[0]).toBe(rawCount((i) => rawMethod(i) === "Transit"));
    expect(counts[1]).toBe(rawCount((i) => rawMethod(i) === "Radial Velocity"));
    // Transit is by far the most productive method.
    expect(counts[0]).toBeGreaterThan(counts[1] ?? 0);
  });

  it("finds the Kepler and TESS discoveries (Q4)", () => {
    const kepler = CATALOG.facilityGroups.filter((g) => g === FacilityGroup.KEPLER).length;
    const tess = CATALOG.facilityGroups.filter((g) => g === FacilityGroup.TESS).length;
    expect(kepler).toBeGreaterThan(2500);
    expect(tess).toBeGreaterThan(900);
  });

  it("flags masses estimated from a mass–radius relation", () => {
    const estimated = Array.from({ length: CATALOG.size }, (_, i) => i).filter((i) =>
      CATALOG.isCalculated(i, Quantity.MASS),
    );
    expect(estimated.length).toBeGreaterThan(1000);
    // Orbital periods are never calculated by the archive.
    expect(Array.from({ length: CATALOG.size }, (_, i) => CATALOG.isCalculated(i, Quantity.PERIOD)).some(Boolean)).toBe(
      false,
    );
  });
});

describe("PlanetFilter", () => {
  it("counts planets around Sun-like stars like the archive's filter box (Q7)", () => {
    const filter = new PlanetFilter();
    filter.applyPreset(FilterPreset.SUN_LIKE_STARS);
    expect(filter.matches(CATALOG).length).toBe(rawCount((i) => between(rawNumber("st_mass", i), 0.95, 1.05)));
    expect(filter.archiveFilters).toEqual([{ column: "Stellar Mass [Solar mass]", text: "between 0.95 and 1.05" }]);
  });

  it("counts recent transit discoveries (Q11)", () => {
    const filter = new PlanetFilter();
    filter.applyPreset(FilterPreset.RECENT);
    for (const method of DiscoveryMethod.enumeration.values) {
      filter.methodVisibleProperty(method).value = method === DiscoveryMethod.TRANSIT;
    }
    expect(filter.matches(CATALOG).length).toBe(
      rawCount((i) => rawNumber("disc_year", i) >= 2024 && rawMethod(i) === "Transit"),
    );
    expect(filter.archiveFilters).toEqual([
      { column: "Discovery Method", text: "'Transit'" },
      { column: "Discovery Year", text: ">=2024" },
    ]);
  });

  it("lists Earth-like orbits around Sun-like stars (Q21)", () => {
    const filter = new PlanetFilter();
    filter.applyPreset(FilterPreset.EARTH_LIKE_ORBITS);
    const expected = rawCount(
      (i) => between(rawNumber("pl_orbsmax", i), 0.72, 1.5) && between(rawNumber("st_mass", i), 0.9, 1.1),
    );
    expect(filter.matches(CATALOG).length).toBe(expected);
    expect(expected).toBeGreaterThan(20);
    expect(expected).toBeLessThan(CATALOG.size / 20);
  });

  it("hides empty cells with 'not null' (Part 3)", () => {
    const filter = new PlanetFilter();
    filter.applyPreset(FilterPreset.ORBIT_KNOWN);
    const n = filter.matches(CATALOG).length;
    expect(n).toBe(
      rawCount((i) => ["pl_orbsmax", "pl_orbper", "st_mass"].every((c) => Number.isFinite(rawNumber(c, i)))),
    );
    expect(filter.archiveFilters.map((line) => line.text)).toEqual(["not null", "not null", "not null"]);
  });

  it("keeps measured masses only, matching the archive's !=calculated (Q24)", () => {
    const filter = new PlanetFilter();
    filter.measuredMassOnlyProperty.value = true;
    const matches = filter.matches(CATALOG);
    expect(matches.every((i) => !CATALOG.isCalculated(i, Quantity.MASS))).toBe(true);
    expect(filter.archiveFilters).toEqual([{ column: MASS_REFERENCE_COLUMN, text: "!=calculated" }]);
  });

  it("writes one-sided bounds as >= and <=, and swaps reversed bounds", () => {
    const filter = new PlanetFilter();
    const criterion = filter.criterion(Quantity.PERIOD);
    criterion.setRange(null, 10);
    expect(criterion.archiveSyntax).toBe("<=10");
    criterion.setRange(30, 3);
    expect(criterion.archiveSyntax).toBe("between 3 and 30");
  });

  it("notifies on every change and resets to no filter", () => {
    const filter = new PlanetFilter();
    let changes = 0;
    filter.changedEmitter.addListener(() => changes++);
    filter.criterion(Quantity.RADIUS).maxProperty.value = 2;
    filter.methodVisibleProperty(DiscoveryMethod.IMAGING).value = false;
    expect(changes).toBe(2);
    expect(filter.isActive).toBe(true);
    filter.reset();
    expect(filter.isActive).toBe(false);
    expect(filter.matches(CATALOG).length).toBe(CATALOG.size);
  });
});

describe("sortPlanets", () => {
  const all = Uint32Array.from({ length: CATALOG.size }, (_, i) => i);

  it("puts planets with no value last in both directions", () => {
    for (const ascending of [true, false]) {
      const sorted = sortPlanets(CATALOG, all, TableColumn.MASS, ascending);
      const masses = Array.from(sorted, (i) => CATALOG.value(i, Quantity.MASS));
      const firstMissing = masses.findIndex((m) => Number.isNaN(m));
      expect(masses.slice(firstMissing).every((m) => Number.isNaN(m))).toBe(true);
      const known = masses.slice(0, firstMissing);
      expect(known.every((m, k) => k === 0 || (ascending ? m >= (known[k - 1] ?? 0) : m <= (known[k - 1] ?? 0)))).toBe(
        true,
      );
    }
  });

  it("sorts names naturally", () => {
    const sorted = Array.from(sortPlanets(CATALOG, all, TableColumn.NAME, true), (i) => CATALOG.names[i]);
    expect(sorted.indexOf("Kepler-2 b")).toBeLessThan(sorted.indexOf("Kepler-10 b"));
  });

  it("finds the extremes of Part 3 and they obey Kepler's third law (Q13–Q19)", () => {
    const filter = new PlanetFilter();
    filter.applyPreset(FilterPreset.ORBIT_KNOWN);
    const known = filter.matches(CATALOG);
    const shortest = sortPlanets(CATALOG, known, TableColumn.PERIOD, true)[0] as number;
    const check = keplerCheck(
      CATALOG.value(shortest, Quantity.PERIOD),
      CATALOG.value(shortest, Quantity.SEMI_MAJOR_AXIS),
      CATALOG.value(shortest, Quantity.STAR_MASS),
    );
    expect(Math.abs(check.fractionalDifference)).toBeLessThan(0.1);
    const widest = sortPlanets(CATALOG, known, TableColumn.SEMI_MAJOR_AXIS, false)[0] as number;
    expect(CATALOG.methods[widest]).toBe(DiscoveryMethod.IMAGING);
  });
});

describe("ExoplanetDatabase", () => {
  it("keeps the sorted list in step with the filter and sort column", () => {
    const database = new ExoplanetDatabase();
    database.filter.applyPreset(FilterPreset.EARTH_LIKE_ORBITS);
    database.filter.measuredMassOnlyProperty.value = true;
    database.sortBy(TableColumn.MASS);
    const sorted = database.sortedPlanetsProperty.value;
    expect(sorted.length).toBe(database.matchingPlanetsProperty.value.length);
    const masses = Array.from(sorted, (i) => CATALOG.value(i, Quantity.MASS));
    expect(masses[0]).toBeLessThanOrEqual(masses[1] ?? Number.POSITIVE_INFINITY);
    database.sortBy(TableColumn.MASS);
    expect(database.sortAscendingProperty.value).toBe(false);
    database.reset();
    expect(database.sortedPlanetsProperty.value.length).toBe(CATALOG.size);
  });
});

describe("CountsModel", () => {
  it("splits the planets discovered since a year by method", async () => {
    const { CountsModel } = await import("../src/counts/model/CountsModel.js");
    const model = new CountsModel();
    const all = model.methodCounts(model.yearRange.min);
    expect(all.reduce((a, b) => a + b, 0)).toBe(CATALOG.size);
    const recent = model.methodCounts(2024);
    expect(recent.reduce((a, b) => a + b, 0)).toBe(rawCount((i) => rawNumber("disc_year", i) >= 2024));
  });
});
