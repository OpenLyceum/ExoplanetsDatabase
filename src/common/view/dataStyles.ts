/**
 * dataStyles.ts
 *
 * Colours, markers and display strings for the data categories (discovery methods and
 * facilities) and the quantities, so every screen labels and colours them the same way.
 */

import { DerivedProperty, PatternStringProperty, type TReadOnlyProperty } from "scenerystack/axon";
import type { ProfileColorProperty } from "scenerystack/scenery";
import { DiscoveryMethod } from "../../common/model/DiscoveryMethod.js";
import { FacilityGroup } from "../../common/model/FacilityGroup.js";
import type { Quantity } from "../../common/model/Quantity.js";
import ExoplanetsDatabaseColors from "../../ExoplanetsDatabaseColors.js";
import { StringManager } from "../../i18n/StringManager.js";
import { MarkerShape } from "./MarkerShape.js";

type StringGroup = Readonly<Record<string, TReadOnlyProperty<string>>>;

/** Looks up `<key>StringProperty` in a string group. */
const lookup = (group: unknown, key: string): TReadOnlyProperty<string> => {
  const property = (group as StringGroup)[`${key}StringProperty`];
  if (!property) {
    throw new Error(`Missing string ${key}`);
  }
  return property;
};

const METHOD_COLORS = new Map<DiscoveryMethod, ProfileColorProperty>([
  [DiscoveryMethod.TRANSIT, ExoplanetsDatabaseColors.transitColorProperty],
  [DiscoveryMethod.RADIAL_VELOCITY, ExoplanetsDatabaseColors.radialVelocityColorProperty],
  [DiscoveryMethod.MICROLENSING, ExoplanetsDatabaseColors.microlensingColorProperty],
  [DiscoveryMethod.IMAGING, ExoplanetsDatabaseColors.imagingColorProperty],
  [DiscoveryMethod.OTHER, ExoplanetsDatabaseColors.otherMethodColorProperty],
]);

const METHOD_MARKERS = new Map<DiscoveryMethod, MarkerShape>([
  [DiscoveryMethod.TRANSIT, MarkerShape.CIRCLE],
  [DiscoveryMethod.RADIAL_VELOCITY, MarkerShape.SQUARE],
  [DiscoveryMethod.MICROLENSING, MarkerShape.TRIANGLE],
  [DiscoveryMethod.IMAGING, MarkerShape.DIAMOND],
  [DiscoveryMethod.OTHER, MarkerShape.CROSS],
]);

const FACILITY_COLORS = new Map<FacilityGroup, ProfileColorProperty>([
  [FacilityGroup.KEPLER, ExoplanetsDatabaseColors.keplerColorProperty],
  [FacilityGroup.K2, ExoplanetsDatabaseColors.k2ColorProperty],
  [FacilityGroup.TESS, ExoplanetsDatabaseColors.tessColorProperty],
  [FacilityGroup.OTHER_SPACE, ExoplanetsDatabaseColors.otherSpaceColorProperty],
  [FacilityGroup.GROUND, ExoplanetsDatabaseColors.groundColorProperty],
]);

const FACILITY_MARKERS = new Map<FacilityGroup, MarkerShape>([
  [FacilityGroup.KEPLER, MarkerShape.CIRCLE],
  [FacilityGroup.K2, MarkerShape.CIRCLE],
  [FacilityGroup.TESS, MarkerShape.DIAMOND],
  [FacilityGroup.OTHER_SPACE, MarkerShape.TRIANGLE],
  [FacilityGroup.GROUND, MarkerShape.SQUARE],
]);

export const methodColor = (method: DiscoveryMethod): ProfileColorProperty =>
  METHOD_COLORS.get(method) ?? ExoplanetsDatabaseColors.otherMethodColorProperty;

export const methodMarker = (method: DiscoveryMethod): MarkerShape => METHOD_MARKERS.get(method) ?? MarkerShape.CROSS;

export const methodName = (method: DiscoveryMethod): TReadOnlyProperty<string> =>
  lookup(StringManager.getInstance().getCommonStrings().methods, method.key);

export const methodShortName = (method: DiscoveryMethod): TReadOnlyProperty<string> =>
  lookup(StringManager.getInstance().getCommonStrings().methodsShort, method.key);

export const facilityColor = (group: FacilityGroup): ProfileColorProperty =>
  FACILITY_COLORS.get(group) ?? ExoplanetsDatabaseColors.groundColorProperty;

export const facilityMarker = (group: FacilityGroup): MarkerShape => FACILITY_MARKERS.get(group) ?? MarkerShape.SQUARE;

export const facilityName = (group: FacilityGroup): TReadOnlyProperty<string> =>
  lookup(StringManager.getInstance().getCommonStrings().facilities, group.key);

export const quantityName = (quantity: Quantity): TReadOnlyProperty<string> =>
  lookup(StringManager.getInstance().getCommonStrings().quantities, quantity.key);

export const quantityShortName = (quantity: Quantity): TReadOnlyProperty<string> =>
  lookup(StringManager.getInstance().getCommonStrings().quantitiesShort, quantity.key);

/** Unit as rich text (may hold <sub>), empty for dimensionless quantities. */
export const quantityUnit = (quantity: Quantity): TReadOnlyProperty<string> =>
  lookup(StringManager.getInstance().getCommonStrings().units, quantity.key);

const labelsWithUnit = new Map<Quantity, TReadOnlyProperty<string>>();

/** "Orbital period (days)" as rich text, or just the name when the quantity has no unit. Cached. */
export const quantityLabelWithUnit = (quantity: Quantity): TReadOnlyProperty<string> => {
  let label = labelsWithUnit.get(quantity);
  if (!label) {
    const pattern = new PatternStringProperty(
      StringManager.getInstance().getCommonStrings().labelWithUnitPatternStringProperty,
      {
        label: quantityName(quantity),
        unit: quantityUnit(quantity),
      },
    );
    label = new DerivedProperty([pattern, quantityName(quantity), quantityUnit(quantity)], (withUnit, name, unit) =>
      unit === "" ? name : withUnit,
    );
    labelsWithUnit.set(quantity, label);
  }
  return label;
};

/** Removes rich-text markup: "M<sub>⊕</sub>" becomes "M⊕". */
export const plainText = (richText: string): string => richText.replace(/<[^>]+>/g, "");
