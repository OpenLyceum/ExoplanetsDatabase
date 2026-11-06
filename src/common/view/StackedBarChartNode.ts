/**
 * StackedBarChartNode.ts
 *
 * Bars stacked by group (discovery method): discoveries per year, or a histogram of distances
 * on a log axis. Hovering a bar, or stepping through bars with the arrow keys, shows its count
 * broken down by group.
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import { KeyboardListener, Node, type ProfileColorProperty, Rectangle, RichText } from "scenerystack/scenery";
import ExoplanetsDatabaseColors from "../../ExoplanetsDatabaseColors.js";
import { FONTS } from "../../ExoplanetsDatabaseConstants.js";
import { ExoplanetsDatabasePanel } from "../ExoplanetsDatabasePanel.js";
import { formatCount } from "./format.js";
import { niceStep, type PlotAxis, PlotFrameNode, toAxis } from "./PlotFrameNode.js";

export type BarBin = {
  /** Bin edges in data units. */
  readonly from: number;
  readonly to: number;
  /** Shown in the tooltip, e.g. "2016" or "100–160 pc". */
  readonly label: string;
};

export type BarGroup = {
  readonly name: TReadOnlyProperty<string>;
  readonly color: ProfileColorProperty;
};

/** Gap between neighbouring bars, px. */
const BAR_GAP = 1;

export class StackedBarChartNode extends Node {
  public readonly frame: PlotFrameNode;
  private readonly barsLayer = new Node();
  private readonly tooltip: ExoplanetsDatabasePanel;
  private readonly tooltipText: RichText;
  private readonly focusTarget: Rectangle;
  private bins: readonly BarBin[] = [];
  private counts: readonly (readonly number[])[] = [];
  private groups: readonly BarGroup[] = [];
  private barNodes: Node[] = [];
  private focusedBin = -1;

  public constructor(
    viewWidth: number,
    viewHeight: number,
    accessibleName: TReadOnlyProperty<string>,
    accessibleHelpText: TReadOnlyProperty<string>,
  ) {
    super({ isDisposable: false });
    this.frame = new PlotFrameNode(viewWidth, viewHeight);
    this.frame.plotLayer.addChild(this.barsLayer);

    this.focusTarget = new Rectangle(0, 0, viewWidth, viewHeight, {
      tagName: "div",
      focusable: true,
      pickable: false,
      accessibleName,
      accessibleHelpText,
    });
    this.focusTarget.addInputListener(
      new KeyboardListener({
        keys: ["arrowRight", "arrowLeft"] as const,
        fire: (_event, key) => {
          const n = this.bins.length;
          if (n > 0) {
            this.focusedBin = Math.max(0, Math.min(n - 1, this.focusedBin + (key === "arrowRight" ? 1 : -1)));
            this.showTooltip(this.focusedBin);
            this.focusTarget.addAccessibleResponse(this.describe(this.focusedBin).replace(/<[^>]+>/g, " "));
          }
        },
      }),
    );
    this.tooltipText = new RichText("", {
      font: FONTS.SMALL,
      fill: ExoplanetsDatabaseColors.textColorProperty,
      leading: 2,
    });
    this.tooltip = new ExoplanetsDatabasePanel(this.tooltipText, {
      xMargin: 6,
      yMargin: 4,
      pickable: false,
      visible: false,
      stroke: ExoplanetsDatabaseColors.accentColorProperty,
    });
    this.frame.overlayLayer.children = [this.focusTarget, this.tooltip];
    this.children = [this.frame];
  }

  /** Draws the bars. counts[bin][group] are planets per bin per group. */
  public setBars(
    xAxis: PlotAxis,
    xLabel: TReadOnlyProperty<string>,
    yLabel: TReadOnlyProperty<string>,
    bins: readonly BarBin[],
    counts: readonly (readonly number[])[],
    groups: readonly BarGroup[],
  ): void {
    this.bins = bins;
    this.counts = counts;
    this.groups = groups;
    this.focusedBin = -1;
    this.tooltip.visible = false;
    const maxTotal = Math.max(1, ...counts.map((row) => row.reduce((a, b) => a + b, 0)));
    const step = niceStep(maxTotal, 5);
    this.frame.setAxes(xAxis, { range: new Range(0, Math.ceil((maxTotal * 1.05) / step) * step), log: false });
    this.frame.setAxisLabels(xLabel, yLabel);

    for (const node of this.barNodes) {
      node.dispose();
    }
    const transform = this.frame.chartTransform;
    this.barNodes = bins.map((bin, b) => {
      const x0 = transform.modelToViewX(toAxis(xAxis, bin.from)) + BAR_GAP / 2;
      const x1 = transform.modelToViewX(toAxis(xAxis, bin.to)) - BAR_GAP / 2;
      let base = 0;
      const rectangles = groups.map((group, g) => {
        const n = counts[b]?.[g] ?? 0;
        const y0 = transform.modelToViewY(base);
        const y1 = transform.modelToViewY(base + n);
        base += n;
        return new Rectangle(x0, y1, Math.max(0, x1 - x0), Math.max(0, y0 - y1), { fill: group.color });
      });
      // A full-height hit area so short bars are easy to hover.
      const hit = new Rectangle(x0, 0, Math.max(1, x1 - x0), this.frame.viewHeight, { fill: "transparent" });
      const node = new Node({ children: [hit, ...rectangles] });
      node.addInputListener({
        enter: () => this.showTooltip(b),
        exit: () => {
          this.tooltip.visible = false;
        },
      });
      return node;
    });
    this.barsLayer.children = this.barNodes;
  }

  private describe(b: number): string {
    const row = this.counts[b] ?? [];
    const total = row.reduce((sum, n) => sum + n, 0);
    const lines = this.groups
      .map((group, g) => ({ name: group.name.value, n: row[g] ?? 0 }))
      .filter((line) => line.n > 0)
      .map((line) => `${line.name}: ${formatCount(line.n)}`);
    return [`<b>${this.bins[b]?.label ?? ""}: ${formatCount(total)}</b>`, ...lines].join("<br>");
  }

  private showTooltip(b: number): void {
    const bar = this.barNodes[b];
    if (!bar) {
      return;
    }
    this.tooltipText.string = this.describe(b);
    this.tooltip.visible = true;
    const barTop = Math.min(...bar.children.slice(1).map((child) => child.top));
    this.tooltip.centerX = bar.centerX;
    this.tooltip.bottom = Math.max(this.tooltip.height + 2, barTop - 6);
    if (this.tooltip.left < 2) {
      this.tooltip.left = 2;
    }
    if (this.tooltip.right > this.frame.viewWidth - 2) {
      this.tooltip.right = this.frame.viewWidth - 2;
    }
  }
}
