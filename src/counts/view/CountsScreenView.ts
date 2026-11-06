/**
 * CountsScreenView.ts
 *
 * The Counts screen, the sim's version of the archive's Exoplanet Counts page: headline numbers
 * across the top, planets per discovery method (optionally only recent ones) on the left, and
 * the growth of the confirmed count since the first discoveries on the right.
 */

import { DerivedProperty, Multilink, PatternStringProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { Bounds2, Range } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { AlignBox, HBox, Line, Node, Path, Rectangle, RichText, Text, VBox } from "scenerystack/scenery";
import { ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { NumberSpinner } from "scenerystack/sun";
import { FLAT_RESET_ALL_BUTTON_OPTIONS } from "../../common/ExoplanetsDatabaseButtonOptions.js";
import { ExoplanetsDatabasePanel } from "../../common/ExoplanetsDatabasePanel.js";
import { DiscoveryMethod } from "../../common/model/DiscoveryMethod.js";
import { FacilityGroup } from "../../common/model/FacilityGroup.js";
import { Quantity } from "../../common/model/Quantity.js";
import { DataCreditNode } from "../../common/view/DataCreditNode.js";
import { methodColor, methodMarker, methodName } from "../../common/view/dataStyles.js";
import { formatCount, formatPercent } from "../../common/view/format.js";
import { PlotFrameNode } from "../../common/view/PlotFrameNode.js";
import ExoplanetsDatabaseColors from "../../ExoplanetsDatabaseColors.js";
import { FONTS, FOUR_THOUSAND_PLANETS_YEAR, SCREEN_VIEW_MARGIN } from "../../ExoplanetsDatabaseConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { CountsModel } from "../model/CountsModel.js";
import { CountsScreenSummaryContent } from "./CountsScreenSummaryContent.js";

export type CountsScreenViewOptions = ScreenViewOptions;

const MARGIN = 10;
const TILE_HEIGHT = 92;
const METHODS_WIDTH = 440;
const BAR_MAX_WIDTH = 190;
const BAR_HEIGHT = 20;
const CHART_WIDTH = 400;
const CHART_HEIGHT = 270;

/** The archive's confirmed count first passed this in June 2019. */
const FOUR_THOUSAND = 4000;

export class CountsScreenView extends ScreenView {
  public constructor(model: CountsModel, providedOptions?: CountsScreenViewOptions) {
    const options = optionize<CountsScreenViewOptions, EmptySelfOptions, ScreenViewOptions>()(
      { screenSummaryContent: new CountsScreenSummaryContent(model) },
      providedOptions,
    );
    super(options);

    const strings = StringManager.getInstance().getCountsStrings();
    const catalog = model.catalog;
    const bounds = this.layoutBounds;
    const heading = (text: TReadOnlyProperty<string>): Text =>
      new Text(text, {
        font: FONTS.TITLE,
        fill: ExoplanetsDatabaseColors.accentColorProperty,
        maxWidth: METHODS_WIDTH,
      });

    // ── Headline tiles ────────────────────────────────────────────────────────
    const facilityCount = (group: FacilityGroup): number => catalog.facilityGroups.filter((g) => g === group).length;
    const tileValues: [TReadOnlyProperty<string>, number][] = [
      [strings.tiles.confirmedStringProperty, catalog.size],
      [strings.tiles.tessCandidatesStringProperty, catalog.tessCandidates],
      [strings.tiles.keplerCandidatesStringProperty, catalog.keplerCandidates],
      [strings.tiles.byTessStringProperty, facilityCount(FacilityGroup.TESS)],
      [strings.tiles.byKeplerStringProperty, facilityCount(FacilityGroup.KEPLER)],
    ];
    const tileWidth = (bounds.width - 2 * MARGIN - 4 * MARGIN) / 5;
    const tiles = tileValues.map(([label, value], k) => {
      const number = new Text(formatCount(value), {
        font: FONTS.BIG_NUMBER,
        fill: ExoplanetsDatabaseColors.textColorProperty,
      });
      const caption = new RichText(label, {
        font: FONTS.SMALL,
        fill: ExoplanetsDatabaseColors.secondaryTextColorProperty,
        lineWrap: tileWidth - 24,
        maxWidth: tileWidth - 24,
        align: "center",
      });
      return new ExoplanetsDatabasePanel(new VBox({ spacing: 4, children: [number, caption] }), {
        left: MARGIN + k * (tileWidth + MARGIN),
        top: MARGIN,
        minWidth: tileWidth,
        maxWidth: tileWidth,
        minHeight: TILE_HEIGHT,
        align: "center",
        tagName: "p",
        accessibleName: new DerivedProperty([label], (text) => `${text}: ${formatCount(value)}`),
      });
    });
    const candidateNote = new RichText(strings.candidateNoteStringProperty, {
      font: FONTS.SMALL,
      fill: ExoplanetsDatabaseColors.secondaryTextColorProperty,
      maxWidth: bounds.width - 2 * MARGIN,
      left: MARGIN,
      top: MARGIN + TILE_HEIGHT + 22,
    });

    // ── Planets by method ────────────────────────────────────────────────────
    const methods = DiscoveryMethod.enumeration.values;
    const rows = methods.map((method) => {
      const bar = new Rectangle(0, 0, 1, BAR_HEIGHT, { fill: methodColor(method) });
      const value = new Text("", { font: FONTS.LABEL, fill: ExoplanetsDatabaseColors.textColorProperty });
      const row = new HBox({
        spacing: 8,
        children: [
          new Path(methodMarker(method).toShape(6), { fill: methodColor(method) }),
          new AlignBox(
            new Text(methodName(method), {
              font: FONTS.LABEL,
              fill: ExoplanetsDatabaseColors.textColorProperty,
              maxWidth: 110,
            }),
            { alignBounds: new Bounds2(0, 0, 110, BAR_HEIGHT), xAlign: "left" },
          ),
          new Node({ children: [new Rectangle(0, 0, BAR_MAX_WIDTH, BAR_HEIGHT), bar] }),
          value,
        ],
      });
      return { method, bar, value, row };
    });
    const otherList = new RichText(StringManager.getInstance().getCommonStrings().otherMethodsListStringProperty, {
      font: FONTS.SMALL,
      fill: ExoplanetsDatabaseColors.secondaryTextColorProperty,
      lineWrap: METHODS_WIDTH - 24,
      maxWidth: METHODS_WIDTH - 24,
    });
    const yearSpinner = new NumberSpinner(
      model.sinceYearProperty,
      new DerivedProperty([model.sinceYearProperty], () => model.yearRange),
      {
        arrowsPosition: "leftRight",
        numberDisplayOptions: {
          textOptions: { font: FONTS.LABEL },
          backgroundFill: ExoplanetsDatabaseColors.controlSurfaceColorProperty,
        },
        accessibleName: strings.sinceYearStringProperty,
        accessibleHelpText: strings.sinceYearHelpStringProperty,
      },
    );
    const totalText = new Text("", {
      font: FONTS.LABEL,
      fill: ExoplanetsDatabaseColors.secondaryTextColorProperty,
      maxWidth: METHODS_WIDTH - 24,
    });
    Multilink.multilink(
      [model.sinceYearProperty, strings.methodTotalPatternStringProperty, strings.methodRowPatternStringProperty],
      (sinceYear, totalPattern, rowPattern) => {
        const counts = model.methodCounts(sinceYear);
        const total = counts.reduce((a, b) => a + b, 0);
        const max = Math.max(1, ...counts);
        rows.forEach(({ bar, value }, k) => {
          const n = counts[k] ?? 0;
          bar.rectWidth = Math.max(n > 0 ? 1 : 0, (BAR_MAX_WIDTH * n) / max);
          value.string = rowPattern
            .replace("{{count}}", formatCount(n))
            .replace("{{percent}}", formatPercent(total > 0 ? n / total : Number.NaN));
        });
        totalText.string = totalPattern.replace("{{count}}", formatCount(total)).replace("{{year}}", String(sinceYear));
      },
    );
    const methodsPanel = new ExoplanetsDatabasePanel(
      new VBox({
        align: "left",
        spacing: 8,
        children: [
          heading(strings.methodsTitleStringProperty),
          new HBox({
            spacing: 10,
            children: [
              new Text(strings.sinceYearStringProperty, {
                font: FONTS.LABEL,
                fill: ExoplanetsDatabaseColors.textColorProperty,
                maxWidth: 200,
              }),
              yearSpinner,
            ],
          }),
          ...rows.map(({ row }) => row),
          totalText,
          otherList,
        ],
      }),
      { left: MARGIN, top: candidateNote.bottom + 12, minWidth: METHODS_WIDTH, maxWidth: METHODS_WIDTH },
    );

    // ── Growth over time ─────────────────────────────────────────────────────
    const frame = new PlotFrameNode(CHART_WIDTH, CHART_HEIGHT);
    const firstYear = 1990;
    const lastYear = Math.ceil(Math.max(...Array.from(catalog.discoveryMonths).filter(Number.isFinite))) + 0.5;
    const yMax = Math.ceil((catalog.size * 1.08) / 1000) * 1000;
    frame.setAxes({ range: new Range(firstYear, lastYear), log: false }, { range: new Range(0, yMax), log: false });
    frame.setAxisLabels(strings.yearAxisStringProperty, strings.growthAxisStringProperty);
    const dates = Array.from({ length: catalog.size }, (_, i) => {
      const month = catalog.discoveryMonths[i] ?? Number.NaN;
      return Number.isFinite(month) ? month : catalog.value(i, Quantity.DISCOVERY_YEAR) + 0.5;
    });
    const stepLine = (include: (i: number) => boolean): Shape => {
      const times = dates.filter((_, i) => include(i)).sort((a, b) => a - b);
      const shape = new Shape().moveTo(
        frame.chartTransform.modelToViewX(firstYear),
        frame.chartTransform.modelToViewY(0),
      );
      times.forEach((t, k) => {
        shape.lineTo(frame.chartTransform.modelToViewX(t), frame.chartTransform.modelToViewY(k + 1));
      });
      return shape.lineTo(frame.chartTransform.modelToViewX(lastYear), frame.chartTransform.modelToViewY(times.length));
    };
    const methodLines = methods.map(
      (method) =>
        new Path(
          stepLine((i) => catalog.methods[i] === method),
          { stroke: methodColor(method), lineWidth: 2 },
        ),
    );
    const totalLine = new Path(
      stepLine(() => true),
      { stroke: ExoplanetsDatabaseColors.textColorProperty, lineWidth: 2.5 },
    );
    const y4000 = frame.chartTransform.modelToViewY(FOUR_THOUSAND);
    const x2019 = frame.chartTransform.modelToViewX(FOUR_THOUSAND_PLANETS_YEAR);
    const markerOptions = { stroke: ExoplanetsDatabaseColors.guideLineColorProperty, lineDash: [5, 4] };
    const marker = new Node({
      children: [
        new Line(0, y4000, x2019, y4000, markerOptions),
        new Line(x2019, y4000, x2019, CHART_HEIGHT, markerOptions),
        new Text(strings.fourThousandStringProperty, {
          font: FONTS.SMALL,
          fill: ExoplanetsDatabaseColors.guideLineColorProperty,
          right: x2019 - 6,
          bottom: y4000 - 4,
          maxWidth: x2019 - 10,
        }),
      ],
    });
    frame.plotLayer.children = [...methodLines, totalLine, marker];
    const totalLegend = new HBox({
      spacing: 6,
      children: [
        new Line(0, 0, 18, 0, { stroke: ExoplanetsDatabaseColors.textColorProperty, lineWidth: 2.5 }),
        new Text(strings.totalLineStringProperty, {
          font: FONTS.SMALL,
          fill: ExoplanetsDatabaseColors.textColorProperty,
        }),
      ],
    });
    const growthText = new Text(
      new PatternStringProperty(strings.growthPatternStringProperty, {
        count: formatCount(catalog.size),
        factor: (catalog.size / FOUR_THOUSAND).toFixed(2),
      }),
      { font: FONTS.LABEL, fill: ExoplanetsDatabaseColors.textColorProperty, maxWidth: CHART_WIDTH + 60 },
    );
    const growthPanel = new ExoplanetsDatabasePanel(
      new VBox({
        align: "left",
        spacing: 8,
        children: [
          heading(strings.growthTitleStringProperty),
          new Node({ children: [frame] }),
          new HBox({ spacing: 16, children: [totalLegend, growthText] }),
        ],
      }),
      {
        right: bounds.maxX - MARGIN,
        top: methodsPanel.top,
        tagName: "div",
        accessibleParagraph: new PatternStringProperty(strings.growthDescriptionPatternStringProperty, {
          count: formatCount(catalog.size),
        }),
      },
    );

    const credit = new DataCreditNode({ left: MARGIN, bottom: bounds.maxY - 6, maxWidth: 680 });
    const resetAllButton = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      listener: () => model.reset(),
      right: bounds.maxX - SCREEN_VIEW_MARGIN,
      bottom: bounds.maxY - SCREEN_VIEW_MARGIN,
    });

    for (const node of [...tiles, candidateNote, methodsPanel, growthPanel, credit, resetAllButton]) {
      this.addChild(node);
    }
    this.addChild(new Node({ pdomOrder: [...tiles, methodsPanel, yearSpinner, growthPanel, resetAllButton] }));
  }

  public reset(): void {
    // No view-only state.
  }

  public override step(_dt: number): void {
    // Nothing animates.
  }
}
