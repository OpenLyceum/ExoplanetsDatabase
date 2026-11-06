/**
 * format.ts
 *
 * Number formatting for the table, readouts and tick labels (adapted from TransitHunter's
 * chartUtils): significant figures with a true minus sign, grouped integers, and powers of ten.
 */

import { toFixed } from "scenerystack/dot";

/** Narrow no-break space, the SI thousands separator, which reads the same in every locale. */
const GROUP_SEPARATOR = " ";

/** An integer with grouped thousands: 6 464. */
export const formatCount = (value: number): string =>
  String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, GROUP_SEPARATOR);

/** Superscript digits for plain-text exponents. */
const SUPERSCRIPTS: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
  "-": "⁻",
};

const superscript = (exponent: number): string =>
  String(exponent)
    .split("")
    .map((c) => SUPERSCRIPTS[c] ?? c)
    .join("");

/**
 * A value to `digits` significant figures in plain text: decimals between 10⁻³ and 10⁶, otherwise
 * m × 10ⁿ with Unicode superscripts (so it fits in a plain Text node).
 */
export const formatValue = (value: number, digits = 3): string => {
  if (!Number.isFinite(value)) {
    return "—";
  }
  if (value === 0) {
    return "0";
  }
  const magnitude = Math.abs(value);
  if (magnitude < 1e-3 || magnitude >= 1e6) {
    const exponent = Math.floor(Math.log10(magnitude));
    const mantissa = Number((value / 10 ** exponent).toPrecision(Math.max(1, digits - 1)));
    return `${String(mantissa).replace("-", "−")} × 10${superscript(exponent)}`;
  }
  // toPrecision keeps the significant figures; Number() drops trailing zeros.
  const rounded = Number(value.toPrecision(digits));
  return (magnitude >= 10 ** digits ? toFixed(rounded, 0) : String(rounded)).replace("-", "−");
};

/** A whole number (year, count) without grouping. */
export const formatInteger = (value: number): string => (Number.isFinite(value) ? String(Math.round(value)) : "—");

/** A decade tick label: 0.01, 0.1, 1, 10, 100, 1000, then 10⁴, 10⁵, … */
export const formatDecade = (exponent: number): string => {
  const n = Math.round(exponent);
  if (n >= -2 && n <= 3) {
    return String(Number((10 ** n).toPrecision(1)));
  }
  return `10${superscript(n)}`;
};

/** A percentage to one decimal place: 74.2. */
export const formatPercent = (fraction: number): string =>
  Number.isFinite(fraction) ? toFixed(100 * fraction, 1) : "—";
