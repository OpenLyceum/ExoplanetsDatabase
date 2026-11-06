/**
 * ExoplanetsDatabaseScreenIcons.ts
 *
 * Home-screen and navigation-bar icons: bars (Counts), a table (Explore), a scatter plot
 * coloured by method (Plot Gallery), and axes with choosers (Plot Builder). Drawn from the
 * sim's own colours and markers so they follow the colour profile.
 */

import { Line, Node, Path, Rectangle } from "scenerystack/scenery";
import { ScreenIcon } from "scenerystack/sim";
import ExoplanetsDatabaseColors from "../ExoplanetsDatabaseColors.js";
import { DiscoveryMethod } from "./model/DiscoveryMethod.js";
import { methodColor, methodMarker } from "./view/dataStyles.js";

const W = 548;
const H = 373;

function background(): Rectangle {
  return new Rectangle(0, 0, W, H, { fill: ExoplanetsDatabaseColors.backgroundColorProperty });
}

function iconFrom(content: Node): ScreenIcon {
  return new ScreenIcon(content, {
    maxIconWidthProportion: 1,
    maxIconHeightProportion: 1,
    fill: ExoplanetsDatabaseColors.backgroundColorProperty,
  });
}

/** Deterministic pseudo-random numbers so the icons never change. */
function seeded(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/** Points in rough method clusters, like the Mass vs orbit size plot. */
function scatterPoints(left: number, top: number, width: number, height: number, count: number): Node[] {
  const random = seeded(7);
  const clusters = [
    { method: DiscoveryMethod.TRANSIT, x: 0.2, y: 0.55, spread: 0.12, share: 0.5 },
    { method: DiscoveryMethod.RADIAL_VELOCITY, x: 0.4, y: 0.4, spread: 0.13, share: 0.3 },
    { method: DiscoveryMethod.MICROLENSING, x: 0.58, y: 0.5, spread: 0.08, share: 0.1 },
    { method: DiscoveryMethod.IMAGING, x: 0.85, y: 0.15, spread: 0.08, share: 0.1 },
  ];
  const nodes: Node[] = [];
  for (const cluster of clusters) {
    const n = Math.round(count * cluster.share);
    for (let k = 0; k < n; k++) {
      const gauss = (): number => (random() + random() + random() - 1.5) * 2 * cluster.spread;
      const x = Math.min(0.97, Math.max(0.03, cluster.x + gauss()));
      const y = Math.min(0.95, Math.max(0.05, cluster.y + gauss()));
      nodes.push(
        new Path(methodMarker(cluster.method).toShape(9), {
          fill: methodColor(cluster.method),
          x: left + x * width,
          y: top + y * height,
        }),
      );
    }
  }
  return nodes;
}

function axes(left: number, top: number, width: number, height: number): Node {
  const options = { stroke: ExoplanetsDatabaseColors.axisColorProperty, lineWidth: 6 };
  return new Node({
    children: [
      new Line(left, top, left, top + height, options),
      new Line(left, top + height, left + width, top + height, options),
    ],
  });
}

export function createCountsIcon(): ScreenIcon {
  const lengths = [0.95, 0.3, 0.12, 0.06, 0.04];
  const bars = DiscoveryMethod.enumeration.values.map(
    (method, k) =>
      new Rectangle(60, 40 + k * 62, 20 + (lengths[k] ?? 0) * (W - 140), 44, {
        fill: methodColor(method),
        cornerRadius: 4,
      }),
  );
  return iconFrom(new Node({ children: [background(), ...bars] }));
}

export function createExploreIcon(): ScreenIcon {
  const rows: Node[] = [new Rectangle(40, 30, W - 80, 50, { fill: ExoplanetsDatabaseColors.tableHeaderColorProperty })];
  for (let r = 0; r < 7; r++) {
    rows.push(
      new Rectangle(40, 80 + r * 38, W - 80, 38, {
        fill:
          r === 2
            ? ExoplanetsDatabaseColors.tableSelectedRowColorProperty
            : r % 2 === 0
              ? ExoplanetsDatabaseColors.tableRowColorProperty
              : ExoplanetsDatabaseColors.tableAlternateRowColorProperty,
      }),
    );
    const method = DiscoveryMethod.enumeration.values[[0, 1, 0, 2, 0, 1, 3][r] ?? 0] as DiscoveryMethod;
    rows.push(new Path(methodMarker(method).toShape(9), { fill: methodColor(method), x: 70, y: 99 + r * 38 }));
    for (let c = 0; c < 4; c++) {
      rows.push(
        new Rectangle(110 + c * 105, 93 + r * 38, 70 - ((r + c) % 3) * 12, 12, {
          fill: ExoplanetsDatabaseColors.secondaryTextColorProperty,
          cornerRadius: 3,
        }),
      );
    }
  }
  return iconFrom(new Node({ children: [background(), ...rows] }));
}

export function createPlotGalleryIcon(): ScreenIcon {
  return iconFrom(
    new Node({ children: [background(), axes(50, 30, W - 90, H - 80), ...scatterPoints(60, 30, W - 110, H - 90, 70)] }),
  );
}

export function createPlotBuilderIcon(): ScreenIcon {
  const chooser = (y: number): Node =>
    new Rectangle(30, y, 120, 44, {
      fill: ExoplanetsDatabaseColors.controlSurfaceColorProperty,
      stroke: ExoplanetsDatabaseColors.panelBorderColorProperty,
      lineWidth: 3,
      cornerRadius: 6,
    });
  return iconFrom(
    new Node({
      children: [
        background(),
        chooser(60),
        chooser(140),
        axes(190, 30, W - 220, H - 80),
        ...scatterPoints(200, 30, W - 240, H - 90, 45),
      ],
    }),
  );
}
