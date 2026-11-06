# Implementation Notes — Exoplanets Database

## Architecture

```
main.ts
  ├─ ExoplanetDatabase (shared: filter, sort, selection)
  ├─ CountsScreen       CountsModel (catalog, since-year)          → CountsScreenView
  ├─ ExploreScreen      ExploreModel (database, visible columns)    → ExploreScreenView
  ├─ PlotGalleryScreen  PlotGalleryModel (preset, Solar System)     → PlotGalleryScreenView
  └─ PlotBuilderScreen  PlotBuilderModel (database, axes, colouring, showInTable) → PlotBuilderScreenView

src/common/model/  ExoplanetCatalog (CATALOG), Quantity, DiscoveryMethod, FacilityGroup, TableColumn,
                   RangeCriterion, PlanetFilter, FilterPreset, sortPlanets, ExoplanetDatabase,
                   physics, SolarSystem, plotPoints
src/common/view/   PlotFrameNode, PointCloudNode, ScatterChartNode, StackedBarChartNode, LegendNode,
                   pointColorings, guides, MarkerShape, dataStyles, format, FilterDialog,
                   FilterSummaryNode, MethodCheckboxGroup, MatchCountNode, DataCreditNode
```

Nothing evolves in time; every model's `step` is empty.

## Decisions

- **Bundled snapshot, not live queries.** The archive's TAP endpoint returns no
  `Access-Control-Allow-Origin` header (checked 2026-11-05; the preflight returns 502), so a page on
  GitHub Pages cannot read it, and a public CORS proxy would be unreliable in class. The user chose
  a frozen snapshot refreshed by hand. The template CSP stays `connect-src 'self' blob:`.
- **Column-oriented JSON** with categories as indices: one array per column keeps the file small
  and fast to decode into `Float64Array`s (NaN for empty cells). The fetch script writes one column
  per line so diffs stay readable; the data folder is excluded from Biome.
- **Virtualised table.** `PlanetTableNode` builds `rowCount` rows once and rewrites their text on
  scroll, sort and filter. Column nodes are cached per `TableColumn` and repositioned when the
  visible columns change, so nothing is created or disposed while browsing. The scroll bar is a
  `VSlider` on a 0–1 fraction (its range never changes as the match count does).
- **Canvas point cloud.** About 6,500 markers are painted per frame in one path per group;
  picking scans the view positions cached during the last paint.
- **Shared filters.** Explore and Plot Builder share one `ExoplanetDatabase` so a filtered table
  and its plot always agree; the Plot Builder's axis ranges come from all planets so the axes do not
  jump while filtering.
- **Gallery mass plots show measured masses only**, and radius plots measured radii only: plotting
  the archive's estimates would draw the archive's own mass–radius formula as a fake trend.
- **Mass vs orbit size is the default plot.** Microlensing and imaging planets rarely have periods
  (12 of 292 microlensing planets), so mass vs period would hide them.
- **Labels avoid each other.** Solar System labels try right, left, below and above their marker;
  guide labels sit on a translucent backdrop above the points; Kepler-line labels follow their lines.

## Testing

- `tests/catalog.test.ts` recomputes the activity's answers from the raw JSON (method counts, Sun-like
  stars, recent transits, Earth-like orbits, `not null`, measured masses, extremes and Kepler's law),
  so the tests keep passing after a refresh.
- `tests/physics.test.ts`, `tests/plotPoints.test.ts` cover the formulas and chart points.
- `tests/memory-leak.test.ts` checks the disposable view nodes against a long-lived shared database.
- `npm run test:fuzz` runs the Playwright pointer and keyboard fuzz.

## Refreshing the data

```bash
npm run fetch-data   # prints a summary to compare with the archive's Exoplanet Counts page
npm test
```

Then commit `src/common/model/data/pscomppars.json`. If the archive renames a column, the script
fails loudly; `Quantity.archiveTitle` holds the interactive table's column titles used in the
archive-syntax panel.
