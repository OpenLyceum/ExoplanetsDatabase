/**
 * Enrich the frozen snapshot without refreshing its values or counts:
 * node scripts/archive/add-limit-flags.ts /path/to/archive-limit-rows.json
 *
 * Input: NASA TAP pscomppars rows containing pl_name, all ten parameter/limit pairs below.
 * Every rounded parameter must match the frozen snapshot before any file is written.
 */
import { readFileSync, writeFileSync } from "node:fs";

const PARAMETERS = [
  ["pl_orbper", 6],
  ["pl_orbsmax", 5],
  ["pl_orbeccen", 4],
  ["pl_rade", 4],
  ["pl_bmasse", 5],
  ["pl_eqt", 4],
  ["pl_insol", 4],
  ["st_teff", 5],
  ["st_rad", 4],
  ["st_mass", 4],
] as const;

const input = process.argv[2];
if (!input) {
  throw new Error("Pass the path to NASA TAP limit rows (JSON).");
}
const output = new URL("../../src/common/model/data/pscomppars.json", import.meta.url);
const snapshot = JSON.parse(readFileSync(output, "utf8")) as {
  columns: Record<string, (string | number | null)[]>;
};
const rows = JSON.parse(readFileSync(input, "utf8")) as Record<string, string | number | null>[];
const byName = new Map(rows.map((row) => [row["pl_name"], row]));
if (byName.size !== rows.length) {
  throw new Error("Duplicate planet names in limit metadata.");
}
for (const [parameter, digits] of PARAMETERS) {
  const flags = (snapshot.columns["pl_name"] ?? []).map((name, i) => {
    const row = byName.get(name);
    const value = row?.[parameter];
    const rounded = typeof value === "number" ? Number(value.toPrecision(digits)) : null;
    const flag = row?.[`${parameter}lim`];
    if (!row || rounded !== snapshot.columns[parameter]?.[i]) {
      throw new Error(`Source drift for ${String(name)}, ${parameter}; snapshot was not written.`);
    }
    if (flag !== null && flag !== -1 && flag !== 0 && flag !== 1) {
      throw new Error(`Invalid or missing limit flag for ${String(name)}, ${parameter}.`);
    }
    return flag;
  });
  snapshot.columns[`${parameter}lim`] = flags;
}
// Same column-per-line format as fetch-archive.ts; existing snapshot values are unchanged.
const body = Object.entries(snapshot)
  .map(([key, value]) =>
    key === "columns"
      ? `"columns":{\n${Object.entries(snapshot.columns)
          .map(([column, values]) => `${JSON.stringify(column)}:${JSON.stringify(values)}`)
          .join(",\n")}\n}`
      : `${JSON.stringify(key)}:${JSON.stringify(value)}`,
  )
  .join(",\n");
writeFileSync(output, `{\n${body}\n}\n`);
console.log(`Added validated limit flags for ${snapshot.columns["pl_name"]?.length ?? 0} planets.`);
