# Correctness review — 2026-11-06

Reviewed local commit `b13d281`. Scope: snapshot extraction and provenance, filters and
archive equivalents, counts and plotting, Kepler checks, density, and composition guides.
The findings below were corrected in the follow-up on 2026-11-06; see the resolution at the end.

## Findings

### E1 — P1: archive upper limits are presented as measured central values

`scripts/archive/fetch-archive.ts` imports numeric values and calculated-value bits but omits
`pl_bmasselim`, `pl_radelim`, and other limit flags. Consequently,
`src/common/model/ExoplanetCatalog.ts:123` accepts any finite, non-calculated mass as measured.
The measured-mass filter and gallery retain mass limits as normal points; planet cards display
definite masses and derived densities.

Concrete example: the bundled Kepler-62 c row contains mass 4 Earth masses, radius 0.54 Earth
radii, and calculated bits 0. `hasMeasuredMass` returns true, and the card calculates about
140 g/cm³ without an upper-limit indicator. The source paper lists 4 as a maximum mass, along
with the 36/35 Earth-mass maxima used for Kepler-62 e/f. See
[Borucki et al., Table 1](https://faculty.washington.edu/agol/587.full.pdf) and the archive's
[column definitions](https://exoplanetarchive.ipac.caltech.edu/docs/API_PS_columns.html).
The lost information also contaminates HabitabilityLab's derived escape-speed data.

Recommended correction: retain and decode limit flags, display inequalities, propagate them
through derived quantities, and exclude bounds from plots advertised as measured point values.
Rebuild both the snapshot and HabitabilityLab's extracted data.

### E2 — P2: the pure-iron composition guide uses an unsupported extrapolation

`src/common/view/guides.ts:94` calls `rockyRadius(m, 1)` to draw a curve labelled pure iron.
The cited [Zeng et al. 2016 fit](https://arxiv.org/abs/1512.08827) is calibrated for core mass
fractions 0–0.4 and masses 1–8 Earth masses, not CMF=1. The curve extends to 30 Earth masses.
At 28.0181 Earth masses, the code predicts 2.11689 Earth radii while the author's
[pure-iron numerical table](https://lweb.cfa.harvard.edu/~lzeng/tables/massradiusFe.txt) gives
1.7747: a 19.3% radius error. TransitHunter duplicates this issue.

Recommended correction: use a numerical pure-iron relation with a documented valid range;
do not present the CMF=1 extrapolation as the cited composition model.

### E3 — P2: reversed range bounds disagree with the displayed archive filter

`src/common/model/RangeCriterion.ts:38–46` evaluates bounds in input order but sorts them
when generating archive syntax. The dialog permits each bound to be entered independently.
For `setRange(10, 5)`, the UI promises `between 5 and 10` while `accepts(7)` is false and
the simulation returns no matching finite values. Copying the displayed syntax into the
archive therefore asks a different question.

Recommended correction: normalize bounds consistently or reject/report an inverted interval
and preserve that meaning in the archive equivalent. The probe below chooses normalization;
explicit validation is another valid correction.

## Validation

- Node `v26.13.0`; lint, all type checks, production build, and 39 existing tests passed.
- Pointer and keyboard fuzz, 10 seconds each with assertions, passed.
- All four production screens initialized and Reset All worked at desktop and phone sizes,
  with assertions and randomized listener order; no browser errors observed.
- Local compliance passed with warnings; remote security settings were not checked (`gh`
  unavailable). Template drift: declared Vitest `^5.1.0` versus template `^5.0.5`.
- Three independent review probes failed. Temporary tests were removed after copying their
  source below. NASA TAP queries timed out; the limit finding uses the bundled values and
  the original paper, not an assumed current API response.

Snapshot provenance was also compared with the archive's
[calculated-values documentation](https://exoplanetarchive.ipac.caltech.edu/docs/pscp_calc.html).
Minimum RV masses and calculated mass/radius flags are distinguished correctly within the
information the snapshot retains. This review does not establish full usability or accessibility.

## Historical reproduction probes

The following code records the original probes against the reviewed commit, before correction.
Some APIs have since changed; use the permanent regression tests named below for the corrected code.
The original command was
`npm test -- tests/review-probes.test.ts`. All three assertions fail on the reviewed commit.

```typescript
import { expect, it } from "vitest";
import { RangeCriterion } from "../src/common/model/RangeCriterion.js";
import { Quantity } from "../src/common/model/Quantity.js";
import { CATALOG } from "../src/common/model/ExoplanetCatalog.js";
import { rockyRadius } from "../src/common/model/physics.js";

it("review: reversed bounds match the interval shown in archive syntax", () => {
  const criterion = new RangeCriterion(Quantity.MASS);
  criterion.setRange(10, 5);
  console.log("FILTER", { syntax: criterion.archiveSyntax, accepts7: criterion.accepts(7) });
  expect(criterion.accepts(7)).toBe(true);
});

it("review: the published Kepler-62 c upper limit is not a measured mass", () => {
  const index = CATALOG.indexOf("Kepler-62 c");
  console.log("LIMIT_MASS", { mass: CATALOG.value(index, Quantity.MASS), measured: CATALOG.hasMeasuredMass(index), density: 5.51 * CATALOG.value(index, Quantity.MASS) / CATALOG.value(index, Quantity.RADIUS) ** 3 });
  expect(CATALOG.hasMeasuredMass(index)).toBe(false);
});

it("review: pure-iron guide agrees within 5 percent with the author's numerical table", () => {
  const expected = 1.7747;
  const actual = rockyRadius(28.0181, 1);
  console.log("IRON", { actual, expected, relativeError: actual / expected - 1 });
  expect(Math.abs(actual / expected - 1)).toBeLessThan(0.05);
});
```

## Resolution — 2026-11-06

E1–E3 are corrected. Every planet's ten parameter values matched a supplemental NASA query
before its limit flags were restored; existing values and headline counts are unchanged.
The importer retains these flags on future refreshes. Cards and tables show bounds, density
constraints propagate only when mathematically valid, measured-only samples exclude limits,
and scatter plots omit bounded coordinates. The pure-iron guide now interpolates the author's
numerical table. Range bounds normalize consistently, including direct keypad edits.

Permanent regressions are in `tests/catalog.test.ts`, `tests/plotPoints.test.ts`,
`tests/physics.test.ts`, and `tests/ironRadius.test.ts`. Snapshot enrichment is repeatable and
refuses source drift. Handouts distinguish 3,163 measured masses, 3,032 estimates and 238 bounds;
the instructor key and Word files were updated. Lint, all type checks, 44 tests and build passed.
