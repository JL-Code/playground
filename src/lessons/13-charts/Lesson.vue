<script setup lang="ts">
import { ref, watch } from "vue";
import * as GC from "@mescius/spread-sheets";
import LessonShell from "../../components/LessonShell.vue";
import { chartSheetArray } from "../../spread/chartSheet";
import { createEnterSeed } from "../../spread/enterSeed";
import { useSpread } from "../../spread/useSpread";

const CHART_NAME = "SalesChart";
const COLUMN_LINE_RANGE = "A1:D5";
const PIE_HELPER_RANGE = "F1:G4";
const CHART_X = 420;
const CHART_Y = 10;
const CHART_WIDTH = 480;
const CHART_HEIGHT = 280;

const host = ref<HTMLElement | null>(null);
const { sheet } = useSpread(host);

function seed(s: GC.Spread.Sheets.Worksheet) {
  s.name("图表");
  s.setArray(0, 0, chartSheetArray());
  s.setColumnWidth(0, 80);
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

function findChart(s: GC.Spread.Sheets.Worksheet) {
  try {
    return s.charts.get(CHART_NAME);
  } catch {
    return undefined;
  }
}

function writePieHelper(s: GC.Spread.Sheets.Worksheet) {
  const table = chartSheetArray();
  const header = table[0]!;
  const total = table[5]!;
  s.setArray(0, 5, [
    ["产品", "全年"],
    [header[1]!, total[1]!],
    [header[2]!, total[2]!],
    [header[3]!, total[3]!],
  ]);
}

function addColumnChart() {
  const s = requireSheet();
  if (!s) {
    return;
  }
  if (findChart(s)) {
    s.charts.remove(CHART_NAME);
  }
  s.charts.add(
    CHART_NAME,
    GC.Spread.Sheets.Charts.ChartType.columnClustered,
    CHART_X,
    CHART_Y,
    CHART_WIDTH,
    CHART_HEIGHT,
    COLUMN_LINE_RANGE,
  );
}

function changeToLine() {
  const s = requireSheet();
  if (!s) {
    return;
  }
  const chart = findChart(s);
  if (!chart) {
    console.warn("还没有图表");
    return;
  }
  chart.chartType(GC.Spread.Sheets.Charts.ChartType.line);
  chart.dataRange(COLUMN_LINE_RANGE);
}

function changeToPie() {
  const s = requireSheet();
  if (!s) {
    return;
  }
  const chart = findChart(s);
  if (!chart) {
    console.warn("还没有图表");
    return;
  }
  chart.chartType(GC.Spread.Sheets.Charts.ChartType.pie);
  writePieHelper(s);
  chart.dataRange(PIE_HELPER_RANGE);
}

function removeChart() {
  const s = requireSheet();
  if (!s) {
    return;
  }
  if (!findChart(s)) {
    console.warn("还没有图表");
    return;
  }
  s.charts.remove(CHART_NAME);
}
</script>

<template>
  <div class="lesson">
    <LessonShell title="图表" :ready="sheet !== null">
      <template #description>
        <p>
          样例是三产品 × 四季度，末行合计（
          <code>chartSheetArray</code>）。
          <code>charts.add</code> 用簇状柱形绑
          <code>A1:D5</code>（不含合计）。同一张
          <code>SalesChart</code> 可改
          <code>chartType</code> 为折线（仍
          <code>A1:D5</code>）或饼图（
          <code>writePieHelper</code> 写入
          <code>F1:G4</code>，因
          <code>B1:D1,B6:D6</code> 不抛错但不按产品切片）。依赖
          <code>@mescius/spread-sheets-charts</code>（<code>main.ts</code>
          副作用导入）。
        </p>
      </template>
      <template #actions>
        <button :disabled="sheet === null" type="button" @click="addColumnChart">
          加柱状图
        </button>
        <button :disabled="sheet === null" type="button" @click="changeToLine">
          改成折线
        </button>
        <button :disabled="sheet === null" type="button" @click="changeToPie">
          改成饼图
        </button>
        <button :disabled="sheet === null" type="button" @click="removeChart">
          移除图表
        </button>
      </template>
    </LessonShell>
    <div ref="host" class="spread-host" />
  </div>
</template>
