<script setup lang="ts">
import { ref, watch } from "vue";
import * as GC from "@mescius/spread-sheets";
import LessonShell from "../../components/LessonShell.vue";
import { createEnterSeed } from "../../spread/enterSeed";
import { useSpread } from "../../spread/useSpread";

const host = ref<HTMLElement | null>(null);
const { sheet } = useSpread(host);
const productName = ref("键盘");
const qty = ref(3);

function seed(s: GC.Spread.Sheets.Worksheet) {
  s.name("Vue到表");
  s.setArray(0, 0, [
    ["产品", "单价", "数量"],
    ["占位", "", ""],
  ]);
}

watch(sheet, createEnterSeed(seed), { immediate: true });

function writeFromVue() {
  const s = sheet.value;
  if (!s) {
    console.warn("Worksheet 尚未挂载");
    return;
  }
  s.setValue(1, 1, productName.value);
  s.setValue(1, 2, qty.value);
}
</script>

<template>
  <div class="lesson">
    <LessonShell title="Vue → 表" :ready="sheet !== null">
      <template #description>
        <p>
          改左侧的 Vue <code>ref</code> 不会自动改格子，必须调用
          <code>setValue</code>。对照：你更新 data，再手动 patch DOM。
        </p>
        <div class="vue-panel">
          <label>
            productName
            <input v-model="productName" type="text" />
          </label>
          <label>
            qty
            <input v-model.number="qty" type="number" />
          </label>
          <pre>{{ JSON.stringify({ productName, qty }, null, 2) }}</pre>
        </div>
      </template>
      <template #actions>
        <button :disabled="sheet === null" type="button" @click="writeFromVue">
          把 Vue 写入 B2/C2
        </button>
      </template>
    </LessonShell>
    <div ref="host" class="spread-host" />
  </div>
</template>
