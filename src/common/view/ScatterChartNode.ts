/**
 * ScatterChartNode.ts
 *
 * An interactive planet scatter plot: a PlotFrameNode with a PointCloudNode, optional guide
 * curves and Solar System markers. Hovering shows the nearest planet's name and values; clicking
 * (or the arrow keys, which step through the planets from left to right) selects it.
 */

import { Property as AxonProperty, type Property, type TReadOnlyProperty } from "scenerystack/axon";
import { Bounds2 } from "scenerystack/dot";
import { Circle, colorProfileProperty, KeyboardListener, Node, Rectangle, RichText, Text } from "scenerystack/scenery";
import type { ExoplanetCatalog } from "../../common/model/ExoplanetCatalog.js";
import { type AxisRequest, axisValue, EMPTY_POINTS, type PointSet } from "../../common/model/plotPoints.js";
import { Quantity } from "../../common/model/Quantity.js";
import ExoplanetsDatabaseColors from "../../ExoplanetsDatabaseColors.js";
import { FONTS, MARKER_SIZE } from "../../ExoplanetsDatabaseConstants.js";
import { ExoplanetsDatabasePanel } from "../ExoplanetsDatabasePanel.js";
import { plainText, quantityName, quantityUnit } from "./dataStyles.js";
import { formatInteger, formatValue } from "./format.js";
import { type PlotAxis, PlotFrameNode } from "./PlotFrameNode.js";
import { PointCloudNode, type PointStyle } from "./PointCloudNode.js";

/** How close (px) the pointer must be to a planet to pick it. */
const PICK_DISTANCE = 9;

export type ScatterAxis = PlotAxis & AxisRequest;

/** A labelled reference point (a Solar System planet), in data units. */
export type ReferencePoint = { readonly label: string; readonly x: number; readonly y: number };

export class ScatterChartNode extends Node {
  public readonly frame: PlotFrameNode;

  /** Planet under the pointer, or null. */
  public readonly hoveredPlanetProperty = new AxonProperty<number | null>(null);

  private readonly catalog: ExoplanetCatalog;
  private readonly selectedPlanetProperty: Property<number | null>;
  private readonly cloud: PointCloudNode;
  private readonly guidesLayer = new Node();
  private readonly referenceLayer = new Node();
  private readonly tooltip: ExoplanetsDatabasePanel;
  private readonly tooltipText: RichText;
  private xAxis: ScatterAxis | null = null;
  private yAxis: ScatterAxis | null = null;
  private points: PointSet = EMPTY_POINTS;
  private references: readonly ReferencePoint[] = [];

  /** Point positions sorted left to right, for keyboard stepping. */
  private leftToRight: number[] = [];

  public constructor(
    catalog: ExoplanetCatalog,
    selectedPlanetProperty: Property<number | null>,
    viewWidth: number,
    viewHeight: number,
    accessibleName: TReadOnlyProperty<string>,
    accessibleHelpText: TReadOnlyProperty<string>,
  ) {
    super({ isDisposable: false });
    this.catalog = catalog;
    this.selectedPlanetProperty = selectedPlanetProperty;
    this.frame = new PlotFrameNode(viewWidth, viewHeight);
    this.cloud = new PointCloudNode(this.frame.chartTransform, MARKER_SIZE / 2 + 0.5);
    // Guides go over the points so their labels stay readable; they are thin dashed lines.
    this.frame.plotLayer.children = [this.cloud, this.guidesLayer, this.referenceLayer];

    // Picking happens on a transparent rectangle over the plot area.
    const hitArea = new Rectangle(0, 0, viewWidth, viewHeight, {
      fill: "transparent",
      cursor: "crosshair",
      tagName: "div",
      focusable: true,
      accessibleName,
      accessibleHelpText,
    });
    hitArea.addInputListener({
      move: (event) => {
        const local = hitArea.globalToLocalPoint(event.pointer.point);
        this.hoveredPlanetProperty.value = this.cloud.nearest(local.x, local.y, PICK_DISTANCE);
      },
      exit: () => {
        this.hoveredPlanetProperty.value = null;
      },
      down: (event) => {
        const local = hitArea.globalToLocalPoint(event.pointer.point);
        this.selectedPlanetProperty.value = this.cloud.nearest(local.x, local.y, PICK_DISTANCE);
      },
    });
    hitArea.addInputListener(
      new KeyboardListener({
        keys: ["arrowRight", "arrowLeft", "arrowUp", "arrowDown"] as const,
        fire: (_event, key) => this.step(key === "arrowRight" || key === "arrowUp" ? 1 : -1),
      }),
    );
    this.frame.overlayLayer.addChild(hitArea);

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
    this.frame.overlayLayer.addChild(this.tooltip);

    this.children = [this.frame];

    const update = (): void => this.updateHighlight();
    this.hoveredPlanetProperty.lazyLink(update);
    selectedPlanetProperty.lazyLink(update);
    colorProfileProperty.lazyLink(() => this.cloud.repaint());
  }

  /** Shows a new plot. Guide nodes are built by the caller from frame.dataToView. */
  public setPlot(
    xAxis: ScatterAxis,
    yAxis: ScatterAxis,
    xLabel: TReadOnlyProperty<string>,
    yLabel: TReadOnlyProperty<string>,
    points: PointSet,
    styles: readonly PointStyle[],
  ): void {
    this.xAxis = xAxis;
    this.yAxis = yAxis;
    this.points = points;
    this.frame.setAxes(xAxis, yAxis);
    this.frame.setAxisLabels(xLabel, yLabel);
    this.cloud.setPoints(points, styles);
    this.leftToRight = Array.from(points.indices.keys()).sort((a, b) => (points.xs[a] ?? 0) - (points.xs[b] ?? 0));
    this.layoutReferences();
    this.updateHighlight();
  }

  /** Replaces the guide curves (nodes in view coordinates). */
  public setGuides(nodes: Node[]): void {
    for (const child of this.guidesLayer.children) {
      child.dispose();
    }
    this.guidesLayer.children = nodes;
  }

  /** Solar System (or other reference) markers, in data units; an empty list hides them. */
  public setReferencePoints(points: readonly ReferencePoint[]): void {
    this.references = points;
    this.layoutReferences();
  }

  private layoutReferences(): void {
    for (const child of this.referenceLayer.children) {
      child.dispose();
    }
    const { viewWidth, viewHeight } = this.frame;
    const plotBounds = new Bounds2(0, 0, viewWidth, viewHeight);
    const placed = this.references
      .map((point) => ({ point, position: this.frame.dataToView(point.x, point.y) }))
      .filter(
        (entry): entry is { point: ReferencePoint; position: { x: number; y: number } } =>
          entry.position !== null && plotBounds.containsCoordinates(entry.position.x, entry.position.y),
      );
    const circles = placed.map(
      ({ position }) =>
        new Circle(MARKER_SIZE, {
          x: position.x,
          y: position.y,
          stroke: ExoplanetsDatabaseColors.solarSystemColorProperty,
          lineWidth: 1.5,
        }),
    );
    // Each label tries right, left, below and above its marker, keeping clear of the plot edge,
    // the markers and the labels already placed.
    const taken = circles.map((circle) => circle.bounds);
    const gap = MARKER_SIZE + 2;
    const labels = placed.map(({ point, position }) => {
      const text = new Text(point.label, {
        font: FONTS.SMALL,
        fill: ExoplanetsDatabaseColors.solarSystemColorProperty,
      });
      const candidates = [
        () => text.mutate({ left: position.x + gap, centerY: position.y }),
        () => text.mutate({ right: position.x - gap, centerY: position.y }),
        () => text.mutate({ centerX: position.x, top: position.y + gap }),
        () => text.mutate({ centerX: position.x, bottom: position.y - gap }),
      ];
      const fits = (): boolean =>
        plotBounds.containsBounds(text.bounds) && !taken.some((b) => b.intersectsBounds(text.bounds));
      const choice = candidates.find((place) => {
        place();
        return fits();
      });
      if (!choice) {
        (candidates[0] as () => void)();
      }
      taken.push(text.bounds);
      return text;
    });
    this.referenceLayer.children = [...circles, ...labels];
  }

  /** Moves the selection to the next planet to the right (+1) or left (−1). */
  private step(direction: 1 | -1): void {
    const order = this.leftToRight;
    if (order.length === 0) {
      return;
    }
    const selected = this.selectedPlanetProperty.value;
    const k = selected === null ? -1 : this.points.indices.indexOf(selected);
    const position = k < 0 ? -1 : order.indexOf(k);
    const next =
      position < 0
        ? direction > 0
          ? 0
          : order.length - 1
        : Math.max(0, Math.min(order.length - 1, position + direction));
    const index = this.points.indices[order[next] ?? 0] ?? null;
    this.selectedPlanetProperty.value = index;
    if (index !== null) {
      this.addAccessibleResponse(plainText(this.describe(index).replace(/<br>/g, ", ")));
    }
  }

  /** "Name<br>x label: value unit<br>y label: value unit". */
  private describe(index: number): string {
    const line = (axis: ScatterAxis | null): string => {
      if (!axis) {
        return "";
      }
      const value = axisValue(this.catalog, index, axis);
      const q = axis.quantity;
      const unit = quantityUnit(q).value;
      const shown =
        q === Quantity.DISCOVERY_YEAR
          ? formatInteger(this.catalog.value(index, q))
          : formatValue(value, q.significantFigures);
      const mark = this.catalog.isCalculated(index, q)
        ? "≈"
        : q === Quantity.MASS && this.catalog.isMinimumMass(index)
          ? "≥"
          : "";
      return `${quantityName(q).value}: ${mark}${shown}${unit === "" ? "" : ` ${unit}`}`;
    };
    return `<b>${this.catalog.names[index] ?? ""}</b><br>${line(this.xAxis)}<br>${line(this.yAxis)}`;
  }

  private updateHighlight(): void {
    const hovered = this.hoveredPlanetProperty.value;
    const selected = this.selectedPlanetProperty.value;
    this.cloud.setRings(
      [selected, hovered].filter((i): i is number => i !== null),
      () => ExoplanetsDatabaseColors.textColorProperty.value.toCSS(),
    );
    const shown = hovered ?? selected;
    const position = shown === null ? null : this.cloud.viewPositionOf(shown);
    if (shown === null || !position) {
      this.tooltip.visible = false;
      return;
    }
    this.tooltipText.string = this.describe(shown);
    this.tooltip.visible = true;
    // Beside the point, flipped to stay inside the plot.
    const { viewWidth, viewHeight } = this.frame;
    this.tooltip.left = position.x + 12;
    if (this.tooltip.right > viewWidth) {
      this.tooltip.right = position.x - 12;
    }
    this.tooltip.bottom = position.y - 8;
    if (this.tooltip.top < 0) {
      this.tooltip.top = Math.min(position.y + 8, viewHeight - this.tooltip.height);
    }
  }
}
