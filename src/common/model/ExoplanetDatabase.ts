/**
 * ExoplanetDatabase.ts
 *
 * State shared by the Explore and Plot Builder screens: the filters, the planets that pass them,
 * the table's sort order, and the selected planet. One instance is built in main.ts and handed to
 * both screens, so a filtered table and its plot always show the same planets.
 */

import { BooleanProperty, EnumerationProperty, Property } from "scenerystack/axon";
import { CATALOG, type ExoplanetCatalog } from "./ExoplanetCatalog.js";
import { PlanetFilter } from "./PlanetFilter.js";
import { sortPlanets } from "./sortPlanets.js";
import { TableColumn } from "./TableColumn.js";

export class ExoplanetDatabase {
  public readonly catalog: ExoplanetCatalog;
  public readonly filter = new PlanetFilter();

  /** Planets passing the filters, in catalog order. */
  public readonly matchingPlanetsProperty: Property<Uint32Array>;

  /** Planets passing the filters, in table order. */
  public readonly sortedPlanetsProperty: Property<Uint32Array>;

  /** Newest discoveries first by default. */
  public readonly sortColumnProperty = new EnumerationProperty(TableColumn.DISCOVERY_YEAR);
  public readonly sortAscendingProperty = new BooleanProperty(false);

  /** Catalog index of the selected planet, or null. */
  public readonly selectedPlanetProperty = new Property<number | null>(null);

  public constructor(catalog: ExoplanetCatalog = CATALOG) {
    this.catalog = catalog;
    this.matchingPlanetsProperty = new Property(this.filter.matches(catalog));
    this.sortedPlanetsProperty = new Property(this.sort(this.matchingPlanetsProperty.value));

    this.filter.changedEmitter.addListener(() => {
      this.matchingPlanetsProperty.value = this.filter.matches(catalog);
    });
    const resort = (): void => {
      this.sortedPlanetsProperty.value = this.sort(this.matchingPlanetsProperty.value);
    };
    this.matchingPlanetsProperty.lazyLink(resort);
    this.sortColumnProperty.lazyLink(resort);
    this.sortAscendingProperty.lazyLink(resort);
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

  private sort(indices: Uint32Array): Uint32Array {
    return sortPlanets(this.catalog, indices, this.sortColumnProperty.value, this.sortAscendingProperty.value);
  }

  public reset(): void {
    this.filter.reset();
    this.sortColumnProperty.reset();
    this.sortAscendingProperty.reset();
    this.selectedPlanetProperty.reset();
  }
}
