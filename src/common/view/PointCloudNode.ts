/**
 * PointCloudNode.ts
 *
 * Thousands of planets painted straight onto a canvas, one marker shape and colour per group
 * (discovery method, facility, year…). Points are given in the chart's model coordinates (log10
 * on a log axis). Groups are painted in order, so later groups land on top: pass the rarest
 * last. Adapted from TransitHunter's PointCloudNode; adds groups, highlight rings and picking.
 */

import type { ChartTransform } from "scenerystack/bamboo";
import { Bounds2 } from "scenerystack/dot";
import { CanvasNode } from "scenerystack/scenery";
import { EMPTY_POINTS, HIDDEN_GROUP, type PointSet } from "../../common/model/plotPoints.js";
import ExoplanetsDatabaseColors from "../../ExoplanetsDatabaseColors.js";
import type { MarkerShape } from "./MarkerShape.js";

/** How one group of points is drawn. */
export type PointStyle = {
  /** CSS colour, read at paint time so colour-profile changes take effect on repaint. */
  readonly css: () => string;
  readonly marker: MarkerShape;
};

export class PointCloudNode extends CanvasNode {
  private readonly chartTransform: ChartTransform;
  private readonly radius: number;
  private points: PointSet = EMPTY_POINTS;
  private styles: readonly PointStyle[] = [];
  private ringColor: () => string = () => ExoplanetsDatabaseColors.textColorProperty.value.toCSS();
  private rings: number[] = [];

  /** View positions from the last paint, for picking. */
  private viewXs = new Float32Array(0);
  private viewYs = new Float32Array(0);

  public constructor(transform: ChartTransform, radius: number) {
    super({ canvasBounds: new Bounds2(0, 0, transform.viewWidth, transform.viewHeight), pickable: false });
    this.chartTransform = transform;
    this.radius = radius;
    const repaint = (): void => this.invalidatePaint();
    transform.changedEmitter.addListener(repaint);
    this.disposeEmitter.addListener(() => transform.changedEmitter.removeListener(repaint));
  }

  public setPoints(points: PointSet, styles: readonly PointStyle[]): void {
    this.points = points;
    this.styles = styles;
    this.invalidatePaint();
  }

  /** Planets (catalog indices) to circle, e.g. the selected and the hovered one. */
  public setRings(indices: number[], color: () => string): void {
    this.rings = indices;
    this.ringColor = color;
    this.invalidatePaint();
  }

  /** Repaints after a colour change. */
  public repaint(): void {
    this.invalidatePaint();
  }

  /** Catalog index of the drawn point nearest a view position, within `maxDistance` px, or null. */
  public nearest(x: number, y: number, maxDistance: number): number | null {
    let best = -1;
    let bestDistance = maxDistance * maxDistance;
    for (let k = 0; k < this.viewXs.length; k++) {
      if (this.points.groups[k] === HIDDEN_GROUP) {
        continue;
      }
      const dx = (this.viewXs[k] ?? Number.NaN) - x;
      const dy = (this.viewYs[k] ?? Number.NaN) - y;
      const distance = dx * dx + dy * dy;
      if (distance <= bestDistance) {
        bestDistance = distance;
        best = k;
      }
    }
    return best < 0 ? null : (this.points.indices[best] ?? null);
  }

  /** View position of a planet in the current point set, or null. */
  public viewPositionOf(index: number): { x: number; y: number } | null {
    const k = this.points.indices.indexOf(index);
    if (k < 0 || this.points.groups[k] === HIDDEN_GROUP) {
      return null;
    }
    const transform = this.chartTransform;
    return {
      x: transform.modelToViewX(this.points.xs[k] ?? 0),
      y: transform.modelToViewY(this.points.ys[k] ?? 0),
    };
  }

  public override paintCanvas(context: CanvasRenderingContext2D): void {
    const transform = this.chartTransform;
    const { xs, ys, groups } = this.points;
    const n = xs.length;
    if (this.viewXs.length !== n) {
      this.viewXs = new Float32Array(n);
      this.viewYs = new Float32Array(n);
    }
    for (let k = 0; k < n; k++) {
      this.viewXs[k] = transform.modelToViewX(xs[k] ?? 0);
      this.viewYs[k] = transform.modelToViewY(ys[k] ?? 0);
    }
    const r = this.radius;
    context.globalAlpha = 0.85;
    this.styles.forEach((style, group) => {
      context.beginPath();
      for (let k = 0; k < n; k++) {
        if (groups[k] === group) {
          style.marker.trace(context, this.viewXs[k] ?? 0, this.viewYs[k] ?? 0, r);
        }
      }
      context.fillStyle = style.css();
      context.fill();
    });
    context.globalAlpha = 1;
    if (this.rings.length > 0) {
      context.lineWidth = 2;
      context.strokeStyle = this.ringColor();
      for (const index of this.rings) {
        const position = this.viewPositionOf(index);
        if (position) {
          context.beginPath();
          context.arc(position.x, position.y, r + 4, 0, 2 * Math.PI);
          context.stroke();
        }
      }
    }
  }
}
