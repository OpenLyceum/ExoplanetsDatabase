import { roundSymmetric } from "scenerystack/dot";
import { EXPLORE_MODEL_SETTINGS, EXPLORE_SCREEN_VIEW_SETTINGS } from "../../ExoplanetsDatabaseConstants.js";
/**
 * ExploreModel.ts
 *
 * Model for the Explore screen: the shared database (filters, sort order, selection),
 * which columns the table shows, and the virtualised window into the sorted list
 * (first visible row). PlanetTableNode keeps DOM / Scenery virtualization only.
 */

import { BooleanProperty, DerivedProperty, NumberProperty, type TReadOnlyProperty } from "scenerystack/axon";
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
export const MAX_VISIBLE_COLUMNS: number = EXPLORE_MODEL_SETTINGS.MAX_VISIBLE_COLUMNS;

/** Sort-arrow state shown in a column header. */
export type ColumnSortState = "none" | "ascending" | "descending";

export class ExploreModel implements TModel {
  public readonly database: ExoplanetDatabase;

  /** Whether each column is shown (the name column always is). */
  public readonly columnVisibleProperties: ReadonlyMap<TableColumn, BooleanProperty>;

  /** The columns currently shown, in TableColumn order. */
  public readonly visibleColumnsProperty: TReadOnlyProperty<TableColumn[]>;

  /** How many rows the table body shows at once. */
  public readonly rowCount: number;

  /** Index into sortedPlanets of the first visible row. */
  public readonly firstRowProperty: NumberProperty;

  /**
   * Catalog indices for the visible window (length `rowCount`); missing slots
   * are null when the filtered list is shorter than the window.
   */
  public readonly visiblePlanetIndicesProperty: TReadOnlyProperty<(number | null)[]>;

  /** Largest legal first-row index for the current sorted list. */
  public readonly maxFirstRowProperty: TReadOnlyProperty<number>;

  public constructor(database: ExoplanetDatabase, rowCount: number = EXPLORE_SCREEN_VIEW_SETTINGS.TABLE_ROWS) {
    this.database = database;
    this.rowCount = rowCount;
    this.columnVisibleProperties = new Map(
      TableColumn.enumeration.values.map((column) => [column, new BooleanProperty(DEFAULT_COLUMNS.has(column))]),
    );

    this.visibleColumnsProperty = DerivedProperty.deriveAny([...this.columnVisibleProperties.values()], () =>
      TableColumn.enumeration.values.filter(
        (column) => column === TableColumn.NAME || this.columnVisibleProperties.get(column)?.value,
      ),
    );

    this.firstRowProperty = new NumberProperty(0);
    this.maxFirstRowProperty = new DerivedProperty([database.sortedPlanetsProperty], (sorted) =>
      Math.max(0, sorted.length - rowCount),
    );
    this.visiblePlanetIndicesProperty = new DerivedProperty(
      [database.sortedPlanetsProperty, this.firstRowProperty],
      (sorted, first) => {
        const window: (number | null)[] = [];
        for (let r = 0; r < rowCount; r++) {
          const index = sorted[first + r];
          window.push(index === undefined ? null : index);
        }
        return window;
      },
    );

    // Keep the scroll window inside the list when filters/sort shrink it.
    database.sortedPlanetsProperty.lazyLink(() => this.clampFirstRow());
  }

  /** The columns currently shown, in TableColumn order. */
  public get visibleColumns(): TableColumn[] {
    return this.visibleColumnsProperty.value;
  }

  /** Sort-indicator state for a header. */
  public sortStateFor(column: TableColumn): ColumnSortState {
    if (column !== this.database.sortColumnProperty.value) {
      return "none";
    }
    return this.database.sortAscendingProperty.value ? "ascending" : "descending";
  }

  /** Catalog index at a visible row, or null if that slot is empty. */
  public planetAtRow(row: number): number | null {
    return this.visiblePlanetIndicesProperty.value[row] ?? null;
  }

  /** Scroll position as a 0 (bottom) … 1 (top) fraction for the VSlider. */
  public scrollFractionFromFirstRow(): number {
    const max = this.maxFirstRowProperty.value;
    return max === 0 ? 1 : 1 - this.firstRowProperty.value / max;
  }

  /** Sets firstRow from a 0 (bottom) … 1 (top) scroll-bar fraction. */
  public setFirstRowFromScrollFraction(scroll: number): void {
    this.firstRowProperty.value = roundSymmetric((1 - scroll) * this.maxFirstRowProperty.value);
  }

  public scrollBy(rows: number): void {
    const max = this.maxFirstRowProperty.value;
    this.firstRowProperty.value = Math.max(0, Math.min(max, this.firstRowProperty.value + rows));
  }

  /** Scrolls so the selected planet's row is visible. */
  public scrollToSelection(): void {
    const selected = this.database.selectedPlanetProperty.value;
    if (selected === null) {
      return;
    }
    const position = this.database.sortedPlanetsProperty.value.indexOf(selected);
    if (position < 0) {
      return;
    }
    const first = this.firstRowProperty.value;
    if (position < first) {
      this.firstRowProperty.value = position;
    } else if (position >= first + this.rowCount) {
      this.firstRowProperty.value = position - this.rowCount + 1;
    }
  }

  public clampFirstRow(): void {
    this.firstRowProperty.value = Math.min(this.firstRowProperty.value, this.maxFirstRowProperty.value);
  }

  public reset(): void {
    this.database.reset();
    for (const property of this.columnVisibleProperties.values()) {
      property.reset();
    }
    this.firstRowProperty.reset();
  }

  public step(_dt: number): void {
    // Nothing evolves in time.
  }
}
