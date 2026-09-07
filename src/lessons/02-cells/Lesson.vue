<script setup lang="ts">
import { ref, watch } from "vue";
import * as GC from "@mescius/spread-sheets";
import LessonShell from "../../components/LessonShell.vue";
import { useSpread } from "../../spread/useSpread";

const host = ref<HTMLElement | null>(null);
const { sheet } = useSpread(host);
const readout = ref("");

function seed(s: GC.Spread.Sheets.Worksheet) {
  s.name("单元格");
  s.getCell(0, 0).value("产品");
  s.getCell(0, 1).value("单价");
  s.setValue(1, 0, "占位 — 点「写入样例数据块」");
}

watch(sheet, (s) => {
  if (s && s.getValue(0, 0) == null) seed(s);
}, { immediate: true });

function writeSample() {
  const s = sheet.value;
  if (!s) {
    console.warn("Worksheet 尚未挂载");
    return;
  }
  s.setArray(0, 0, [
    ["产品", "单价", "数量"],
    ["键盘", 199, 3],
    ["鼠标", 79, 5],
    ["显示器", 1299, 2],
  ]);
}

function readA1() {
  const s = sheet.value;
  if (!s) {
    console.warn("Worksheet 尚未挂载");
    return;
  }
  const cell = s.getCell(0, 0);
  readout.value = `A1 value=${String(cell.value())} text=${cell.text()}`;
}

function readSelection() {
  const s = sheet.value;
  if (!s) {
    console.warn("Worksheet 尚未挂载");
    return;
  }
  const selections = s.getSelections();
  readout.value = JSON.stringify(selections);
}
</script>

<template>
  <div class="lesson">
    <LessonShell title="单元格读写" :ready="sheet !== null">
      <template #description>
        <p>
          <code>getCell(row, col).value()</code> / <code>setValue</code> 相当于对
          <code>ref</code> 读写。<code>text()</code> 是显示字符串，可能和底层 value 不同（例如日期）。
        </p>
        <p>
          <code>setArray</code> 一次写入一块矩形区域。<code>getSelections()</code> 返回当前选区（零基行列）。
        </p>
        <p v-if="readout">读取结果：{{ readout }}</p>
      </template>
      <template #actions>
        <button :disabled="sheet === null" type="button" @click="writeSample">写入样例数据块</button>
        <button :disabled="sheet === null" type="button" @click="readA1">读取 A1</button>
        <button :disabled="sheet === null" type="button" @click="readSelection">读取当前选区</button>
      </template>
    </LessonShell>
    <div ref="host" class="spread-host" />
  </div>
</template>
