/**
 * main.ts
 *
 * Entry point for the simulation. Initializes SceneryStack, creates the
 * screens, and starts the main event loop.
 *
 * !! CRITICAL IMPORT ORDER !!
 * brand.js MUST be the first import. Each module imports the next, so the import nesting is
 *
 *   main → brand → splash → assert → init
 *
 * and therefore the actual EXECUTION order (deepest import runs first) is the reverse:
 *
 *   init → assert → splash → brand → main
 *
 * SceneryStack requires this exact load order. Never reorder these imports.
 */

// brand.js MUST be first; importing it runs the whole chain (init→assert→splash→brand) before main.
import "./brand.js";

import { onReadyToLaunch, PreferencesModel, Sim } from "scenerystack/sim";
import { Tandem } from "scenerystack/tandem";
import { PlotBuilderScreen } from "./builder/PlotBuilderScreen.js";
import { CountsScreen } from "./counts/CountsScreen.js";
import ExoplanetsDatabaseColors from "./ExoplanetsDatabaseColors.js";
import { ExploreScreen } from "./explore/ExploreScreen.js";
import { PlotGalleryScreen } from "./gallery/PlotGalleryScreen.js";
import { StringManager } from "./i18n/StringManager.js";
import { ExoplanetsDatabasePreferencesModel } from "./preferences/ExoplanetsDatabasePreferencesModel.js";
import { ExoplanetsDatabasePreferencesNode } from "./preferences/ExoplanetsDatabasePreferencesNode.js";

onReadyToLaunch(() => {
  const stringManager = StringManager.getInstance();

  // Simulation-specific preferences; initial values come from exoplanetsDatabaseQueryParameters.
  const simPreferences = new ExoplanetsDatabasePreferencesModel(Tandem.ROOT.createTandem("preferences"));

  const screens = [
    new CountsScreen({
      name: stringManager.getScreenNames().countsStringProperty,
      tandem: Tandem.ROOT.createTandem("countsScreen"),
      backgroundColorProperty: ExoplanetsDatabaseColors.backgroundColorProperty,
    }),
    new ExploreScreen({
      name: stringManager.getScreenNames().exploreStringProperty,
      tandem: Tandem.ROOT.createTandem("exploreScreen"),
      backgroundColorProperty: ExoplanetsDatabaseColors.backgroundColorProperty,
    }),
    new PlotGalleryScreen({
      name: stringManager.getScreenNames().galleryStringProperty,
      tandem: Tandem.ROOT.createTandem("galleryScreen"),
      backgroundColorProperty: ExoplanetsDatabaseColors.backgroundColorProperty,
    }),
    new PlotBuilderScreen({
      name: stringManager.getScreenNames().builderStringProperty,
      tandem: Tandem.ROOT.createTandem("builderScreen"),
      backgroundColorProperty: ExoplanetsDatabaseColors.backgroundColorProperty,
    }),
  ];

  const sim = new Sim(stringManager.getTitleStringProperty(), screens, {
    preferencesModel: new PreferencesModel({
      visualOptions: {
        // Adds a "Projector Mode" toggle in Preferences → Visual
        supportsProjectorMode: true,
        // Enables keyboard-navigation highlight outlines
        supportsInteractiveHighlights: true,
      },
      simulationOptions: {
        customPreferences: [
          {
            createContent: (tandem: Tandem) => new ExoplanetsDatabasePreferencesNode(simPreferences, tandem),
          },
        ],
      },
      localizationOptions: {
        // Adds a language picker in Preferences → Language
        supportsDynamicLocale: true,
      },
    }),

    // Optional: fill in credits shown in Help → About
    credits: {
      leadDesign: "",
      softwareDevelopment: "",
      team: "",
      qualityAssurance: "",
    },
  });

  sim.start();
});
