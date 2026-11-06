/**
 * PlanetTableNode.ts
 *
 * The simplified archive table. Only `rowCount` rows are ever built; scrolling rewrites their text
 * from the sorted, filtered planet list, so thousands of planets cost no more than a screenful.
 * Each header sorts by its column (press again to reverse) and has a filter button that opens the
 * column's FilterDialog, as the archive puts a filter box under every header.
 *
 * Keyboard: the table body is one focusable element; the up/down arrows, Page Up/Down, Home and
 * End move the selected planet, and the table scrolls to keep it in view.
 */

import { Multilink, NumberProperty, PatternStringProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { Dimension2, Range } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { FireListener, KeyboardListener, Node, Path, Rectangle, RichText, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { RectangularPushButton, VSlider } from "scenerystack/sun";
import type { DiscoveryMethod } from "../../common/model/DiscoveryMethod.js";
import type { Quantity } from "../../common/model/Quantity.js";
import { TableColumn } from "../../common/model/TableColumn.js";
import {
  methodColor,
  methodMarker,
  methodShortName,
  quantityShortName,
  quantityUnit,
} from "../../common/view/dataStyles.js";
import { showFilterDialog } from "../../common/view/FilterDialog.js";
import { formatInteger, formatValue } from "../../common/view/format.js";
import ExoplanetsDatabaseColors from "../../ExoplanetsDatabaseColors.js";
import { FONTS } from "../../ExoplanetsDatabaseConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { ExploreModel } from "../model/ExploreModel.js";

const ROW_HEIGHT = 22;
const HEADER_HEIGHT = 40;
const SCROLL_BAR_WIDTH = 18;
const NAME_COLUMN_WIDTH = 138;
const METHOD_COLUMN_WIDTH = 72;
const CELL_PADDING = 5;
const FILTER_BUTTON_SIZE = 14;

/** A funnel, the usual filter icon. */
const FUNNEL_SHAPE = new Shape()
  .moveTo(0, 0)
  .lineTo(10, 0)
  .lineTo(6, 5)
  .lineTo(6, 10)
  .lineTo(4, 9)
  .lineTo(4, 5)
  .close();

/** One column's header and its column of cells, built once and repositioned when columns change. */
class ColumnNodes {
  public readonly header: Node;
  public readonly cells: Node[];
  private readonly headerBackground: Rectangle;
  private readonly headerLabel: Text;
  private readonly unitLabel: RichText;
  private readonly sortIndicator: Text;
  private readonly filterButton: RectangularPushButton | null;
  private readonly filterIcon: Path | null;
  private readonly texts: Text[];
  private readonly markers: Path[];

  public readonly column: TableColumn;

  public constructor(column: TableColumn, model: ExploreModel, rowCount: number) {
    this.column = column;
    const strings = StringManager.getInstance().getExploreStrings();
    const quantity = column.quantity;

    let label: TReadOnlyProperty<string>;
    if (column === TableColumn.NAME) {
      label = strings.nameColumnStringProperty;
    } else if (column === TableColumn.METHOD) {
      label = strings.methodColumnStringProperty;
    } else {
      const q = quantity as Quantity;
      label = new PatternStringProperty(
        StringManager.getInstance().getCommonStrings().labelWithUnitPatternStringProperty,
        { label: quantityShortName(q), unit: quantityUnit(q) },
      );
    }
    this.headerBackground = new Rectangle(0, 0, 1, HEADER_HEIGHT, {
      fill: ExoplanetsDatabaseColors.tableHeaderColorProperty,
    });
    // Two lines: the short name, then the unit and the sort arrow (the filter button sits at the right).
    this.headerLabel = new Text(quantity === null ? label : quantityShortName(quantity), {
      font: FONTS.TABLE_HEADER,
      fill: ExoplanetsDatabaseColors.textColorProperty,
    });
    this.unitLabel = new RichText(quantity === null ? "" : quantityUnit(quantity), {
      font: FONTS.SMALL,
      fill: ExoplanetsDatabaseColors.secondaryTextColorProperty,
    });
    this.sortIndicator = new Text("", { font: new PhetFont(9), fill: ExoplanetsDatabaseColors.accentColorProperty });

    const sortLabel = new PatternStringProperty(strings.sortByPatternStringProperty, {
      column: quantity === null ? label : quantityShortName(quantity),
    });
    const sortTarget = new Node({
      children: [this.headerBackground, this.headerLabel, this.unitLabel, this.sortIndicator],
      cursor: "pointer",
      tagName: "button",
      accessibleName: sortLabel,
      inputListeners: [new FireListener({ fire: () => model.database.sortBy(column) })],
    });

    if (quantity) {
      const criterion = model.database.filter.criterion(quantity);
      this.filterIcon = new Path(FUNNEL_SHAPE, { fill: ExoplanetsDatabaseColors.secondaryTextColorProperty });
      this.filterButton = new RectangularPushButton({
        content: this.filterIcon,
        baseColor: ExoplanetsDatabaseColors.tableHeaderColorProperty,
        xMargin: 2,
        yMargin: 2,
        minWidth: FILTER_BUTTON_SIZE,
        minHeight: FILTER_BUTTON_SIZE,
        accessibleName: new PatternStringProperty(strings.filterColumnPatternStringProperty, {
          column: quantityShortName(quantity),
        }),
        listener: () => showFilterDialog(criterion),
      });
      const updateIcon = (): void => {
        (this.filterIcon as Path).fill = criterion.isActive
          ? ExoplanetsDatabaseColors.activeFilterColorProperty
          : ExoplanetsDatabaseColors.secondaryTextColorProperty;
      };
      model.database.filter.changedEmitter.addListener(updateIcon);
      updateIcon();
    } else {
      this.filterButton = null;
      this.filterIcon = null;
    }
    this.header = new Node({ children: this.filterButton ? [sortTarget, this.filterButton] : [sortTarget] });

    this.texts = [];
    this.markers = [];
    this.cells = [];
    for (let r = 0; r < rowCount; r++) {
      const text = new Text("", {
        font: FONTS.TABLE,
        fill: ExoplanetsDatabaseColors.textColorProperty,
        pickable: false,
      });
      const children: Node[] = [text];
      if (column === TableColumn.METHOD) {
        const marker = new Path(null, { pickable: false });
        this.markers.push(marker);
        children.unshift(marker);
      }
      this.texts.push(text);
      this.cells.push(new Node({ children, pickable: false }));
    }
  }

  /** Lays the header and cells out at width w. */
  public layout(width: number): void {
    this.headerBackground.setRectWidth(width);
    const filterRoom = this.filterButton ? FILTER_BUTTON_SIZE + 4 : 0;
    this.headerLabel.maxWidth = width - 2 * CELL_PADDING - 8;
    this.headerLabel.left = CELL_PADDING;
    this.headerLabel.top = 4;
    this.unitLabel.maxWidth = Math.max(10, width - 2 * CELL_PADDING - filterRoom);
    this.unitLabel.left = CELL_PADDING;
    this.unitLabel.bottom = HEADER_HEIGHT - 4;
    this.sortIndicator.right = width - 2;
    this.sortIndicator.top = 2;
    if (this.filterButton) {
      this.filterButton.right = width - 2;
      this.filterButton.bottom = HEADER_HEIGHT - 3;
    }
    const markerRoom = this.markers.length > 0 ? 12 : 0;
    this.texts.forEach((text, r) => {
      text.maxWidth = width - 2 * CELL_PADDING - markerRoom;
      text.left = CELL_PADDING + markerRoom;
      text.centerY = ROW_HEIGHT / 2;
      const marker = this.markers[r];
      if (marker) {
        marker.center = marker.center.setXY(CELL_PADDING + 4, ROW_HEIGHT / 2);
      }
    });
  }

  public setSortState(state: "none" | "ascending" | "descending"): void {
    this.sortIndicator.string = state === "ascending" ? "▲" : state === "descending" ? "▼" : "";
    this.sortIndicator.right = this.headerBackground.right - 2;
  }

  /** Writes planet `index` (or nothing, for null) into row r. */
  public fill(r: number, index: number | null, model: ExploreModel): void {
    const text = this.texts[r] as Text;
    const marker = this.markers[r];
    if (index === null) {
      text.string = "";
      if (marker) {
        marker.shape = null;
      }
      return;
    }
    const catalog = model.database.catalog;
    if (this.column === TableColumn.NAME) {
      text.string = catalog.names[index] ?? "";
      text.fill = ExoplanetsDatabaseColors.textColorProperty;
      return;
    }
    if (this.column === TableColumn.METHOD) {
      const method = catalog.methods[index] as DiscoveryMethod;
      text.string = methodShortName(method).value;
      text.fill = ExoplanetsDatabaseColors.textColorProperty;
      if (marker) {
        marker.shape = methodMarker(method).toShape(4);
        marker.fill = methodColor(method);
        marker.center = marker.center.setXY(CELL_PADDING + 4, ROW_HEIGHT / 2);
      }
      return;
    }
    const quantity = this.column.quantity as Quantity;
    const value = catalog.value(index, quantity);
    if (Number.isNaN(value)) {
      text.string = "—";
      text.fill = ExoplanetsDatabaseColors.estimatedTextColorProperty;
      return;
    }
    const formatted = quantity.isInteger ? formatInteger(value) : formatValue(value, quantity.significantFigures);
    const estimated = catalog.isCalculated(index, quantity);
    text.string = `${catalog.valuePrefix(index, quantity)}${formatted}`;
    text.fill = estimated
      ? ExoplanetsDatabaseColors.estimatedTextColorProperty
      : ExoplanetsDatabaseColors.textColorProperty;
  }
}

export class PlanetTableNode extends Node {
  private readonly model: ExploreModel;
  private readonly rowCount: number;
  private readonly tableWidth: number;
  private readonly firstRowProperty = new NumberProperty(0);
  private readonly columnNodes = new Map<TableColumn, ColumnNodes>();
  private readonly columnsLayer = new Node();
  private readonly rowBackgrounds: Rectangle[] = [];
  private readonly noMatchesText: Text;
  private visibleColumnNodes: ColumnNodes[] = [];

  /** The focusable table body (for the keyboard traversal order). */
  public readonly bodyNode: Node;
  public readonly scrollBar: VSlider;

  public constructor(model: ExploreModel, width: number, rowCount: number) {
    // Lives as long as the Explore screen, which lives as long as the sim.
    super({ isDisposable: false });
    this.model = model;
    this.rowCount = rowCount;
    this.tableWidth = width - SCROLL_BAR_WIDTH - 4;
    const strings = StringManager.getInstance().getExploreStrings();
    const database = model.database;
    const bodyHeight = rowCount * ROW_HEIGHT;

    // ── Rows ──────────────────────────────────────────────────────────────────
    for (let r = 0; r < rowCount; r++) {
      const background = new Rectangle(0, HEADER_HEIGHT + r * ROW_HEIGHT, this.tableWidth, ROW_HEIGHT, {
        cursor: "pointer",
        inputListeners: [
          new FireListener({
            fire: () => {
              const index = database.sortedPlanetsProperty.value[this.firstRowProperty.value + r];
              if (index !== undefined) {
                database.selectedPlanetProperty.value = index;
              }
            },
          }),
        ],
      });
      this.rowBackgrounds.push(background);
    }
    this.noMatchesText = new Text(strings.noMatchesStringProperty, {
      font: FONTS.LABEL,
      fill: ExoplanetsDatabaseColors.secondaryTextColorProperty,
      left: CELL_PADDING,
      top: HEADER_HEIGHT + 6,
      maxWidth: this.tableWidth - 2 * CELL_PADDING,
    });

    this.bodyNode = new Node({
      children: [...this.rowBackgrounds, this.noMatchesText],
      tagName: "div",
      focusable: true,
      accessibleName: strings.tableStringProperty,
      accessibleHelpText: strings.tableHelpStringProperty,
    });
    this.bodyNode.addInputListener(
      new KeyboardListener({
        keys: ["arrowUp", "arrowDown", "pageUp", "pageDown", "home", "end"] as const,
        fire: (_event, key) => {
          const sorted = database.sortedPlanetsProperty.value;
          if (sorted.length === 0) {
            return;
          }
          const selected = database.selectedPlanetProperty.value;
          const current = selected === null ? -1 : sorted.indexOf(selected);
          const steps: Record<string, number> = {
            arrowUp: -1,
            arrowDown: 1,
            pageUp: -rowCount,
            pageDown: rowCount,
            home: -sorted.length,
            end: sorted.length,
          };
          // With nothing selected yet, any key selects the first row.
          const target = current < 0 ? 0 : current + (steps[key] ?? 0);
          const next = Math.max(0, Math.min(sorted.length - 1, target));
          database.selectedPlanetProperty.value = sorted[next] ?? null;
          const name = database.catalog.names[sorted[next] ?? 0] ?? "";
          this.bodyNode.addAccessibleResponse(name);
        },
      }),
    );
    // Mouse wheel and trackpad scrolling.
    this.bodyNode.addInputListener({
      wheel: (event) => {
        const delta = event.domEvent?.deltaY ?? 0;
        this.scrollBy(Math.sign(delta) * Math.max(1, Math.round(Math.abs(delta) / ROW_HEIGHT)));
        event.handle();
      },
    });

    // ── Scroll bar: a vertical slider on 0 (bottom) … 1 (top) ────────────────
    const scrollProperty = new NumberProperty(1, { range: new Range(0, 1) });
    let syncing = false;
    const maxFirstRow = (): number => Math.max(0, database.sortedPlanetsProperty.value.length - rowCount);
    scrollProperty.lazyLink((scroll) => {
      if (!syncing) {
        syncing = true;
        this.firstRowProperty.value = Math.round((1 - scroll) * maxFirstRow());
        syncing = false;
      }
    });
    this.firstRowProperty.lazyLink((first) => {
      if (!syncing) {
        syncing = true;
        const max = maxFirstRow();
        scrollProperty.value = max === 0 ? 1 : 1 - first / max;
        syncing = false;
      }
      this.refresh();
    });
    this.scrollBar = new VSlider(scrollProperty, new Range(0, 1), {
      trackSize: new Dimension2(4, bodyHeight - 24),
      thumbSize: new Dimension2(SCROLL_BAR_WIDTH, 24),
      trackFillEnabled: ExoplanetsDatabaseColors.tableHeaderColorProperty,
      keyboardStep: 0.02,
      shiftKeyboardStep: 0.005,
      pageKeyboardStep: 0.1,
      accessibleName: strings.scrollBarStringProperty,
      left: this.tableWidth + 4,
      top: HEADER_HEIGHT + 12,
    });

    this.children = [this.bodyNode, this.columnsLayer, this.scrollBar];

    // ── Updates ───────────────────────────────────────────────────────────────
    for (const property of model.columnVisibleProperties.values()) {
      property.lazyLink(() => this.relayout());
    }
    database.sortedPlanetsProperty.link(() => {
      this.firstRowProperty.value = Math.min(this.firstRowProperty.value, maxFirstRow());
      syncing = true;
      const max = maxFirstRow();
      scrollProperty.value = max === 0 ? 1 : 1 - this.firstRowProperty.value / max;
      syncing = false;
      this.scrollBar.enabled = max > 0;
      this.scrollToSelection();
      this.refresh();
    });
    Multilink.multilink([database.sortColumnProperty, database.sortAscendingProperty], () =>
      this.updateSortIndicators(),
    );
    database.selectedPlanetProperty.lazyLink(() => {
      this.scrollToSelection();
      this.refresh();
    });
    // Method names are written into cells, so rewrite them when the language changes.
    Multilink.multilinkAny([StringManager.getInstance().getCommonStrings().methodsShort.transitStringProperty], () =>
      this.refresh(),
    );
    this.relayout();
  }

  private scrollBy(rows: number): void {
    const max = Math.max(0, this.model.database.sortedPlanetsProperty.value.length - this.rowCount);
    this.firstRowProperty.value = Math.max(0, Math.min(max, this.firstRowProperty.value + rows));
  }

  /** Scrolls so the selected planet's row is visible. */
  private scrollToSelection(): void {
    const selected = this.model.database.selectedPlanetProperty.value;
    if (selected === null) {
      return;
    }
    const position = this.model.database.sortedPlanetsProperty.value.indexOf(selected);
    if (position < 0) {
      return;
    }
    const first = this.firstRowProperty.value;
    if (position < first) {
      this.firstRowProperty.value = position;
    } else if (position >= first + this.rowCount) {
      this.firstRowProperty.value = position - this.rowCount + 1;
    }
  }

  /** Rebuilds the column layout after the visible columns change. */
  private relayout(): void {
    const columns = this.model.visibleColumns;
    this.visibleColumnNodes = columns.map((column) => {
      let nodes = this.columnNodes.get(column);
      if (!nodes) {
        nodes = new ColumnNodes(column, this.model, this.rowCount);
        this.columnNodes.set(column, nodes);
      }
      return nodes;
    });
    const fixed = NAME_COLUMN_WIDTH + (columns.includes(TableColumn.METHOD) ? METHOD_COLUMN_WIDTH : 0);
    const flexible = columns.filter((c) => c.quantity !== null).length;
    const flexibleWidth = flexible > 0 ? (this.tableWidth - fixed) / flexible : 0;

    const children: Node[] = [];
    let x = 0;
    for (const nodes of this.visibleColumnNodes) {
      const width =
        nodes.column === TableColumn.NAME
          ? NAME_COLUMN_WIDTH
          : nodes.column === TableColumn.METHOD
            ? METHOD_COLUMN_WIDTH
            : flexibleWidth;
      nodes.layout(width);
      nodes.header.x = x;
      children.push(nodes.header);
      nodes.cells.forEach((cell, r) => {
        cell.x = x;
        cell.y = HEADER_HEIGHT + r * ROW_HEIGHT;
        children.push(cell);
      });
      x += width;
    }
    this.columnsLayer.children = children;
    this.updateSortIndicators();
    this.refresh();
  }

  private updateSortIndicators(): void {
    const database = this.model.database;
    for (const nodes of this.columnNodes.values()) {
      nodes.setSortState(
        nodes.column !== database.sortColumnProperty.value
          ? "none"
          : database.sortAscendingProperty.value
            ? "ascending"
            : "descending",
      );
    }
  }

  /** Writes the visible window of planets into the rows. */
  private refresh(): void {
    const database = this.model.database;
    const sorted = database.sortedPlanetsProperty.value;
    const first = this.firstRowProperty.value;
    const selected = database.selectedPlanetProperty.value;
    for (let r = 0; r < this.rowCount; r++) {
      const index = sorted[first + r];
      const background = this.rowBackgrounds[r] as Rectangle;
      background.fill =
        index !== undefined && index === selected
          ? ExoplanetsDatabaseColors.tableSelectedRowColorProperty
          : (first + r) % 2 === 0
            ? ExoplanetsDatabaseColors.tableRowColorProperty
            : ExoplanetsDatabaseColors.tableAlternateRowColorProperty;
      for (const nodes of this.visibleColumnNodes) {
        nodes.fill(r, index ?? null, this.model);
      }
    }
    this.noMatchesText.visible = sorted.length === 0;
  }

  public reset(): void {
    this.firstRowProperty.reset();
  }
}
