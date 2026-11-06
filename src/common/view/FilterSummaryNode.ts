/**
 * FilterSummaryNode.ts
 *
 * Lists the filters in force in plain words and, beside each one, what to type in the NASA
 * Exoplanet Archive's own table for the same result (hidden when the preference is off). This is
 * the bridge from the sim back to the real archive.
 */

import { Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { localeProperty } from "scenerystack/joist";
import { GridBox, type Node, RichText, Text, VBox } from "scenerystack/scenery";
import { DiscoveryMethod } from "../../common/model/DiscoveryMethod.js";
import type { PlanetFilter } from "../../common/model/PlanetFilter.js";
import { MASS_REFERENCE_COLUMN } from "../../common/model/PlanetFilter.js";
import type { RangeCriterion } from "../../common/model/RangeCriterion.js";
import ExoplanetsDatabaseColors from "../../ExoplanetsDatabaseColors.js";
import { FONTS } from "../../ExoplanetsDatabaseConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import { exoplanetsDatabasePreferences } from "../../preferences/ExoplanetsDatabasePreferencesModel.js";
import { ExoplanetsDatabasePanel } from "../ExoplanetsDatabasePanel.js";
import { methodName, plainText, quantityName, quantityUnit } from "./dataStyles.js";
import { formatInteger, formatValue } from "./format.js";

/** Most filter lines shown; the rest are summarised as "…". */
const MAX_LINES = 5;

const fill = (pattern: string, values: Record<string, string>): string =>
  pattern.replace(/\{\{(\w+)\}\}/g, (match, key: string) => values[key] ?? match);

type SummaryLine = { readonly readable: string; readonly column: string; readonly text: string };

/** One plain-words line for a range criterion. */
function describeCriterion(criterion: RangeCriterion): SummaryLine {
  const summary = StringManager.getInstance().getExploreStrings().summary;
  const q = criterion.quantity;
  const format = (v: number): string => (q.isInteger ? formatInteger(v) : formatValue(v, 4));
  const min = criterion.minProperty.value;
  const max = criterion.maxProperty.value;
  const values = {
    label: quantityName(q).value,
    min: min === null ? "" : format(Math.min(min, max ?? min)),
    max: max === null ? "" : format(Math.max(max, min ?? max)),
    unit: plainText(quantityUnit(q).value),
  };
  let pattern: TReadOnlyProperty<string> = summary.requireValuePatternStringProperty;
  if (min !== null && max !== null) {
    pattern = summary.rangePatternStringProperty;
  } else if (min !== null) {
    pattern = summary.atLeastPatternStringProperty;
  } else if (max !== null) {
    pattern = summary.atMostPatternStringProperty;
  }
  return { readable: fill(pattern.value, values).trim(), column: q.archiveTitle, text: criterion.archiveSyntax ?? "" };
}

/** Plain-words description and archive text for every filter in force. */
function describeFilters(filter: PlanetFilter): SummaryLine[] {
  const summary = StringManager.getInstance().getExploreStrings().summary;
  const lines: SummaryLine[] = [];
  const shown = DiscoveryMethod.enumeration.values.filter((m) => filter.methodVisibleProperty(m).value);
  if (shown.length < DiscoveryMethod.enumeration.values.length) {
    const methodLine = filter.archiveFilters.find((line) => line.column === "Discovery Method");
    lines.push({
      readable: fill(summary.methodsPatternStringProperty.value, {
        methods: shown.length === 0 ? "—" : shown.map((m) => methodName(m).value).join(", "),
      }),
      column: "Discovery Method",
      text: methodLine?.text ?? "—",
    });
  }
  lines.push(...filter.activeCriteria.map(describeCriterion));
  if (filter.measuredMassOnlyProperty.value) {
    lines.push({
      readable: summary.measuredMassStringProperty.value,
      column: MASS_REFERENCE_COLUMN,
      text: "!=calculated",
    });
  }
  return lines;
}

export class FilterSummaryNode extends ExoplanetsDatabasePanel {
  public constructor(filter: PlanetFilter, width: number) {
    const content = new VBox({ align: "left", spacing: 4 });
    super(content, { minWidth: width, maxWidth: width, xMargin: 10, yMargin: 6 });

    const strings = StringManager.getInstance().getExploreStrings();
    const summary = strings.summary;
    const innerWidth = width - 20;
    const showArchive = exoplanetsDatabasePreferences.showArchiveSyntaxProperty;

    const rebuild = (): void => {
      for (const child of content.children) {
        child.dispose();
      }
      const archiveColumn = showArchive.value;
      const readableWidth = archiveColumn ? innerWidth * 0.42 : innerWidth;
      const archiveWidth = innerWidth - readableWidth - 12;

      const lines = describeFilters(filter);

      const children: Node[] = [];
      const headings: Node[] = [
        new Text(summary.titleStringProperty, {
          font: FONTS.HEADING,
          fill: ExoplanetsDatabaseColors.accentColorProperty,
          maxWidth: readableWidth,
        }),
      ];
      if (archiveColumn) {
        headings.push(
          new Text(strings.archiveTitleStringProperty, {
            font: FONTS.HEADING,
            fill: ExoplanetsDatabaseColors.accentColorProperty,
            maxWidth: archiveWidth,
          }),
        );
      }
      if (lines.length === 0) {
        children.push(new GridBox({ rows: [headings], xSpacing: 12, xAlign: "left" }));
        children.push(
          new Text(archiveColumn ? strings.archiveNoFiltersStringProperty : summary.noneStringProperty, {
            font: FONTS.SMALL,
            fill: ExoplanetsDatabaseColors.secondaryTextColorProperty,
            maxWidth: innerWidth,
          }),
        );
      } else {
        const rows: Node[][] = [headings];
        for (const line of lines.slice(0, MAX_LINES)) {
          const row: Node[] = [
            new Text(line.readable, {
              font: FONTS.SMALL,
              fill: ExoplanetsDatabaseColors.textColorProperty,
              maxWidth: readableWidth,
            }),
          ];
          if (archiveColumn) {
            row.push(
              new RichText(`${line.column}: <b>${line.text}</b>`, {
                font: FONTS.CODE,
                fill: ExoplanetsDatabaseColors.codeTextColorProperty,
                maxWidth: archiveWidth,
              }),
            );
          }
          rows.push(row);
        }
        if (lines.length > MAX_LINES) {
          rows.push([new Text("…", { font: FONTS.SMALL, fill: ExoplanetsDatabaseColors.secondaryTextColorProperty })]);
        }
        children.push(new GridBox({ rows, xSpacing: 12, ySpacing: 3, xAlign: "left" }));
      }
      content.children = children;
    };

    filter.changedEmitter.addListener(rebuild);
    const multilink = Multilink.lazyMultilink([showArchive, localeProperty], rebuild);
    rebuild();

    this.disposeFilterSummaryNode = () => {
      filter.changedEmitter.removeListener(rebuild);
      multilink.dispose();
      for (const child of content.children) {
        child.dispose();
      }
    };
  }

  private readonly disposeFilterSummaryNode: () => void;

  public override dispose(): void {
    this.disposeFilterSummaryNode();
    super.dispose();
  }
}
