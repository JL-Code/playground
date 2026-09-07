# SpreadJS Vue3 Playground Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Vite + Vue 3 + TypeScript SPA with five routed SpreadJS lessons covering Workbook/Sheet, cells, formulas, styles, and rows/columns.

**Architecture:** Each lesson is a Vue route that mounts a host `div` and calls `useSpread` to create a `GC.Spread.Sheets.Workbook` on mount and `destroy()` it on unmount. Lesson pages write sample data on init and expose buttons that call SpreadJS APIs directly. There is no Pinia; workbook state lives only inside SpreadJS.

**Tech Stack:** Vite, Vue 3, TypeScript, Vue Router, `@mescius/spread-sheets` (core only).

## Global Constraints

- Vite SPA only — no Nuxt, no SSR.
- Install `@mescius/spread-sheets`; do **not** install `@mescius/spread-sheets-vue`.
- Do **not** add Designer, charts, pivot, or Excel IO packages.
- Do **not** add Pinia or mirror sheet data into Vue reactive objects.
- Do **not** add component unit tests or an in-browser code editor.
- UI copy in Chinese; API identifiers stay official English (`getCell`, `setFormula`, etc.).
- License: `GC.Spread.Sheets.LicenseKey = import.meta.env.VITE_SPREADJS_LICENSE ?? ""` before constructing a Workbook. Missing key is allowed (trial watermark).
- `.env` (real key) must not be committed; `.env.example` with empty key is committed.
- `package.json` scripts: `dev`, `build`, `preview`.
- Workbook must be destroyed when leaving a lesson so the next visit is a fresh instance.
- Left nav ~240px; lesson chrome (title, 3–6 sentence explanation, buttons) above a host that fills remaining height. Light documentation-site look, not a fake Excel chrome.
- Buttons disabled while `sheet` is `null`. Unexpected errors: `console.warn`, no modal error UI.
- Verification is `vue-tsc` / `vite build` plus the spec’s manual checks, not unit tests.

---

## File structure

Create these files (repo currently has only git metadata and the design spec):

- `package.json` — deps and scripts
- `index.html` — Vite HTML entry
- `vite.config.ts` — Vue plugin
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` — TS project
- `.gitignore` — `node_modules`, `dist`, `.env`
- `.env.example` — `VITE_SPREADJS_LICENSE=`
- `README.md` — how to run and where lessons live
- `src/main.ts` — app bootstrap, SpreadJS CSS, license side-effect import
- `src/vite-env.d.ts` — `ImportMetaEnv`
- `src/App.vue` — sidebar + `<router-view>`
- `src/router.ts` — five lesson routes, default redirect to lesson 1
- `src/styles/app.css` — layout
- `src/spread/license.ts` — set license key
- `src/spread/useSpread.ts` — workbook lifecycle
- `src/components/LessonShell.vue` — shared lesson chrome
- `src/lessons/01-workbook/Lesson.vue`
- `src/lessons/02-cells/Lesson.vue`
- `src/lessons/03-formulas/Lesson.vue`
- `src/lessons/04-styles/Lesson.vue`
- `src/lessons/05-rows-cols/Lesson.vue`

---

### Task 1: Vite Vue TypeScript scaffold

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `src/vite-env.d.ts`
- Create: `src/main.ts`
- Create: `src/App.vue`
- Create: `src/styles/app.css`

**Interfaces:**
- Consumes: empty app directory (keep `docs/` and `.git`)
- Produces: runnable Vite app; `import.meta.env.VITE_SPREADJS_LICENSE` typed as `string | undefined`

- [ ] **Step 1: Write package manifest**

```json
{
  "name": "spreadjs-playground",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@mescius/spread-sheets": "^19.1.0",
    "vue": "^3.5.13",
    "vue-router": "^4.5.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.2.3",
    "typescript": "~5.7.3",
    "vite": "^6.2.0",
    "vue-tsc": "^2.2.8"
  }
}
```

- [ ] **Step 2: Write Vite / TS / HTML entry files**

`index.html`:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SpreadJS Playground</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

`vite.config.ts`:

```ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
});
```

`tsconfig.json`:

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

`tsconfig.app.json`:

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"]
}
```

`tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}
```

`.gitignore`:

```
node_modules
dist
.env
*.local
.DS_Store
```

`.env.example`:

```
VITE_SPREADJS_LICENSE=
```

`src/vite-env.d.ts`:

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SPREADJS_LICENSE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<object, object, unknown>;
  export default component;
}
```

`src/styles/app.css` (minimal so Task 1 builds; layout completed in Task 3):

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body,
#app {
  margin: 0;
  height: 100%;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  color: #1a1a1a;
  background: #f4f5f7;
}
```

`src/App.vue`:

```vue
<script setup lang="ts"></script>

<template>
  <p>SpreadJS playground scaffold</p>
</template>
```

`src/main.ts`:

```ts
import { createApp } from "vue";
import App from "./App.vue";
import "./styles/app.css";

createApp(App).mount("#app");
```

- [ ] **Step 3: Install and typecheck/build**

Run:

```bash
npm install
npm run build
```

Expected: install succeeds; `vue-tsc -b && vite build` exits 0 and writes `dist/`.

If `@mescius/spread-sheets@^19.1.0` is unpublished or peer-conflicts, install the latest 19.x that `npm view @mescius/spread-sheets version` reports, and keep it in `package.json`.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json index.html vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json .gitignore .env.example src/vite-env.d.ts src/main.ts src/App.vue src/styles/app.css
git commit -m "$(cat <<'EOF'
chore: scaffold Vite Vue TypeScript app for SpreadJS playground

EOF
)"
```

---

### Task 2: License helper and `useSpread`

**Files:**
- Create: `src/spread/license.ts`
- Create: `src/spread/useSpread.ts`
- Modify: `src/main.ts`

**Interfaces:**
- Consumes: Vue 3 app from Task 1; `@mescius/spread-sheets` from Task 1
- Produces:
  - `applySpreadLicense(): void`
  - `useSpread(host: Ref<HTMLElement | null>): { spread: ShallowRef<GC.Spread.Sheets.Workbook | null>; sheet: ShallowRef<GC.Spread.Sheets.Worksheet | null> }`

- [ ] **Step 1: Write license + composable**

`src/spread/license.ts`:

```ts
import * as GC from "@mescius/spread-sheets";

export function applySpreadLicense(): void {
  GC.Spread.Sheets.LicenseKey = import.meta.env.VITE_SPREADJS_LICENSE ?? "";
}
```

`src/spread/useSpread.ts`:

```ts
import { onMounted, onUnmounted, shallowRef, type Ref, type ShallowRef } from "vue";
import * as GC from "@mescius/spread-sheets";
import { applySpreadLicense } from "./license";

export function useSpread(host: Ref<HTMLElement | null>): {
  spread: ShallowRef<GC.Spread.Sheets.Workbook | null>;
  sheet: ShallowRef<GC.Spread.Sheets.Worksheet | null>;
} {
  const spread = shallowRef<GC.Spread.Sheets.Workbook | null>(null);
  const sheet = shallowRef<GC.Spread.Sheets.Worksheet | null>(null);

  onMounted(() => {
    const el = host.value;
    if (!el) {
      console.warn("useSpread: host element is null");
      return;
    }

    applySpreadLicense();
    const workbook = new GC.Spread.Sheets.Workbook(el, { sheetCount: 1 });
    spread.value = workbook;
    sheet.value = workbook.getActiveSheet();

    workbook.bind(GC.Spread.Sheets.Events.ActiveSheetChanged, () => {
      sheet.value = workbook.getActiveSheet();
    });
  });

  onUnmounted(() => {
    spread.value?.destroy();
    spread.value = null;
    sheet.value = null;
  });

  return { spread, sheet };
}
```

If TypeScript complains about `Workbook` / `Worksheet` namespaces, import the types the package actually exports (check `node_modules/@mescius/spread-sheets/index.d.ts`) and keep the public return shape `spread` + `sheet` as `ShallowRef`.

- [ ] **Step 2: Import SpreadJS CSS once at bootstrap**

Replace `src/main.ts` with:

```ts
import { createApp } from "vue";
import App from "./App.vue";
import "./styles/app.css";
import "@mescius/spread-sheets/styles/gc.spread.sheets.excel2013white.css";

createApp(App).mount("#app");
```

If that CSS path 404s at build time, list `node_modules/@mescius/spread-sheets/styles/` and import the Excel white theme file that exists (name may include `excel2013white` or `excel2016colorful`). Prefer the white theme.

Do **not** wire the router yet; CSS import is enough to prove the package resolves.

- [ ] **Step 3: Build**

Run:

```bash
npm run build
```

Expected: exit 0. Unused `useSpread` may trigger `noUnusedLocals` only if imported; it is a module export, so it should compile. If CSS import fails, fix the path as in Step 2.

- [ ] **Step 4: Commit**

```bash
git add src/spread/license.ts src/spread/useSpread.ts src/main.ts
git commit -m "$(cat <<'EOF'
feat: add SpreadJS license helper and workbook composable

EOF
)"
```

---

### Task 3: App chrome, router, LessonShell

**Files:**
- Create: `src/router.ts`
- Create: `src/components/LessonShell.vue`
- Create: `src/lessons/01-workbook/Lesson.vue` (placeholder host so the shell is testable)
- Modify: `src/App.vue`
- Modify: `src/main.ts`
- Modify: `src/styles/app.css`

**Interfaces:**
- Consumes: `useSpread` from Task 2
- Produces:
  - Routes: `/lessons/workbook`, `/lessons/cells`, `/lessons/formulas`, `/lessons/styles`, `/lessons/rows-cols`
  - `/` redirects to `/lessons/workbook`
  - `LessonShell` props: `title: string`, `ready: boolean`; slots: `description`, `actions`, default unused; host is inside the shell via slot `sheet` **or** parent passes host outside — **use this exact API:**

`LessonShell.vue` props + slots:

- Props: `title: string`, `ready: boolean`
- Slots: `description` (Chinese explanation), `actions` (buttons)
- The host `div` is **not** inside LessonShell. Parent lesson owns `ref="host"` so `useSpread(host)` stays in the lesson SFC.

- [ ] **Step 1: Write LessonShell, router, App layout**

`src/components/LessonShell.vue`:

```vue
<script setup lang="ts">
defineProps<{
  title: string;
  ready: boolean;
}>();
</script>

<template>
  <header class="lesson-header">
    <h1>{{ title }}</h1>
    <div class="lesson-description">
      <slot name="description" />
    </div>
    <div class="lesson-actions" :data-ready="ready">
      <slot name="actions" />
    </div>
  </header>
</template>
```

`src/lessons/01-workbook/Lesson.vue` (temporary: host + destroy cycle only; buttons come in Task 4):

```vue
<script setup lang="ts">
import { ref } from "vue";
import LessonShell from "../../components/LessonShell.vue";
import { useSpread } from "../../spread/useSpread";

const host = ref<HTMLElement | null>(null);
const { sheet } = useSpread(host);
</script>

<template>
  <div class="lesson">
    <LessonShell title="Workbook / Sheet" :ready="sheet !== null">
      <template #description>
        <p>
          Workbook 相当于 Vue 的 createApp，Worksheet 相当于一个页面。这一课先确认表格能挂上，按钮在下一课补全。
        </p>
      </template>
    </LessonShell>
    <div ref="host" class="spread-host" />
  </div>
</template>
```

Temporary stub pages so every nav item has a component (replace in later tasks with real lessons). Create:

`src/lessons/02-cells/Lesson.vue`, `src/lessons/03-formulas/Lesson.vue`, `src/lessons/04-styles/Lesson.vue`, `src/lessons/05-rows-cols/Lesson.vue` — same structure as 01, only `title` and one `<p>` change:

- 02 title `单元格读写`, description `对照 ref 读写单元格。完整按钮见后续实现。`
- 03 title `公式`, description `对照 computed。完整按钮见后续实现。`
- 04 title `样式`, description `对照 class / 格式化。完整按钮见后续实现。`
- 05 title `行列操作`, description `插入删除行列、行高列宽、冻结。完整按钮见后续实现。`

Each stub must call `useSpread(host)` so leaving a route destroys the workbook.

`src/router.ts`:

```ts
import { createRouter, createWebHistory } from "vue-router";
import LessonWorkbook from "./lessons/01-workbook/Lesson.vue";
import LessonCells from "./lessons/02-cells/Lesson.vue";
import LessonFormulas from "./lessons/03-formulas/Lesson.vue";
import LessonStyles from "./lessons/04-styles/Lesson.vue";
import LessonRowsCols from "./lessons/05-rows-cols/Lesson.vue";

export const lessonNav = [
  { to: "/lessons/workbook", label: "1. Workbook / Sheet" },
  { to: "/lessons/cells", label: "2. 单元格读写" },
  { to: "/lessons/formulas", label: "3. 公式" },
  { to: "/lessons/styles", label: "4. 样式" },
  { to: "/lessons/rows-cols", label: "5. 行列操作" },
] as const;

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/lessons/workbook" },
    { path: "/lessons/workbook", component: LessonWorkbook },
    { path: "/lessons/cells", component: LessonCells },
    { path: "/lessons/formulas", component: LessonFormulas },
    { path: "/lessons/styles", component: LessonStyles },
    { path: "/lessons/rows-cols", component: LessonRowsCols },
  ],
});
```

`src/App.vue`:

```vue
<script setup lang="ts">
import { lessonNav } from "./router";
</script>

<template>
  <div class="app-shell">
    <nav class="sidebar" aria-label="课程">
      <p class="brand">SpreadJS Playground</p>
      <RouterLink
        v-for="item in lessonNav"
        :key="item.to"
        :to="item.to"
        class="nav-link"
        active-class="nav-link-active"
      >
        {{ item.label }}
      </RouterLink>
    </nav>
    <main class="main">
      <RouterView />
    </main>
  </div>
</template>
```

Replace `src/main.ts` with:

```ts
import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router";
import "./styles/app.css";
import "@mescius/spread-sheets/styles/gc.spread.sheets.excel2013white.css";

createApp(App).use(router).mount("#app");
```

Replace `src/styles/app.css` with:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body,
#app {
  margin: 0;
  height: 100%;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  color: #1a1a1a;
  background: #f4f5f7;
}

.app-shell {
  display: flex;
  height: 100%;
}

.sidebar {
  width: 240px;
  flex-shrink: 0;
  padding: 16px 12px;
  background: #fff;
  border-right: 1px solid #e3e5e8;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.brand {
  margin: 0 8px 12px;
  font-weight: 650;
  font-size: 14px;
}

.nav-link {
  display: block;
  padding: 8px 10px;
  border-radius: 6px;
  color: #333;
  text-decoration: none;
  font-size: 13px;
}

.nav-link:hover {
  background: #f0f2f5;
}

.nav-link-active {
  background: #e8f0fe;
  color: #174ea6;
  font-weight: 600;
}

.main {
  flex: 1;
  min-width: 0;
  padding: 16px;
}

.lesson {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 12px;
}

.lesson-header h1 {
  margin: 0 0 8px;
  font-size: 20px;
}

.lesson-description p {
  margin: 0 0 8px;
  font-size: 14px;
  line-height: 1.55;
  color: #444;
}

.lesson-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.lesson-actions button {
  appearance: none;
  border: 1px solid #c5c9d0;
  background: #fff;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 13px;
  cursor: pointer;
}

.lesson-actions button:hover:not(:disabled) {
  background: #f6f7f9;
}

.lesson-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spread-host {
  flex: 1;
  min-height: 280px;
  width: 100%;
  border: 1px solid #d0d5dd;
  background: #fff;
}
```

- [ ] **Step 2: Build**

Run:

```bash
npm run build
```

Expected: exit 0.

- [ ] **Step 3: Manual check**

Run `npm run dev`. Open the app. Confirm: left nav 240px, five links, default route is Workbook lesson, a spreadsheet canvas appears, clicking another lesson still shows a canvas (stubs). Switching back to lesson 1 still shows a sheet (destroy/recreate).

- [ ] **Step 4: Commit**

```bash
git add src/router.ts src/components/LessonShell.vue src/lessons src/App.vue src/main.ts src/styles/app.css
git commit -m "$(cat <<'EOF'
feat: add lesson layout, router, and workbook host

EOF
)"
```

---

### Task 4: Lesson 1 Workbook / Sheet

**Files:**
- Modify: `src/lessons/01-workbook/Lesson.vue`

**Interfaces:**
- Consumes: `useSpread` → `{ spread, sheet }`; `LessonShell`
- Produces: buttons 新增 Sheet、重命名当前表为「预算」、激活下一张表、删除当前表

- [ ] **Step 1: Replace the workbook lesson with real actions**

`src/lessons/01-workbook/Lesson.vue`:

```vue
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
```

- [ ] **Step 2: Build**

Run `npm run build`. Expected: exit 0.

- [ ] **Step 3: Manual check**

`npm run dev`, open Workbook 课: A1/A2 有对照说明；新增 Sheet 出现新标签；重命名把当前标签改为「预算」；激活下一张表切换标签；删到只剩一张时控制台 warn，表还在。离开再进入：只剩「总览」，之前新增的表消失。

- [ ] **Step 4: Commit**

```bash
git add src/lessons/01-workbook/Lesson.vue
git commit -m "$(cat <<'EOF'
feat: add Workbook and Sheet lesson actions

EOF
)"
```

---

### Task 5: Lesson 2 单元格读写

**Files:**
- Modify: `src/lessons/02-cells/Lesson.vue`

**Interfaces:**
- Consumes: `useSpread` → `sheet`; `LessonShell`
- Produces: buttons 写入样例数据块、读取 A1、读取当前选区

- [ ] **Step 1: Implement the cells lesson**

```vue
<script setup lang="ts">
import { ref, watch } from "vue";
import type * as GC from "@mescius/spread-sheets";
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
```

If `import type * as GC` cannot be used as a value-type for `Worksheet`, switch to `import * as GC from "@mescius/spread-sheets"` like lesson 1.

- [ ] **Step 2: Build**

`npm run build` — exit 0.

- [ ] **Step 3: Manual check**

写入样例后 A1:C4 出现产品表；读取 A1 在说明区显示 value/text；拖选几个格子后「读取当前选区」显示 JSON。

- [ ] **Step 4: Commit**

```bash
git add src/lessons/02-cells/Lesson.vue
git commit -m "$(cat <<'EOF'
feat: add cell read and write lesson

EOF
)"
```

---

### Task 6: Lesson 3 公式

**Files:**
- Modify: `src/lessons/03-formulas/Lesson.vue`

**Interfaces:**
- Consumes: `useSpread` → `sheet`
- Produces: sample sales grid on enter; buttons 写入 SUM、写入 IF、清空公式列

- [ ] **Step 1: Implement the formulas lesson**

```vue
<script setup lang="ts">
import { ref, watch } from "vue";
import * as GC from "@mescius/spread-sheets";
import LessonShell from "../../components/LessonShell.vue";
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

watch(sheet, (s) => {
  if (s && s.getValue(0, 0) == null) seed(s);
}, { immediate: true });

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
```

If `setFormula` requires a leading `=`, use `"=SUM(B2:B4)"` and `"=IF(B2>=2000,\"高\",\"普通\")"`. Confirm against the installed d.ts / runtime in this task.

- [ ] **Step 2: Build**

`npm run build` — exit 0.

- [ ] **Step 3: Manual check**

SUM 后 C5（第 5 行 C 列，零基 row 4 col 2）显示 1990+790+2598；改 B2 后合计变；IF 在 C2:C4 显示 高/普通。

- [ ] **Step 4: Commit**

```bash
git add src/lessons/03-formulas/Lesson.vue
git commit -m "$(cat <<'EOF'
feat: add formula lesson with SUM and IF

EOF
)"
```

---

### Task 7: Lesson 4 样式

**Files:**
- Modify: `src/lessons/04-styles/Lesson.vue`

**Interfaces:**
- Consumes: `useSpread` → `sheet`
- Produces: sample numbers/dates on enter; buttons apply to **current selection**: 标题样式、货币、百分比、日期、清除样式

- [ ] **Step 1: Implement the styles lesson**

```vue
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
```

If `range.row` is `-1` for whole-column selection, skip those ranges with `console.warn("整行/整列选区请改用单元格区域")` instead of looping `-1`.

- [ ] **Step 2: Build**

`npm run build` — exit 0.

- [ ] **Step 3: Manual check**

标题样式改选区外观；货币/百分比/日期改变显示文本但 value 仍是数字/日期；清除后恢复。

- [ ] **Step 4: Commit**

```bash
git add src/lessons/04-styles/Lesson.vue
git commit -m "$(cat <<'EOF'
feat: add cell style and number format lesson

EOF
)"
```

---

### Task 8: Lesson 5 行列操作

**Files:**
- Modify: `src/lessons/05-rows-cols/Lesson.vue`

**Interfaces:**
- Consumes: `useSpread` → `sheet`
- Produces: sample grid; buttons 在选区前插入行、删除选区行、插入列、删除列、加高行、加宽列、隐藏选区行、冻结首行首列

- [ ] **Step 1: Implement the rows/cols lesson**

```vue
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
```

- [ ] **Step 2: Build**

`npm run build` — exit 0.

- [ ] **Step 3: Manual check**

插入/删除行列移动数据；加高加宽可见；隐藏行消失；冻结后滚动表头/首列钉住。切走再回来样例完整（新 Workbook）。

- [ ] **Step 4: Commit**

```bash
git add src/lessons/05-rows-cols/Lesson.vue
git commit -m "$(cat <<'EOF'
feat: add row and column operations lesson

EOF
)"
```

---

### Task 9: README and full acceptance

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes: finished five lessons
- Produces: run instructions; license note; map of routes → source files

- [ ] **Step 1: Write README.md**

```markdown
# SpreadJS Playground

给熟悉 Vue 3 + TypeScript 的人快速上手 SpreadJS 核心 API（Workbook / Sheet、单元格、公式、样式、行列）。

## 运行

```bash
npm install
cp .env.example .env
# 可选：把正式 License 填进 VITE_SPREADJS_LICENSE
npm run dev
```

没有 License 也能用，表格会带试用水印。不要把填了 key 的 `.env` 提交到 git。

脚本：`npm run dev` / `npm run build` / `npm run preview`。

## 怎么学

左侧按课切换。每课进入就会写入样例数据；按钮调用的就是这一课的 API。对照源码：

| 课 | 路由 | 源码 |
|---|---|---|
| Workbook / Sheet | `/lessons/workbook` | `src/lessons/01-workbook/Lesson.vue` |
| 单元格读写 | `/lessons/cells` | `src/lessons/02-cells/Lesson.vue` |
| 公式 | `/lessons/formulas` | `src/lessons/03-formulas/Lesson.vue` |
| 样式 | `/lessons/styles` | `src/lessons/04-styles/Lesson.vue` |
| 行列操作 | `/lessons/rows-cols` | `src/lessons/05-rows-cols/Lesson.vue` |

生命周期：`src/spread/useSpread.ts`（`onMounted` 创建，`onUnmounted` `destroy`）。

本仓库故意不使用 `@mescius/spread-sheets-vue`，以便直接学习 Workbook API。
```

- [ ] **Step 2: Full acceptance**

Run `npm run build` (exit 0). Run `npm run dev` and walk all five routes:

- 每课按钮改变表格
- 按钮在 sheet 未就绪时 disabled
- 离开再进入同一课，样例重置（新实例）
- 侧栏当前课高亮
- 界面中文、按钮上的 API 说明含英文方法名

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "$(cat <<'EOF'
docs: add playground README with lesson map

EOF
)"
```

---

## Self-review

**Spec coverage**

- Vite Vue TS SPA, no Nuxt: Task 1
- `@mescius/spread-sheets` only, Excel CSS: Tasks 1–2
- `useSpread` + license env: Task 2
- Sidebar + lesson chrome + destroy on leave: Task 3
- Five lessons: Tasks 4–8
- No Pinia / editor / unit tests: honored
- README + scripts: Tasks 1 and 9
- Manual acceptance: Tasks 3–9

**Placeholders:** none remaining; CSS filename fallback is a concrete `ls` instruction if 19.x renamed the theme file.

**Types:** `useSpread(host)` always returns `{ spread, sheet }` as `ShallowRef`. Lessons 1 uses both; 2–5 use `sheet` (and Workbook APIs only in lesson 1).
