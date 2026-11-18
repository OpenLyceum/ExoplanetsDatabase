/**
 * Memory-leak regression suite (fleet standard).
 *
 * Every view object that links to the shared database or to strings is listed with a factory.
 * The database lives outside the factories, as it does in the sim, so a listener left on it after
 * dispose() keeps the node alive and fails the test. (The Explore table and the screen views live
 * for the whole sim and are not disposable.)
 */

import { describe, it } from "vitest";
import { DiscoveryMethod } from "../src/common/model/DiscoveryMethod.js";
import { ExoplanetDatabase } from "../src/common/model/ExoplanetDatabase.js";
import { EMPTY_POINTS } from "../src/common/model/plotPoints.js";
import { DataCreditNode } from "../src/common/view/DataCreditNode.js";
import { FilterSummaryNode } from "../src/common/view/FilterSummaryNode.js";
import { LegendNode } from "../src/common/view/LegendNode.js";
import { MatchCountNode } from "../src/common/view/MatchCountNode.js";
import { MethodCheckboxGroup } from "../src/common/view/MethodCheckboxGroup.js";
import { STAR_MASS_COLORING } from "../src/common/view/pointColorings.js";
import ExoplanetsDatabaseColors from "../src/ExoplanetsDatabaseColors.js";
import { PlanetCardNode } from "../src/explore/view/PlanetCardNode.js";
import { StringManager } from "../src/i18n/StringManager.js";
import { describeDisposalLeaks, expectNoListenerGrowth } from "./helpers/memoryLeak.js";

const database = new ExoplanetDatabase();
database.selectedPlanetProperty.value = 0;

describeDisposalLeaks([
  { name: "MatchCountNode", create: () => new MatchCountNode(database) },
  { name: "DataCreditNode", create: () => new DataCreditNode() },
  { name: "MethodCheckboxGroup", create: () => new MethodCheckboxGroup(database.filter, 150) },
  { name: "FilterSummaryNode", create: () => new FilterSummaryNode(database.filter, 500) },
  { name: "PlanetCardNode", create: () => new PlanetCardNode(database, 500) },
]);

describe("Rebuilt rows release their localized text", () => {
  it("LegendNode.setEntries disposes the previous rows' label and count Text", async () => {
    const legend = new LegendNode();
    legend.setEntries(STAR_MASS_COLORING.legend, EMPTY_POINTS);
    await expectNoListenerGrowth(
      [
        ...STAR_MASS_COLORING.legend.map((entry) => entry.label),
        ExoplanetsDatabaseColors.textColorProperty,
        ExoplanetsDatabaseColors.secondaryTextColorProperty,
      ],
      () => legend.setEntries(STAR_MASS_COLORING.legend, EMPTY_POINTS),
      { label: "replotting must not pile up legend text subscribers" },
    );
  });

  it("FilterSummaryNode disposes its grid text on rebuild and dispose", async () => {
    const strings = StringManager.getInstance().getExploreStrings();
    const methodVisible = database.filter.methodVisibleProperty(
      DiscoveryMethod.enumeration.values[0] as DiscoveryMethod,
    );
    await expectNoListenerGrowth(
      [
        strings.summary.titleStringProperty,
        ExoplanetsDatabaseColors.accentColorProperty,
        ExoplanetsDatabaseColors.textColorProperty,
        ExoplanetsDatabaseColors.secondaryTextColorProperty,
      ],
      () => {
        const node = new FilterSummaryNode(database.filter, 500);
        methodVisible.value = !methodVisible.value;
        methodVisible.value = !methodVisible.value;
        node.dispose();
      },
      { label: "filter changes must not pile up summary text subscribers" },
    );
  });
});
