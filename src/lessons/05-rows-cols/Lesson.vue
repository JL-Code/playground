<script setup lang="ts">
import { ref, watch } from "vue";
import * as GC from "@mescius/spread-sheets";
import LessonShell from "../../components/LessonShell.vue";
import { useSpread } from "../../spread/useSpread";

const host = ref<HTMLElement | null>(null);
const { sheet } = useSpread(host);

function seed(s: GC.Spread.Sheets.Worksheet) {
  s.name("行列");
  const rows: (string | number)[][] = [["月份", "北区", "南区", "合计"]];
  for (let i = 1; i <= 8; i++) {
    rows.push([`${i}月`, i * 10, i * 7, i * 17]);
  }
  s.setArray(0, 0, rows);
}

watch(sheet, (s) => {
  if (s && s.getValue(0, 0) == null) seed(s);
}, { immediate: true });

function requireAnchor(s: GC.Spread.Sheets.Worksheet): { row: number; col: number } | null {
  const sel = s.getSelections()[0];
  if (!sel || sel.row < 0 || sel.col < 0) {
    console.warn("请选中具体单元格，不要整行整列");
    return null;
  }
  return { row: sel.row, col: sel.col };
}

function insertRow() {
  const s = sheet.value;
  if (!s) {
    console.warn("Worksheet 尚未挂载");
    return;
  }
  const anchor = requireAnchor(s);
  if (!anchor) return;
  s.addRows(anchor.row, 1);
}

function deleteRow() {
  const s = sheet.value;
  if (!s) {
    console.warn("Worksheet 尚未挂载");
    return;
  }
  const anchor = requireAnchor(s);
  if (!anchor) return;
  s.deleteRows(anchor.row, 1);
}

function insertCol() {
  const s = sheet.value;
  if (!s) {
    console.warn("Worksheet 尚未挂载");
    return;
  }
  const anchor = requireAnchor(s);
  if (!anchor) return;
  s.addColumns(anchor.col, 1);
}

function deleteCol() {
  const s = sheet.value;
  if (!s) {
    console.warn("Worksheet 尚未挂载");
    return;
  }
  const anchor = requireAnchor(s);
  if (!anchor) return;
  s.deleteColumns(anchor.col, 1);
}

function tallerRow() {
  const s = sheet.value;
  if (!s) {
    console.warn("Worksheet 尚未挂载");
    return;
  }
  const anchor = requireAnchor(s);
  if (!anchor) return;
  s.setRowHeight(anchor.row, 36);
}

function widerCol() {
  const s = sheet.value;
  if (!s) {
    console.warn("Worksheet 尚未挂载");
    return;
  }
  const anchor = requireAnchor(s);
  if (!anchor) return;
  s.setColumnWidth(anchor.col, 140);
}

function hideRow() {
  const s = sheet.value;
  if (!s) {
    console.warn("Worksheet 尚未挂载");
    return;
  }
  const anchor = requireAnchor(s);
  if (!anchor) return;
  s.setRowVisible(anchor.row, false);
}

function freeze() {
  const s = sheet.value;
  if (!s) {
    console.warn("Worksheet 尚未挂载");
    return;
  }
  s.frozenRowCount(1);
  s.frozenColumnCount(1);
}
</script>

<template>
  <div class="lesson">
    <LessonShell title="行列操作" :ready="sheet !== null">
      <template #description>
        <p>
          行列是表格结构，不是 CSS：<code>addRows</code> / <code>deleteRows</code> /
          <code>setRowHeight</code> / <code>setRowVisible</code>。冻结窗格
          <code>frozenRowCount</code> 让表头在滚动时钉住。
        </p>
        <p>
          插入/删除/行高/隐藏以<strong>当前选区左上角</strong>为锚点。隐藏行后，点行头空白处或重新进入本课可恢复（destroy 重建）。
        </p>
      </template>
      <template #actions>
        <button :disabled="sheet === null" type="button" @click="insertRow">插入行</button>
        <button :disabled="sheet === null" type="button" @click="deleteRow">删除行</button>
        <button :disabled="sheet === null" type="button" @click="insertCol">插入列</button>
        <button :disabled="sheet === null" type="button" @click="deleteCol">删除列</button>
        <button :disabled="sheet === null" type="button" @click="tallerRow">加高当前行</button>
        <button :disabled="sheet === null" type="button" @click="widerCol">加宽当前列</button>
        <button :disabled="sheet === null" type="button" @click="hideRow">隐藏当前行</button>
        <button :disabled="sheet === null" type="button" @click="freeze">冻结首行首列</button>
      </template>
    </LessonShell>
    <div ref="host" class="spread-host" />
  </div>
</template>
