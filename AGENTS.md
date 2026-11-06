# AGENTS.md — Exoplanets Database

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenLyceum/.github/AGENTS.md](https://github.com/OpenLyceum/.github/blob/main/AGENTS.md).

## Project

A simplified, student-friendly view of the **NASA Exoplanet Archive**'s Planetary Systems Composite
Parameters table (one row per confirmed planet), for introductory astronomy. It supports the
activity *Exploring Exoplanets with the NASA Exoplanet Archive* (Claude doc, 2026-10-27): every one
of its questions can be answered in the sim, and every filter is also shown in the archive's own
filter-box syntax so students can move on to the real archive. Original work, forked from
`SceneryStackTemplate` on 5 Nov 2026; companion to `StellarWobble` and `TransitHunter`. Four screens:

| Screen | Folder | Content |
|---|---|---|
| Counts | `src/counts/` | Headline counts (confirmed, TESS/Kepler candidates, by TESS/Kepler); planets per method since a year; growth of the confirmed count with the June 2019 4,000 mark |
| Explore | `src/explore/` | Virtualised sortable table, per-column filter dialogs (keypad), quick filters, method checkboxes, measured-mass toggle, column chooser, planet card vs Earth/Sun, archive-syntax panel |
| Plot Gallery | `src/gallery/` | Eight preset plots (scatter or stacked bars) with captions, colour key with counts, Solar System overlay |
| Plot Builder | `src/builder/` | Any quantity vs any other, linear/log, four colourings; same filters and selection as Explore |

Data and formulas: [`doc/model.md`](doc/model.md). Architecture and decisions:
[`doc/implementation-notes.md`](doc/implementation-notes.md).

### Things to know first

- **The data are a frozen snapshot.** The archive's TAP service sends no CORS headers, so the sim
  cannot query it from GitHub Pages. `scripts/archive/fetch-archive.ts` (`npm run fetch-data`)
  writes `src/common/model/data/pscomppars.json` (column-oriented, ~740 KB, ~200 KB gzipped). It is
  committed, excluded from Biome, and refreshed only by hand (the user chose stable numbers for a
  term over automatic refreshes).
- **Estimated values are flagged, never hidden.** The snapshot's `calculated` bitmask marks values
  whose archive reference is `refstr=CALCULATED_VALUE` (masses from a mass–radius relation, radii
  from masses, temperatures, insolation). The archive never calculates P or a, so the card's
  Kepler's-law check is genuine. RV masses with `pl_bmassprov = "Msini"` are minimum masses (≥). Numeric `*lim` flags
  preserve upper/lower bounds; the measured-mass toggle and plot coordinates exclude limits.
  `scripts/archive/add-limit-flags.ts` enriches an older frozen snapshot with drift validation.
- **Pure iron** uses the numerical Zeng table in `data/pureIron.json`, interpolated by
  `src/common/model/ironRadius.ts`; do not extrapolate the rocky CMF fit to pure iron.
- **Explore and Plot Builder share one `ExoplanetDatabase`** (filters, sort, selection), built in
  `main.ts`. Reset All on either screen resets it, and so both screens.
- **Filter dialogs are created once per quantity** and live for the sim (`showFilterDialog`), shared
  by both screens; one `KeypadDialog` serves them all.
- **Log axes work in log10 space** (`PlotFrameNode`, `toAxis`); points are built by
  `buildPoints` in chart coordinates.
- **Node >=26** is required. Run `source ~/.nvm/nvm.sh && nvm use 26` before npm or a git commit
  (the pre-commit hook runs npm).

## Key files

| File | Purpose |
|---|---|
| `scripts/archive/fetch-archive.ts` | TAP queries (pscomppars, toi PC, cumulative CANDIDATE), snapshot writer, summary for checking |
| `src/common/model/ExoplanetCatalog.ts` | Decodes the snapshot into typed columns; `CATALOG` singleton; calculated / minimum-mass flags |
| `src/common/model/Quantity.ts` | Numeric columns: archive column name and title, log preference, significant figures |
| `src/common/model/PlanetFilter.ts`, `RangeCriterion.ts` | Filters and their archive syntax (`between`, `>=`, `<=`, `not null`, `!=calculated`) |
| `src/common/model/FilterPreset.ts` | Quick filters matching the activity |
| `src/common/model/sortPlanets.ts` | Natural name order; empty values last in both directions |
| `src/common/model/ExoplanetDatabase.ts` | Shared filter/sort/selection state |
| `src/common/model/physics.ts` | Kepler's third law, orbit extremes, L ∝ R²T⁴, density, Zeng 2016 rocky radius |
| `src/common/model/plotPoints.ts` | Catalog → chart points (log10, measured-only, discovery month) |
| `src/common/view/PlotFrameNode.ts` | Bamboo frame with linear or log axes and minor decade lines |
| `src/common/view/PointCloudNode.ts` | Canvas markers per group, highlight rings, nearest-point picking |
| `src/common/view/ScatterChartNode.ts` | Hover/click/arrow-key picking, tooltip, Solar System labels that avoid each other |
| `src/common/view/StackedBarChartNode.ts` | Stacked bars with hover/keyboard tooltips |
| `src/common/view/FilterDialog.ts` | Per-column filter dialog with keypad entry |
| `src/explore/view/PlanetTableNode.ts` | Virtualised table: fixed rows rewritten on scroll, sort headers, filter buttons |
| `src/gallery/model/GalleryPreset.ts` | The eight presets: axes, ranges, colouring, guides |

## Accessibility

Standard fleet pattern:

- Per-screen a11y strings live under `a11y.<screenKey>` in each locale JSON. Explore and Plot Builder
  summaries are live (match count, selection, plotted quantities).
- Every screen has a wrapper `Node` with `pdomOrder` (Reset All last) and a `*KeyboardHelpContent`.
- Custom keyboard interactions: the table body (arrows, Page Up/Down, Home/End move the selection),
  scatter plots (left/right step through planets from left to right), bar charts (left/right step
  through bars). Each speaks the planet or bar it lands on.
- The match count is announced when the filters change.
- Colour is never the only cue: each discovery method has its own marker shape.

## Compliance carve-outs

- None.

## Commands

```bash
npm run lint && npm run check && npm run build && npm test
```

For screenshots, run the dev server with `npx vite --port <free port>`. Screen models are reachable
from the console as `phet.joist.sim.screens[i].model` (with `?screens=n`, at index 0).
