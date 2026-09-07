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
| Vue → 表 | `/lessons/vue-to-sheet` | `src/lessons/06-vue-to-sheet/Lesson.vue` |
| 表 → Vue | `/lessons/sheet-to-vue` | `src/lessons/07-sheet-to-vue/Lesson.vue` |
| 双向订单表 | `/lessons/two-way` | `src/lessons/08-two-way/Lesson.vue` |
| Excel 进出 | `/lessons/excel-io` | `src/lessons/09-excel-io/Lesson.vue` |

生命周期：`src/spread/useSpread.ts`（`onMounted` 创建，`onUnmounted` `destroy`）。
课 6–8 示范 Vue `ref` 与表格同步；事件在课页里 `bind`/`unbind`，不放进 `useSpread`。订单数组转换见 `src/spread/orders.ts`。
课 9 用 `@mescius/spread-sheets-io` 做 `.xlsx` 导入导出（`main.ts` 副作用导入），样例与课 8 同一份 `DEFAULT_ORDERS`。

本仓库故意不使用 `@mescius/spread-sheets-vue`，以便直接学习 Workbook API。
