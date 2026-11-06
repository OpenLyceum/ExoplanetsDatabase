# Exoplanets Database

[![CI](../../actions/workflows/ci.yml/badge.svg)](../../actions/workflows/ci.yml)

A friendly front end to the [NASA Exoplanet Archive](https://exoplanetarchive.ipac.caltech.edu/).
Students filter and sort the 6,000+ confirmed exoplanets in a simplified table, compare any planet
with Earth and the Sun, and explore ready-made plots that show how discovery methods shape what we
find. Every filter is also written the way the archive's own table expects it, so students can move
on to the real archive. It supports the activity *Exploring Exoplanets with the NASA Exoplanet
Archive* (introductory astronomy) and pairs with [Stellar Wobble](https://github.com/OpenLyceum/StellarWobble)
and [Transit Hunter](https://github.com/OpenLyceum/TransitHunter). Built with
[SceneryStack](https://scenerystack.org/); runs offline as a Progressive Web App.

## Features

- **Counts.** The archive's headline numbers: confirmed planets, TESS and Kepler candidates still
  waiting for confirmation, and planets found by TESS and by Kepler. Planets per discovery method
  with percentages, optionally only those discovered since a chosen year, and the growth of the
  confirmed count with the 4,000-planet mark of June 2019.
- **Explore.** A table with plain-language columns (period, orbit size, radius, mass, temperatures,
  star properties, distance, …). Press a header to sort, or its funnel to filter: type "at least" and
  "at most" values on a keypad, or hide planets with no value. Quick filters match the activity's
  steps (Sun-like stars, found since 2024, orbit and star known, Earth-like orbits), plus discovery
  method checkboxes and "measured masses only". A live count shows how many planets match, and a
  panel spells out the same filters in the archive's syntax (`between 0.95 and 1.05`, `'Transit'`,
  `not null`, `!=calculated`). The selected planet's card compares it with Earth and the Sun and works
  out Kepler's third law, its closest and farthest distances, the star's luminosity from R²T⁴ and the
  planet's density. Values the archive estimated are marked ≈; radial-velocity minimum masses ≥.
- **Plot Gallery.** Eight preset plots with "what to notice" captions, coloured by discovery method
  with a marker shape per method: mass vs orbit size, mass vs period, discoveries per year, radius vs
  period, mass vs radius (with iron, rock and water curves), Kepler's third law (coloured by star
  mass, with lines for 0.1, 1 and 10 solar masses), a distance histogram, and planet size over time
  (coloured by telescope). Solar System planets can be shown for comparison. Hover, click or use the
  arrow keys to read any planet.
- **Plot Builder.** Any quantity against any other, on linear or log axes, coloured by method,
  telescope, discovery year or star mass, for the planets that pass the Explore filters. Selecting a
  point selects the planet in the table; "Show in Table" jumps there.
- **Real data, offline.** A snapshot of the archive's Planetary Systems Composite Parameters table
  is bundled (the archive's API cannot be called from a web page). `npm run fetch-data` refreshes it.
- **Accessible:**
  - Every control works from the keyboard, including the table and the plots.
  - Each screen has a live screen summary and a keyboard-help dialog.
  - English, French and Spanish.
  - Default and projector colour profiles; colour-blind-safe palette plus marker shapes.
  - Installable PWA.
  - A preference (or `?archiveSyntax=false`) hides the archive syntax.

## Quick Start

```bash
npm install
npm start        # dev server → http://localhost:5173
```

## Scripts

| Command | Description |
|---|---|
| `npm start` / `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build → `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run Vitest unit tests (includes memory-leak suite) |
| `npm run test:fuzz` | Optional Playwright fuzz smoke: pointer (`?fuzz`) + keyboard (`?fuzzBoard`), with `?ea`, 30s each |
| `npm run test:fuzz -- 90` | Same fuzz for 90 seconds (`--duration 90` or `FUZZ_DURATION=90` also work) |
| `npm run test:fuzz:quick` | Shorter fuzz smoke (10s) |
| `npm run test:fuzz:long` | Longer fuzz smoke (300s) |
| `npm run check` | TypeScript type check |
| `npm run lint` | Biome lint check |
| `npm run format` | Auto-format all files |
| `npm run fix` | Lint + auto-fix |
| `npm run icons` | Regenerate PNG icons from `public/icons/icon.svg` |
| `npm run fetch-data` | Take a new snapshot of the NASA Exoplanet Archive (needs network) |
| `npm run release` | `check && lint && build && test`, then version patch + push tags |
| `npm run clean` | Remove `dist/` |

The snapshot is frozen on purpose so that class answers stay put during a term. To refresh it, run
`npm run fetch-data`, check the summary it prints against the archive's Exoplanet Counts page, run
the tests, and commit `src/common/model/data/pscomppars.json`.

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| [SceneryStack](https://scenerystack.org/) | ^3.0.0 | Simulation framework |
| [Vite](https://vitejs.dev/) | ^8 | Build tool + dev server |
| [TypeScript](https://www.typescriptlang.org/) | ^7 | Type-safe JavaScript |
| [Biome](https://biomejs.dev/) | ^2.6 | Linting + formatting |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | ^2 | PWA + service worker |

## License

GNU Affero General Public License v3.0 — see [OpenLyceum org license](https://github.com/OpenLyceum/.github/blob/main/LICENSE).
Data from the NASA Exoplanet Archive; see [CREDITS.md](CREDITS.md) for the acknowledgement.

## Contributing

See [OpenLyceum contributing guidelines](https://github.com/OpenLyceum/.github/blob/main/CONTRIBUTING.md).
Report bugs via GitHub Issues; use org issue templates.
