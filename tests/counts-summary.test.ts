import { localeProperty } from "scenerystack/joist";
import { expect, it, vi } from "vitest";
import { CountsModel } from "../src/counts/model/CountsModel.js";
import { CountsScreenSummaryContent } from "../src/counts/view/CountsScreenSummaryContent.js";

it("updates the Counts summary when the year, locale, and reset change", () => {
  // The shared harness initializes English only; allow this test to exercise the bundled translations.
  vi.spyOn(window.phet["chipper"], "checkAndRemapLocale").mockImplementation((locale) => locale);
  const model = new CountsModel();
  const summary = new CountsScreenSummaryContent(model);
  const initial = summary.getVoicingDetailsString();
  try {
    expect(initial).toContain("confirmed planets");
    model.sinceYearProperty.value = model.yearRange.max;
    expect(summary.getVoicingDetailsString()).not.toBe(initial);
    expect(summary.getVoicingDetailsString()).toContain(String(model.yearRange.max));
    localeProperty.value = "fr";
    expect(summary.getVoicingDetailsString()).toContain("planètes confirmées");
    localeProperty.value = "es";
    expect(summary.getVoicingDetailsString()).toContain("planetas confirmados");
    localeProperty.value = "en";
    model.reset();
    expect(summary.getVoicingDetailsString()).toBe(initial);
  } finally {
    localeProperty.value = "en";
    summary.dispose();
  }
});
