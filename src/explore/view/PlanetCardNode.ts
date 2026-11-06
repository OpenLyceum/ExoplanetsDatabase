/**
 * PlanetCardNode.ts
 *
 * Everything the archive lists about the selected planet, laid out like the activity's
 * "fill in its properties" table, beside Earth's and the Sun's values. Below come the numbers a
 * student would work out by hand: Kepler's third law, the closest and farthest distances from
 * the star, the star's luminosity from R²T⁴, and the planet's density.
 */

import { Bounds2 } from "scenerystack/dot";
import { localeProperty } from "scenerystack/joist";
import { AlignBox, GridBox, type Node, RichText, Text, VBox } from "scenerystack/scenery";
import { ExoplanetsDatabasePanel } from "../../common/ExoplanetsDatabasePanel.js";
import type { DiscoveryMethod } from "../../common/model/DiscoveryMethod.js";
import type { ExoplanetCatalog } from "../../common/model/ExoplanetCatalog.js";
import type { ExoplanetDatabase } from "../../common/model/ExoplanetDatabase.js";
import { FacilityGroup } from "../../common/model/FacilityGroup.js";
import {
  densityConstraint,
  keplerCheck,
  LIGHT_YEARS_PER_PARSEC,
  luminosityFromRadiusAndTemperature,
  orbitExtremes,
} from "../../common/model/physics.js";
import { Quantity } from "../../common/model/Quantity.js";
import { EARTH } from "../../common/model/SolarSystem.js";
import { facilityName, methodName, quantityName, quantityUnit } from "../../common/view/dataStyles.js";
import { formatInteger, formatPercent, formatValue } from "../../common/view/format.js";
import ExoplanetsDatabaseColors from "../../ExoplanetsDatabaseColors.js";
import { FONTS } from "../../ExoplanetsDatabaseConstants.js";
import { StringManager } from "../../i18n/StringManager.js";

const CONTENT_WIDTH = 244;
const LABEL_WIDTH = 112;
const VALUE_WIDTH = 82;
const REFERENCE_WIDTH = 38;

const PLANET_ROWS = [Quantity.MASS, Quantity.RADIUS, Quantity.TEMPERATURE, Quantity.INSOLATION];
const ORBIT_ROWS = [Quantity.PERIOD, Quantity.SEMI_MAJOR_AXIS, Quantity.ECCENTRICITY];
const STAR_ROWS = [Quantity.STAR_MASS, Quantity.STAR_RADIUS, Quantity.STAR_TEMPERATURE, Quantity.PLANET_COUNT];

const fill = (pattern: string, values: Record<string, string>): string =>
  pattern.replace(/\{\{(\w+)\}\}/g, (match, key: string) => values[key] ?? match);

/** The values a student would work out by hand, where the archive lists what they need. */
function derivedLines(catalog: ExoplanetCatalog, index: number): string[] {
  const card = StringManager.getInstance().getExploreStrings().card;
  const value = (q: Quantity): number => catalog.value(index, q);
  const lines: string[] = [];
  const period = value(Quantity.PERIOD);
  const a = value(Quantity.SEMI_MAJOR_AXIS);
  const starMass = value(Quantity.STAR_MASS);
  if (
    [period, a, starMass].every(Number.isFinite) &&
    [Quantity.PERIOD, Quantity.SEMI_MAJOR_AXIS, Quantity.STAR_MASS].every((q) => !catalog.isLimit(index, q))
  ) {
    const check = keplerCheck(period, a, starMass);
    lines.push(
      fill(card.keplerPatternStringProperty.value, {
        pSquared: formatValue(check.periodSquared, 3),
        aCubed: formatValue(check.aCubedOverMass, 3),
        percent: formatPercent(Math.abs(check.fractionalDifference)),
      }),
    );
  }
  const e = value(Quantity.ECCENTRICITY);
  if (
    Number.isFinite(a) &&
    Number.isFinite(e) &&
    !catalog.isLimit(index, Quantity.SEMI_MAJOR_AXIS) &&
    !catalog.isLimit(index, Quantity.ECCENTRICITY)
  ) {
    const { closest, farthest } = orbitExtremes(a, e);
    lines.push(
      fill(card.extremesPatternStringProperty.value, {
        closest: formatValue(closest, 3),
        farthest: formatValue(farthest, 3),
      }),
    );
  }
  const starRadius = value(Quantity.STAR_RADIUS);
  const starTemperature = value(Quantity.STAR_TEMPERATURE);
  if (
    Number.isFinite(starRadius) &&
    Number.isFinite(starTemperature) &&
    !catalog.isLimit(index, Quantity.STAR_RADIUS) &&
    !catalog.isLimit(index, Quantity.STAR_TEMPERATURE)
  ) {
    lines.push(
      fill(card.luminosityPatternStringProperty.value, {
        luminosity: formatValue(luminosityFromRadiusAndTemperature(starRadius, starTemperature), 3),
      }),
    );
  }
  const mass = value(Quantity.MASS);
  const radius = value(Quantity.RADIUS);
  const density = densityConstraint(
    mass,
    radius,
    catalog.limit(index, Quantity.MASS),
    catalog.limit(index, Quantity.RADIUS),
    catalog.isMinimumMass(index),
  );
  if (density) {
    const estimated = catalog.isCalculated(index, Quantity.MASS) || catalog.isCalculated(index, Quantity.RADIUS);
    const prefix = density.limit === 1 ? "≤" : density.limit === -1 ? "≥" : estimated ? "≈" : "";
    lines.push(
      fill(card.densityPatternStringProperty.value, {
        density: `${prefix}${formatValue(density.value, 2)}`,
      }),
    );
  }
  return lines;
}

/** Warnings about estimated and minimum values. */
function noteLines(catalog: ExoplanetCatalog, index: number): string[] {
  const card = StringManager.getInstance().getExploreStrings().card;
  const notes: string[] = [];
  if (Quantity.enumeration.values.some((q) => catalog.isLimit(index, q))) {
    notes.push(card.noteLimitsStringProperty.value);
  }
  if (catalog.isCalculated(index, Quantity.MASS)) {
    notes.push(card.noteMassEstimatedStringProperty.value);
  } else if (catalog.isMinimumMass(index)) {
    notes.push(card.noteMassMinimumStringProperty.value);
  }
  if (catalog.isCalculated(index, Quantity.RADIUS)) {
    notes.push(card.noteRadiusEstimatedStringProperty.value);
  }
  return notes;
}

export class PlanetCardNode extends ExoplanetsDatabasePanel {
  public constructor(database: ExoplanetDatabase, height: number) {
    const content = new VBox({ align: "left", spacing: 6 });
    // Fixed size, content pinned to the top left, so the card doesn't jump as planets change.
    super(
      new AlignBox(content, {
        alignBounds: new Bounds2(0, 0, CONTENT_WIDTH, height - 20),
        xAlign: "left",
        yAlign: "top",
      }),
    );

    const strings = StringManager.getInstance();
    const card = strings.getExploreStrings().card;
    const common = strings.getCommonStrings();

    const secondary = { font: FONTS.SMALL, fill: ExoplanetsDatabaseColors.secondaryTextColorProperty };
    const heading = (text: string): Text =>
      new Text(text, {
        font: FONTS.HEADING,
        fill: ExoplanetsDatabaseColors.accentColorProperty,
        maxWidth: CONTENT_WIDTH,
      });
    const paragraph = (text: string, options = secondary): RichText =>
      new RichText(text, { ...options, lineWrap: CONTENT_WIDTH, maxWidth: CONTENT_WIDTH });

    const rebuild = (): void => {
      for (const child of content.children) {
        child.dispose();
      }
      const index = database.selectedPlanetProperty.value;
      if (index === null) {
        content.children = [
          paragraph(card.emptyStringProperty.value, {
            font: FONTS.LABEL,
            fill: ExoplanetsDatabaseColors.secondaryTextColorProperty,
          }),
        ];
        return;
      }
      const catalog = database.catalog;
      const value = (q: Quantity): number => catalog.value(index, q);
      const format = (q: Quantity, v = value(q)): string =>
        q.isInteger ? formatInteger(v) : formatValue(v, q.significantFigures);

      // A label | value unit | Earth or Sun reference grid for some quantities.
      const grid = (quantities: Quantity[], referenceOf: (q: Quantity) => string, referenceName: string): GridBox => {
        const header: Node[] = [
          new Text("", secondary),
          new Text("", secondary),
          new Text(referenceName, {
            font: FONTS.SMALL,
            fill: ExoplanetsDatabaseColors.accentColorProperty,
            maxWidth: REFERENCE_WIDTH,
          }),
        ];
        const rows: Node[][] = quantities.map((q) => {
          const v = value(q);
          const estimated = catalog.isCalculated(index, q);
          const unit = quantityUnit(q).value;
          const text = Number.isNaN(v)
            ? common.noValueStringProperty.value
            : `${catalog.valuePrefix(index, q)}${format(q)}${unit === "" ? "" : ` ${unit}`}`;
          return [
            new Text(quantityName(q).value, { ...secondary, maxWidth: LABEL_WIDTH }),
            new RichText(text, {
              font: FONTS.LABEL,
              fill: estimated
                ? ExoplanetsDatabaseColors.estimatedTextColorProperty
                : ExoplanetsDatabaseColors.textColorProperty,
              maxWidth: VALUE_WIDTH,
            }),
            new Text(referenceOf(q), { ...secondary, maxWidth: REFERENCE_WIDTH }),
          ];
        });
        return new GridBox({ rows: [header, ...rows], xSpacing: 6, ySpacing: 2, xAlign: "left" });
      };
      const earthReference = (q: Quantity): string => {
        const v = EARTH.values.get(q);
        return v === undefined ? "" : formatValue(v, 4);
      };
      const sunReference = (q: Quantity): string => (q === Quantity.PLANET_COUNT ? "8" : earthReference(q));

      const method = catalog.methods[index] as DiscoveryMethod;
      const facilityGroup = catalog.facilityGroups[index] as FacilityGroup;
      const facility =
        facilityGroup === FacilityGroup.GROUND || facilityGroup === FacilityGroup.OTHER_SPACE
          ? (catalog.facilities[index] ?? "")
          : facilityName(facilityGroup).value;
      const children: Node[] = [
        new Text(catalog.names[index] ?? "", {
          font: FONTS.TITLE,
          fill: ExoplanetsDatabaseColors.textColorProperty,
          maxWidth: CONTENT_WIDTH,
        }),
        paragraph(
          [
            fill(card.orbitsPatternStringProperty.value, { host: catalog.hosts[index] ?? "" }),
            fill(card.discoveredPatternStringProperty.value, {
              method: methodName(method).value.toLowerCase(),
              year: formatInteger(value(Quantity.DISCOVERY_YEAR)),
            }),
            fill(card.facilityPatternStringProperty.value, { facility }),
          ].join("<br>"),
        ),
        heading(card.planetHeadingStringProperty.value),
        grid(PLANET_ROWS, earthReference, card.earthReferenceStringProperty.value),
        heading(card.orbitHeadingStringProperty.value),
        grid(ORBIT_ROWS, earthReference, card.earthReferenceStringProperty.value),
        heading(card.starHeadingStringProperty.value),
        grid(STAR_ROWS, sunReference, card.sunReferenceStringProperty.value),
      ];
      const distance = value(Quantity.DISTANCE);
      if (Number.isFinite(distance)) {
        children.push(
          paragraph(
            `${quantityName(Quantity.DISTANCE).value}: ${fill(card.distancePatternStringProperty.value, {
              parsecs: formatValue(distance, 4),
              lightYears: formatValue(distance * LIGHT_YEARS_PER_PARSEC, 3),
            })}`,
          ),
        );
      }

      const derived = derivedLines(catalog, index);
      if (derived.length > 0) {
        children.push(
          heading(card.derivedHeadingStringProperty.value),
          paragraph(derived.join("<br>"), { font: FONTS.SMALL, fill: ExoplanetsDatabaseColors.textColorProperty }),
        );
      }
      const notes = noteLines(catalog, index);
      if (notes.length > 0) {
        children.push(
          paragraph(notes.join("<br>"), {
            font: FONTS.SMALL,
            fill: ExoplanetsDatabaseColors.activeFilterColorProperty,
          }),
        );
      }
      content.children = children;
    };

    database.selectedPlanetProperty.link(rebuild);
    localeProperty.lazyLink(rebuild);

    this.disposePlanetCardNode = () => {
      database.selectedPlanetProperty.unlink(rebuild);
      localeProperty.unlink(rebuild);
      for (const child of content.children) {
        child.dispose();
      }
    };
  }

  private readonly disposePlanetCardNode: () => void;

  public override dispose(): void {
    this.disposePlanetCardNode();
    super.dispose();
  }
}
