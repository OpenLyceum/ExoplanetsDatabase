/**
 * guides.ts
 *
 * Reference curves for the plots, drawn in view coordinates of a PlotFrameNode: composition
 * curves on mass–radius axes (Zeng, Sasselov & Jacobsen 2016 for iron and rock, constant density
 * for water) and Kepler's-third-law lines on orbit-size–period axes.
 */

import { PatternStringProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Node, Path, Rectangle, Text } from "scenerystack/scenery";
import { constantDensityRadius, rockyRadius } from "../../common/model/physics.js";
import ExoplanetsDatabaseColors from "../../ExoplanetsDatabaseColors.js";
import { FONTS } from "../../ExoplanetsDatabaseConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { PlotFrameNode } from "./PlotFrameNode.js";

/** Rocky curves stop here, Earth masses (the fit's range, generously). */
const ROCKY_MAX_MASS = 30;

/** Density of water, g/cm³. */
const WATER_DENSITY = 1;

const SAMPLES = 60;

/** A curve y(x) sampled log-evenly between x0 and x1 (data units). */
function curve(frame: PlotFrameNode, x0: number, x1: number, y: (x: number) => number): Shape {
  const shape = new Shape();
  let started = false;
  for (let k = 0; k <= SAMPLES; k++) {
    const x = x0 * (x1 / x0) ** (k / SAMPLES);
    const point = frame.dataToView(x, y(x));
    if (point) {
      if (started) {
        shape.lineTo(point.x, point.y);
      } else {
        shape.moveTo(point.x, point.y);
        started = true;
      }
    }
  }
  return shape;
}

/** A guide label on a translucent backdrop, so it stays readable over the points. */
function backedText(text: TReadOnlyProperty<string>): Node {
  const textNode = new Text(text, {
    font: FONTS.SMALL,
    fill: ExoplanetsDatabaseColors.guideLineColorProperty,
    maxWidth: 120,
  });
  const backdrop = new Rectangle(0, 0, 1, 1, {
    fill: ExoplanetsDatabaseColors.chartBackgroundColorProperty,
    opacity: 0.8,
    cornerRadius: 2,
  });
  const fit = (): void => {
    backdrop.setRectBounds(textNode.bounds.dilatedXY(3, 1));
  };
  textNode.boundsProperty.link(fit);
  const node = new Node({ children: [backdrop, textNode] });
  node.disposeEmitter.addListener(() => {
    textNode.boundsProperty.unlink(fit);
    textNode.dispose();
  });
  return node;
}

/** A label at the end of a curve: left of the point, above or below it. */
function label(frame: PlotFrameNode, text: TReadOnlyProperty<string>, x: number, y: number, above = true): Node | null {
  const point = frame.dataToView(x, y);
  if (!point) {
    return null;
  }
  const node = backedText(text);
  node.right = Math.min(point.x - 4, frame.viewWidth - 4);
  if (above) {
    node.bottom = point.y - 4;
  } else {
    node.top = point.y + 4;
  }
  return node;
}

const lineOptions = { stroke: ExoplanetsDatabaseColors.guideLineColorProperty, lineWidth: 1.5, lineDash: [6, 4] };

/** Pure-iron, Earth-like-rock and water curves for mass (x) against radius (y). */
export function compositionGuides(frame: PlotFrameNode): Node[] {
  const strings = StringManager.getInstance().getPlotGalleryStrings().guides;
  const xRange = frame.axes.x.range;
  const nodes: (Node | null)[] = [
    new Path(
      curve(frame, xRange.min, ROCKY_MAX_MASS, (m) => rockyRadius(m, 1)),
      lineOptions,
    ),
    new Path(
      curve(frame, xRange.min, ROCKY_MAX_MASS, (m) => rockyRadius(m)),
      lineOptions,
    ),
    new Path(
      curve(frame, xRange.min, xRange.max, (m) => constantDensityRadius(m, WATER_DENSITY)),
      lineOptions,
    ),
    label(frame, strings.ironStringProperty, ROCKY_MAX_MASS, rockyRadius(ROCKY_MAX_MASS, 1), false),
    label(frame, strings.rockStringProperty, ROCKY_MAX_MASS, rockyRadius(ROCKY_MAX_MASS)),
    label(frame, strings.waterStringProperty, 300, constantDensityRadius(300, WATER_DENSITY)),
  ];
  return nodes.filter((node): node is Node => node !== null);
}

/** Orbit size (au) where each star mass's line is labelled. */
const ANCHORS = new Map([
  [0.1, 150],
  [1, 600],
  [10, 2500],
]);

/** Line labels, created once (rebuilding the guides must not leave Properties behind). */
const keplerLabels = new Map<number, TReadOnlyProperty<string>>();
const keplerLabel = (mass: number): TReadOnlyProperty<string> => {
  let text = keplerLabels.get(mass);
  if (!text) {
    text = new PatternStringProperty(
      StringManager.getInstance().getPlotGalleryStrings().guides.keplerLinePatternStringProperty,
      { mass },
    );
    keplerLabels.set(mass, text);
  }
  return text;
};

/** Lines of P² = a³/M★ for three star masses, orbit size (x) against period (y). */
export function keplerGuides(frame: PlotFrameNode): Node[] {
  const xRange = frame.axes.x.range;
  const nodes: Node[] = [];
  for (const mass of [0.1, 1, 10]) {
    // Period (days) of an orbit of size a around this star: invert a(P).
    const period = (a: number): number => 365.25 * Math.sqrt(a ** 3 / mass);
    nodes.push(new Path(curve(frame, xRange.min, xRange.max, period), lineOptions));
    // Along the line, above it, staggered so the three labels don't collide.
    const anchor = ANCHORS.get(mass) ?? 1000;
    const p0 = frame.dataToView(anchor, period(anchor));
    const p1 = frame.dataToView(anchor * 2, period(anchor * 2));
    if (p0 && p1) {
      const angle = Math.atan2(p1.y - p0.y, p1.x - p0.x);
      const node = backedText(keplerLabel(mass));
      node.rotation = angle;
      node.center = new Vector2(p0.x + 9 * Math.sin(angle), p0.y - 9 * Math.cos(angle));
      nodes.push(node);
    }
  }
  return nodes;
}
