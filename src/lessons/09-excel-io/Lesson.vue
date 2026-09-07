<script setup lang="ts">
import { ref, watch } from "vue";
import * as GC from "@mescius/spread-sheets";
import LessonShell from "../../components/LessonShell.vue";
import { createEnterSeed } from "../../spread/enterSeed";
import { DEFAULT_ORDERS, ordersToArray } from "../../spread/orders";
import { useSpread } from "../../spread/useSpread";

const host = ref<HTMLElement | null>(null);
const { spread, sheet } = useSpread(host);

function seed(s: GC.Spread.Sheets.Worksheet) {
  s.name("订单导出");
  s.setArray(0, 0, ordersToArray(DEFAULT_ORDERS));
}

watch(sheet, createEnterSeed(seed), { immediate: true });

function isXlsx(file: File): boolean {
  return file.name.toLowerCase().endsWith(".xlsx");
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function onPickFile(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  const wb = spread.value;
  if (!wb) {
    console.warn("Workbook 尚未挂载");
    return;
  }
  if (!file) {
    return;
  }
  if (!isXlsx(file)) {
    console.warn("只支持 .xlsx");
    return;
  }
  wb.import(
    file,
    () => undefined,
    (err: unknown) => {
      console.warn("导入失败", err);
    },
    { fileType: GC.Spread.Sheets.FileType.excel },
  );
}

function exportXlsx() {
  const wb = spread.value;
  if (!wb) {
    console.warn("Workbook 尚未挂载");
    return;
  }
  wb.export(
    (blob: Blob) => {
      downloadBlob(blob, "orders.xlsx");
    },
    (err: unknown) => {
      console.warn("导出失败", err);
    },
    { fileType: GC.Spread.Sheets.FileType.excel },
  );
}
</script>

<template>
  <div class="lesson">
    <LessonShell title="Excel 进出" :ready="sheet !== null">
      <template #description>
        <p>
          <code>spread.import</code> / <code>export</code> 需要
          <code>@mescius/spread-sheets-io</code>（已在
          <code>main.ts</code> 副作用导入）。文件类型用
          <code>FileType.excel</code>。样例与课 8 同一份
          <code>DEFAULT_ORDERS</code>，本课不做 Vue 双向同步。
        </p>
      </template>
      <template #actions>
        <input
          type="file"
          accept=".xlsx"
          :disabled="sheet === null"
          @change="onPickFile"
        />
        <button :disabled="sheet === null" type="button" @click="exportXlsx">
          导出 xlsx
        </button>
      </template>
    </LessonShell>
    <div ref="host" class="spread-host" />
  </div>
</template>
