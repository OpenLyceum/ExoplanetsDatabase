import { EXOPLANETS_DATABASE_SCREEN_ICONS_SETTINGS } from "../ExoplanetsDatabaseConstants.js";
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
    {
      method: DiscoveryMethod.TRANSIT,
      x: EXOPLANETS_DATABASE_SCREEN_ICONS_SETTINGS.CLUSTERS_X,
      y: EXOPLANETS_DATABASE_SCREEN_ICONS_SETTINGS.CLUSTERS_Y,
      spread: 0.12,
      share: 0.5,
    },
    {
      method: DiscoveryMethod.RADIAL_VELOCITY,
      x: EXOPLANETS_DATABASE_SCREEN_ICONS_SETTINGS.SCATTER_POINTS_CLUSTERS_X,
      y: EXOPLANETS_DATABASE_SCREEN_ICONS_SETTINGS.SCATTER_POINTS_CLUSTERS_Y,
      spread: 0.13,
      share: 0.3,
    },
    {
      method: DiscoveryMethod.MICROLENSING,
      x: EXOPLANETS_DATABASE_SCREEN_ICONS_SETTINGS.CLUSTERS_ITEM_3_X,
      y: EXOPLANETS_DATABASE_SCREEN_ICONS_SETTINGS.CLUSTERS_ITEM_3_Y,
      spread: 0.08,
      share: 0.1,
    },
    {
      method: DiscoveryMethod.IMAGING,
      x: EXOPLANETS_DATABASE_SCREEN_ICONS_SETTINGS.CLUSTERS_ITEM_4_X,
      y: EXOPLANETS_DATABASE_SCREEN_ICONS_SETTINGS.CLUSTERS_ITEM_4_Y,
      spread: 0.08,
      share: 0.1,
    },
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
  const options = {
    stroke: ExoplanetsDatabaseColors.axisColorProperty,
    lineWidth: EXOPLANETS_DATABASE_SCREEN_ICONS_SETTINGS.OPTIONS_LINE_WIDTH,
  };
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
      new Rectangle(
        EXOPLANETS_DATABASE_SCREEN_ICONS_SETTINGS.BARS_X,
        40 + k * 62,
        20 + (lengths[k] ?? 0) * (W - 140),
        EXOPLANETS_DATABASE_SCREEN_ICONS_SETTINGS.BARS_HEIGHT,
        {
          fill: methodColor(method),
          cornerRadius: EXOPLANETS_DATABASE_SCREEN_ICONS_SETTINGS.BARS_CORNER_RADIUS,
        },
      ),
  );
  return iconFrom(new Node({ children: [background(), ...bars] }));
}

export function createExploreIcon(): ScreenIcon {
  const rows: Node[] = [
    new Rectangle(
      EXOPLANETS_DATABASE_SCREEN_ICONS_SETTINGS.ROWS_X,
      EXOPLANETS_DATABASE_SCREEN_ICONS_SETTINGS.ROWS_Y,
      W - 80,
      EXOPLANETS_DATABASE_SCREEN_ICONS_SETTINGS.ROWS_HEIGHT,
      { fill: ExoplanetsDatabaseColors.tableHeaderColorProperty },
    ),
  ];
  for (let r = 0; r < 7; r++) {
    rows.push(
      new Rectangle(
        EXOPLANETS_DATABASE_SCREEN_ICONS_SETTINGS.CREATE_EXPLORE_ICON_X,
        80 + r * 38,
        W - 80,
        EXOPLANETS_DATABASE_SCREEN_ICONS_SETTINGS.CREATE_EXPLORE_ICON_HEIGHT,
        {
          fill:
            r === 2
              ? ExoplanetsDatabaseColors.tableSelectedRowColorProperty
              : r % 2 === 0
                ? ExoplanetsDatabaseColors.tableRowColorProperty
                : ExoplanetsDatabaseColors.tableAlternateRowColorProperty,
        },
      ),
    );
    const method = DiscoveryMethod.enumeration.values[[0, 1, 0, 2, 0, 1, 3][r] ?? 0] as DiscoveryMethod;
    rows.push(
      new Path(methodMarker(method).toShape(9), {
        fill: methodColor(method),
        x: EXOPLANETS_DATABASE_SCREEN_ICONS_SETTINGS.CREATE_EXPLORE_ICON_MARKER_X,
        y:
          EXOPLANETS_DATABASE_SCREEN_ICONS_SETTINGS.CREATE_EXPLORE_ICON_Y_OFFSET +
          r * EXOPLANETS_DATABASE_SCREEN_ICONS_SETTINGS.CREATE_EXPLORE_ICON_Y_FACTOR,
      }),
    );
    for (let c = 0; c < 4; c++) {
      rows.push(
        new Rectangle(
          110 + c * 105,
          93 + r * 38,
          70 - ((r + c) % 3) * 12,
          EXOPLANETS_DATABASE_SCREEN_ICONS_SETTINGS.CREATE_EXPLORE_ICON_CELL_HEIGHT,
          {
            fill: ExoplanetsDatabaseColors.secondaryTextColorProperty,
            cornerRadius: EXOPLANETS_DATABASE_SCREEN_ICONS_SETTINGS.CREATE_EXPLORE_ICON_CORNER_RADIUS,
          },
        ),
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
    new Rectangle(
      EXOPLANETS_DATABASE_SCREEN_ICONS_SETTINGS.CHOOSER_X,
      y,
      EXOPLANETS_DATABASE_SCREEN_ICONS_SETTINGS.CHOOSER_WIDTH,
      EXOPLANETS_DATABASE_SCREEN_ICONS_SETTINGS.CHOOSER_HEIGHT,
      {
        fill: ExoplanetsDatabaseColors.controlSurfaceColorProperty,
        stroke: ExoplanetsDatabaseColors.panelBorderColorProperty,
        lineWidth: EXOPLANETS_DATABASE_SCREEN_ICONS_SETTINGS.CHOOSER_LINE_WIDTH,
        cornerRadius: EXOPLANETS_DATABASE_SCREEN_ICONS_SETTINGS.CHOOSER_CORNER_RADIUS,
      },
    );
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
