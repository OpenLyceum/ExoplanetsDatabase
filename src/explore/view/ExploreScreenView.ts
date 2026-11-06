/**
 * ExploreScreenView.ts
 *
 * The Explore screen: quick filters and method checkboxes on the left, the simplified table in
 * the middle with the match count above it and the filters (and their archive syntax) below,
 * and the selected planet's card on the right.
 */

import { DerivedProperty } from "scenerystack/axon";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { Node, Text, VBox } from "scenerystack/scenery";
import { ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { RectangularPushButton } from "scenerystack/sun";
import {
  FLAT_PANEL_PUSH_BUTTON_OPTIONS,
  FLAT_RESET_ALL_BUTTON_OPTIONS,
  LIGHT_SURFACE_TEXT_FILL,
} from "../../common/ExoplanetsDatabaseButtonOptions.js";
import { ExoplanetsDatabasePanel } from "../../common/ExoplanetsDatabasePanel.js";
import { FilterPreset } from "../../common/model/FilterPreset.js";
import { DataCreditNode } from "../../common/view/DataCreditNode.js";
import { FilterSummaryNode } from "../../common/view/FilterSummaryNode.js";
import { MatchCountNode } from "../../common/view/MatchCountNode.js";
import { MethodCheckboxGroup } from "../../common/view/MethodCheckboxGroup.js";
import ExoplanetsDatabaseColors from "../../ExoplanetsDatabaseColors.js";
import { FONTS, SCREEN_VIEW_MARGIN } from "../../ExoplanetsDatabaseConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { ExploreModel } from "../model/ExploreModel.js";
import { ColumnsDialog } from "./ColumnsDialog.js";
import { ExploreScreenSummaryContent } from "./ExploreScreenSummaryContent.js";
import { PlanetCardNode } from "./PlanetCardNode.js";
import { PlanetTableNode } from "./PlanetTableNode.js";

export type ExploreScreenViewOptions = ScreenViewOptions;

const MARGIN = 10;
const SIDEBAR_WIDTH = 152;
const TABLE_WIDTH = 566;
const CARD_WIDTH = 268;
const TABLE_ROWS = 17;
const BUTTON_WIDTH = SIDEBAR_WIDTH - 24;

export class ExploreScreenView extends ScreenView {
  private readonly table: PlanetTableNode;

  public constructor(model: ExploreModel, providedOptions?: ExploreScreenViewOptions) {
    const options = optionize<ExploreScreenViewOptions, EmptySelfOptions, ScreenViewOptions>()(
      { screenSummaryContent: new ExploreScreenSummaryContent(model) },
      providedOptions,
    );
    super(options);

    const strings = StringManager.getInstance().getExploreStrings();
    const common = StringManager.getInstance().getCommonStrings();
    const database = model.database;
    const filter = database.filter;
    const bounds = this.layoutBounds;

    const heading = (text: typeof strings.presetsTitleStringProperty): Text =>
      new Text(text, {
        font: FONTS.HEADING,
        fill: ExoplanetsDatabaseColors.accentColorProperty,
        maxWidth: BUTTON_WIDTH,
      });
    const button = (
      label: typeof strings.presetsTitleStringProperty,
      listener: () => void,
      extra: Partial<ConstructorParameters<typeof RectangularPushButton>[0]> = {},
    ): RectangularPushButton =>
      new RectangularPushButton({
        ...FLAT_PANEL_PUSH_BUTTON_OPTIONS,
        content: new Text(label, { font: FONTS.LABEL, fill: LIGHT_SURFACE_TEXT_FILL, maxWidth: BUTTON_WIDTH - 12 }),
        minWidth: BUTTON_WIDTH,
        xMargin: 6,
        yMargin: 4,
        listener,
        ...extra,
      });

    // ── Sidebar ───────────────────────────────────────────────────────────────
    const presetLabels = common.presets as unknown as Record<string, typeof strings.presetsTitleStringProperty>;
    const presetHelp = common.presetDescriptions as unknown as Record<
      string,
      typeof strings.presetsTitleStringProperty
    >;
    const presetButtons = FilterPreset.enumeration.values.map((preset) =>
      button(
        presetLabels[`${preset.key}StringProperty`] as typeof strings.presetsTitleStringProperty,
        () => filter.applyPreset(preset),
        {
          accessibleHelpText: presetHelp[`${preset.key}StringProperty`] ?? null,
        },
      ),
    );
    const methodCheckboxes = new MethodCheckboxGroup(filter, SIDEBAR_WIDTH - 20);
    const columnsDialog = new ColumnsDialog(model);
    const columnsButton = button(strings.selectColumnsStringProperty, () => columnsDialog.show());
    const clearButton = button(common.clearAllFiltersStringProperty, () => filter.reset(), {
      enabledProperty: new DerivedProperty([database.matchingPlanetsProperty], () => filter.isActive),
    });
    const sidebar = new ExoplanetsDatabasePanel(
      new VBox({
        align: "left",
        spacing: 6,
        children: [
          heading(strings.presetsTitleStringProperty),
          ...presetButtons,
          heading(strings.methodsTitleStringProperty),
          methodCheckboxes,
          columnsButton,
          clearButton,
        ],
      }),
      { left: MARGIN, top: MARGIN, minWidth: SIDEBAR_WIDTH, maxWidth: SIDEBAR_WIDTH, xMargin: 10 },
    );

    // ── Table, count and filter summary ──────────────────────────────────────
    const tableLeft = sidebar.right + MARGIN;
    const matchCount = new MatchCountNode(database, { left: tableLeft, top: MARGIN });
    this.table = new PlanetTableNode(model, TABLE_WIDTH, TABLE_ROWS);
    this.table.left = tableLeft;
    this.table.top = matchCount.bottom + 6;
    const summary = new FilterSummaryNode(filter, TABLE_WIDTH);
    summary.left = tableLeft;
    summary.top = this.table.bottom + 8;

    // ── Planet card ──────────────────────────────────────────────────────────
    const card = new PlanetCardNode(database, bounds.height - 2 * MARGIN - 50);
    card.left = tableLeft + TABLE_WIDTH + MARGIN;
    card.top = MARGIN;
    card.maxWidth = CARD_WIDTH;

    const credit = new DataCreditNode({ left: MARGIN, bottom: bounds.maxY - 6, maxWidth: 680 });

    const resetAllButton = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      listener: () => {
        model.reset();
        this.reset();
      },
      right: bounds.maxX - SCREEN_VIEW_MARGIN,
      bottom: bounds.maxY - SCREEN_VIEW_MARGIN,
    });

    for (const node of [sidebar, matchCount, this.table, summary, card, credit, resetAllButton]) {
      this.addChild(node);
    }
    this.addChild(
      new Node({
        pdomOrder: [...presetButtons, methodCheckboxes, columnsButton, clearButton, this.table, card, resetAllButton],
      }),
    );
  }

  public reset(): void {
    this.table.reset();
  }

  public override step(_dt: number): void {
    // Nothing animates.
  }
}
