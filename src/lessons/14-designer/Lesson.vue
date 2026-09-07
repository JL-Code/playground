<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from "vue";
import * as GC from "@mescius/spread-sheets";
import LessonShell from "../../components/LessonShell.vue";
import { createEnterSeed } from "../../spread/enterSeed";
import {
  createOrderMocks,
  orderMocksToArray,
} from "../../spread/orderMocks";
import {
  DESIGNER_PANEL_NAME,
  DESIGNER_PIVOT_NAME,
  DESIGNER_PIVOT_SHEET,
  DESIGNER_SOURCE_SHEET,
  DESIGNER_SOURCE_TABLE,
  allocateSheetName,
} from "../../spread/designerPivot";
import { useDesigner } from "../../spread/useDesigner";

const HEADER_ROWS = 1;
const DATA_COUNT = 16;
const COL_COUNT = 4;

const host = ref<HTMLElement | null>(null);
const panelHost = ref<HTMLElement | null>(null);
const { designer, spread, sheet } = useDesigner(host);
const panelOpen = ref(false);
const pivotSheetName = ref<string | null>(null);
let pivotPanel: GC.Spread.Pivot.PivotPanel | null = null;

function seed(s: GC.Spread.Sheets.Worksheet) {
  s.name(DESIGNER_SOURCE_SHEET);
  const rows = createOrderMocks({ count: DATA_COUNT, seed: 11 });
  s.setArray(0, 0, orderMocksToArray(rows));
  s.setColumnWidth(0, 100);
  s.setColumnWidth(1, 80);
  s.setColumnWidth(2, 80);
  s.setColumnWidth(3, 100);
  s.tables.add(
    DESIGNER_SOURCE_TABLE,
    0,
    0,
    HEADER_ROWS + DATA_COUNT,
    COL_COUNT,
  );
}

watch(sheet, createEnterSeed(seed), { immediate: true });

function requireWorkbook(): GC.Spread.Sheets.Workbook | null {
  const wb = spread.value;
  if (!wb) {
    console.warn("Workbook 尚未挂载");
    return null;
  }
  return wb;
}

function sheetNames(wb: GC.Spread.Sheets.Workbook): string[] {
  const names: string[] = [];
  for (let i = 0; i < wb.getSheetCount(); i++) {
    names.push(wb.getSheet(i).name());
  }
  return names;
}

function sheetIndexNamed(
  wb: GC.Spread.Sheets.Workbook,
  name: string,
): number {
  for (let i = 0; i < wb.getSheetCount(); i++) {
    if (wb.getSheet(i).name() === name) {
      return i;
    }
  }
  return -1;
}

function destroyPanel() {
  if (pivotPanel) {
    pivotPanel.destroy();
    pivotPanel = null;
  }
  panelOpen.value = false;
  panelHost.value?.replaceChildren();
}

async function openFieldPanel() {
  const wb = requireWorkbook();
  if (!wb) {
    return;
  }
  if (panelOpen.value) {
    console.warn("字段面板已打开");
    return;
  }
  const name = allocateSheetName(DESIGNER_PIVOT_SHEET, sheetNames(wb));
  const index = wb.getSheetCount();
  wb.addSheet(index);
  const pivotSheet = wb.getSheet(index);
  pivotSheet.name(name);
  const pivot = pivotSheet.pivotTables.add(
    DESIGNER_PIVOT_NAME,
    DESIGNER_SOURCE_TABLE,
    0,
    0,
    GC.Spread.Pivot.PivotTableLayoutType.tabular,
    GC.Spread.Pivot.PivotTableThemes.medium2,
  );
  pivot.options.showRowHeader = true;
  pivot.options.showColumnHeader = true;
  const el = panelHost.value;
  if (!el) {
    console.warn("字段面板宿主尚未挂载");
    return;
  }
  panelOpen.value = true;
  await nextTick();
  pivotPanel = new GC.Spread.Pivot.PivotPanel(
    DESIGNER_PANEL_NAME,
    pivot,
    el as HTMLDivElement,
  );
  designer.value?.refresh();
  pivotSheetName.value = name;
  wb.setActiveSheet(name);
}

async function removePivot() {
  const wb = requireWorkbook();
  if (!wb) {
    return;
  }
  const name = pivotSheetName.value;
  if (!panelOpen.value || !name) {
    console.warn("还没有透视表");
    return;
  }
  destroyPanel();
  await nextTick();
  designer.value?.refresh();
  const index = sheetIndexNamed(wb, name);
  if (index < 0) {
    console.warn("未找到透视工作表");
    pivotSheetName.value = null;
    return;
  }
  const pivotSheet = wb.getSheet(index);
  try {
    if (pivotSheet.pivotTables.get(DESIGNER_PIVOT_NAME)) {
      pivotSheet.pivotTables.remove(DESIGNER_PIVOT_NAME);
    }
  } catch {
    /* get may throw when missing */
  }
  if (wb.getSheetCount() <= 1) {
    console.warn("至少保留一张工作表");
    pivotSheetName.value = null;
    return;
  }
  wb.removeSheet(index);
  const sourceIndex = sheetIndexNamed(wb, DESIGNER_SOURCE_SHEET);
  if (sourceIndex >= 0) {
    wb.setActiveSheetIndex(sourceIndex);
  }
  pivotSheetName.value = null;
}

onUnmounted(() => {
  destroyPanel();
});
</script>

<template>
  <div class="lesson">
    <LessonShell title="Designer" :ready="sheet !== null">
      <template #description>
        <p>
          本课挂官方
          <code>GC.Spread.Sheets.Designer.Designer</code>
          （Ribbon），不经过
          <code>@mescius/spread-sheets-vue</code>。进门只有明细 Table
          <code>OrderSource</code>（与课 11 同源
          <code>createOrderMocks</code>），<strong>不</strong>预置行列值。上面的 Ribbon 可以随便点，用来看 SpreadJS 能力。
        </p>
        <p>
          「打开字段面板」在<strong>新 Sheet</strong>上
          <code>pivotTables.add</code> 空透视，右侧
          <code>PivotPanel</code>（约 280px）拖筛选 / 列 / 行 / 值。课 11 仍是命令式
          <code>pivot.add</code>。
        </p>
      </template>
      <template #actions>
        <button
          :disabled="sheet === null"
          type="button"
          @click="openFieldPanel"
        >
          打开字段面板
        </button>
        <button
          :disabled="sheet === null"
          type="button"
          @click="removePivot"
        >
          移除透视
        </button>
      </template>
    </LessonShell>
    <div class="lesson-workspace">
      <div ref="host" class="designer-host" />
      <div
        ref="panelHost"
        class="pivot-panel-host"
        :hidden="!panelOpen"
      />
    </div>
  </div>
</template>
