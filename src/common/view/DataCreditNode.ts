/**
 * DataCreditNode.ts
 *
 * The one-line data credit shown on every screen: source table and snapshot date.
 */

import { PatternStringProperty } from "scenerystack/axon";
import { Text, type TextOptions } from "scenerystack/scenery";
import { CATALOG } from "../../common/model/ExoplanetCatalog.js";
import ExoplanetsDatabaseColors from "../../ExoplanetsDatabaseColors.js";
import { FONTS } from "../../ExoplanetsDatabaseConstants.js";
import { StringManager } from "../../i18n/StringManager.js";

export class DataCreditNode extends Text {
  private readonly creditStringProperty: PatternStringProperty<{ date: string }>;

  public constructor(options?: TextOptions) {
    const creditStringProperty = new PatternStringProperty(
      StringManager.getInstance().getCommonStrings().dataCreditPatternStringProperty,
      { date: CATALOG.retrieved },
    );
    super(creditStringProperty, {
      font: FONTS.SMALL,
      fill: ExoplanetsDatabaseColors.secondaryTextColorProperty,
      maxWidth: 700,
      ...options,
    });
    this.creditStringProperty = creditStringProperty;
  }

  public override dispose(): void {
    super.dispose();
    this.creditStringProperty.dispose();
  }
}
