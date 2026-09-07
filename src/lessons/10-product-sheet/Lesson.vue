<script setup lang="ts">
import { ref, watch } from "vue";
import * as GC from "@mescius/spread-sheets";
import LessonShell from "../../components/LessonShell.vue";
import { createEnterSeed } from "../../spread/enterSeed";
import {
  DEFAULT_PRODUCT_ROWS,
  QTY_HIGHLIGHT_MIN,
  STATUS_LIST_SOURCE,
  productRowsToArray,
} from "../../spread/productRows";
import { nextSortAscending } from "../../spread/nextSortAscending";
import { useSpread } from "../../spread/useSpread";

const TITLE_ROW = 0;
const HEADER_ROW = 1;
const DATA_ROW = 2;
const DATA_COUNT = DEFAULT_PRODUCT_ROWS.length;
const COL_COUNT = 4;
const QTY_COL = 2;
const STATUS_COL = 3;
const TABLE_NAME = "Orders";

const host = ref<HTMLElement | null>(null);
const { spread, sheet } = useSpread(host);

function seed(s: GC.Spread.Sheets.Worksheet) {
  s.name("产品表");
  s.setArray(0, 0, productRowsToArray(DEFAULT_PRODUCT_ROWS));
  s.setColumnWidth(0, 100);
  s.setColumnWidth(1, 80);
  s.setColumnWidth(2, 80);
  s.setColumnWidth(3, 80);
}

watch(sheet, createEnterSeed(seed), { immediate: true });

function requireSheet(): GC.Spread.Sheets.Worksheet | null {
  const s = sheet.value;
  if (!s) {
    console.warn("Worksheet 尚未挂载");
    return null;
  }
  return s;
}

function findOrdersTable(
  s: GC.Spread.Sheets.Worksheet,
): GC.Spread.Sheets.Tables.Table | null {
  const table = s.tables.findByName(TABLE_NAME);
  return table ?? null;
}

function toggleMergeTitle() {
  const s = requireSheet();
  if (!s) {
    return;
  }
  const spans = s.getSpans(
    new GC.Spread.Sheets.Range(TITLE_ROW, 0, 1, COL_COUNT),
  );
  if (spans.length) {
    s.removeSpan(TITLE_ROW, 0);
    return;
  }
  s.addSpan(TITLE_ROW, 0, 1, COL_COUNT);
  const style = new GC.Spread.Sheets.Style();
  style.hAlign = GC.Spread.Sheets.HorizontalAlign.center;
  style.font = "bold 14px sans-serif";
  s.setStyle(TITLE_ROW, 0, style);
}

function statusRange(s: GC.Spread.Sheets.Worksheet) {
  return s.getRange(DATA_ROW, STATUS_COL, DATA_COUNT, 1);
}

function hasStatusList(s: GC.Spread.Sheets.Worksheet): boolean {
  const dv = s.getDataValidator(DATA_ROW, STATUS_COL);
  return (
    dv != null &&
    dv.type() === GC.Spread.Sheets.DataValidation.CriteriaType.list
  );
}

function toggleStatusList() {
  const s = requireSheet();
  if (!s) {
    return;
  }
  if (hasStatusList(s)) {
    statusRange(s).validator(undefined);
    statusRange(s).cellType(undefined);
    return;
  }
  const wb = spread.value;
  if (wb) {
    wb.options.highlightInvalidData = true;
  }
  const dv = GC.Spread.Sheets.DataValidation.createListValidator(
    STATUS_LIST_SOURCE,
  );
  dv.inCellDropdown(true);
  dv.showInputMessage(true);
  dv.inputTitle("状态");
  dv.inputMessage("从列表选择：在售 / 停售");
  // 列表下拉按钮只画在 Text 单元格（typeName === "1"），默认通用类型看不到箭头。
  statusRange(s).cellType(new GC.Spread.Sheets.CellTypes.Text());
  s.setDataValidator(DATA_ROW, STATUS_COL, DATA_COUNT, 1, dv);
  s.setActiveCell(DATA_ROW, STATUS_COL);
}

function toggleQtyHighlight() {
  const s = requireSheet();
  if (!s) {
    return;
  }
  if (s.conditionalFormats.count() > 0) {
    s.conditionalFormats.clearRule();
    return;
  }
  const style = new GC.Spread.Sheets.Style();
  style.backColor = "#C6EFCE";
  style.foreColor = "#006100";
  s.conditionalFormats.addCellValueRule(
    GC.Spread.Sheets.ConditionalFormatting.ComparisonOperators
      .greaterThanOrEqualsTo,
    QTY_HIGHLIGHT_MIN,
    null as unknown as object,
    style,
    [new GC.Spread.Sheets.Range(DATA_ROW, QTY_COL, DATA_COUNT, 1)],
  );
}

function toggleFilter() {
  const s = requireSheet();
  if (!s) {
    return;
  }
  if (findOrdersTable(s)) {
    console.warn("已是 Table，请用表头漏斗筛选");
    return;
  }
  if (s.rowFilter()) {
    s.rowFilter(null as unknown as GC.Spread.Sheets.Filter.RowFilterBase);
    return;
  }
  s.rowFilter(
    new GC.Spread.Sheets.Filter.HideRowFilter(
      new GC.Spread.Sheets.Range(HEADER_ROW, 0, 1 + DATA_COUNT, COL_COUNT),
    ),
  );
}

function sortByQty() {
  const s = requireSheet();
  if (!s) {
    return;
  }
  s.sortRange(DATA_ROW, 0, DATA_COUNT, COL_COUNT, true, [
    {
      index: QTY_COL,
      ascending: nextSortAscending(s.getSortState(), QTY_COL),
    },
  ]);
}

function toggleTable() {
  const s = requireSheet();
  if (!s) {
    return;
  }
  const existing = findOrdersTable(s);
  if (existing) {
    s.tables.remove(
      existing,
      GC.Spread.Sheets.Tables.TableRemoveOptions.keepData,
    );
    return;
  }
  s.rowFilter(null as unknown as GC.Spread.Sheets.Filter.RowFilterBase);
  s.tables.add(
    TABLE_NAME,
    HEADER_ROW,
    0,
    1 + DATA_COUNT,
    COL_COUNT,
    GC.Spread.Sheets.Tables.TableThemes.medium2,
  );
}
</script>

<template>
  <div class="lesson">
    <LessonShell title="表格像产品" :ready="sheet !== null">
      <template #description>
        <p>
          进门只有数据。按钮分别调用
          <code>addSpan</code>、<code>DataValidation</code>、
          <code>conditionalFormats</code>、<code>rowFilter</code> /
          <code>sortRange</code>、<code>tables.add</code>。数量高亮是
          <code>&gt;= {{ QTY_HIGHLIGHT_MIN }}</code>（样例里是 12 / 8 / 7 / 5）。状态下拉后点状态单元格，右侧会出现箭头。Table
          自带筛选，转成 Table 会关掉 sheet 级
          <code>rowFilter</code>。
        </p>
      </template>
      <template #actions>
        <button :disabled="sheet === null" type="button" @click="toggleMergeTitle">
          合并标题
        </button>
        <button :disabled="sheet === null" type="button" @click="toggleStatusList">
          状态下拉
        </button>
        <button :disabled="sheet === null" type="button" @click="toggleQtyHighlight">
          数量高亮
        </button>
        <button :disabled="sheet === null" type="button" @click="toggleFilter">
          打开筛选
        </button>
        <button :disabled="sheet === null" type="button" @click="sortByQty">
          按数量排序
        </button>
        <button :disabled="sheet === null" type="button" @click="toggleTable">
          转成 Table
        </button>
      </template>
    </LessonShell>
    <div ref="host" class="spread-host" />
  </div>
</template>
