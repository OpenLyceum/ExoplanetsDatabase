/**
 * TableColumn.ts
 *
 * Columns the Explore table can show and sort by: the planet's name, its discovery method, and
 * every numeric quantity.
 */

import { Enumeration, EnumerationValue } from "scenerystack/phet-core";
import { Quantity } from "./Quantity.js";

export class TableColumn extends EnumerationValue {
  public static readonly NAME = new TableColumn("name", null);
  public static readonly METHOD = new TableColumn("method", null);
  public static readonly DISCOVERY_YEAR = new TableColumn("discoveryYear", Quantity.DISCOVERY_YEAR);
  public static readonly PERIOD = new TableColumn("period", Quantity.PERIOD);
  public static readonly SEMI_MAJOR_AXIS = new TableColumn("semiMajorAxis", Quantity.SEMI_MAJOR_AXIS);
  public static readonly ECCENTRICITY = new TableColumn("eccentricity", Quantity.ECCENTRICITY);
  public static readonly RADIUS = new TableColumn("radius", Quantity.RADIUS);
  public static readonly MASS = new TableColumn("mass", Quantity.MASS);
  public static readonly TEMPERATURE = new TableColumn("temperature", Quantity.TEMPERATURE);
  public static readonly INSOLATION = new TableColumn("insolation", Quantity.INSOLATION);
  public static readonly STAR_MASS = new TableColumn("starMass", Quantity.STAR_MASS);
  public static readonly STAR_RADIUS = new TableColumn("starRadius", Quantity.STAR_RADIUS);
  public static readonly STAR_TEMPERATURE = new TableColumn("starTemperature", Quantity.STAR_TEMPERATURE);
  public static readonly DISTANCE = new TableColumn("distance", Quantity.DISTANCE);
  public static readonly PLANET_COUNT = new TableColumn("planetCount", Quantity.PLANET_COUNT);

  public static readonly enumeration = new Enumeration(TableColumn);

  public readonly key: string;

  /** The numeric quantity shown, or null for the name and method columns. */
  public readonly quantity: Quantity | null;

  public constructor(key: string, quantity: Quantity | null) {
    super();
    this.key = key;
    this.quantity = quantity;
  }

  /** The column that shows a quantity. */
  public static forQuantity(quantity: Quantity): TableColumn {
    const column = TableColumn.enumeration.values.find((c) => c.quantity === quantity);
    if (!column) {
      throw new Error(`No table column for ${quantity.key}`);
    }
    return column;
  }
}
