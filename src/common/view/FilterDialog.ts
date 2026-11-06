/**
 * FilterDialog.ts
 *
 * The dialog behind each column's filter button: an "at least" and an "at most" value typed on a
 * keypad, a "hide planets with no value" checkbox, and the text to type in the archive's own
 * filter box for the same filter. One dialog per quantity, created on first use and kept for the
 * life of the sim (the Explore and Plot Builder screens share them, as they share the filters).
 */

import {
  DerivedProperty,
  Multilink,
  PatternStringProperty,
  type Property,
  StringProperty,
  type TReadOnlyProperty,
} from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import { HBox, RichText, Text, VBox } from "scenerystack/scenery";
import { Keypad } from "scenerystack/scenery-phet";
import { Dialog, KeypadDialog } from "scenerystack/sim";
import { Checkbox, RectangularPushButton } from "scenerystack/sun";
import { CATALOG } from "../../common/model/ExoplanetCatalog.js";
import type { Quantity } from "../../common/model/Quantity.js";
import type { RangeCriterion } from "../../common/model/RangeCriterion.js";
import ExoplanetsDatabaseColors from "../../ExoplanetsDatabaseColors.js";
import { FONTS } from "../../ExoplanetsDatabaseConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import { exoplanetsDatabasePreferences } from "../../preferences/ExoplanetsDatabasePreferencesModel.js";
import { FLAT_PANEL_PUSH_BUTTON_OPTIONS, LIGHT_SURFACE_TEXT_FILL } from "../ExoplanetsDatabaseButtonOptions.js";
import { plainText, quantityLabelWithUnit } from "./dataStyles.js";
import { formatInteger, formatValue } from "./format.js";

/** Width of a value field, px. */
const FIELD_WIDTH = 110;

let keypadDialog: KeypadDialog | null = null;

/** The keypad every filter dialog types into (created on first use). */
const getKeypadDialog = (): KeypadDialog => {
  if (!keypadDialog) {
    keypadDialog = new KeypadDialog({
      keypadLayout: Keypad.PositiveFloatingPointLayout,
      keypadOptions: { accumulatorOptions: { maxDigits: 10, maxDigitsRightOfMantissa: 5 } },
    });
  }
  return keypadDialog;
};

/** Values a bound may take: from 0 (or the first discovery year) to a power of ten above the data. */
const boundRange = (quantity: Quantity): Range => {
  const values = Array.from(CATALOG.column(quantity)).filter(Number.isFinite);
  const max = Math.max(...values);
  if (quantity.isInteger) {
    return new Range(Math.floor(Math.min(...values) / 10) * 10, Math.ceil(max / 10) * 10 + 10);
  }
  return new Range(0, 10 ** Math.ceil(Math.log10(max)));
};

const formatBound = (quantity: Quantity, value: number): string =>
  quantity.isInteger ? formatInteger(value) : formatValue(value, quantity.significantFigures);

/** A light field showing a bound ("any" when unset); pressing it opens the keypad. */
class BoundField extends RectangularPushButton {
  private readonly multilink: { dispose: () => void };

  public constructor(
    boundProperty: Property<number | null>,
    quantity: Quantity,
    accessibleName: TReadOnlyProperty<string>,
  ) {
    const strings = StringManager.getInstance();
    const text = new Text("", { font: FONTS.LABEL, fill: LIGHT_SURFACE_TEXT_FILL, maxWidth: FIELD_WIDTH - 16 });
    super({
      ...FLAT_PANEL_PUSH_BUTTON_OPTIONS,
      content: text,
      minWidth: FIELD_WIDTH,
      xMargin: 8,
      yMargin: 4,
      accessibleName,
      listener: () => {
        getKeypadDialog().beginEdit(
          (value: number) => {
            boundProperty.value = quantity.isInteger ? Math.round(value) : value;
          },
          boundRange(quantity),
          strings.getCommonStrings().keypadRangePatternStringProperty,
          () => undefined,
        );
      },
    });
    this.multilink = Multilink.multilink(
      [boundProperty, strings.getExploreStrings().anyValueStringProperty],
      (value, any) => {
        text.string = value === null ? any : formatBound(quantity, value);
      },
    );
  }

  public override dispose(): void {
    this.multilink.dispose();
    super.dispose();
  }
}

export class FilterDialog extends Dialog {
  public constructor(criterion: RangeCriterion) {
    const strings = StringManager.getInstance().getExploreStrings();
    const quantity = criterion.quantity;
    const label = quantityLabelWithUnit(quantity);
    const plainLabel = new DerivedProperty([label], plainText);

    const title = new RichText(
      new PatternStringProperty(strings.filterDialogTitlePatternStringProperty, { quantity: label }),
      {
        font: FONTS.TITLE,
        fill: LIGHT_SURFACE_TEXT_FILL,
        maxWidth: 380,
      },
    );

    const boundRow = (labelProperty: TReadOnlyProperty<string>, boundProperty: Property<number | null>): HBox => {
      const clearButton = new RectangularPushButton({
        ...FLAT_PANEL_PUSH_BUTTON_OPTIONS,
        content: new Text(strings.clearBoundStringProperty, {
          font: FONTS.SMALL,
          fill: LIGHT_SURFACE_TEXT_FILL,
          maxWidth: 60,
        }),
        listener: () => {
          boundProperty.value = null;
        },
        enabledProperty: new DerivedProperty([boundProperty], (value) => value !== null),
        accessibleName: new PatternStringProperty(new StringProperty("{{clear}} {{bound}}"), {
          clear: strings.clearBoundStringProperty,
          bound: labelProperty,
        }),
      });
      return new HBox({
        spacing: 10,
        children: [
          new Text(labelProperty, { font: FONTS.LABEL, fill: LIGHT_SURFACE_TEXT_FILL, maxWidth: 90 }),
          new BoundField(boundProperty, quantity, labelProperty),
          clearButton,
        ],
      });
    };

    const requireValueCheckbox = new Checkbox(
      criterion.requireValueProperty,
      new Text(strings.requireValueStringProperty, { font: FONTS.LABEL, fill: LIGHT_SURFACE_TEXT_FILL, maxWidth: 300 }),
      {
        boxWidth: 16,
        spacing: 6,
        checkboxColor: ExoplanetsDatabaseColors.controlSurfaceTextColorProperty,
        checkboxColorBackground: ExoplanetsDatabaseColors.controlSurfaceColorProperty,
      },
    );

    // What to type in the archive's box for this column.
    const archiveTextProperty = new StringProperty("");
    const archiveText = new RichText(archiveTextProperty, {
      font: FONTS.SMALL,
      fill: LIGHT_SURFACE_TEXT_FILL,
      maxWidth: 380,
      lineWrap: 380,
      visibleProperty: exoplanetsDatabasePreferences.showArchiveSyntaxProperty,
    });
    Multilink.multilink(
      [
        criterion.minProperty,
        criterion.maxProperty,
        criterion.requireValueProperty,
        strings.archiveEquivalentPatternStringProperty,
        strings.archiveEquivalentNoneStringProperty,
      ],
      (_min, _max, _require, pattern, none) => {
        const syntax = criterion.archiveSyntax;
        archiveTextProperty.value = (syntax === null ? none : pattern)
          .replace("{{text}}", `<b>${syntax ?? ""}</b>`)
          .replace("{{column}}", `“${quantity.archiveTitle}”`);
      },
    );

    // Requiring a value is implied by a bound, so the checkbox is only meaningful without one.
    Multilink.multilink([criterion.minProperty, criterion.maxProperty], (min, max) => {
      requireValueCheckbox.enabled = min === null && max === null;
    });

    const clearButton = new RectangularPushButton({
      ...FLAT_PANEL_PUSH_BUTTON_OPTIONS,
      content: new Text(strings.clearFilterStringProperty, {
        font: FONTS.LABEL,
        fill: LIGHT_SURFACE_TEXT_FILL,
        maxWidth: 200,
      }),
      listener: () => criterion.reset(),
    });

    const content = new VBox({
      spacing: 12,
      align: "left",
      children: [
        boundRow(strings.atLeastStringProperty, criterion.minProperty),
        boundRow(strings.atMostStringProperty, criterion.maxProperty),
        requireValueCheckbox,
        archiveText,
        clearButton,
      ],
    });

    super(content, {
      title,
      fill: ExoplanetsDatabaseColors.controlSurfaceColorProperty,
      accessibleName: plainLabel,
      isDisposable: false,
    });
  }
}

const dialogs = new Map<RangeCriterion, FilterDialog>();

/** Shows the filter dialog for a criterion, creating it the first time. */
export function showFilterDialog(criterion: RangeCriterion): void {
  let dialog = dialogs.get(criterion);
  if (!dialog) {
    dialog = new FilterDialog(criterion);
    dialogs.set(criterion, dialog);
  }
  dialog.show();
}
