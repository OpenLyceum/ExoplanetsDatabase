# Model — Exoplanets Database

## Data

The sim bundles a snapshot of the NASA Exoplanet Archive's **Planetary Systems Composite
Parameters** table (`pscomppars`): one row per confirmed planet, with planet, orbit and host-star
values combined from the best available references. `scripts/archive/fetch-archive.ts` queries it
through the archive's TAP service, together with two candidate counts:

| Count | Query |
|---|---|
| Confirmed planets | rows of `pscomppars` |
| TESS candidates not yet confirmed | `toi` with `tfopwg_disp = 'PC'` |
| Kepler candidates not yet confirmed | `cumulative` with `koi_disposition = 'CANDIDATE'` |

These match the archive's Exoplanet Counts page (within the week's new discoveries).

Columns kept (archive units): `pl_orbper` (days), `pl_orbsmax` (au), `pl_orbeccen`, `pl_rade` (R⊕),
`pl_bmasse` (M⊕, mass or M sin i), `pl_bmassprov`, `pl_eqt` (K), `pl_insol` (Earth flux), `st_teff`
(K), `st_rad` (R☉), `st_mass` (M☉), `sy_dist` (pc), `sy_pnum`, `disc_year`, `disc_pubdate`
(stored as a decimal year at mid-month), `discoverymethod`, `disc_facility`, `pl_name`, `hostname`.
Numbers keep 4–6 significant figures. The corresponding `*lim` columns are retained for
planet/orbit and stellar parameters: +1 means upper bound, −1 lower bound, 0 central value.

**Estimated values.** Where no paper gives a value, the archive calculates one and its reference
reads "Calculated Value" (`refstr=CALCULATED_VALUE`). The snapshot keeps a bitmask per planet for
`pl_orbper, pl_orbsmax, pl_rade, pl_bmasse, pl_eqt, pl_insol, st_teff, st_rad, st_mass`. In the
November 2026 snapshot about 3,000 masses, 1,500 radii, 1,100 temperatures and 1,300 insolations
are calculated; periods, semi-major axes and stellar values never are. Masses with provenance
`Msini` are minimum masses from radial velocity alone. Bounds on M sin i are labelled
explicitly; an upper bound on M sin i does not bound the true mass from above.
The measured-mass toggle excludes estimated values and upper/lower limits. Plots exclude
limits on either axis rather than drawing a bound as a point. Cards propagate valid density
bounds and omit derived calculations when the inputs do not define a unique value or bound.

## Groupings

- **Discovery method:** Transit, Radial Velocity, Microlensing, Imaging, and Other (transit and
  eclipse timing variations, orbital brightness modulation, pulsar and pulsation timing,
  astrometry, disk kinematics).
- **Facility:** Kepler, K2, TESS, other space telescopes (CoRoT, CHEOPS, Gaia, Hubble, JWST,
  Spitzer, WISE), ground-based.
- **Star mass** (Kepler's-law plot): below 0.6 M☉, 0.6–1.4 M☉, above 1.4 M☉.

## Filters

A range criterion per quantity: an optional minimum and maximum (inclusive) and "hide planets with
no value". A bound implies a value is required, as in the archive. Archive syntax:

| Sim | Archive filter box |
|---|---|
| min and max | `between min and max` |
| min only | `>=min` |
| max only | `<=max` |
| value required | `not null` |
| one method | `'Transit'` (quotes for an exact match) |
| measured masses only | `!=calculated` in *Planet Mass or Mass\*sin(i) Reference*, plus `pl_bmasselim = 0` in TAP |

The keypad and matching logic normalize reversed bounds to the same ordered interval.

Quick filters: Sun-like stars (M★ 0.95–1.05), found since 2024, orbit and star known (a, P, M★ not
null), Earth-like orbits (a 0.72–1.5 au and M★ 0.9–1.1).

## Formulas (planet card and plots)

- **Kepler's third law** in Solar System units: P² = a³/M★ (P in years = days / 365.25, a in au, M★
  in M☉; the planet's own mass is neglected). The card shows both sides and their difference.
  About 82 % of planets with all three values agree to 10 %. Large differences usually mean an
  unusual system: Kepler-47 c orbits a binary star whose combined mass is not the listed M★.
- **Closest and farthest distance:** a(1 − e), a(1 + e).
- **Luminosity:** L/L☉ = (R/R☉)² (T/5772 K)⁴.
- **Density:** ρ = 5.51 g/cm³ × M/R³ (Earth units).
- **Composition curves:** rocky radius R = (1.07 − 0.21 CMF) M^(1/3.7) (Zeng, Sasselov & Jacobsen
  2016) for Earth-like rock (CMF = 0.325); the fit is calibrated for CMF 0–0.4 and 1–8 M⊕.
  The displayed rock guide extends approximately to 30 M⊕. Pure iron instead uses log-log
  interpolation of [Zeng's numerical table](https://lweb.cfa.harvard.edu/~lzeng/tables/massradiusFe.txt)
  (`data/pureIron.json`), within its published mass range. Water is a uniform 1 g/cm³ guide,
  not a compressed water-planet model.
- **Kepler lines:** P = 365.25 √(a³/M★) days for M★ = 0.1, 1, 10 M☉.

## Simplifications

- Composite parameters mix references, so a planet's values may not be mutually consistent.
- Uncertainties are not shown.
- The Solar System reference values are the NASA Planetary Fact Sheet's; planet temperatures are
  its black-body temperatures.

## Preserving the frozen snapshot when adding limit flags

`fetch-archive.ts` now requests and writes limit flags on future refreshes. To repair an older
snapshot without changing its values or counts, query the ten parameter/limit pairs listed in
`scripts/archive/add-limit-flags.ts` from NASA TAP, save the JSON, and run:

```bash
node scripts/archive/add-limit-flags.ts /path/to/archive-limit-rows.json
```

The updater verifies every parameter against the frozen, rounded value and refuses source drift
or missing metadata before writing. The 2026-11-06 enrichment matched all 6,464 planets and all
ten retained parameters. It adds 225 upper and 13 lower mass limits; there are 3,163 measured
masses, 3,032 estimated masses, and 238 mass bounds among 6,433 listed masses.
