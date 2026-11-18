/**
 * ExoplanetDatabase.ts
 *
 * State shared by the Explore and Plot Builder screens: the filters, the planets that pass them,
 * the table's sort order, and the selected planet. One instance is built in main.ts and handed to
 * both screens, so a filtered table and its plot always show the same planets.
 */

import {
  BooleanProperty,
  DerivedProperty,
  EnumerationProperty,
  Property,
  type TReadOnlyProperty,
} from "scenerystack/axon";
import { CATALOG, type ExoplanetCatalog } from "./ExoplanetCatalog.js";
import { PlanetFilter } from "./PlanetFilter.js";
import { sortPlanets } from "./sortPlanets.js";
import { TableColumn } from "./TableColumn.js";

export class ExoplanetDatabase {
  public readonly catalog: ExoplanetCatalog;
  public readonly filter = new PlanetFilter();

  /** Planets passing the filters, in catalog order. */
  public readonly matchingPlanetsProperty: TReadOnlyProperty<Uint32Array>;
  private readonly _matchingPlanetsProperty: Property<Uint32Array>;

  /** Planets passing the filters, in table order. */
  public readonly sortedPlanetsProperty: TReadOnlyProperty<Uint32Array>;

  /** Newest discoveries first by default. */
  public readonly sortColumnProperty = new EnumerationProperty(TableColumn.DISCOVERY_YEAR);
  public readonly sortAscendingProperty = new BooleanProperty(false);

  /** Catalog index of the selected planet, or null. */
  public readonly selectedPlanetProperty = new Property<number | null>(null);

  public constructor(catalog: ExoplanetCatalog = CATALOG) {
    this.catalog = catalog;
    this._matchingPlanetsProperty = new Property(this.filter.matches(catalog));
    this.matchingPlanetsProperty = this._matchingPlanetsProperty;
    this.sortedPlanetsProperty = new DerivedProperty(
      [this.matchingPlanetsProperty, this.sortColumnProperty, this.sortAscendingProperty],
      (matching, column, ascending) => sortPlanets(catalog, matching, column, ascending),
    );

    this.filter.changedEmitter.addListener(() => {
      this._matchingPlanetsProperty.value = this.filter.matches(catalog);
    });
  }

  /** Sorts by a column; choosing the current sort column again reverses the order. */
  public sortBy(column: TableColumn): void {
    if (this.sortColumnProperty.value === column) {
      this.sortAscendingProperty.toggle();
    } else {
      this.sortColumnProperty.value = column;
      this.sortAscendingProperty.value = true;
    }
  }

  public reset(): void {
    this.filter.reset();
    this.sortColumnProperty.reset();
    this.sortAscendingProperty.reset();
    this.selectedPlanetProperty.reset();
  }
}
