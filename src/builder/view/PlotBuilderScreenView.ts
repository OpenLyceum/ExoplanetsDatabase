/**
 * PlotBuilderScreenView.ts
 *
 * The Plot Builder: choose what goes on each axis (linear or log) and what the colours mean, and
 * plot the planets that pass the filters shared with the Explore table. Selecting a point selects
 * the planet in the table too; "Show in Table" jumps there.
 */

import { DerivedProperty, Multilink, PatternStringProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { HBox, Node, RichText, Text, VBox } from "scenerystack/scenery";
import { ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { AquaRadioButtonGroup, Checkbox, ComboBox, RectangularPushButton } from "scenerystack/sun";
import {
  EXOPLANETS_DATABASE_COMBO_BOX_OPTIONS,
  FLAT_PANEL_PUSH_BUTTON_OPTIONS,
  FLAT_RESET_ALL_BUTTON_OPTIONS,
  LIGHT_SURFACE_TEXT_FILL,
} from "../../common/ExoplanetsDatabaseButtonOptions.js";
import { EXOPLANETS_DATABASE_CHECKBOX_OPTIONS } from "../../common/ExoplanetsDatabaseControlOptions.js";
import { ExoplanetsDatabasePanel } from "../../common/ExoplanetsDatabasePanel.js";
import { buildPoints } from "../../common/model/plotPoints.js";
import { Quantity } from "../../common/model/Quantity.js";
import { SOLAR_SYSTEM } from "../../common/model/SolarSystem.js";
import { DataCreditNode } from "../../common/view/DataCreditNode.js";
import { quantityLabelWithUnit, quantityName } from "../../common/view/dataStyles.js";
import { showFilterDialog } from "../../common/view/FilterDialog.js";
import { FilterSummaryNode } from "../../common/view/FilterSummaryNode.js";
import { LegendNode } from "../../common/view/LegendNode.js";
import { MatchCountNode } from "../../common/view/MatchCountNode.js";
import { MethodCheckboxGroup } from "../../common/view/MethodCheckboxGroup.js";
import {
  FACILITY_COLORING,
  METHOD_COLORING,
  type PointColoring,
  STAR_MASS_COLORING,
  YEAR_COLORING,
} from "../../common/view/pointColorings.js";
import { type ScatterAxis, ScatterChartNode } from "../../common/view/ScatterChartNode.js";
import ExoplanetsDatabaseColors from "../../ExoplanetsDatabaseColors.js";
import { FONTS, SCREEN_VIEW_MARGIN } from "../../ExoplanetsDatabaseConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import { ColorBy } from "../model/ColorBy.js";
import type { PlotBuilderModel } from "../model/PlotBuilderModel.js";
import { PlotBuilderScreenSummaryContent } from "./PlotBuilderScreenSummaryContent.js";

export type PlotBuilderScreenViewOptions = ScreenViewOptions;

const MARGIN = 10;
const LEFT_WIDTH = 200;
const RIGHT_WIDTH = 236;
const CHART_LEFT = 290;
const CHART_WIDTH = 425;
const CHART_HEIGHT = 330;

const COLORINGS = new Map<ColorBy, PointColoring>([
  [ColorBy.METHOD, METHOD_COLORING],
  [ColorBy.FACILITY, FACILITY_COLORING],
  [ColorBy.YEAR, YEAR_COLORING],
  [ColorBy.STAR_MASS, STAR_MASS_COLORING],
]);

/** Axis range covering every planet's value, rounded out to whole decades (log) or nice numbers. */
function dataRange(values: Float64Array, quantity: Quantity, log: boolean): Range {
  if (quantity === Quantity.DISCOVERY_YEAR) {
    return new Range(1989, 2027);
  }
  const usable = Array.from(values).filter((v) => Number.isFinite(v) && (!log || v > 0));
  if (usable.length === 0) {
    return log ? new Range(0.1, 10) : new Range(0, 1);
  }
  const min = Math.min(...usable);
  const max = Math.max(...usable);
  if (log) {
    return new Range(10 ** Math.floor(Math.log10(min)), 10 ** Math.ceil(Math.log10(max)));
  }
  const pad = (max - min) * 0.04 || 1;
  return new Range(quantity === Quantity.ECCENTRICITY ? 0 : Math.min(0, min - pad), max + pad);
}

export class PlotBuilderScreenView extends ScreenView {
  public constructor(model: PlotBuilderModel, providedOptions?: PlotBuilderScreenViewOptions) {
    const options = optionize<PlotBuilderScreenViewOptions, EmptySelfOptions, ScreenViewOptions>()(
      { screenSummaryContent: new PlotBuilderScreenSummaryContent(model) },
      providedOptions,
    );
    super(options);

    const strings = StringManager.getInstance().getPlotBuilderStrings();
    const common = StringManager.getInstance().getCommonStrings();
    const database = model.database;
    const catalog = database.catalog;
    const bounds = this.layoutBounds;
    const listParent = new Node();

    const heading = (text: TReadOnlyProperty<string>): Text =>
      new Text(text, {
        font: FONTS.HEADING,
        fill: ExoplanetsDatabaseColors.accentColorProperty,
        maxWidth: LEFT_WIDTH - 20,
      });
    const lightText = (text: TReadOnlyProperty<string>, maxWidth: number): Text =>
      new Text(text, { font: FONTS.LABEL, fill: LIGHT_SURFACE_TEXT_FILL, maxWidth });
    const label = (text: TReadOnlyProperty<string>, maxWidth: number): Text =>
      new Text(text, { font: FONTS.LABEL, fill: ExoplanetsDatabaseColors.textColorProperty, maxWidth });

    // ── Axis choosers ─────────────────────────────────────────────────────────
    const quantityItems = Quantity.enumeration.values.map((q) => ({
      value: q,
      createNode: () =>
        new RichText(quantityLabelWithUnit(q), {
          font: FONTS.LABEL,
          fill: LIGHT_SURFACE_TEXT_FILL,
          maxWidth: LEFT_WIDTH - 60,
        }),
      accessibleName: quantityName(q),
    }));
    const axisControls = (
      title: TReadOnlyProperty<string>,
      quantityProperty: typeof model.xQuantityProperty,
      logProperty: typeof model.xLogProperty,
    ): VBox => {
      const comboBox = new ComboBox(quantityProperty, quantityItems, listParent, {
        ...EXOPLANETS_DATABASE_COMBO_BOX_OPTIONS,
        accessibleName: title,
      });
      const logCheckbox = new Checkbox(logProperty, label(strings.logScaleStringProperty, LEFT_WIDTH - 50), {
        ...EXOPLANETS_DATABASE_CHECKBOX_OPTIONS,
        accessibleName: new PatternStringProperty(strings.logScaleForPatternStringProperty, { axis: title }),
        enabledProperty: new DerivedProperty([quantityProperty], (q) => q.canUseLog),
        accessibleHelpText: strings.logScaleHelpStringProperty,
      });
      return new VBox({ align: "left", spacing: 6, children: [heading(title), comboBox, logCheckbox] });
    };
    const xControls = axisControls(strings.xAxisStringProperty, model.xQuantityProperty, model.xLogProperty);
    const yControls = axisControls(strings.yAxisStringProperty, model.yQuantityProperty, model.yLogProperty);

    const colorByNames = strings.colorBy as unknown as Readonly<Record<string, TReadOnlyProperty<string>>>;
    const colorByGroup = new AquaRadioButtonGroup(
      model.colorByProperty,
      ColorBy.enumeration.values.map((colorBy) => ({
        value: colorBy,
        options: { accessibleName: colorByNames[`${colorBy.key}StringProperty`] ?? null },
        createNode: () =>
          label(colorByNames[`${colorBy.key}StringProperty`] as TReadOnlyProperty<string>, LEFT_WIDTH - 50),
      })),
      { spacing: 7, radioButtonOptions: { radius: 7 }, accessibleName: strings.colorByTitleStringProperty },
    );
    const solarSystemCheckbox = new Checkbox(
      model.showSolarSystemProperty,
      label(common.showSolarSystemStringProperty, LEFT_WIDTH - 50),
      {
        ...EXOPLANETS_DATABASE_CHECKBOX_OPTIONS,
        accessibleName: common.showSolarSystemStringProperty,
      },
    );
    const leftPanel = new ExoplanetsDatabasePanel(
      new VBox({
        align: "left",
        spacing: 12,
        children: [
          xControls,
          yControls,
          new VBox({
            align: "left",
            spacing: 6,
            children: [heading(strings.colorByTitleStringProperty), colorByGroup],
          }),
          solarSystemCheckbox,
        ],
      }),
      { left: MARGIN, top: MARGIN, minWidth: LEFT_WIDTH, maxWidth: LEFT_WIDTH },
    );

    // ── Chart ─────────────────────────────────────────────────────────────────
    const chart = new ScatterChartNode(
      catalog,
      database.selectedPlanetProperty,
      CHART_WIDTH,
      CHART_HEIGHT,
      strings.chartStringProperty,
      strings.chartHelpStringProperty,
    );
    chart.left = CHART_LEFT;
    chart.top = MARGIN + 6;
    const legend = new LegendNode();

    // ── Right panel: count, methods, filters, selection ─────────────────────
    const matchCount = new MatchCountNode(database, { maxWidth: RIGHT_WIDTH - 20 });
    const methodCheckboxes = new MethodCheckboxGroup(database.filter, RIGHT_WIDTH - 20);
    const filterButton = (quantityProperty: typeof model.xQuantityProperty): RectangularPushButton => {
      const text = new PatternStringProperty(strings.filterAxisPatternStringProperty, {
        quantity: new DerivedProperty(
          [quantityProperty, common.labelWithUnitPatternStringProperty],
          (q) => quantityName(q).value,
        ),
      });
      return new RectangularPushButton({
        ...FLAT_PANEL_PUSH_BUTTON_OPTIONS,
        content: lightText(text, RIGHT_WIDTH - 36),
        accessibleName: text,
        minWidth: RIGHT_WIDTH - 24,
        listener: () => showFilterDialog(database.filter.criterion(quantityProperty.value)),
      });
    };
    const xFilterButton = filterButton(model.xQuantityProperty);
    const yFilterButton = filterButton(model.yQuantityProperty);
    const clearButton = new RectangularPushButton({
      ...FLAT_PANEL_PUSH_BUTTON_OPTIONS,
      content: lightText(common.clearAllFiltersStringProperty, RIGHT_WIDTH - 36),
      accessibleName: common.clearAllFiltersStringProperty,
      minWidth: RIGHT_WIDTH - 24,
      listener: () => database.filter.reset(),
      enabledProperty: new DerivedProperty([database.matchingPlanetsProperty], () => database.filter.isActive),
    });
    const selectedText = new Text("", {
      font: FONTS.SMALL,
      fill: ExoplanetsDatabaseColors.textColorProperty,
      maxWidth: RIGHT_WIDTH - 24,
    });
    Multilink.multilink(
      [database.selectedPlanetProperty, strings.selectedPatternStringProperty, strings.noSelectionStringProperty],
      (index, pattern, none) => {
        selectedText.string = index === null ? none : pattern.replace("{{name}}", catalog.names[index] ?? "");
      },
    );
    const showInTableButton = new RectangularPushButton({
      ...FLAT_PANEL_PUSH_BUTTON_OPTIONS,
      content: lightText(strings.showInTableStringProperty, RIGHT_WIDTH - 36),
      accessibleName: strings.showInTableStringProperty,
      minWidth: RIGHT_WIDTH - 24,
      listener: () => model.showInTable(),
      enabledProperty: new DerivedProperty([database.selectedPlanetProperty], (index) => index !== null),
    });
    const legendBox = new VBox({
      align: "left",
      spacing: 6,
      children: [heading(common.colorKeyStringProperty), legend],
    });
    const rightPanel = new ExoplanetsDatabasePanel(
      new VBox({
        align: "left",
        spacing: 8,
        children: [
          matchCount,
          heading(strings.filtersTitleStringProperty),
          methodCheckboxes,
          xFilterButton,
          yFilterButton,
          clearButton,
          legendBox,
          new HBox({ children: [selectedText] }),
          showInTableButton,
        ],
      }),
      { right: bounds.maxX - MARGIN, top: MARGIN, minWidth: RIGHT_WIDTH, maxWidth: RIGHT_WIDTH },
    );

    const summary = new FilterSummaryNode(database.filter, CHART_LEFT + CHART_WIDTH - LEFT_WIDTH - MARGIN - 10);
    summary.left = LEFT_WIDTH + 2 * MARGIN;
    summary.top = chart.bottom + 12;

    // ── Redrawing ─────────────────────────────────────────────────────────────
    const update = (): void => {
      const xQuantity = model.xQuantityProperty.value;
      const yQuantity = model.yQuantityProperty.value;
      const xLog = model.xLogProperty.value && xQuantity.canUseLog;
      const yLog = model.yLogProperty.value && yQuantity.canUseLog;
      const coloring = COLORINGS.get(model.colorByProperty.value) ?? METHOD_COLORING;
      const xAxis: ScatterAxis = {
        quantity: xQuantity,
        log: xLog,
        range: dataRange(catalog.column(xQuantity), xQuantity, xLog),
      };
      const yAxis: ScatterAxis = {
        quantity: yQuantity,
        log: yLog,
        range: dataRange(catalog.column(yQuantity), yQuantity, yLog),
      };
      const points = buildPoints(catalog, database.matchingPlanetsProperty.value, xAxis, yAxis, (i) =>
        coloring.groupOf(catalog, i),
      );
      chart.setPlot(
        xAxis,
        yAxis,
        quantityLabelWithUnit(xQuantity),
        quantityLabelWithUnit(yQuantity),
        points,
        coloring.styles,
      );
      legend.setEntries(coloring.legend, points);
      // The method checkboxes already show the method colours.
      legendBox.visible = model.colorByProperty.value !== ColorBy.METHOD;

      const names = common.solarSystem as unknown as Readonly<Record<string, TReadOnlyProperty<string>>>;
      chart.setReferencePoints(
        model.showSolarSystemProperty.value
          ? SOLAR_SYSTEM.flatMap((planet) => {
              const x = planet.values.get(xQuantity);
              const y = planet.values.get(yQuantity);
              return x === undefined || y === undefined
                ? []
                : [{ label: names[`${planet.key}StringProperty`]?.value ?? planet.key, x, y }];
            })
          : [],
      );
    };
    Multilink.multilink(
      [
        model.xQuantityProperty,
        model.yQuantityProperty,
        model.xLogProperty,
        model.yLogProperty,
        model.colorByProperty,
        model.showSolarSystemProperty,
        database.matchingPlanetsProperty,
        common.solarSystem.earthStringProperty,
      ],
      update,
    );

    const credit = new DataCreditNode({ left: MARGIN, bottom: bounds.maxY - 6, maxWidth: 680 });
    const resetAllButton = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      listener: () => model.reset(),
      right: bounds.maxX - SCREEN_VIEW_MARGIN,
      bottom: bounds.maxY - SCREEN_VIEW_MARGIN,
    });

    for (const node of [leftPanel, chart, rightPanel, summary, credit, resetAllButton, listParent]) {
      this.addChild(node);
    }
    this.addChild(
      new Node({
        pdomOrder: [
          xControls,
          yControls,
          colorByGroup,
          solarSystemCheckbox,
          chart,
          methodCheckboxes,
          xFilterButton,
          yFilterButton,
          clearButton,
          showInTableButton,
          resetAllButton,
        ],
      }),
    );
  }

  public reset(): void {
    // No view-only state.
  }

  public override step(_dt: number): void {
    // Nothing animates.
  }
}
