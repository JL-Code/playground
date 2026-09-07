<script setup lang="ts">
import { ref, watch } from "vue";
import * as GC from "@mescius/spread-sheets";
import LessonShell from "../../components/LessonShell.vue";
import { useSpread } from "../../spread/useSpread";

const host = ref<HTMLElement | null>(null);
const { sheet } = useSpread(host);

function seed(s: GC.Spread.Sheets.Worksheet) {
  s.name("样式");
  s.setArray(0, 0, [
    ["项目", "金额", "占比", "日期"],
    ["键盘", 1990, 0.37, new Date(2026, 8, 1)],
    ["鼠标", 790, 0.15, new Date(2026, 8, 2)],
    ["显示器", 2598, 0.48, new Date(2026, 8, 3)],
  ]);
  s.setColumnWidth(0, 100);
  s.setColumnWidth(1, 120);
  s.setColumnWidth(2, 100);
  s.setColumnWidth(3, 120);
}

watch(sheet, (s) => {
  if (s && s.getValue(0, 0) == null) seed(s);
}, { immediate: true });

function eachSelectedCell(s: GC.Spread.Sheets.Worksheet, fn: (row: number, col: number) => void) {
  const selections = s.getSelections();
  if (!selections.length) {
    console.warn("请先选中单元格");
    return;
  }
  for (const range of selections) {
    if (range.row === -1 || range.col === -1) {
      console.warn("整行/整列选区请改用单元格区域");
      continue;
    }
    for (let r = range.row; r < range.row + range.rowCount; r++) {
      for (let c = range.col; c < range.col + range.colCount; c++) {
        fn(r, c);
      }
    }
  }
}

function applyHeaderStyle() {
  const s = sheet.value;
  if (!s) {
    console.warn("Worksheet 尚未挂载");
    return;
  }
  eachSelectedCell(s, (row, col) => {
    const style = new GC.Spread.Sheets.Style();
    style.font = "bold 13px sans-serif";
    style.foreColor = "#ffffff";
    style.backColor = "#4472C4";
    style.hAlign = GC.Spread.Sheets.HorizontalAlign.center;
    style.borderBottom = new GC.Spread.Sheets.LineBorder("#2F5496", GC.Spread.Sheets.LineStyle.thin);
    s.setStyle(row, col, style);
  });
}

function applyCurrency() {
  const s = sheet.value;
  if (!s) {
    console.warn("Worksheet 尚未挂载");
    return;
  }
  eachSelectedCell(s, (row, col) => {
    s.getCell(row, col).formatter("¥#,##0.00");
  });
}

function applyPercent() {
  const s = sheet.value;
  if (!s) {
    console.warn("Worksheet 尚未挂载");
    return;
  }
  eachSelectedCell(s, (row, col) => {
    s.getCell(row, col).formatter("0%");
  });
}

function applyDate() {
  const s = sheet.value;
  if (!s) {
    console.warn("Worksheet 尚未挂载");
    return;
  }
  eachSelectedCell(s, (row, col) => {
    s.getCell(row, col).formatter("yyyy-mm-dd");
  });
}

function clearStyle() {
  const s = sheet.value;
  if (!s) {
    console.warn("Worksheet 尚未挂载");
    return;
  }
  eachSelectedCell(s, (row, col) => {
    s.setStyle(row, col, new GC.Spread.Sheets.Style());
    s.getCell(row, col).formatter("");
  });
}
</script>

<template>
  <div class="lesson">
    <LessonShell title="样式" :ready="sheet !== null">
      <template #description>
        <p>
          <code>Style</code> 相当于 class：字体、前景/背景、对齐、边框。数字格式是
          <code>formatter</code>，不是 CSS。按钮作用于<strong>当前选区</strong>。
        </p>
        <p>
          建议：选中第 1 行点「标题样式」；选中金额列点「货币」；占比列点「百分比」；日期列点「日期」。
        </p>
      </template>
      <template #actions>
        <button :disabled="sheet === null" type="button" @click="applyHeaderStyle">标题样式</button>
        <button :disabled="sheet === null" type="button" @click="applyCurrency">货币</button>
        <button :disabled="sheet === null" type="button" @click="applyPercent">百分比</button>
        <button :disabled="sheet === null" type="button" @click="applyDate">日期</button>
        <button :disabled="sheet === null" type="button" @click="clearStyle">清除样式</button>
      </template>
    </LessonShell>
    <div ref="host" class="spread-host" />
  </div>
</template>
