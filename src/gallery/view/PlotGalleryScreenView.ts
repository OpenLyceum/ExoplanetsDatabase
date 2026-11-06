/**
 * PlotGalleryScreenView.ts
 *
 * The Plot Gallery: a list of ready-made plots on the left, the plot in the middle with its
 * colour key on the right, and a "what to notice" caption underneath. Scatter plots and bar
 * charts are separate nodes; the preset decides which one shows.
 */

import { DerivedProperty, Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { Node, RichText, Text, VBox } from "scenerystack/scenery";
import { ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { AquaRadioButtonGroup, Checkbox } from "scenerystack/sun";
import { FLAT_RESET_ALL_BUTTON_OPTIONS } from "../../common/ExoplanetsDatabaseButtonOptions.js";
import { EXOPLANETS_DATABASE_CHECKBOX_OPTIONS } from "../../common/ExoplanetsDatabaseControlOptions.js";
import { ExoplanetsDatabasePanel } from "../../common/ExoplanetsDatabasePanel.js";
import { DiscoveryMethod } from "../../common/model/DiscoveryMethod.js";
import { buildPoints, type PointSet } from "../../common/model/plotPoints.js";
import { Quantity } from "../../common/model/Quantity.js";
import { SOLAR_SYSTEM } from "../../common/model/SolarSystem.js";
import { DataCreditNode } from "../../common/view/DataCreditNode.js";
import { methodColor, methodName, quantityLabelWithUnit, quantityUnit } from "../../common/view/dataStyles.js";
import { formatCount, formatValue } from "../../common/view/format.js";
import { compositionGuides, keplerGuides } from "../../common/view/guides.js";
import { LegendNode } from "../../common/view/LegendNode.js";
import {
  FACILITY_COLORING,
  METHOD_COLORING,
  type PointColoring,
  STAR_MASS_COLORING,
} from "../../common/view/pointColorings.js";
import { ScatterChartNode } from "../../common/view/ScatterChartNode.js";
import { type BarBin, StackedBarChartNode } from "../../common/view/StackedBarChartNode.js";
import ExoplanetsDatabaseColors from "../../ExoplanetsDatabaseColors.js";
import { FONTS, SCREEN_VIEW_MARGIN } from "../../ExoplanetsDatabaseConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import { GalleryPreset } from "../model/GalleryPreset.js";
import type { PlotGalleryModel } from "../model/PlotGalleryModel.js";
import { PlotGalleryScreenSummaryContent } from "./PlotGalleryScreenSummaryContent.js";

export type PlotGalleryScreenViewOptions = ScreenViewOptions;

const MARGIN = 10;
const LIST_WIDTH = 190;
const CHART_LEFT = 268;
const CHART_WIDTH = 500;
const CHART_HEIGHT = 340;
const KEY_WIDTH = 220;

/** Distance histogram: bins 0.2 dex wide. */
const DISTANCE_BIN_DEX = 0.2;

type PresetStrings = Readonly<
  Record<string, { titleStringProperty: TReadOnlyProperty<string>; captionStringProperty: TReadOnlyProperty<string> }>
>;

export class PlotGalleryScreenView extends ScreenView {
  public constructor(model: PlotGalleryModel, providedOptions?: PlotGalleryScreenViewOptions) {
    const options = optionize<PlotGalleryScreenViewOptions, EmptySelfOptions, ScreenViewOptions>()(
      { screenSummaryContent: new PlotGalleryScreenSummaryContent(model) },
      providedOptions,
    );
    super(options);

    const strings = StringManager.getInstance().getPlotGalleryStrings();
    const common = StringManager.getInstance().getCommonStrings();
    const presetStrings = strings.presets as unknown as PresetStrings;
    const presetText = (preset: GalleryPreset) => {
      const entry = presetStrings[preset.key];
      if (!entry) {
        throw new Error(`No strings for ${preset.key}`);
      }
      return entry;
    };
    const catalog = model.catalog;
    const bounds = this.layoutBounds;
    const allPlanets = Uint32Array.from({ length: catalog.size }, (_, i) => i);

    // ── Preset list ───────────────────────────────────────────────────────────
    const presetList = new AquaRadioButtonGroup(
      model.presetProperty,
      GalleryPreset.enumeration.values.map((preset) => ({
        value: preset,
        options: { accessibleName: presetText(preset).titleStringProperty },
        createNode: () =>
          new Text(presetText(preset).titleStringProperty, {
            font: FONTS.LABEL,
            fill: ExoplanetsDatabaseColors.textColorProperty,
            maxWidth: LIST_WIDTH - 50,
          }),
      })),
      { spacing: 10, radioButtonOptions: { radius: 7 }, accessibleName: strings.presetsTitleStringProperty },
    );
    const solarSystemCheckbox = new Checkbox(
      model.showSolarSystemProperty,
      new Text(common.showSolarSystemStringProperty, {
        font: FONTS.LABEL,
        fill: ExoplanetsDatabaseColors.textColorProperty,
        maxWidth: LIST_WIDTH - 50,
      }),
      {
        ...EXOPLANETS_DATABASE_CHECKBOX_OPTIONS,
        accessibleName: common.showSolarSystemStringProperty,
        enabledProperty: new DerivedProperty([model.presetProperty], (preset) => preset.solarSystem),
      },
    );
    const listPanel = new ExoplanetsDatabasePanel(
      new VBox({
        align: "left",
        spacing: 10,
        children: [
          new Text(strings.presetsTitleStringProperty, {
            font: FONTS.HEADING,
            fill: ExoplanetsDatabaseColors.accentColorProperty,
          }),
          presetList,
          solarSystemCheckbox,
        ],
      }),
      { left: MARGIN, top: MARGIN, minWidth: LIST_WIDTH, maxWidth: LIST_WIDTH },
    );

    // ── Charts ────────────────────────────────────────────────────────────────
    const scatter = new ScatterChartNode(
      catalog,
      model.highlightedPlanetProperty,
      CHART_WIDTH,
      CHART_HEIGHT,
      strings.chartStringProperty,
      strings.chartHelpStringProperty,
    );
    const bars = new StackedBarChartNode(
      CHART_WIDTH,
      CHART_HEIGHT,
      strings.barChartStringProperty,
      strings.barChartHelpStringProperty,
    );
    for (const chart of [scatter, bars]) {
      chart.left = CHART_LEFT;
      chart.top = MARGIN + 6;
    }

    // ── Colour key and planet count ──────────────────────────────────────────
    const legend = new LegendNode();
    const plottedText = new Text("", {
      font: FONTS.SMALL,
      fill: ExoplanetsDatabaseColors.secondaryTextColorProperty,
      maxWidth: KEY_WIDTH - 20,
    });
    const keyPanel = new ExoplanetsDatabasePanel(
      new VBox({
        align: "left",
        spacing: 8,
        children: [
          new Text(strings.colorKeyTitleStringProperty, {
            font: FONTS.HEADING,
            fill: ExoplanetsDatabaseColors.accentColorProperty,
          }),
          legend,
          plottedText,
        ],
      }),
      { right: bounds.maxX - MARGIN, top: MARGIN, minWidth: KEY_WIDTH, maxWidth: KEY_WIDTH },
    );

    // ── Caption ───────────────────────────────────────────────────────────────
    const captionWidth = bounds.maxX - MARGIN - (LIST_WIDTH + 2 * MARGIN) - 24;
    const captionTitle = new Text("", {
      font: FONTS.TITLE,
      fill: ExoplanetsDatabaseColors.accentColorProperty,
      maxWidth: captionWidth,
    });
    const captionText = new RichText("", {
      font: FONTS.CAPTION,
      fill: ExoplanetsDatabaseColors.textColorProperty,
      lineWrap: captionWidth,
      maxWidth: captionWidth,
    });
    const captionPanel = new ExoplanetsDatabasePanel(
      new VBox({ align: "left", spacing: 4, children: [captionTitle, captionText] }),
      {
        left: LIST_WIDTH + 2 * MARGIN,
        top: MARGIN + CHART_HEIGHT + 62,
        minWidth: captionWidth + 24,
        maxWidth: captionWidth + 24,
      },
    );

    // ── Building each plot ───────────────────────────────────────────────────
    const pointCache = new Map<GalleryPreset, PointSet>();
    const coloringOf = (preset: GalleryPreset): PointColoring =>
      preset.coloring === "starMass"
        ? STAR_MASS_COLORING
        : preset.coloring === "facility"
          ? FACILITY_COLORING
          : METHOD_COLORING;
    const pointsOf = (preset: GalleryPreset): PointSet => {
      let points = pointCache.get(preset);
      if (!points && preset.y) {
        const coloring = coloringOf(preset);
        points = buildPoints(
          catalog,
          allPlanets,
          { quantity: preset.x.quantity, log: preset.x.log, fromDiscoveryMonth: preset.xFromDiscoveryMonth },
          preset.y,
          (i) => coloring.groupOf(catalog, i),
          preset.measuredOnly,
        );
        pointCache.set(preset, points);
      }
      return points as PointSet;
    };
    const methods = DiscoveryMethod.enumeration.values;
    const barGroups = methods.map((m) => ({ name: methodName(m), color: methodColor(m) }));

    const showScatter = (preset: GalleryPreset): void => {
      const y = preset.y as NonNullable<GalleryPreset["y"]>;
      const points = pointsOf(preset);
      const coloring = coloringOf(preset);
      const xLabel = preset.xFromDiscoveryMonth
        ? strings.discoveryDateAxisStringProperty
        : quantityLabelWithUnit(preset.x.quantity);
      scatter.setPlot(
        { ...preset.x, fromDiscoveryMonth: preset.xFromDiscoveryMonth },
        y,
        xLabel,
        quantityLabelWithUnit(y.quantity),
        points,
        coloring.styles,
      );
      scatter.setGuides(
        preset.guides.flatMap((guide) =>
          guide === "composition" ? compositionGuides(scatter.frame) : keplerGuides(scatter.frame),
        ),
      );
      legend.setEntries(coloring.legend, points);
      plottedText.string = strings.planetsPlottedPatternStringProperty.value.replace(
        "{{count}}",
        formatCount(points.indices.length),
      );
    };

    const showBars = (preset: GalleryPreset): void => {
      let bins: BarBin[];
      let binOf: (i: number) => number;
      if (preset.kind === "yearBars") {
        const first = Math.ceil(preset.x.range.min);
        const last = Math.floor(preset.x.range.max) - 1;
        bins = Array.from({ length: last - first + 1 }, (_, b) => ({
          from: first + b,
          to: first + b + 1,
          label: String(first + b),
        }));
        binOf = (i) => catalog.value(i, Quantity.DISCOVERY_YEAR) - first;
      } else {
        const lo = Math.log10(preset.x.range.min);
        const n = Math.round((Math.log10(preset.x.range.max) - lo) / DISTANCE_BIN_DEX);
        const unit = quantityUnit(preset.x.quantity).value;
        bins = Array.from({ length: n }, (_, b) => {
          const from = 10 ** (lo + b * DISTANCE_BIN_DEX);
          const to = 10 ** (lo + (b + 1) * DISTANCE_BIN_DEX);
          return {
            from,
            to,
            label: strings.binRangePatternStringProperty.value
              .replace("{{from}}", formatValue(from, 2))
              .replace("{{to}}", formatValue(to, 2))
              .replace("{{unit}}", unit),
          };
        });
        binOf = (i) => Math.floor((Math.log10(catalog.value(i, preset.x.quantity)) - lo) / DISTANCE_BIN_DEX);
      }
      const counts = bins.map(() => methods.map(() => 0));
      let plotted = 0;
      for (let i = 0; i < catalog.size; i++) {
        const b = binOf(i);
        const row = counts[b];
        if (Number.isInteger(b) && row) {
          const g = methods.indexOf(catalog.methods[i] as DiscoveryMethod);
          row[g] = (row[g] ?? 0) + 1;
          plotted++;
        }
      }
      const xLabel =
        preset.kind === "yearBars"
          ? quantityLabelWithUnit(Quantity.DISCOVERY_YEAR)
          : quantityLabelWithUnit(preset.x.quantity);
      bars.setBars(preset.x, xLabel, strings.planetsAxisStringProperty, bins, counts, barGroups);
      // Legend counts come from the bars (all planets with a value).
      const groups = new Uint8Array(plotted);
      let filled = 0;
      for (const row of counts) {
        for (const [g, n] of row.entries()) {
          groups.fill(g, filled, filled + n);
          filled += n;
        }
      }
      legend.setEntries(METHOD_COLORING.legend, {
        indices: new Uint32Array(plotted),
        xs: new Float64Array(0),
        ys: new Float64Array(0),
        groups,
      });
      plottedText.string = strings.planetsPlottedPatternStringProperty.value.replace("{{count}}", formatCount(plotted));
    };

    const updateSolarSystem = (): void => {
      const preset = model.presetProperty.value;
      const y = preset.y;
      if (!(y && preset.solarSystem && model.showSolarSystemProperty.value)) {
        scatter.setReferencePoints([]);
        return;
      }
      const names = common.solarSystem as unknown as Readonly<Record<string, TReadOnlyProperty<string>>>;
      scatter.setReferencePoints(
        SOLAR_SYSTEM.flatMap((planet) => {
          const x = planet.values.get(preset.x.quantity);
          const yValue = planet.values.get(y.quantity);
          return x === undefined || yValue === undefined
            ? []
            : [{ label: names[`${planet.key}StringProperty`]?.value ?? planet.key, x, y: yValue }];
        }),
      );
    };

    Multilink.multilink([model.presetProperty, strings.planetsPlottedPatternStringProperty], (preset) => {
      const isScatter = preset.kind === "scatter";
      scatter.visible = isScatter;
      bars.visible = !isScatter;
      if (isScatter) {
        showScatter(preset);
      } else {
        showBars(preset);
      }
      updateSolarSystem();
      captionTitle.stringProperty = presetText(preset).titleStringProperty;
      captionText.stringProperty = presetText(preset).captionStringProperty;
    });
    model.showSolarSystemProperty.lazyLink(updateSolarSystem);
    common.solarSystem.earthStringProperty.lazyLink(updateSolarSystem);

    const credit = new DataCreditNode({ left: MARGIN, bottom: bounds.maxY - 6, maxWidth: 680 });
    const resetAllButton = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      listener: () => model.reset(),
      right: bounds.maxX - SCREEN_VIEW_MARGIN,
      bottom: bounds.maxY - SCREEN_VIEW_MARGIN,
    });

    for (const node of [listPanel, scatter, bars, keyPanel, captionPanel, credit, resetAllButton]) {
      this.addChild(node);
    }
    this.addChild(
      new Node({ pdomOrder: [presetList, solarSystemCheckbox, scatter, bars, captionPanel, resetAllButton] }),
    );
  }

  public reset(): void {
    // No view-only state.
  }

  public override step(_dt: number): void {
    // Nothing animates.
  }
}
