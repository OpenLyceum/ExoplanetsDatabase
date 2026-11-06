/**
 * exoplanetsDatabaseQueryParameters.ts
 *
 * Sim-specific startup query parameters. This is the single place where every
 * sim-specific query parameter is declared and documented. Public-facing
 * parameters (intended for end users / sharing links) must set `public: true`.
 *
 * ── How to add a query parameter ──────────────────────────────────────────────
 * 1. Add an entry below with a `type`, `defaultValue`, and (if user-facing)
 *    `public: true`. Add `isValidValue` to bound numeric ranges.
 * 2. If it should also be user-editable at runtime, surface it as a preference
 *    in ExoplanetsDatabasePreferencesModel (initialize that Property from this query parameter).
 *
 * Usage: append e.g. `?archiveSyntax=false` to the sim URL.
 */

import { logGlobal } from "scenerystack/phet-core";
import { QueryStringMachine } from "scenerystack/query-string-machine";
import ExoplanetsDatabaseNamespace from "../ExoplanetsDatabaseNamespace.js";

const exoplanetsDatabaseQueryParameters = QueryStringMachine.getAll({
  /**
   * Shows, beside the table and the Plot Builder, what to type in the NASA Exoplanet Archive's own
   * table to apply the same filters. On by default; turn it off when students should stay in the sim.
   */
  archiveSyntax: {
    type: "boolean",
    defaultValue: true,
    public: true,
  },
});

ExoplanetsDatabaseNamespace.register("exoplanetsDatabaseQueryParameters", exoplanetsDatabaseQueryParameters);

// Log query parameters (for the console / PhET-iO).
logGlobal("phet.chipper.queryParameters");

export default exoplanetsDatabaseQueryParameters;
