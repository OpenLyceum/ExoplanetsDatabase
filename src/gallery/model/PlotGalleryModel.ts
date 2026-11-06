/**
 * PlotGalleryModel.ts
 *
 * Model for the Plot Gallery screen: which ready-made plot is shown, and whether the Solar System
 * planets are drawn on it for comparison.
 */

import { BooleanProperty, EnumerationProperty, Property } from "scenerystack/axon";
import type { TModel } from "scenerystack/joist";
import { CATALOG, type ExoplanetCatalog } from "../../common/model/ExoplanetCatalog.js";
import { GalleryPreset } from "./GalleryPreset.js";

export class PlotGalleryModel implements TModel {
  public readonly catalog: ExoplanetCatalog;
  public readonly presetProperty = new EnumerationProperty(GalleryPreset.MASS_VS_ORBIT);
  public readonly showSolarSystemProperty = new BooleanProperty(true);

  /** Planet under the pointer or picked by keyboard (catalog index), or null. */
  public readonly highlightedPlanetProperty = new Property<number | null>(null);

  public constructor(catalog: ExoplanetCatalog = CATALOG) {
    this.catalog = catalog;
    this.presetProperty.lazyLink(() => {
      this.highlightedPlanetProperty.value = null;
    });
  }

  public reset(): void {
    this.presetProperty.reset();
    this.showSolarSystemProperty.reset();
    this.highlightedPlanetProperty.reset();
  }

  public step(_dt: number): void {
    // Nothing evolves in time.
  }
}
