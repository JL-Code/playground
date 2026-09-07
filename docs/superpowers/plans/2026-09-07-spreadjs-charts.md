# SpreadJS 课 13 图表 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add lesson 13 that seeds a 6×4 quarterly sales table and uses `sheet.charts` to add a clustered column chart, switch it to line or pie, and remove it.

**Architecture:** Keep `useSpread` / `LessonShell` / `createEnterSeed`. Extract a pure `chartSheetArray()` seed. Import `@mescius/spread-sheets-charts` as a `main.ts` side effect. One named chart `SalesChart`; column/line bind `A1:D5`; pie binds `B1:D1,B6:D6`, falling back to contiguous `F1:G4` if the plugin rejects a union range.

**Tech Stack:** Vue 3, Vue Router, Vite, `@mescius/spread-sheets` ^19, `@mescius/spread-sheets-charts` ^19, `node:test` for the seed array.

## Global Constraints

- Do not modify lessons 1–12, `useSpread`, or install `@mescius/spread-sheets-vue`.
- Do not add Designer, Nuxt, area/bar/combo charts, chart title/legend/axis tuning, a type/range form, multiple charts, or pivot-to-chart.
- UI copy in Chinese; API identifiers stay official English (`charts.add`, `chartType`, `dataRange`).
- Buttons disabled while `sheet` is `null`. Failures: `console.warn`, no custom alert.
- License: existing `VITE_SPREADJS_LICENSE`; missing key allowed (trial watermark).
- Align charts package major with existing addons (`^19`, prefer same patch as `@mescius/spread-sheets-pivot-addon` currently `^19.2.2`).
- Entering the lesson must not add a chart; leaving and re-entering restores the seed table with no chart.
- Verification: `node --experimental-strip-types --test src/spread/chartSheet.test.ts`, `npm run build`, plus the spec’s manual checks. No Vue component tests.

---

## File structure

- Create: `src/spread/chartSheet.ts` — `chartSheetArray()` and size constants
- Create: `src/spread/chartSheet.test.ts` — shape, header, quarter labels, totals
- Create: `src/lessons/13-charts/Lesson.vue` — seed, four buttons, charts API
- Modify: `package.json` / lockfile — add `@mescius/spread-sheets-charts`
- Modify: `src/main.ts` — side-effect import the charts plugin
- Modify: `src/router.ts` — nav item and route `/lessons/charts`
- Modify: `README.md` — lesson 13 row and charts package sentence
- Modify: `TODO.md` — check off 图表

Spec: `docs/superpowers/specs/2026-09-07-spreadjs-charts-design.md`

Run tests like other `src/spread/*.test.ts` files (`.ts` import specifiers):

```bash
node --experimental-strip-types --test src/spread/chartSheet.test.ts
```

---

### Task 1: Quarterly seed array

**Files:**
- Create: `src/spread/chartSheet.ts`
- Create: `src/spread/chartSheet.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `CHART_SHEET_ROW_COUNT` (`6`), `CHART_SHEET_COL_COUNT` (`4`), `chartSheetArray(): (string | number)[][]`

- [ ] **Step 1: Write the failing test**

Create `src/spread/chartSheet.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CHART_SHEET_COL_COUNT,
  CHART_SHEET_ROW_COUNT,
  chartSheetArray,
} from "./chartSheet.ts";

test("chart sheet seed is 6 rows by 4 columns", () => {
  const table = chartSheetArray();
  assert.equal(CHART_SHEET_ROW_COUNT, 6);
  assert.equal(CHART_SHEET_COL_COUNT, 4);
  assert.equal(table.length, 6);
  for (const row of table) {
    assert.equal(row.length, 4);
  }
});

test("header and quarter labels match the spec", () => {
  const table = chartSheetArray();
  assert.deepEqual(table[0], ["季度", "键盘", "鼠标", "显示器"]);
  assert.equal(table[1]![0], "Q1");
  assert.equal(table[2]![0], "Q2");
  assert.equal(table[3]![0], "Q3");
  assert.equal(table[4]![0], "Q4");
});

test("totals row equals the sum of four quarters", () => {
  const table = chartSheetArray();
  assert.equal(table[5]![0], "合计");
  assert.deepEqual(table[5], ["合计", 51, 76, 41]);
  for (let col = 1; col <= 3; col++) {
    const sum =
      Number(table[1]![col]) +
      Number(table[2]![col]) +
      Number(table[3]![col]) +
      Number(table[4]![col]);
    assert.equal(table[5]![col], sum);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test src/spread/chartSheet.test.ts`

Expected: FAIL with module not found (`chartSheet.ts`) or `chartSheetArray` is not exported.

- [ ] **Step 3: Write minimal implementation**

Create `src/spread/chartSheet.ts`:

```ts
export const CHART_SHEET_ROW_COUNT = 6;
export const CHART_SHEET_COL_COUNT = 4;

export function chartSheetArray(): (string | number)[][] {
  return [
    ["季度", "键盘", "鼠标", "显示器"],
    ["Q1", 12, 20, 8],
    ["Q2", 15, 18, 11],
    ["Q3", 10, 22, 9],
    ["Q4", 14, 16, 13],
    ["合计", 51, 76, 41],
  ];
}
```

Do not use spreadsheet formulas. Do not add the `F1:G4` helper here (lesson 6×4 only).

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --test src/spread/chartSheet.test.ts`

Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/spread/chartSheet.ts src/spread/chartSheet.test.ts
git commit -m "feat: add chart lesson seed array"
```

---

### Task 2: Charts plugin and lesson page

**Files:**
- Modify: `package.json` (and lockfile)
- Modify: `src/main.ts`
- Create: `src/lessons/13-charts/Lesson.vue`
- Modify: `src/router.ts`

**Interfaces:**
- Consumes: `chartSheetArray()` from Task 1
- Produces: route `/lessons/charts`; sheet name `"图表"`; chart name `"SalesChart"`; `charts.add` / `chartType` / `dataRange` / `charts.remove` as specified below

- [ ] **Step 1: Install the charts addon**

From the repo root (same installer the repo already uses for other Mescius packages):

```bash
npm install @mescius/spread-sheets-charts@^19.2.2
```

If the project is pnpm-managed (`pnpm-lock.yaml` present and no `package-lock.json` in use), use `pnpm add @mescius/spread-sheets-charts@^19.2.2` instead. Do not add `@mescius/spread-sheets-vue`.

- [ ] **Step 2: Side-effect import in `main.ts`**

Keep existing imports. After the print/pdf imports, add:

```ts
import "@mescius/spread-sheets-charts";
```

The file should still create the Vue app afterward, unchanged.

- [ ] **Step 3: Add the lesson page**

Create `src/lessons/13-charts/Lesson.vue`. Follow `src/lessons/11-pivot/Lesson.vue` for `useSpread`, `createEnterSeed`, `requireSheet`, and `LessonShell`.

Constants and helpers (script):

```ts
import { ref, watch } from "vue";
import * as GC from "@mescius/spread-sheets";
import LessonShell from "../../components/LessonShell.vue";
import { chartSheetArray } from "../../spread/chartSheet";
import { createEnterSeed } from "../../spread/enterSeed";
import { useSpread } from "../../spread/useSpread";

const CHART_NAME = "SalesChart";
const COLUMN_LINE_RANGE = "A1:D5";
const PIE_UNION_RANGE = "B1:D1,B6:D6";
const PIE_HELPER_RANGE = "F1:G4";
const CHART_X = 420;
const CHART_Y = 10;
const CHART_WIDTH = 480;
const CHART_HEIGHT = 280;

const host = ref<HTMLElement | null>(null);
const { sheet } = useSpread(host);

function seed(s: GC.Spread.Sheets.Worksheet) {
  s.name("图表");
  s.setArray(0, 0, chartSheetArray());
  s.setColumnWidth(0, 80);
  s.setColumnWidth(1, 80);
  s.setColumnWidth(2, 80);
  s.setColumnWidth(3, 80);
}

watch(sheet, createEnterSeed(seed), { immediate: true });

function requireSheet(): GC.Spread.Sheets.Worksheet | null {
  const s = sheet.value;
  if (!s) {
    console.warn("Worksheet 尚未挂载");
    return null;
  }
  return s;
}

function findChart(s: GC.Spread.Sheets.Worksheet) {
  try {
    return s.charts.get(CHART_NAME);
  } catch {
    return undefined;
  }
}

function writePieHelper(s: GC.Spread.Sheets.Worksheet) {
  const table = chartSheetArray();
  const header = table[0]!;
  const total = table[5]!;
  s.setArray(0, 5, [
    ["产品", "全年"],
    [header[1]!, total[1]!],
    [header[2]!, total[2]!],
    [header[3]!, total[3]!],
  ]);
}

function addColumnChart() {
  const s = requireSheet();
  if (!s) {
    return;
  }
  if (findChart(s)) {
    s.charts.remove(CHART_NAME);
  }
  s.charts.add(
    CHART_NAME,
    GC.Spread.Sheets.Charts.ChartType.columnClustered,
    CHART_X,
    CHART_Y,
    CHART_WIDTH,
    CHART_HEIGHT,
    COLUMN_LINE_RANGE,
  );
}

function changeToLine() {
  const s = requireSheet();
  if (!s) {
    return;
  }
  const chart = findChart(s);
  if (!chart) {
    console.warn("还没有图表");
    return;
  }
  chart.chartType(GC.Spread.Sheets.Charts.ChartType.line);
  chart.dataRange(COLUMN_LINE_RANGE);
}

function changeToPie() {
  const s = requireSheet();
  if (!s) {
    return;
  }
  const chart = findChart(s);
  if (!chart) {
    console.warn("还没有图表");
    return;
  }
  chart.chartType(GC.Spread.Sheets.Charts.ChartType.pie);
  try {
    chart.dataRange(PIE_UNION_RANGE);
  } catch {
    writePieHelper(s);
    chart.dataRange(PIE_HELPER_RANGE);
  }
}

function removeChart() {
  const s = requireSheet();
  if (!s) {
    return;
  }
  if (!findChart(s)) {
    console.warn("还没有图表");
    return;
  }
  s.charts.remove(CHART_NAME);
}
```

If `charts.get` returns a falsy value instead of throwing, `findChart` still works. If `dataRange(PIE_UNION_RANGE)` does not throw but the pie is wrong (quarters as slices, or no product labels), stop using the union: call `writePieHelper` and `dataRange(PIE_HELPER_RANGE)` unconditionally in `changeToPie`, and mention the helper in the description paragraph.

Template:

```vue
<template>
  <div class="lesson">
    <LessonShell title="图表" :ready="sheet !== null">
      <template #description>
        <p>
          样例是三产品 × 四季度，末行合计（
          <code>chartSheetArray</code>）。
          <code>charts.add</code> 用簇状柱形绑
          <code>A1:D5</code>（不含合计）。同一张
          <code>SalesChart</code> 可改
          <code>chartType</code> 为折线（仍
          <code>A1:D5</code>）或饼图（
          <code>B1:D1,B6:D6</code>；若插件不接受非连续区域则绑
          <code>F1:G4</code>）。依赖
          <code>@mescius/spread-sheets-charts</code>（<code>main.ts</code>
          副作用导入）。
        </p>
      </template>
      <template #actions>
        <button :disabled="sheet === null" type="button" @click="addColumnChart">
          加柱状图
        </button>
        <button :disabled="sheet === null" type="button" @click="changeToLine">
          改成折线
        </button>
        <button :disabled="sheet === null" type="button" @click="changeToPie">
          改成饼图
        </button>
        <button :disabled="sheet === null" type="button" @click="removeChart">
          移除图表
        </button>
      </template>
    </LessonShell>
    <div ref="host" class="spread-host" />
  </div>
</template>
```

Do not add CSS. Do not bind sheet events.

- [ ] **Step 4: Register the route**

In `src/router.ts`:

- Import: `import LessonCharts from "./lessons/13-charts/Lesson.vue";`
- Append nav: `{ to: "/lessons/charts", label: "13. 图表" }`
- Append route: `{ path: "/lessons/charts", component: LessonCharts }`

Do not change other lesson paths.

- [ ] **Step 5: Typecheck / build**

Run: `npm run build`

Expected: PASS (`vue-tsc -b && vite build`). If `GC.Spread.Sheets.Charts` is missing on the type, add `import "@mescius/spread-sheets-charts";` at the top of `Lesson.vue` as well as in `main.ts`.

- [ ] **Step 6: Manual check**

Run: `npm run dev`, open `/lessons/charts`.

Expected:

- Table is 6×4: header, Q1–Q4, 合计 51 / 76 / 41; no chart yet
- 加柱状图: clustered columns to the right of the table; three series named 键盘 / 鼠标 / 显示器
- 改成折线: same chart, line; 改成饼图: same chart, three slices for the three products
- 移除图表: chart gone; 改成折线 with no chart logs `还没有图表`
- Leave and re-enter: table restored, no chart

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json pnpm-lock.yaml src/main.ts src/lessons/13-charts/Lesson.vue src/router.ts
git commit -m "feat: add charts lesson with column line and pie"
```

Only stage the lockfile that actually changed. Do not add `.env`.

---

### Task 3: README and TODO

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`

**Interfaces:**
- Consumes: lesson route and source path from Task 2
- Produces: docs that list lesson 13; TODO 图表 checked

- [ ] **Step 1: Update README**

In the lessons table, after the print row, add:

```
| 图表 | `/lessons/charts` | `src/lessons/13-charts/Lesson.vue` |
```

After the 课 12 sentence, add:

```
课 13 用 `@mescius/spread-sheets-charts` 做柱状 / 折线 / 饼图（`main.ts` 副作用导入）；样例为三产品 × 四季度 + 合计行。
```

- [ ] **Step 2: Check off TODO.md**

Change the 图表 item to:

```
- [x] **图表**  
  课 13：`charts.add` 柱状 / 折线 / 饼图。见 `docs/superpowers/specs/2026-09-07-spreadjs-charts-design.md`。
```

Leave Designer / Nuxt / 大数据量 unchecked. In the opening “已完成” sentence, add 课 13 图表.

- [ ] **Step 3: Re-run seed tests and build**

```bash
node --experimental-strip-types --test src/spread/chartSheet.test.ts
npm run build
```

Expected: tests PASS; build PASS.

- [ ] **Step 4: Commit**

```bash
git add README.md TODO.md
git commit -m "docs: mark charts lesson complete"
```

---

## Self-review

**Spec coverage:** Goal/non-goals → Global Constraints. Seed numbers and 6×4 → Task 1. Plugin, `SalesChart`, ranges, pixels, four buttons, warn copy, no enter-time chart → Task 2. README + TODO → Task 3. Pie union with `F1:G4` fallback → `changeToPie` + description. No component tests → stated.

**Placeholders:** None. Fallback is executable (`try`/`catch`, then unconditional helper if the pie is visually wrong).

**Types:** `chartSheetArray(): (string | number)[][]`; chart name `SalesChart`; ranges `A1:D5`, `B1:D1,B6:D6`, `F1:G4`; `ChartType.columnClustered` / `line` / `pie`.
