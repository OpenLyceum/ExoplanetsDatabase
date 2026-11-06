# Credits — Exoplanets Database

A simplified view of the NASA Exoplanet Archive for introductory astronomy, written for the
[OpenLyceum](https://github.com/OpenLyceum) fleet with [SceneryStack](https://scenerystack.org/).

## License

GNU Affero General Public License v3.0 or later — see [org LICENSE](https://github.com/OpenLyceum/.github/blob/main/LICENSE).

## Data

- **Planets.** This research has made use of the NASA Exoplanet Archive, which is operated by the
  California Institute of Technology, under contract with the National Aeronautics and Space
  Administration under the Exoplanet Exploration Program. The sim bundles a snapshot of the
  Planetary Systems Composite Parameters table (`pscomppars`), queried through the archive's TAP
  service; the retrieval date is in `src/common/model/data/pscomppars.json` and on every screen.
- **Candidates.** TESS Objects of Interest with disposition PC (`toi`) and Kepler Objects of
  Interest with disposition CANDIDATE (`cumulative`), from the same archive.
- **Composite parameters** combine values from several papers per planet; see
  [About PSCompPars](https://exoplanetarchive.ipac.caltech.edu/docs/pscp_about.html). Values the
  archive calculated rather than took from a paper are flagged and shown as estimates.
- **Solar System values.** NASA Planetary Fact Sheet.
- **Mass–radius curves.** Zeng, L., Sasselov, D. D. & Jacobsen, S. B. (2016), *Mass–Radius Relation
  for Rocky Planets Based on PREM*, ApJ 819, 127.
- **4,000 planets in June 2019.** IPAC news release, "Exoplanet count hits 4,000".

## Acknowledgments

Companion to [Stellar Wobble](https://github.com/OpenLyceum/StellarWobble) and
[Transit Hunter](https://github.com/OpenLyceum/TransitHunter), whose point-cloud, chart-frame and
mass–radius code it adapts.
