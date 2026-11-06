/**
 * MatchCountNode.ts
 *
 * "1 175 of 6 464 planets": how many planets pass the filters, the number the activity asks for
 * after each filter. Announced to screen readers when it changes.
 */

import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { Text, type TextOptions } from "scenerystack/scenery";
import type { ExoplanetDatabase } from "../../common/model/ExoplanetDatabase.js";
import ExoplanetsDatabaseColors from "../../ExoplanetsDatabaseColors.js";
import { FONTS } from "../../ExoplanetsDatabaseConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import { formatCount } from "./format.js";

export class MatchCountNode extends Text {
  public readonly countStringProperty: TReadOnlyProperty<string>;

  public constructor(database: ExoplanetDatabase, options?: TextOptions) {
    const common = StringManager.getInstance().getCommonStrings();
    const countStringProperty = new DerivedProperty(
      [
        database.matchingPlanetsProperty,
        common.matchCountPatternStringProperty,
        common.planetCountPatternStringProperty,
      ],
      (matches, pattern, allPattern) =>
        matches.length === database.catalog.size
          ? allPattern.replace("{{count}}", formatCount(matches.length))
          : pattern
              .replace("{{count}}", formatCount(matches.length))
              .replace("{{total}}", formatCount(database.catalog.size)),
    );
    super(countStringProperty, {
      font: FONTS.MATCH_COUNT,
      fill: ExoplanetsDatabaseColors.textColorProperty,
      maxWidth: 400,
      ...options,
    });
    this.countStringProperty = countStringProperty;
    countStringProperty.lazyLink((text) => this.addAccessibleResponse(text));
  }

  public override dispose(): void {
    super.dispose();
    this.countStringProperty.dispose();
  }
}
