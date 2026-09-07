<script setup lang="ts">
import { onUnmounted, ref, watch } from "vue";
import * as GC from "@mescius/spread-sheets";
import LessonShell from "../../components/LessonShell.vue";
import { createEnterSeed } from "../../spread/enterSeed";
import {
  DEFAULT_ORDERS,
  arrayToOrders,
  ordersToArray,
  shouldReadOrdersFromEvent,
  type Order,
} from "../../spread/orders";
import { useSpread } from "../../spread/useSpread";

const host = ref<HTMLElement | null>(null);
const { sheet } = useSpread(host);
const orders = ref<Order[]>(DEFAULT_ORDERS.map((row) => ({ ...row })));
let syncing = false;

function writeOrders(s: GC.Spread.Sheets.Worksheet) {
  syncing = true;
  try {
    s.setArray(0, 0, ordersToArray(orders.value));
  } finally {
    syncing = false;
  }
}

function seed(s: GC.Spread.Sheets.Worksheet) {
  s.name("双向");
  writeOrders(s);
}

watch(sheet, createEnterSeed(seed), { immediate: true });

function writeVueToSheet() {
  const s = sheet.value;
  if (!s) {
    console.warn("Worksheet 尚未挂载");
    return;
  }
  writeOrders(s);
}

function resetOrders() {
  orders.value = DEFAULT_ORDERS.map((row) => ({ ...row }));
  writeVueToSheet();
}

function onValueChanged(
  _e: unknown,
  info: GC.Spread.Sheets.IValueChangedEventArgs,
) {
  if (!shouldReadOrdersFromEvent(syncing, info.row)) {
    return;
  }
  const s = info.sheet;
  const rowCount = 1 + Math.max(orders.value.length, 1);
  const rows = s.getArray(0, 0, rowCount, 3) as unknown[][];
  orders.value = arrayToOrders(rows);
}

watch(
  sheet,
  (s, prev) => {
    if (prev) {
      prev.unbind(GC.Spread.Sheets.Events.ValueChanged, onValueChanged);
    }
    if (s) {
      s.bind(GC.Spread.Sheets.Events.ValueChanged, onValueChanged);
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  sheet.value?.unbind(GC.Spread.Sheets.Events.ValueChanged, onValueChanged);
});
</script>

<template>
  <div class="lesson">
    <LessonShell title="双向订单表" :ready="sheet !== null">
      <template #description>
        <p>
          <code>setArray</code> 会触发 <code>ValueChanged</code>。用
          <code>syncing</code> 在写入期间忽略回调，避免死循环。表头（第 0 行）不写回
          <code>orders</code>。
        </p>
        <div class="vue-panel">
          <pre>{{ JSON.stringify(orders, null, 2) }}</pre>
        </div>
      </template>
      <template #actions>
        <button :disabled="sheet === null" type="button" @click="writeVueToSheet">
          Vue → 表
        </button>
        <button :disabled="sheet === null" type="button" @click="resetOrders">
          重置订单
        </button>
      </template>
    </LessonShell>
    <div ref="host" class="spread-host" />
  </div>
</template>
