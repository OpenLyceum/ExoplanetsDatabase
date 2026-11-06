/**
 * GalleryPreset.ts
 *
 * The Plot Gallery's ready-made plots. Each one shows a pattern in the discoveries; its title
 * and "what to notice" caption live in the `gallery.presets.<key>` strings.
 */

import { Range } from "scenerystack/dot";
import { Enumeration, EnumerationValue } from "scenerystack/phet-core";
import { Quantity } from "../../common/model/Quantity.js";

/** How the preset draws its data. */
export type GalleryChartKind = "scatter" | "yearBars" | "histogram";

/** What a scatter preset colours its points by. */
export type GalleryColoring = "method" | "starMass" | "facility";

/** Guide curves a preset can add. */
export type GalleryGuide = "composition" | "keplerLines";

export type GalleryAxis = {
  readonly quantity: Quantity;
  readonly log: boolean;
  /** Axis range in data units (not log). */
  readonly range: Range;
};

type GalleryPresetOptions = {
  readonly kind: GalleryChartKind;
  readonly x: GalleryAxis;
  readonly y?: GalleryAxis;
  readonly coloring?: GalleryColoring;
  /** Leave out planets whose value of these quantities the archive estimated. */
  readonly measuredOnly?: readonly Quantity[];
  readonly guides?: readonly GalleryGuide[];
  /** Plot the discovery publication month instead of the year on x (spreads the points). */
  readonly xFromDiscoveryMonth?: boolean;
  /** Whether Solar System planets can be shown. */
  readonly solarSystem?: boolean;
};

const PERIOD_AXIS: GalleryAxis = { quantity: Quantity.PERIOD, log: true, range: new Range(0.1, 1e7) };
const MASS_AXIS: GalleryAxis = { quantity: Quantity.MASS, log: true, range: new Range(0.05, 1e5) };
const RADIUS_AXIS: GalleryAxis = { quantity: Quantity.RADIUS, log: true, range: new Range(0.3, 30) };
const YEAR_AXIS: GalleryAxis = { quantity: Quantity.DISCOVERY_YEAR, log: false, range: new Range(1989, 2027) };

export class GalleryPreset extends EnumerationValue {
  public static readonly MASS_VS_ORBIT = new GalleryPreset("massVsOrbit", {
    kind: "scatter",
    x: { quantity: Quantity.SEMI_MAJOR_AXIS, log: true, range: new Range(0.003, 1e4) },
    y: MASS_AXIS,
    measuredOnly: [Quantity.MASS],
    solarSystem: true,
  });

  public static readonly MASS_VS_PERIOD = new GalleryPreset("massVsPeriod", {
    kind: "scatter",
    x: PERIOD_AXIS,
    y: MASS_AXIS,
    measuredOnly: [Quantity.MASS],
    solarSystem: true,
  });

  public static readonly DISCOVERIES_PER_YEAR = new GalleryPreset("discoveriesPerYear", {
    kind: "yearBars",
    x: YEAR_AXIS,
  });

  public static readonly RADIUS_VS_PERIOD = new GalleryPreset("radiusVsPeriod", {
    kind: "scatter",
    x: { quantity: Quantity.PERIOD, log: true, range: new Range(0.1, 1e5) },
    y: RADIUS_AXIS,
    measuredOnly: [Quantity.RADIUS],
    solarSystem: true,
  });

  public static readonly MASS_VS_RADIUS = new GalleryPreset("massVsRadius", {
    kind: "scatter",
    x: { quantity: Quantity.MASS, log: true, range: new Range(0.1, 1e4) },
    y: RADIUS_AXIS,
    measuredOnly: [Quantity.MASS, Quantity.RADIUS],
    guides: ["composition"],
    solarSystem: true,
  });

  public static readonly KEPLERS_THIRD_LAW = new GalleryPreset("keplersThirdLaw", {
    kind: "scatter",
    x: { quantity: Quantity.SEMI_MAJOR_AXIS, log: true, range: new Range(0.003, 1e4) },
    y: { quantity: Quantity.PERIOD, log: true, range: new Range(0.05, 1e9) },
    coloring: "starMass",
    guides: ["keplerLines"],
    solarSystem: true,
  });

  public static readonly DISTANCE_HISTOGRAM = new GalleryPreset("distanceHistogram", {
    kind: "histogram",
    x: { quantity: Quantity.DISTANCE, log: true, range: new Range(1, 1e4) },
  });

  public static readonly SIZE_OVER_TIME = new GalleryPreset("sizeOverTime", {
    kind: "scatter",
    x: YEAR_AXIS,
    y: RADIUS_AXIS,
    measuredOnly: [Quantity.RADIUS],
    coloring: "facility",
    xFromDiscoveryMonth: true,
  });

  public static readonly enumeration = new Enumeration(GalleryPreset);

  /** Key into the `gallery.presets` string group. */
  public readonly key: string;
  public readonly kind: GalleryChartKind;
  public readonly x: GalleryAxis;
  public readonly y: GalleryAxis | null;
  public readonly coloring: GalleryColoring;
  public readonly measuredOnly: readonly Quantity[];
  public readonly guides: readonly GalleryGuide[];
  public readonly xFromDiscoveryMonth: boolean;
  public readonly solarSystem: boolean;

  public constructor(key: string, options: GalleryPresetOptions) {
    super();
    this.key = key;
    this.kind = options.kind;
    this.x = options.x;
    this.y = options.y ?? null;
    this.coloring = options.coloring ?? "method";
    this.measuredOnly = options.measuredOnly ?? [];
    this.guides = options.guides ?? [];
    this.xFromDiscoveryMonth = options.xFromDiscoveryMonth ?? false;
    this.solarSystem = options.solarSystem ?? false;
  }
}
