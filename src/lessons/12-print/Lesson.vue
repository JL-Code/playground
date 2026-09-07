<script setup lang="ts">
import { onUnmounted, ref, watch } from "vue";
import * as GC from "@mescius/spread-sheets";
import LessonShell from "../../components/LessonShell.vue";
import { createEnterSeed } from "../../spread/enterSeed";
import {
  formatPrintRange,
  parsePrintRange,
  shouldFollowUsedRange,
  type PrintRange,
} from "../../spread/printRange";
import { printSheetArray } from "../../spread/printSheet";
import { useSpread } from "../../spread/useSpread";

const DEFAULT_HEADER = "季度订单";
const DEFAULT_FOOTER = "第 &P 页";
const DEFAULT_MARGIN = 0.05;

const host = ref<HTMLElement | null>(null);
const { spread, sheet } = useSpread(host);

const headerCenter = ref(DEFAULT_HEADER);
const footerCenter = ref(DEFAULT_FOOTER);
const marginInches = ref(DEFAULT_MARGIN);
const printArea = ref("");
const lastAutoArea = ref("");
const lastApplied = ref("");

function usedContentRange(
  s: GC.Spread.Sheets.Worksheet,
): PrintRange | null {
  const used = s.getUsedRange(GC.Spread.Sheets.UsedRangeType.data);
  if (!used || used.rowCount < 1 || used.colCount < 1) {
    return null;
  }
  return {
    row: used.row,
    col: used.col,
    rowCount: used.rowCount,
    colCount: used.colCount,
  };
}

function adoptUsedRange(s: GC.Spread.Sheets.Worksheet) {
  const used = usedContentRange(s);
  const next = used ? formatPrintRange(used) : "";
  if (shouldFollowUsedRange(printArea.value, lastAutoArea.value)) {
    printArea.value = next;
    lastAutoArea.value = next;
  }
}

function seed(s: GC.Spread.Sheets.Worksheet) {
  s.name("打印");
  s.setArray(0, 0, printSheetArray());
  s.setColumnWidth(0, 100);
  s.setColumnWidth(1, 80);
  s.setColumnWidth(2, 80);
  s.setColumnWidth(3, 80);
  s.setColumnWidth(4, 80);
  s.setColumnWidth(5, 80);
  s.setColumnWidth(6, 100);
  const used = usedContentRange(s);
  const next = used ? formatPrintRange(used) : "";
  printArea.value = next;
  lastAutoArea.value = next;
}

watch(sheet, createEnterSeed(seed), { immediate: true });

function onSheetContentChanged() {
  const s = sheet.value;
  if (s) {
    adoptUsedRange(s);
  }
}

watch(
  sheet,
  (s, prev) => {
    if (prev) {
      prev.unbind(GC.Spread.Sheets.Events.ClipboardPasted, onSheetContentChanged);
      prev.unbind(GC.Spread.Sheets.Events.RangeChanged, onSheetContentChanged);
    }
    if (s) {
      s.bind(GC.Spread.Sheets.Events.ClipboardPasted, onSheetContentChanged);
      s.bind(GC.Spread.Sheets.Events.RangeChanged, onSheetContentChanged);
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  const s = sheet.value;
  if (!s) {
    return;
  }
  s.unbind(GC.Spread.Sheets.Events.ClipboardPasted, onSheetContentChanged);
  s.unbind(GC.Spread.Sheets.Events.RangeChanged, onSheetContentChanged);
});

function requireSheet(): GC.Spread.Sheets.Worksheet | null {
  const s = sheet.value;
  if (!s) {
    console.warn("Worksheet 尚未挂载");
    return null;
  }
  return s;
}

function formKey(): string {
  return JSON.stringify({
    h: headerCenter.value,
    f: footerCenter.value,
    m: marginInches.value,
    a: printArea.value,
  });
}

function applyPrintInfo(): boolean {
  const s = requireSheet();
  if (!s) {
    return false;
  }
  const range = printArea.value.trim()
    ? parsePrintRange(printArea.value)
    : usedContentRange(s);
  if (!range) {
    console.warn("打印区域无效或没有内容", printArea.value);
    return false;
  }
  printArea.value = formatPrintRange(range);
  const usedNow = usedContentRange(s);
  if (usedNow && printArea.value === formatPrintRange(usedNow)) {
    lastAutoArea.value = printArea.value;
  }
  const inches = Number(marginInches.value);
  if (!Number.isFinite(inches) || inches < 0) {
    console.warn("边距无效", marginInches.value);
    return false;
  }
  const hundredths = inches * 100;
  const info = s.printInfo();
  info.pageHeaderFooter({
    normal: {
      header: { center: headerCenter.value },
      footer: { center: footerCenter.value },
    },
  });
  info.margin({
    top: hundredths,
    bottom: hundredths,
    left: hundredths,
    right: hundredths,
    header: hundredths,
    footer: hundredths,
  });
  info.rowStart(range.row);
  info.rowEnd(range.row + range.rowCount - 1);
  info.columnStart(range.col);
  info.columnEnd(range.col + range.colCount - 1);
  s.printInfo(info);
  lastApplied.value = formKey();
  return true;
}

function ensureApplied(): boolean {
  if (lastApplied.value === formKey()) {
    return true;
  }
  return applyPrintInfo();
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function previewPrint() {
  const wb = spread.value;
  if (!wb) {
    console.warn("Workbook 尚未挂载");
    return;
  }
  if (!ensureApplied()) {
    return;
  }
  wb.print(wb.getActiveSheetIndex());
}

function exportPdf() {
  const wb = spread.value;
  if (!wb) {
    console.warn("Workbook 尚未挂载");
    return;
  }
  if (!ensureApplied()) {
    return;
  }
  wb.savePDF(
    (blob: Blob) => {
      downloadBlob(blob, "products.pdf");
    },
    (err: unknown) => {
      console.warn("导出 PDF 失败", err);
    },
    undefined,
    wb.getActiveSheetIndex(),
  );
}
</script>

<template>
  <div class="lesson">
    <LessonShell title="打印 / PDF" :ready="sheet !== null">
      <template #description>
        <p>
          明细在课 10 产品行上扩到 36 行 × 7 列（
          <code>printSheetArray</code>
          ），不套合并/筛选。
          <code>printInfo</code>
          写页眉、页脚、边距（英寸×100）和打印区域（进门按
          <code>getUsedRange(data)</code>
          填内容区；粘贴或改格子后若你没手改过区域会跟着变。清空后再应用也会重新识别）；预览用
          <code>spread.print</code>，PDF 用
          <code>savePDF</code>（
          <code>main.ts</code>
          导入 print / pdf 插件）。
        </p>
        <div class="vue-panel">
          <label>
            页眉（居中）
            <input v-model="headerCenter" type="text" />
          </label>
          <label>
            页脚（居中）
            <input v-model="footerCenter" type="text" />
          </label>
          <label>
            边距（英寸）
            <input v-model.number="marginInches" min="0" step="0.05" type="number" />
          </label>
          <label>
            打印区域
            <input
              v-model="printArea"
              placeholder="空则识别内容区"
              type="text"
            />
          </label>
        </div>
      </template>
      <template #actions>
        <button :disabled="sheet === null" type="button" @click="applyPrintInfo">
          应用到表
        </button>
        <button :disabled="sheet === null" type="button" @click="previewPrint">
          打印预览
        </button>
        <button :disabled="sheet === null" type="button" @click="exportPdf">
          导出 PDF
        </button>
      </template>
    </LessonShell>
    <div ref="host" class="spread-host" />
  </div>
</template>
