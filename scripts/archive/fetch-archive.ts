/**
 * fetch-archive.ts
 *
 * Takes a snapshot of the NASA Exoplanet Archive for the simulation. Run it by hand
 * (`npm run fetch-data`) when you want fresher numbers; the sim never queries the archive
 * at runtime because the archive's TAP service sends no CORS headers.
 *
 * It queries the archive's TAP service (https://exoplanetarchive.ipac.caltech.edu/TAP) for
 *   - the Planetary Systems Composite Parameters table (pscomppars), one row per confirmed planet;
 *   - the number of TESS Objects of Interest still flagged as planet candidates (toi, tfopwg_disp = 'PC');
 *   - the number of Kepler Objects of Interest still flagged as candidates (cumulative, koi_disposition = 'CANDIDATE'),
 * and writes src/common/model/data/pscomppars.json, a column-oriented file (one array per column,
 * null for an empty cell, categories stored as indices into a lookup list).
 *
 * It finishes by printing the numbers the classroom handout asks for, so the snapshot can be
 * checked against the archive's own web pages.
 */

import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const TAP_URL = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync";
const OUTPUT = resolve(dirname(fileURLToPath(import.meta.url)), "../../src/common/model/data/pscomppars.json");

/** Numeric pscomppars columns kept in the snapshot, with the significant figures stored. */
const NUMERIC_COLUMNS: readonly (readonly [column: string, significantFigures: number])[] = [
  ["pl_orbper", 6], // orbital period (days)
  ["pl_orbsmax", 5], // semi-major axis (au)
  ["pl_orbeccen", 4], // eccentricity
  ["pl_rade", 4], // planet radius (Earth radii)
  ["pl_bmasse", 5], // planet mass or M sin i (Earth masses)
  ["pl_eqt", 4], // equilibrium temperature (K)
  ["pl_insol", 4], // insolation flux (Earth flux)
  ["st_teff", 5], // stellar effective temperature (K)
  ["st_rad", 4], // stellar radius (solar radii)
  ["st_mass", 4], // stellar mass (solar masses)
  ["sy_dist", 5], // distance from the Sun (pc)
  ["sy_pnum", 2], // number of planets in the system
  ["disc_year", 4], // discovery year
];

/** Categorical columns, stored as indices into a sorted lookup list. */
const CATEGORY_COLUMNS = ["discoverymethod", "disc_facility", "pl_bmassprov"] as const;

/** Free-text columns stored verbatim. */
const TEXT_COLUMNS = ["pl_name", "hostname", "disc_pubdate"] as const;

/**
 * Numeric columns whose value the archive sometimes calculates instead of taking from a paper
 * (its `*_reflink` then reads "Calculated Value"; see https://exoplanetarchive.ipac.caltech.edu/docs/pscp_calc.html).
 * Bit i of the snapshot's `calculated` column is set when CALCULABLE_COLUMNS[i] was calculated.
 */
const CALCULABLE_COLUMNS = [
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

type Row = Record<string, string | number | null>;

async function tap(query: string): Promise<Row[]> {
  const url = `${TAP_URL}?${new URLSearchParams({ query, format: "json" }).toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TAP query failed (${response.status}): ${query}`);
  }
  return (await response.json()) as Row[];
}

async function count(query: string): Promise<number> {
  const rows = await tap(query);
  const value = Object.values(rows[0] ?? {})[0];
  if (typeof value !== "number") {
    throw new Error(`Count query returned no number: ${query}`);
  }
  return value;
}

function roundSig(value: number, digits: number): number {
  return value === 0 ? 0 : Number(value.toPrecision(digits));
}

/** "2019-06" → 2019.4167 (the middle of the month as a decimal year), or null. */
function decimalMonth(pubdate: string | null): number | null {
  const match = typeof pubdate === "string" ? /^(\d{4})-(\d{2})/.exec(pubdate) : null;
  return match ? Number((Number(match[1]) + (Number(match[2]) - 0.5) / 12).toFixed(4)) : null;
}

async function main(): Promise<void> {
  const columns = [
    ...TEXT_COLUMNS,
    ...CATEGORY_COLUMNS,
    ...NUMERIC_COLUMNS.map(([column]) => column),
    ...CALCULABLE_COLUMNS.map((column) => `${column}_reflink`),
  ];
  console.log("Querying pscomppars…");
  const rows = await tap(`select ${columns.join(",")} from pscomppars order by disc_year, pl_name`);
  console.log(`  ${rows.length} confirmed planets`);

  const tessCandidates = await count("select count(*) from toi where tfopwg_disp = 'PC'");
  const keplerCandidates = await count("select count(*) from cumulative where koi_disposition = 'CANDIDATE'");

  const categories: Record<string, string[]> = {};
  const data: Record<string, (string | number | null)[]> = {};
  for (const column of CATEGORY_COLUMNS) {
    const values = [...new Set(rows.map((row) => row[column]).filter((v): v is string => typeof v === "string"))];
    values.sort((a, b) => a.localeCompare(b, "en"));
    categories[column] = values;
    data[column] = rows.map((row) => (typeof row[column] === "string" ? values.indexOf(row[column]) : null));
  }
  for (const column of ["pl_name", "hostname"] as const) {
    data[column] = rows.map((row) => row[column] as string);
  }
  data["disc_month"] = rows.map((row) => decimalMonth(row["disc_pubdate"] as string | null));
  for (const [column, digits] of NUMERIC_COLUMNS) {
    data[column] = rows.map((row) => {
      const value = row[column];
      return typeof value === "number" && Number.isFinite(value) ? roundSig(value, digits) : null;
    });
  }

  data["calculated"] = rows.map((row) =>
    CALCULABLE_COLUMNS.reduce(
      (bits, column, i) =>
        /refstr=CALCULATED_VALUE/.test(String(row[`${column}_reflink`] ?? "")) ? bits | (1 << i) : bits,
      0,
    ),
  );

  const retrieved = new Date().toISOString().slice(0, 10);
  const snapshot = {
    source: "NASA Exoplanet Archive, Planetary Systems Composite Parameters (pscomppars)",
    url: "https://exoplanetarchive.ipac.caltech.edu/",
    retrieved,
    planetCount: rows.length,
    tessCandidates,
    keplerCandidates,
    calculableColumns: CALCULABLE_COLUMNS,
    categories,
    columns: data,
  };
  // One column per line keeps diffs readable without a line per number.
  const body = Object.entries(snapshot)
    .map(([key, value]) =>
      key === "columns"
        ? `"columns":{\n${Object.entries(value as object)
            .map(([name, values]) => `${JSON.stringify(name)}:${JSON.stringify(values)}`)
            .join(",\n")}\n}`
        : `${JSON.stringify(key)}:${JSON.stringify(value)}`,
    )
    .join(",\n");
  writeFileSync(OUTPUT, `{\n${body}\n}\n`);
  console.log(`Wrote ${OUTPUT}`);

  // ── Summary for checking against the handout and the archive's Exoplanet Counts page ──
  const method = (row: Row): string => String(row["discoverymethod"]);
  const num = (row: Row, key: string): number => (typeof row[key] === "number" ? (row[key] as number) : Number.NaN);
  const between = (x: number, lo: number, hi: number): boolean => x >= lo && x <= hi;
  const byMethod = (subset: Row[]): string =>
    ["Transit", "Radial Velocity", "Microlensing", "Imaging"]
      .map((m) => {
        const n = subset.filter((row) => method(row) === m).length;
        return `${m} ${n} (${((100 * n) / subset.length).toFixed(1)}%)`;
      })
      .join(", ");
  console.log(`\nRetrieved ${retrieved}`);
  console.log(`Confirmed planets: ${rows.length}`);
  console.log(`TESS candidates (PC): ${tessCandidates}; Kepler candidates: ${keplerCandidates}`);
  console.log(
    `Discovered by Kepler: ${rows.filter((r) => r["disc_facility"] === "Kepler").length}; ` +
      `by TESS: ${rows.filter((r) => String(r["disc_facility"]).includes("TESS")).length}`,
  );
  console.log(`Stellar mass 0.95–1.05: ${rows.filter((r) => between(num(r, "st_mass"), 0.95, 1.05)).length}`);
  console.log(`By method: ${byMethod(rows)}`);
  console.log(`By method, disc_year >= 2024: ${byMethod(rows.filter((r) => num(r, "disc_year") >= 2024))}`);
  console.log(
    `a 0.72–1.5 au and M★ 0.9–1.1: ${
      rows.filter((r) => between(num(r, "pl_orbsmax"), 0.72, 1.5) && between(num(r, "st_mass"), 0.9, 1.1)).length
    }`,
  );
  console.log("Values calculated by the archive rather than measured:");
  reportCalculated(rows);
}

function reportCalculated(rows: Row[]): void {
  for (const column of CALCULABLE_COLUMNS) {
    const n = rows.filter((row) => /refstr=CALCULATED_VALUE/.test(String(row[`${column}_reflink`] ?? ""))).length;
    console.log(`  ${column}: ${n} calculated`);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
