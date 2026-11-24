/**
 * ExoplanetsDatabasePreferencesModel.ts
 *
 * Model for the simulation-specific preferences shown in Preferences →
 * Simulation. Each preference Property takes its initial value from the
 * corresponding query parameter in exoplanetsDatabaseQueryParameters.
 *
 * Remove the example preference (and its query parameter / UI control) if the
 * sim has no sim-specific preferences.
 */

import { BooleanProperty } from "scenerystack/axon";
import type { Tandem } from "scenerystack/tandem";
import ExoplanetsDatabaseNamespace from "../ExoplanetsDatabaseNamespace.js";
import exoplanetsDatabaseQueryParameters from "./exoplanetsDatabaseQueryParameters.js";

export class ExoplanetsDatabasePreferencesModel {
  /** Show what to type in the archive's own table (initial value from the `archiveSyntax` query parameter). */
  public readonly showArchiveSyntaxProperty: BooleanProperty;

  public constructor(tandem?: Tandem) {
    this.showArchiveSyntaxProperty = new BooleanProperty(
      exoplanetsDatabaseQueryParameters.archiveSyntax,
      tandem ? { tandem: tandem.createTandem("showArchiveSyntaxProperty") } : undefined,
    );
  }

  public reset(): void {
    this.showArchiveSyntaxProperty.reset();
  }
}

ExoplanetsDatabaseNamespace.register("ExoplanetsDatabasePreferencesModel", ExoplanetsDatabasePreferencesModel);
