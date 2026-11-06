/**
 * LegendNode.ts
 *
 * A legend for a plot's colouring: marker, label and how many planets of that kind are plotted.
 */

import { HBox, Path, RichText, Text, VBox } from "scenerystack/scenery";
import type { PointSet } from "../../common/model/plotPoints.js";
import ExoplanetsDatabaseColors from "../../ExoplanetsDatabaseColors.js";
import { FONTS } from "../../ExoplanetsDatabaseConstants.js";
import { formatCount } from "./format.js";
import type { LegendEntry } from "./pointColorings.js";

const LABEL_WIDTH = 140;
const COUNT_WIDTH = 44;

class LegendRow extends HBox {
  private readonly count: Text;

  public constructor(entry: LegendEntry) {
    const count = new Text("", { font: FONTS.SMALL, fill: ExoplanetsDatabaseColors.secondaryTextColorProperty });
    super({
      spacing: 6,
      children: [
        new Path(entry.marker.toShape(5), { fill: entry.color }),
        new RichText(entry.label, {
          font: FONTS.SMALL,
          fill: ExoplanetsDatabaseColors.textColorProperty,
          maxWidth: LABEL_WIDTH,
        }),
        count,
      ],
    });
    this.count = count;
  }

  public setCount(n: number): void {
    this.count.string = formatCount(n);
    this.count.maxWidth = COUNT_WIDTH;
  }
}

export class LegendNode extends VBox {
  public constructor() {
    super({ align: "left", spacing: 5, isDisposable: false });
  }

  /** Shows these entries with counts from the plotted points (rows with none plotted are dimmed). */
  public setEntries(entries: readonly LegendEntry[], points: PointSet): void {
    for (const child of this.children) {
      child.dispose();
    }
    const counts = new Map<number, number>();
    for (const group of points.groups) {
      counts.set(group, (counts.get(group) ?? 0) + 1);
    }
    this.children = entries.map((entry) => {
      const row = new LegendRow(entry);
      const n = entry.groups.reduce((sum, group) => sum + (counts.get(group) ?? 0), 0);
      row.setCount(n);
      row.opacity = n === 0 ? 0.4 : 1;
      return row;
    });
  }
}
