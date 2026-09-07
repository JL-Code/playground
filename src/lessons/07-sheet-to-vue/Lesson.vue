<script setup lang="ts">
import { onUnmounted, ref, watch } from "vue";
import * as GC from "@mescius/spread-sheets";
import LessonShell from "../../components/LessonShell.vue";
import { createEnterSeed } from "../../spread/enterSeed";
import { useSpread } from "../../spread/useSpread";

const host = ref<HTMLElement | null>(null);
const { sheet } = useSpread(host);
const selectionJson = ref("[]");
const activeValue = ref("");
const activeText = ref("");

function seed(s: GC.Spread.Sheets.Worksheet) {
  s.name("表到Vue");
  s.setArray(0, 0, [
    ["产品", "单价", "数量"],
    ["键盘", 199, 3],
    ["鼠标", 79, 5],
  ]);
}

watch(sheet, createEnterSeed(seed), { immediate: true });

function refreshFromSheet(s: GC.Spread.Sheets.Worksheet) {
  const row = s.getActiveRowIndex();
  const col = s.getActiveColumnIndex();
  const cell = s.getCell(row, col);
  activeValue.value = String(cell.value() ?? "");
  activeText.value = cell.text();
  selectionJson.value = JSON.stringify(s.getSelections());
}

function onSelectionChanged(
  _e: unknown,
  info: GC.Spread.Sheets.ISelectionChangedEventArgs,
) {
  selectionJson.value = JSON.stringify(info.newSelections);
  refreshFromSheet(info.sheet);
}

function onValueChanged(
  _e: unknown,
  info: GC.Spread.Sheets.IValueChangedEventArgs,
) {
  refreshFromSheet(info.sheet);
}

watch(
  sheet,
  (s, prev) => {
    if (prev) {
      prev.unbind(GC.Spread.Sheets.Events.SelectionChanged, onSelectionChanged);
      prev.unbind(GC.Spread.Sheets.Events.ValueChanged, onValueChanged);
    }
    if (s) {
      s.bind(GC.Spread.Sheets.Events.SelectionChanged, onSelectionChanged);
      s.bind(GC.Spread.Sheets.Events.ValueChanged, onValueChanged);
      refreshFromSheet(s);
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  const s = sheet.value;
  if (!s) {
    return;
  }
  s.unbind(GC.Spread.Sheets.Events.SelectionChanged, onSelectionChanged);
  s.unbind(GC.Spread.Sheets.Events.ValueChanged, onValueChanged);
});
</script>

<template>
  <div class="lesson">
    <LessonShell title="表 → Vue" :ready="sheet !== null">
      <template #description>
        <p>
          <code>SelectionChanged</code> / <code>ValueChanged</code> 相当于 DOM
          事件：在回调里读格子，赋给 Vue <code>ref</code>。本课不把面板写回表。
        </p>
        <div class="vue-panel">
          <pre>{{
            JSON.stringify(
              { selection: selectionJson, activeValue, activeText },
              null,
              2,
            )
          }}</pre>
        </div>
      </template>
    </LessonShell>
    <div ref="host" class="spread-host" />
  </div>
</template>
