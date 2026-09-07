<script setup lang="ts">
import { ref, watch } from "vue";
import * as GC from "@mescius/spread-sheets";
import LessonShell from "../../components/LessonShell.vue";
import { useSpread } from "../../spread/useSpread";

const host = ref<HTMLElement | null>(null);
const { spread, sheet } = useSpread(host);

function seed(active: GC.Spread.Sheets.Worksheet) {
  active.name("总览");
  active.getCell(0, 0).value("Workbook ≈ createApp");
  active.getCell(1, 0).value("Worksheet ≈ 一个路由页面");
}

function whenSheetReady(fn: (s: GC.Spread.Sheets.Worksheet, wb: GC.Spread.Sheets.Workbook) => void) {
  const wb = spread.value;
  const s = sheet.value;
  if (!wb || !s) {
    console.warn("Workbook 尚未挂载");
    return;
  }
  fn(s, wb);
}

watch(sheet, (s) => {
  if (s && s.getValue(0, 0) == null) {
    seed(s);
  }
}, { immediate: true });

function addSheet() {
  whenSheetReady((_s, wb) => {
    const index = wb.getSheetCount();
    wb.addSheet(index);
    const created = wb.getSheet(index);
    created.name(`Sheet${index + 1}`);
    created.getCell(0, 0).value("新工作表");
    wb.setActiveSheetIndex(index);
  });
}

function renameBudget() {
  whenSheetReady((s) => {
    s.name("预算");
  });
}

function activateNext() {
  whenSheetReady((_s, wb) => {
    const count = wb.getSheetCount();
    if (count < 2) {
      console.warn("只有一张表，先新增 Sheet");
      return;
    }
    const next = (wb.getActiveSheetIndex() + 1) % count;
    wb.setActiveSheetIndex(next);
  });
}

function removeCurrent() {
  whenSheetReady((_s, wb) => {
    if (wb.getSheetCount() <= 1) {
      console.warn("至少保留一张工作表");
      return;
    }
    wb.removeSheet(wb.getActiveSheetIndex());
  });
}
</script>

<template>
  <div class="lesson">
    <LessonShell title="Workbook / Sheet" :ready="sheet !== null">
      <template #description>
        <p>
          <code>Workbook</code> 是整份工作簿，对应 Vue 的 <code>createApp</code>；
          <code>Worksheet</code> 是其中一张表，对应一个页面。标签栏上的名字来自
          <code>sheet.name()</code>，不是路由 path。
        </p>
        <p>
          进入本课会得到默认一张表「总览」。路由离开时 <code>useSpread</code> 会
          <code>destroy()</code>，再进来是全新实例。
        </p>
      </template>
      <template #actions>
        <button :disabled="sheet === null" type="button" @click="addSheet">新增 Sheet</button>
        <button :disabled="sheet === null" type="button" @click="renameBudget">重命名当前表为「预算」</button>
        <button :disabled="sheet === null" type="button" @click="activateNext">激活下一张表</button>
        <button :disabled="sheet === null" type="button" @click="removeCurrent">删除当前表</button>
      </template>
    </LessonShell>
    <div ref="host" class="spread-host" />
  </div>
</template>
