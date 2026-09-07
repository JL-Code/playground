<script setup lang="ts">
import { ref, watch } from "vue";
import * as GC from "@mescius/spread-sheets";
import LessonShell from "../../components/LessonShell.vue";
import { chartSheetArray } from "../../spread/chartSheet";
import { SINGLE_CHART_NAME, TRIO_CHARTS } from "../../spread/chartTrio";
import { createEnterSeed } from "../../spread/enterSeed";
import { useSpread } from "../../spread/useSpread";

const COLUMN_LINE_RANGE = "A1:D5";
const PIE_HELPER_RANGE = "F1:G4";
const CHART_X = 420;
const CHART_Y = 10;
const CHART_WIDTH = 480;
const CHART_HEIGHT = 280;

const ChartType = GC.Spread.Sheets.Charts.ChartType;
const TRIO_TYPE = {
  column: ChartType.columnClustered,
  line: ChartType.line,
  pie: ChartType.pie,
} as const;

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

function findChart(s: GC.Spread.Sheets.Worksheet, name: string) {
  try {
    return s.charts.get(name);
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

function removeIfPresent(s: GC.Spread.Sheets.Worksheet, name: string) {
  if (findChart(s, name)) {
    s.charts.remove(name);
  }
}

function removeTrio(s: GC.Spread.Sheets.Worksheet) {
  for (const spec of TRIO_CHARTS) {
    removeIfPresent(s, spec.name);
  }
}

function addColumnChart() {
  const s = requireSheet();
  if (!s) {
    return;
  }
  removeTrio(s);
  removeIfPresent(s, SINGLE_CHART_NAME);
  s.charts.add(
    SINGLE_CHART_NAME,
    ChartType.columnClustered,
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
  const chart = findChart(s, SINGLE_CHART_NAME);
  if (!chart) {
    console.warn("还没有图表");
    return;
  }
  chart.chartType(ChartType.line);
  chart.dataRange(COLUMN_LINE_RANGE);
}

function changeToPie() {
  const s = requireSheet();
  if (!s) {
    return;
  }
  const chart = findChart(s, SINGLE_CHART_NAME);
  if (!chart) {
    console.warn("还没有图表");
    return;
  }
  chart.chartType(ChartType.pie);
  writePieHelper(s);
  chart.dataRange(PIE_HELPER_RANGE);
}

function removeChart() {
  const s = requireSheet();
  if (!s) {
    return;
  }
  if (!findChart(s, SINGLE_CHART_NAME)) {
    console.warn("还没有图表");
    return;
  }
  s.charts.remove(SINGLE_CHART_NAME);
}

function addTrioCharts() {
  const s = requireSheet();
  if (!s) {
    return;
  }
  removeIfPresent(s, SINGLE_CHART_NAME);
  writePieHelper(s);
  for (const spec of TRIO_CHARTS) {
    removeIfPresent(s, spec.name);
    s.charts.add(
      spec.name,
      TRIO_TYPE[spec.kind],
      spec.x,
      spec.y,
      spec.width,
      spec.height,
      spec.range,
    );
  }
}

function removeTrioChart(name: string, label: string) {
  const s = requireSheet();
  if (!s) {
    return;
  }
  if (!findChart(s, name)) {
    console.warn(`还没有${label}`);
    return;
  }
  s.charts.remove(name);
}
</script>

<template>
  <div class="lesson">
    <LessonShell title="图表" :ready="sheet !== null">
      <template #description>
        <p>
          样例是三产品 × 四季度，末行合计（
          <code>chartSheetArray</code>）。前四颗按钮管一张
          <code>SalesChart</code>：
          <code>charts.add</code> 簇状柱形绑
          <code>A1:D5</code>，再改
          <code>chartType</code> 为折线或饼图（饼图用
          <code>F1:G4</code>）。「三张一起出」会先去掉
          <code>SalesChart</code>，再
          <code>add</code> 三个不同名字（
          <code>SalesColumn</code> /
          <code>SalesLine</code> /
          <code>SalesPie</code>），可分别
          <code>remove</code>。依赖
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
        <button :disabled="sheet === null" type="button" @click="addTrioCharts">
          三张一起出
        </button>
        <button
          :disabled="sheet === null"
          type="button"
          @click="removeTrioChart(TRIO_CHARTS[0]!.name, '柱状图')"
        >
          移除柱状
        </button>
        <button
          :disabled="sheet === null"
          type="button"
          @click="removeTrioChart(TRIO_CHARTS[1]!.name, '折线图')"
        >
          移除折线
        </button>
        <button
          :disabled="sheet === null"
          type="button"
          @click="removeTrioChart(TRIO_CHARTS[2]!.name, '饼图')"
        >
          移除饼图
        </button>
      </template>
    </LessonShell>
    <div ref="host" class="spread-host" />
  </div>
</template>
