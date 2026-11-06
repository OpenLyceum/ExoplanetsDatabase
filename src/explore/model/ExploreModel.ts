/**
 * ExploreModel.ts
 *
 * Model for the Explore screen: the shared database (filters, sort order, selection) plus which
 * columns the table shows. Nothing moves, so step() does nothing.
 */

import { BooleanProperty } from "scenerystack/axon";
import type { TModel } from "scenerystack/joist";
import type { ExoplanetDatabase } from "../../common/model/ExoplanetDatabase.js";
import { TableColumn } from "../../common/model/TableColumn.js";

/** Columns shown when the screen opens: what the handout asks for first. */
const DEFAULT_COLUMNS = new Set([
  TableColumn.NAME,
  TableColumn.METHOD,
  TableColumn.DISCOVERY_YEAR,
  TableColumn.PERIOD,
  TableColumn.SEMI_MAJOR_AXIS,
  TableColumn.RADIUS,
  TableColumn.MASS,
  TableColumn.STAR_MASS,
]);

/** Most columns that fit across the table. */
export const MAX_VISIBLE_COLUMNS = 9;

export class ExploreModel implements TModel {
  public readonly database: ExoplanetDatabase;

  /** Whether each column is shown (the name column always is). */
  public readonly columnVisibleProperties: ReadonlyMap<TableColumn, BooleanProperty>;

  public constructor(database: ExoplanetDatabase) {
    this.database = database;
    this.columnVisibleProperties = new Map(
      TableColumn.enumeration.values.map((column) => [column, new BooleanProperty(DEFAULT_COLUMNS.has(column))]),
    );
  }

  /** The columns currently shown, in TableColumn order. */
  public get visibleColumns(): TableColumn[] {
    return TableColumn.enumeration.values.filter(
      (column) => column === TableColumn.NAME || this.columnVisibleProperties.get(column)?.value,
    );
  }

  public reset(): void {
    this.database.reset();
    for (const property of this.columnVisibleProperties.values()) {
      property.reset();
    }
  }

  public step(_dt: number): void {
    // Nothing evolves in time.
  }
}
