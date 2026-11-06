/**
 * Memory-leak regression suite (fleet standard).
 *
 * Every view object that links to the shared database or to strings is listed with a factory.
 * The database lives outside the factories, as it does in the sim, so a listener left on it after
 * dispose() keeps the node alive and fails the test. (The Explore table and the screen views live
 * for the whole sim and are not disposable.)
 */

import { ExoplanetDatabase } from "../src/common/model/ExoplanetDatabase.js";
import { DataCreditNode } from "../src/common/view/DataCreditNode.js";
import { FilterSummaryNode } from "../src/common/view/FilterSummaryNode.js";
import { MatchCountNode } from "../src/common/view/MatchCountNode.js";
import { MethodCheckboxGroup } from "../src/common/view/MethodCheckboxGroup.js";
import { PlanetCardNode } from "../src/explore/view/PlanetCardNode.js";
import { describeDisposalLeaks } from "./helpers/memoryLeak.js";

const database = new ExoplanetDatabase();
database.selectedPlanetProperty.value = 0;

describeDisposalLeaks([
  { name: "MatchCountNode", create: () => new MatchCountNode(database) },
  { name: "DataCreditNode", create: () => new DataCreditNode() },
  { name: "MethodCheckboxGroup", create: () => new MethodCheckboxGroup(database.filter, 150) },
  { name: "FilterSummaryNode", create: () => new FilterSummaryNode(database.filter, 500) },
  { name: "PlanetCardNode", create: () => new PlanetCardNode(database, 500) },
]);
