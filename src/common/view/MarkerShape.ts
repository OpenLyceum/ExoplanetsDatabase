/**
 * MarkerShape.ts
 *
 * Point markers for the plots and legends. Each discovery method has its own shape so colour is
 * never the only cue.
 */

import { Shape } from "scenerystack/kite";
import { Enumeration, EnumerationValue } from "scenerystack/phet-core";

export class MarkerShape extends EnumerationValue {
  public static readonly CIRCLE = new MarkerShape();
  public static readonly SQUARE = new MarkerShape();
  public static readonly TRIANGLE = new MarkerShape();
  public static readonly DIAMOND = new MarkerShape();
  public static readonly CROSS = new MarkerShape();

  public static readonly enumeration = new Enumeration(MarkerShape);

  /** Adds this marker, centred on (x, y) with half-size r, to the context's current path. */
  public trace(context: CanvasRenderingContext2D, x: number, y: number, r: number): void {
    if (this === MarkerShape.CIRCLE) {
      context.moveTo(x + r, y);
      context.arc(x, y, r, 0, 2 * Math.PI);
    } else if (this === MarkerShape.SQUARE) {
      const s = r * 0.9;
      context.rect(x - s, y - s, 2 * s, 2 * s);
    } else if (this === MarkerShape.TRIANGLE) {
      const s = r * 1.2;
      context.moveTo(x, y - s);
      context.lineTo(x + s, y + s * 0.8);
      context.lineTo(x - s, y + s * 0.8);
      context.closePath();
    } else if (this === MarkerShape.DIAMOND) {
      const s = r * 1.25;
      context.moveTo(x, y - s);
      context.lineTo(x + s, y);
      context.lineTo(x, y + s);
      context.lineTo(x - s, y);
      context.closePath();
    } else {
      const s = r * 1.1;
      const w = r * 0.45;
      context.rect(x - s, y - w, 2 * s, 2 * w);
      context.rect(x - w, y - s, 2 * w, 2 * s);
    }
  }

  /** The same marker as a kite Shape centred on the origin, for legends. */
  public toShape(r: number): Shape {
    if (this === MarkerShape.CIRCLE) {
      return Shape.circle(0, 0, r);
    }
    if (this === MarkerShape.SQUARE) {
      const s = r * 0.9;
      return Shape.rect(-s, -s, 2 * s, 2 * s);
    }
    if (this === MarkerShape.TRIANGLE) {
      const s = r * 1.2;
      return new Shape()
        .moveTo(0, -s)
        .lineTo(s, s * 0.8)
        .lineTo(-s, s * 0.8)
        .close();
    }
    if (this === MarkerShape.DIAMOND) {
      const s = r * 1.25;
      return new Shape().moveTo(0, -s).lineTo(s, 0).lineTo(0, s).lineTo(-s, 0).close();
    }
    const s = r * 1.1;
    const w = r * 0.45;
    return new Shape()
      .moveTo(-s, -w)
      .lineTo(-w, -w)
      .lineTo(-w, -s)
      .lineTo(w, -s)
      .lineTo(w, -w)
      .lineTo(s, -w)
      .lineTo(s, w)
      .lineTo(w, w)
      .lineTo(w, s)
      .lineTo(-w, s)
      .lineTo(-w, w)
      .lineTo(-s, w)
      .close();
  }
}
