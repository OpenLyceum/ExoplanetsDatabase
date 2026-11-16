import { METHOD_CHECKBOX_GROUP_SETTINGS } from "../../ExoplanetsDatabaseConstants.js";
/**
 * MethodCheckboxGroup.ts
 *
 * One checkbox per discovery method, each with the method's plot marker, plus "measured masses
 * only". Used by the Explore sidebar and the Plot Builder, which share the filter; doubles as the
 * method legend.
 */

import { HBox, Path, Text, VBox } from "scenerystack/scenery";
import { Checkbox } from "scenerystack/sun";
import { DiscoveryMethod } from "../../common/model/DiscoveryMethod.js";
import type { PlanetFilter } from "../../common/model/PlanetFilter.js";
import ExoplanetsDatabaseColors from "../../ExoplanetsDatabaseColors.js";
import { FONTS } from "../../ExoplanetsDatabaseConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import { EXOPLANETS_DATABASE_CHECKBOX_OPTIONS } from "../ExoplanetsDatabaseControlOptions.js";
import { methodColor, methodMarker, methodName } from "./dataStyles.js";

export class MethodCheckboxGroup extends VBox {
  public constructor(filter: PlanetFilter, width: number) {
    const common = StringManager.getInstance().getCommonStrings();
    const checkboxes = DiscoveryMethod.enumeration.values.map(
      (method) =>
        new Checkbox(
          filter.methodVisibleProperty(method),
          new HBox({
            spacing: METHOD_CHECKBOX_GROUP_SETTINGS.CHECKBOXES_SPACING,
            children: [
              new Path(methodMarker(method).toShape(5), { fill: methodColor(method) }),
              new Text(methodName(method), {
                font: FONTS.LABEL,
                fill: ExoplanetsDatabaseColors.textColorProperty,
                maxWidth: width - METHOD_CHECKBOX_GROUP_SETTINGS.CHECKBOXES_MAX_WIDTH_OFFSET,
              }),
            ],
          }),
          {
            ...EXOPLANETS_DATABASE_CHECKBOX_OPTIONS,
            accessibleName: methodName(method),
            accessibleHelpText: method === DiscoveryMethod.OTHER ? common.otherMethodsListStringProperty : null,
          },
        ),
    );
    const measuredMassCheckbox = new Checkbox(
      filter.measuredMassOnlyProperty,
      new Text(common.measuredMassesOnlyStringProperty, {
        font: FONTS.LABEL,
        fill: ExoplanetsDatabaseColors.textColorProperty,
        maxWidth: width - METHOD_CHECKBOX_GROUP_SETTINGS.MEASURED_MASS_CHECKBOX_MAX_WIDTH_OFFSET,
      }),
      {
        ...EXOPLANETS_DATABASE_CHECKBOX_OPTIONS,
        accessibleName: common.measuredMassesOnlyStringProperty,
        accessibleHelpText: common.estimatedMassNoteStringProperty,
      },
    );
    super({
      align: "left",
      spacing: METHOD_CHECKBOX_GROUP_SETTINGS.SPACING,
      children: [...checkboxes, measuredMassCheckbox],
    });
    this.disposeMethodCheckboxGroup = () => {
      for (const checkbox of [...checkboxes, measuredMassCheckbox]) {
        // The labels link to string Properties, so they need disposing too.
        for (const node of checkbox.getChildren()) {
          node.dispose();
        }
        checkbox.dispose();
      }
    };
  }

  private readonly disposeMethodCheckboxGroup: () => void;

  public override dispose(): void {
    this.disposeMethodCheckboxGroup();
    super.dispose();
  }
}
