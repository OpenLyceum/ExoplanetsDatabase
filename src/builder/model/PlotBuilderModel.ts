/**
 * PlotBuilderModel.ts
 *
 * Model for the Plot Builder screen: any quantity against any other, on linear or log axes,
 * coloured by method, facility or year, using the same filters and selection as the Explore table.
 */

import { BooleanProperty, EnumerationProperty } from "scenerystack/axon";
import type { TModel } from "scenerystack/joist";
import type { ExoplanetDatabase } from "../../common/model/ExoplanetDatabase.js";
import { Quantity } from "../../common/model/Quantity.js";
import { ColorBy } from "./ColorBy.js";

export class PlotBuilderModel implements TModel {
  public readonly database: ExoplanetDatabase;

  /** Switches to the Explore screen (the selected planet stays selected). */
  public readonly showInTable: () => void;

  public readonly xQuantityProperty = new EnumerationProperty(Quantity.SEMI_MAJOR_AXIS);
  public readonly yQuantityProperty = new EnumerationProperty(Quantity.MASS);
  public readonly xLogProperty = new BooleanProperty(true);
  public readonly yLogProperty = new BooleanProperty(true);
  public readonly colorByProperty = new EnumerationProperty(ColorBy.METHOD);
  public readonly showSolarSystemProperty = new BooleanProperty(true);

  public constructor(database: ExoplanetDatabase, showInTable: () => void) {
    this.database = database;
    this.showInTable = showInTable;

    // A new quantity starts on the axis type that suits it.
    this.xQuantityProperty.lazyLink((quantity) => {
      this.xLogProperty.value = quantity.prefersLog && quantity.canUseLog;
    });
    this.yQuantityProperty.lazyLink((quantity) => {
      this.yLogProperty.value = quantity.prefersLog && quantity.canUseLog;
    });
  }

  public reset(): void {
    this.database.reset();
    this.xQuantityProperty.reset();
    this.yQuantityProperty.reset();
    this.xLogProperty.reset();
    this.yLogProperty.reset();
    this.colorByProperty.reset();
    this.showSolarSystemProperty.reset();
  }

  public step(_dt: number): void {
    // Nothing evolves in time.
  }
}
