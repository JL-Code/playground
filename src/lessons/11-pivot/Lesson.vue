<script setup lang="ts">
import { ref, watch } from "vue";
import * as GC from "@mescius/spread-sheets";
import LessonShell from "../../components/LessonShell.vue";
import { createEnterSeed } from "../../spread/enterSeed";
import {
  createOrderMocks,
  orderMocksToArray,
} from "../../spread/orderMocks";
import { pivotSubtotalSum } from "../../spread/pivotSubtotal";
import { useSpread } from "../../spread/useSpread";

const SOURCE_TABLE = "OrderSource";
const PIVOT_NAME = "OrdersPivot";
const HEADER_ROWS = 1;
const DATA_COUNT = 16;
const COL_COUNT = 4;
const PIVOT_ROW = 18;

const host = ref<HTMLElement | null>(null);
const { sheet } = useSpread(host);

function seed(s: GC.Spread.Sheets.Worksheet) {
  s.name("透视");
  const rows = createOrderMocks({ count: DATA_COUNT, seed: 11 });
  s.setArray(0, 0, orderMocksToArray(rows));
  s.setColumnWidth(0, 100);
  s.setColumnWidth(1, 80);
  s.setColumnWidth(2, 80);
  s.setColumnWidth(3, 100);
  s.tables.add(
    SOURCE_TABLE,
    0,
    0,
    HEADER_ROWS + DATA_COUNT,
    COL_COUNT,
  );
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

function findPivot(s: GC.Spread.Sheets.Worksheet) {
  try {
    return s.pivotTables.get(PIVOT_NAME);
  } catch {
    return undefined;
  }
}

function addPivot() {
  const s = requireSheet();
  if (!s) {
    return;
  }
  if (findPivot(s)) {
    s.pivotTables.remove(PIVOT_NAME);
  }
  const pivot = s.pivotTables.add(
    PIVOT_NAME,
    SOURCE_TABLE,
    PIVOT_ROW,
    0,
    GC.Spread.Pivot.PivotTableLayoutType.tabular,
    GC.Spread.Pivot.PivotTableThemes.medium2,
  );
  pivot.suspendLayout();
  pivot.options.showRowHeader = true;
  pivot.options.showColumnHeader = true;
  const field = GC.Spread.Pivot.PivotTableFieldType;
  pivot.add("产品", "产品", field.rowField);
  pivot.add("状态", "状态", field.columnField);
  pivot.add(
    "数量",
    "数量求和",
    field.valueField,
    pivotSubtotalSum(GC),
  );
  pivot.resumeLayout();
}

function removePivot() {
  const s = requireSheet();
  if (!s) {
    return;
  }
  if (!findPivot(s)) {
    console.warn("还没有透视表");
    return;
  }
  s.pivotTables.remove(PIVOT_NAME);
}
</script>

<template>
  <div class="lesson">
    <LessonShell title="数据透视" :ready="sheet !== null">
      <template #description>
        <p>
          明细来自
          <code>createOrderMocks</code>（可改 count / names / seed 等）。建成 Table
          <code>OrderSource</code> 后，
          <code>pivotTables.add</code> 在下方做行=产品、列=状态、值=数量求和。依赖
          <code>@mescius/spread-sheets-pivot-addon</code>（<code>main.ts</code>
          副作用导入）。
        </p>
      </template>
      <template #actions>
        <button :disabled="sheet === null" type="button" @click="addPivot">
          生成透视
        </button>
        <button :disabled="sheet === null" type="button" @click="removePivot">
          移除透视
        </button>
      </template>
    </LessonShell>
    <div ref="host" class="spread-host" />
  </div>
</template>
