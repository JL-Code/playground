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
| 表格像产品 | `/lessons/product-sheet` | `src/lessons/10-product-sheet/Lesson.vue` |
| 数据透视 | `/lessons/pivot` | `src/lessons/11-pivot/Lesson.vue` |
| 打印 / PDF | `/lessons/print` | `src/lessons/12-print/Lesson.vue` |
| 图表 | `/lessons/charts` | `src/lessons/13-charts/Lesson.vue` |

生命周期：`src/spread/useSpread.ts`（`onMounted` 创建，`onUnmounted` `destroy`）。
课 6–8 示范 Vue `ref` 与表格同步；事件在课页里 `bind`/`unbind`，不放进 `useSpread`。订单数组转换见 `src/spread/orders.ts`。
课 9 用 `@mescius/spread-sheets-io` 做 `.xlsx` 导入导出（`main.ts` 副作用导入），样例与课 8 同一份 `DEFAULT_ORDERS`。
课 10 用核心包演示合并、数据验证、条件格式、筛选/排序、Table；样例见 `src/spread/productRows.ts`。
课 11 用 `@mescius/spread-sheets-pivot-addon` 做透视（`main.ts` 副作用导入）；明细由 `src/spread/orderMocks.ts` 的 `createOrderMocks` 生成。
课 12 用 print / pdf 插件做 `printInfo`、打印预览和导出 PDF；样例为 36 行 × 7 列（课 10 产品行加仓库/类别/备注并拉长）。
课 13 用 `@mescius/spread-sheets-charts` 做柱状 / 折线 / 饼图（`main.ts` 副作用导入）；样例为三产品 × 四季度 + 合计行。

本仓库故意不使用 `@mescius/spread-sheets-vue`，以便直接学习 Workbook API。
