/**
 * ColumnsDialog.ts
 *
 * The sim's "Select Columns": a checkbox per column. Once the table is full, the remaining
 * checkboxes are disabled until a column is removed.
 */

import { DerivedProperty, PatternStringProperty } from "scenerystack/axon";
import { RichText, Text, VBox } from "scenerystack/scenery";
import { Dialog } from "scenerystack/sim";
import { Checkbox } from "scenerystack/sun";
import { LIGHT_SURFACE_TEXT_FILL } from "../../common/ExoplanetsDatabaseButtonOptions.js";
import { TableColumn } from "../../common/model/TableColumn.js";
import { quantityLabelWithUnit } from "../../common/view/dataStyles.js";
import ExoplanetsDatabaseColors from "../../ExoplanetsDatabaseColors.js";
import { FONTS } from "../../ExoplanetsDatabaseConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import { type ExploreModel, MAX_VISIBLE_COLUMNS } from "../model/ExploreModel.js";

export class ColumnsDialog extends Dialog {
  public constructor(model: ExploreModel) {
    const strings = StringManager.getInstance().getExploreStrings();
    const columns = TableColumn.enumeration.values.filter((column) => column !== TableColumn.NAME);
    const visibleProperties = columns.map((column) => model.columnVisibleProperties.get(column));
    const visibleCountProperty = DerivedProperty.deriveAny(
      visibleProperties.filter((p) => p !== undefined),
      () => visibleProperties.filter((p) => p?.value).length + 1,
    );

    const checkboxes = columns.map((column) => {
      const property = model.columnVisibleProperties.get(column);
      if (!property) {
        throw new Error(`No visibility for ${column.key}`);
      }
      const label =
        column === TableColumn.METHOD
          ? new Text(strings.methodColumnStringProperty, { font: FONTS.LABEL, fill: LIGHT_SURFACE_TEXT_FILL })
          : new RichText(quantityLabelWithUnit(column.quantity as NonNullable<TableColumn["quantity"]>), {
              font: FONTS.LABEL,
              fill: LIGHT_SURFACE_TEXT_FILL,
              maxWidth: 260,
            });
      return new Checkbox(property, label, {
        accessibleName:
          column === TableColumn.METHOD
            ? strings.methodColumnStringProperty
            : quantityLabelWithUnit(column.quantity as NonNullable<TableColumn["quantity"]>),
        boxWidth: 16,
        spacing: 6,
        checkboxColor: ExoplanetsDatabaseColors.controlSurfaceTextColorProperty,
        checkboxColorBackground: ExoplanetsDatabaseColors.controlSurfaceColorProperty,
        enabledProperty: new DerivedProperty(
          [property, visibleCountProperty],
          (visible, count) => visible || count < MAX_VISIBLE_COLUMNS,
        ),
      });
    });

    const hint = new Text(
      new PatternStringProperty(strings.columnsDialogHintStringProperty, { max: MAX_VISIBLE_COLUMNS }),
      { font: FONTS.SMALL, fill: LIGHT_SURFACE_TEXT_FILL, maxWidth: 300 },
    );

    super(new VBox({ align: "left", spacing: 6, children: [hint, ...checkboxes] }), {
      title: new Text(strings.columnsDialogTitleStringProperty, { font: FONTS.TITLE, fill: LIGHT_SURFACE_TEXT_FILL }),
      fill: ExoplanetsDatabaseColors.controlSurfaceColorProperty,
      isDisposable: false,
    });
  }
}
