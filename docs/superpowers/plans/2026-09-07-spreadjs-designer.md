# SpreadJS 课 14 Designer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add lesson 14 that mounts the official SpreadJS Designer Ribbon (vanilla constructor, not the Vue wrapper) and, via two buttons, creates an empty pivot on a new sheet with a 280px `PivotPanel` field list, then tears both down.

**Architecture:** New `useDesigner` owns `new GC.Spread.Sheets.Designer.Designer(host)` and `designer.destroy()`; do not put Ribbon into `useSpread`. Seed the Designer’s workbook with the same `createOrderMocks` + Table `OrderSource` as lesson 11. Lesson buttons call `pivotTables.add` with **no** `pivot.add` fields, then `new GC.Spread.Pivot.PivotPanel`. Ribbon stays `DefaultConfig` so the learner can poke other Designer features.

**Tech Stack:** Vue 3, Vue Router, Vite, `@mescius/spread-sheets` ^19, `@mescius/spread-sheets-designer` ^19.2.2, `@mescius/spread-sheets-designer-resources-cn` ^19.2.2, existing `@mescius/spread-sheets-pivot-addon`, `node:test` for sheet-name allocation.

## Global Constraints

- Do not modify lessons 1–13, `useSpread`, or lesson 11’s `pivot.add` recipe.
- Do not install `@mescius/spread-sheets-vue` or `@mescius/spread-sheets-designer-vue`.
- Do not add Nuxt, 大数据量, or new SpreadJS chart/print APIs in this lesson.
- UI copy in Chinese; API identifiers stay official English (`Designer`, `PivotPanel`, `pivotTables.add`).
- Buttons disabled while the workbook is not ready. Failures: `console.warn`, no custom alert.
- Sheets license: existing `VITE_SPREADJS_LICENSE`. Designer often needs a **separate** key: `VITE_SPREADJS_DESIGNER_LICENSE`, falling back to the sheets key if unset. Missing keys allowed (trial watermark / Designer license banner).
- Align designer packages to the same major as current addons (`^19`, prefer patch `19.2.2` like pivot/charts).
- Entering the lesson must show Ribbon + 明细 Table and **no** pivot / **no** field panel. Leaving and re-entering destroys Designer (no leftover Ribbon DOM).
- Do not pre-fill 产品 × 状态 × 数量求和.
- Verification: `node --experimental-strip-types --test src/spread/designerPivot.test.ts`, `npm run build`, plus spec manual checks (drag fields, remove). No Vue component tests.
- Do not mix this work with unrelated uncommitted files (e.g. charts WIP) in commits.

---

## File structure

- Create: `src/spread/designerPivot.ts` — names, panel width, `allocateSheetName`
- Create: `src/spread/designerPivot.test.ts`
- Create: `src/spread/useDesigner.ts` — Designer create/destroy, expose workbook/sheet
- Create: `src/lessons/14-designer/Lesson.vue` — seed, two buttons, panel host
- Modify: `package.json` / lockfile — designer + designer-resources-cn
- Modify: `src/main.ts` — resource import **before** designer; designer CSS
- Modify: `src/spread/license.ts` — `applyDesignerLicense()`
- Modify: `src/vite-env.d.ts` — env + module declaration
- Modify: `.env.example` — optional Designer key
- Modify: `src/router.ts` — `/lessons/designer`
- Modify: `src/styles/app.css` — designer workspace + 280px panel
- Modify: `README.md`, `TODO.md`

Spec: `docs/superpowers/specs/2026-09-07-spreadjs-designer-design.md`

Run:

```bash
node --experimental-strip-types --test src/spread/designerPivot.test.ts
```

---

### Task 1: Pivot sheet name helper

**Files:**
- Create: `src/spread/designerPivot.ts`
- Create: `src/spread/designerPivot.test.ts`

**Interfaces:**
- Consumes: `nextIndexedName` from `src/spread/uniqueSheetName.ts`
- Produces: `DESIGNER_SOURCE_SHEET` (`"明细"`), `DESIGNER_PIVOT_SHEET` (`"透视"`), `DESIGNER_SOURCE_TABLE` (`"OrderSource"`), `DESIGNER_PIVOT_NAME` (`"OrdersPivot"`), `DESIGNER_PANEL_NAME` (`"OrdersPivotPanel"`), `DESIGNER_PANEL_WIDTH` (`280`), `allocateSheetName(base: string, taken: Iterable<string>): string`

- [ ] **Step 1: Write the failing test**

Create `src/spread/designerPivot.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DESIGNER_PANEL_WIDTH,
  DESIGNER_PIVOT_NAME,
  DESIGNER_PIVOT_SHEET,
  DESIGNER_SOURCE_SHEET,
  DESIGNER_SOURCE_TABLE,
  allocateSheetName,
} from "./designerPivot.ts";

test("designer pivot constants match the spec", () => {
  assert.equal(DESIGNER_SOURCE_SHEET, "明细");
  assert.equal(DESIGNER_PIVOT_SHEET, "透视");
  assert.equal(DESIGNER_SOURCE_TABLE, "OrderSource");
  assert.equal(DESIGNER_PIVOT_NAME, "OrdersPivot");
  assert.equal(DESIGNER_PANEL_WIDTH, 280);
});

test("allocateSheetName uses the base when free", () => {
  assert.equal(allocateSheetName("透视", ["明细"]), "透视");
});

test("allocateSheetName indexes when the base is taken", () => {
  assert.equal(allocateSheetName("透视", ["明细", "透视"]), "透视_01");
  assert.equal(
    allocateSheetName("透视", ["明细", "透视", "透视_01"]),
    "透视_02",
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test src/spread/designerPivot.test.ts`

Expected: FAIL with module not found (`designerPivot.ts`).

- [ ] **Step 3: Write minimal implementation**

Create `src/spread/designerPivot.ts`:

```ts
import { nextIndexedName } from "./uniqueSheetName.ts";

export const DESIGNER_SOURCE_SHEET = "明细";
export const DESIGNER_PIVOT_SHEET = "透视";
export const DESIGNER_SOURCE_TABLE = "OrderSource";
export const DESIGNER_PIVOT_NAME = "OrdersPivot";
export const DESIGNER_PANEL_NAME = "OrdersPivotPanel";
export const DESIGNER_PANEL_WIDTH = 280;

export function allocateSheetName(
  base: string,
  taken: Iterable<string>,
): string {
  const used = new Set(taken);
  if (!used.has(base)) {
    return base;
  }
  return nextIndexedName(base, taken);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --test src/spread/designerPivot.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/spread/designerPivot.ts src/spread/designerPivot.test.ts
git commit -m "feat: add designer pivot sheet name helper"
```

---

### Task 2: Designer package, license, and `useDesigner`

**Files:**
- Modify: `package.json` (and the lockfile npm actually updates)
- Modify: `src/main.ts`
- Modify: `src/spread/license.ts`
- Modify: `src/vite-env.d.ts`
- Modify: `.env.example`
- Create: `src/spread/useDesigner.ts`

**Interfaces:**
- Consumes: `applySpreadLicense`, `applySpreadCulture`
- Produces: `applyDesignerLicense(): void`; `useDesigner(host: Ref<HTMLElement | null>): { designer: ShallowRef<GC.Spread.Sheets.Designer.Designer | null>; spread: ShallowRef<GC.Spread.Sheets.Workbook | null>; sheet: ShallowRef<GC.Spread.Sheets.Worksheet | null> }`

- [ ] **Step 1: Install Designer packages**

From the repo root:

```bash
npm install @mescius/spread-sheets-designer@19.2.2 @mescius/spread-sheets-designer-resources-cn@19.2.2
```

If 19.2.2 is unpublished for either package, install the newest `19.2.x` that exists for **both** (keep them on the same patch). Do not jump to a different major.

If the Designer constructor later throws a missing-module error for Ribbon extras (commonly `@mescius/spread-sheets-shapes` or `@mescius/spread-sheets-tablesheet`), install that package at the same `19.2.x` and add a **side-effect import only** in `main.ts`. Do not add lesson buttons for those APIs.

- [ ] **Step 2: Env and license**

In `src/vite-env.d.ts`, add:

```ts
declare module "@mescius/spread-sheets-designer-resources-cn";

interface ImportMetaEnv {
  readonly VITE_SPREADJS_LICENSE?: string;
  readonly VITE_SPREADJS_DESIGNER_LICENSE?: string;
}
```

Keep the existing `VITE_SPREADJS_LICENSE` line; do not duplicate the `ImportMetaEnv` interface—merge the new optional key into the one already there.

Append to `.env.example`:

```
# Designer Ribbon 独立发行密钥；不填则复用 VITE_SPREADJS_LICENSE
VITE_SPREADJS_DESIGNER_LICENSE=
```

Add to `src/spread/license.ts` (import designer as a side effect so `GC.Spread.Sheets.Designer` exists):

```ts
import "@mescius/spread-sheets-designer-resources-cn";
import "@mescius/spread-sheets-designer";

export function applyDesignerLicense(): void {
  const key =
    import.meta.env.VITE_SPREADJS_DESIGNER_LICENSE ??
    import.meta.env.VITE_SPREADJS_LICENSE ??
    "";
  GC.Spread.Sheets.Designer.LicenseKey = key;
}
```

Keep existing `applySpreadLicense`. Resource import must stay **before** `@mescius/spread-sheets-designer` anywhere it appears.

- [ ] **Step 3: `main.ts` side-effect imports**

After the existing charts import, add:

```ts
import "@mescius/spread-sheets-designer-resources-cn";
import "@mescius/spread-sheets-designer";
import "@mescius/spread-sheets-designer/styles/gc.spread.sheets.designer.min.css";
```

Resources before designer. Do not import `@mescius/spread-sheets-designer-vue`.

- [ ] **Step 4: Write `useDesigner`**

Create `src/spread/useDesigner.ts`:

```ts
import {
  onMounted,
  onUnmounted,
  shallowRef,
  type Ref,
  type ShallowRef,
} from "vue";
import * as GC from "@mescius/spread-sheets";
import { applySpreadCulture } from "./culture";
import { applyDesignerLicense, applySpreadLicense } from "./license";

export function useDesigner(host: Ref<HTMLElement | null>): {
  designer: ShallowRef<GC.Spread.Sheets.Designer.Designer | null>;
  spread: ShallowRef<GC.Spread.Sheets.Workbook | null>;
  sheet: ShallowRef<GC.Spread.Sheets.Worksheet | null>;
} {
  const designer = shallowRef<GC.Spread.Sheets.Designer.Designer | null>(
    null,
  );
  const spread = shallowRef<GC.Spread.Sheets.Workbook | null>(null);
  const sheet = shallowRef<GC.Spread.Sheets.Worksheet | null>(null);

  onMounted(() => {
    const el = host.value;
    if (!el) {
      console.warn("useDesigner: host element is null");
      return;
    }

    applySpreadLicense();
    applyDesignerLicense();
    applySpreadCulture();

    const instance = new GC.Spread.Sheets.Designer.Designer(el, undefined, undefined, {
      sheetCount: 1,
    });
    const workbook = instance.getWorkbook() as GC.Spread.Sheets.Workbook;
    const onActiveSheetChanged = () => {
      sheet.value = workbook.getActiveSheet();
    };

    designer.value = instance;
    spread.value = workbook;
    sheet.value = workbook.getActiveSheet();
    workbook.bind(
      GC.Spread.Sheets.Events.ActiveSheetChanged,
      onActiveSheetChanged,
    );

    onUnmounted(() => {
      workbook.unbind(
        GC.Spread.Sheets.Events.ActiveSheetChanged,
        onActiveSheetChanged,
      );
      instance.destroy();
      designer.value = null;
      spread.value = null;
      sheet.value = null;
    });
  });

  return { designer, spread, sheet };
}
```

If TypeScript complains that `Designer` is not on `GC.Spread.Sheets`, import the designer namespace:

```ts
import "@mescius/spread-sheets-designer";
```

is already in `license.ts`; `vue-tsc` should see `GC.Spread.Sheets.Designer` after that. If the constructor signature rejects `undefined` config, pass `GC.Spread.Sheets.Designer.DefaultConfig` as the second argument instead.

- [ ] **Step 5: Typecheck**

Run: `npx vue-tsc -b --pretty false`

Expected: PASS (no Designer-related errors). If `Designer.LicenseKey` typing is missing, assign via:

```ts
(
  GC.Spread.Sheets.Designer as unknown as { LicenseKey: string }
).LicenseKey = key;
```

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/main.ts src/spread/license.ts src/spread/useDesigner.ts src/vite-env.d.ts .env.example
git commit -m "feat: mount SpreadJS Designer via useDesigner"
```

Only stage the lockfile that changed. Do not add `.env`.

---

### Task 3: Lesson 14 UI — empty pivot + field panel

**Files:**
- Create: `src/lessons/14-designer/Lesson.vue`
- Modify: `src/router.ts`
- Modify: `src/styles/app.css`

**Interfaces:**
- Consumes: `useDesigner`; constants and `allocateSheetName` from Task 1; `createOrderMocks` / `orderMocksToArray`; `createEnterSeed`
- Produces: route `/lessons/designer`; nav label `14. Designer`; lesson buttons `打开字段面板` / `移除透视`

- [ ] **Step 1: CSS**

Append to `src/styles/app.css`:

```css
.lesson-workspace {
  display: flex;
  flex: 1;
  min-height: 0;
  min-width: 0;
}

.designer-host {
  flex: 1;
  min-width: 0;
  min-height: 360px;
  border: 1px solid #d0d5dd;
  background: #fff;
}

.pivot-panel-host {
  flex-shrink: 0;
  width: 280px;
  min-height: 360px;
  border: 1px solid #d0d5dd;
  border-left: none;
  background: #fff;
}

.pivot-panel-host[hidden] {
  display: none;
}
```

Do not change `.spread-host` used by lessons 1–13.

- [ ] **Step 2: Router**

In `src/router.ts`:

- Import `LessonDesigner` from `./lessons/14-designer/Lesson.vue`
- Append to `lessonNav`: `{ to: "/lessons/designer", label: "14. Designer" }`
- Append route: `{ path: "/lessons/designer", component: LessonDesigner }`

- [ ] **Step 3: Lesson page**

Create `src/lessons/14-designer/Lesson.vue` with this exact behavior (copy is part of the spec):

```vue
<script setup lang="ts">
import { onUnmounted, ref, watch } from "vue";
import * as GC from "@mescius/spread-sheets";
import LessonShell from "../../components/LessonShell.vue";
import { createEnterSeed } from "../../spread/enterSeed";
import {
  createOrderMocks,
  orderMocksToArray,
} from "../../spread/orderMocks";
import {
  DESIGNER_PANEL_NAME,
  DESIGNER_PIVOT_NAME,
  DESIGNER_PIVOT_SHEET,
  DESIGNER_SOURCE_SHEET,
  DESIGNER_SOURCE_TABLE,
  allocateSheetName,
} from "../../spread/designerPivot";
import { useDesigner } from "../../spread/useDesigner";

const HEADER_ROWS = 1;
const DATA_COUNT = 16;
const COL_COUNT = 4;

const host = ref<HTMLElement | null>(null);
const panelHost = ref<HTMLElement | null>(null);
const { spread, sheet } = useDesigner(host);
const panelOpen = ref(false);
const pivotSheetName = ref<string | null>(null);
let pivotPanel: GC.Spread.Pivot.PivotPanel | null = null;

function seed(s: GC.Spread.Sheets.Worksheet) {
  s.name(DESIGNER_SOURCE_SHEET);
  const rows = createOrderMocks({ count: DATA_COUNT, seed: 11 });
  s.setArray(0, 0, orderMocksToArray(rows));
  s.setColumnWidth(0, 100);
  s.setColumnWidth(1, 80);
  s.setColumnWidth(2, 80);
  s.setColumnWidth(3, 100);
  s.tables.add(
    DESIGNER_SOURCE_TABLE,
    0,
    0,
    HEADER_ROWS + DATA_COUNT,
    COL_COUNT,
  );
}

watch(sheet, createEnterSeed(seed), { immediate: true });

function requireWorkbook(): GC.Spread.Sheets.Workbook | null {
  const wb = spread.value;
  if (!wb) {
    console.warn("Workbook 尚未挂载");
    return null;
  }
  return wb;
}

function sheetNames(wb: GC.Spread.Sheets.Workbook): string[] {
  const names: string[] = [];
  for (let i = 0; i < wb.getSheetCount(); i++) {
    names.push(wb.getSheet(i).name());
  }
  return names;
}

function sheetIndexNamed(
  wb: GC.Spread.Sheets.Workbook,
  name: string,
): number {
  for (let i = 0; i < wb.getSheetCount(); i++) {
    if (wb.getSheet(i).name() === name) {
      return i;
    }
  }
  return -1;
}

function destroyPanel() {
  if (pivotPanel) {
    pivotPanel.destroy();
    pivotPanel = null;
  }
  panelOpen.value = false;
  panelHost.value?.replaceChildren();
}

function openFieldPanel() {
  const wb = requireWorkbook();
  if (!wb) {
    return;
  }
  if (panelOpen.value) {
    console.warn("字段面板已打开");
    return;
  }
  const name = allocateSheetName(DESIGNER_PIVOT_SHEET, sheetNames(wb));
  const index = wb.getSheetCount();
  wb.addSheet(index);
  const pivotSheet = wb.getSheet(index);
  pivotSheet.name(name);
  const pivot = pivotSheet.pivotTables.add(
    DESIGNER_PIVOT_NAME,
    DESIGNER_SOURCE_TABLE,
    0,
    0,
    GC.Spread.Pivot.PivotTableLayoutType.tabular,
    GC.Spread.Pivot.PivotTableThemes.medium2,
  );
  pivot.options.showRowHeader = true;
  pivot.options.showColumnHeader = true;
  const el = panelHost.value;
  if (!el) {
    console.warn("字段面板宿主尚未挂载");
    return;
  }
  pivotPanel = new GC.Spread.Pivot.PivotPanel(
    DESIGNER_PANEL_NAME,
    pivot,
    el,
  );
  pivotSheetName.value = name;
  panelOpen.value = true;
  wb.setActiveSheet(name);
}

function removePivot() {
  const wb = requireWorkbook();
  if (!wb) {
    return;
  }
  const name = pivotSheetName.value;
  if (!panelOpen.value || !name) {
    console.warn("还没有透视表");
    return;
  }
  destroyPanel();
  const index = sheetIndexNamed(wb, name);
  if (index < 0) {
    console.warn("未找到透视工作表");
    pivotSheetName.value = null;
    return;
  }
  const pivotSheet = wb.getSheet(index);
  try {
    if (pivotSheet.pivotTables.get(DESIGNER_PIVOT_NAME)) {
      pivotSheet.pivotTables.remove(DESIGNER_PIVOT_NAME);
    }
  } catch {
    /* get may throw when missing */
  }
  if (wb.getSheetCount() <= 1) {
    console.warn("至少保留一张工作表");
    pivotSheetName.value = null;
    return;
  }
  wb.removeSheet(index);
  const sourceIndex = sheetIndexNamed(wb, DESIGNER_SOURCE_SHEET);
  if (sourceIndex >= 0) {
    wb.setActiveSheetIndex(sourceIndex);
  }
  pivotSheetName.value = null;
}

onUnmounted(() => {
  destroyPanel();
});
</script>

<template>
  <div class="lesson">
    <LessonShell title="Designer" :ready="sheet !== null">
      <template #description>
        <p>
          本课挂官方
          <code>GC.Spread.Sheets.Designer.Designer</code>
          （Ribbon），不经过
          <code>@mescius/spread-sheets-vue</code>。进门只有明细 Table
          <code>OrderSource</code>（与课 11 同源
          <code>createOrderMocks</code>），<strong>不</strong>预置行列值。上面的 Ribbon 可以随便点，用来看 SpreadJS 能力。
        </p>
        <p>
          「打开字段面板」在<strong>新 Sheet</strong>上
          <code>pivotTables.add</code> 空透视，右侧
          <code>PivotPanel</code>（约 280px）拖筛选 / 列 / 行 / 值。课 11 仍是命令式
          <code>pivot.add</code>。
        </p>
      </template>
      <template #actions>
        <button
          :disabled="sheet === null"
          type="button"
          @click="openFieldPanel"
        >
          打开字段面板
        </button>
        <button
          :disabled="sheet === null"
          type="button"
          @click="removePivot"
        >
          移除透视
        </button>
      </template>
    </LessonShell>
    <div class="lesson-workspace">
      <div ref="host" class="designer-host" />
      <div
        ref="panelHost"
        class="pivot-panel-host"
        :hidden="!panelOpen"
      />
    </div>
  </div>
</template>
```

Do **not** call `pivot.add("产品", …)` anywhere in this file.

If `setActiveSheet(name)` is not on the typings, use `wb.setActiveSheetIndex(index)` after add.

- [ ] **Step 4: Tests + build**

```bash
node --experimental-strip-types --test src/spread/designerPivot.test.ts
npm run build
```

Expected: both PASS.

- [ ] **Step 5: Manual check (dev)**

`npm run dev`, open `/lessons/designer`:

1. Ribbon is visible; one sheet named 明细; 16 data rows; no field panel.
2. 打开字段面板 → new sheet 透视, empty pivot, 280px panel with fields; drag 产品 to rows and 数量 to values → pivot fills.
3. 移除透视 → panel gone, 透视 sheet gone, back on 明细.
4. Leave the lesson and return → fresh Designer, no leftover Ribbon.

- [ ] **Step 6: Commit**

```bash
git add src/lessons/14-designer/Lesson.vue src/router.ts src/styles/app.css
git commit -m "feat: add Designer lesson with empty pivot field panel"
```

---

### Task 4: README and TODO

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`

**Interfaces:**
- Consumes: lesson route and source path from Task 3
- Produces: docs that list lesson 14; TODO Designer checked; Nuxt and 大数据量 still open

- [ ] **Step 1: Update README**

In the lessons table, after the 图表 row, add:

```
| Designer | `/lessons/designer` | `src/lessons/14-designer/Lesson.vue` |
```

After the 课 13 sentence, add:

```
课 14 用 `@mescius/spread-sheets-designer` 挂 Ribbon（`useDesigner`，不是 `useSpread`）；透视走新 Sheet 空表 + `PivotPanel`，不硬编码 `pivot.add`。Designer 密钥见 `.env.example` 的 `VITE_SPREADJS_DESIGNER_LICENSE`。
```

- [ ] **Step 2: Check off TODO.md**

Change the Designer item to checked, keep the existing explanation and spec path. Leave Nuxt and 大数据量 unchecked. In the opening “已完成” sentence, add 课 14 Designer.

- [ ] **Step 3: Re-run tests and build**

```bash
node --experimental-strip-types --test src/spread/designerPivot.test.ts
npm run build
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add README.md TODO.md
git commit -m "docs: mark Designer lesson complete"
```

---

## Self-review

**Spec coverage:** Ribbon Designer + not `useSpread` → Task 2. Excel-style empty pivot on new sheet + 280px `PivotPanel` + no `pivot.add` → Task 3. Same `OrderSource` / `createOrderMocks` as lesson 11, lesson 11 untouched → Task 3 seed. License extra key → Task 2 `.env.example`. Route `/lessons/designer` → Task 3. README/TODO → Task 4. Non-goals (Nuxt, vue wrapper, changing lesson 11) → Global Constraints.

**Placeholders:** Missing-module fallback for shapes/tablesheet is a concrete install+side-effect-import, not “handle later”. Constructor config fallback is `DefaultConfig` if `undefined` fails types.

**Types:** `allocateSheetName(base: string, taken: Iterable<string>): string`; `useDesigner` returns designer/spread/sheet shallow refs; pivot name `OrdersPivot`; table `OrderSource`; panel width `280`.
