<script setup lang="ts">
import { ref, watch } from "vue";
import * as GC from "@mescius/spread-sheets";
import LessonShell from "../../components/LessonShell.vue";
import { createEnterSeed } from "../../spread/enterSeed";
import { useSpread } from "../../spread/useSpread";

const host = ref<HTMLElement | null>(null);
const { sheet } = useSpread(host);

function seed(s: GC.Spread.Sheets.Worksheet) {
  s.name("公式");
  s.setArray(0, 0, [
    ["产品", "销售额", "合计 / 标记"],
    ["键盘", 1990, null],
    ["鼠标", 790, null],
    ["显示器", 2598, null],
  ]);
  s.getCell(5, 0).value("改 B 列数字，C 列公式会像 computed 一样重算");
}

watch(sheet, createEnterSeed(seed), { immediate: true });

function writeSum() {
  const s = sheet.value;
  if (!s) {
    console.warn("Worksheet 尚未挂载");
    return;
  }
  s.setValue(4, 0, "合计");
  s.setFormula(4, 2, "SUM(B2:B4)");
}

function writeIf() {
  const s = sheet.value;
  if (!s) {
    console.warn("Worksheet 尚未挂载");
    return;
  }
  s.setFormula(1, 2, 'IF(B2>=2000,"高","普通")');
  s.setFormula(2, 2, 'IF(B3>=2000,"高","普通")');
  s.setFormula(3, 2, 'IF(B4>=2000,"高","普通")');
}

function clearFormulas() {
  const s = sheet.value;
  if (!s) {
    console.warn("Worksheet 尚未挂载");
    return;
  }
  s.setFormula(1, 2, "");
  s.setFormula(2, 2, "");
  s.setFormula(3, 2, "");
  s.setFormula(4, 2, "");
  s.setValue(4, 0, null);
}
</script>

<template>
  <div class="lesson">
    <LessonShell title="公式" :ready="sheet !== null">
      <template #description>
        <p>
          <code>setFormula(row, col, "=SUM(...)")</code> 对应 Vue 的 <code>computed</code>：依赖单元格变了，结果自动重算。公式字符串可以带或不带前导 <code>=</code>，本课不写等号，交给 API。
        </p>
        <p>
          先点「写入 SUM」看 C5 合计，再改 B2:B4；「写入 IF」按销售额打标。
        </p>
      </template>
      <template #actions>
        <button :disabled="sheet === null" type="button" @click="writeSum">写入 SUM</button>
        <button :disabled="sheet === null" type="button" @click="writeIf">写入 IF</button>
        <button :disabled="sheet === null" type="button" @click="clearFormulas">清空公式列</button>
      </template>
    </LessonShell>
    <div ref="host" class="spread-host" />
  </div>
</template>
