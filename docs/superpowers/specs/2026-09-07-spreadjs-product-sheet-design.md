# SpreadJS 课 10：表格像产品

日期：2026-09-07  
状态：已确认（对话中分节批准）  
前置：课 1–9；不改课 8 `orders.ts`、不改课 9 Excel IO

## 目标

增加一课，在**同一张订单表**上用命令式 API 演示：合并单元格、数据验证、条件格式、筛选、排序、Table。进门只灌数据；能力全部由按钮套上，对照源码。

成功标准：`npm run dev` 打开课 10 能看到标题 + 表头 + 8 行带「状态」的订单；六个按钮各自产生可见变化；离开再进入恢复为未套能力的 seed。`npm run build` 通过。

## 非目标

- 新 npm 包、Designer、图表、透视、打印/PDF、Nuxt
- Vue 双向同步、`ValueChanged`
- 改 `useSpread`、课 8/9 文件
- 自定义校验对话框、多层条件格式、Table 主题切换器
- 10 万 / 50 万行渲染（`TODO.md` 另项）

## 架构

沿用侧栏 + `LessonShell` + 宿主 `div` + `useSpread` + `createEnterSeed`。API 都在 `@mescius/spread-sheets` 核心包。

数据抽到 `src/spread/productRows.ts`（本课专用，不改 `orders.ts`）：`ProductRow`（`name` / `price` / `qty` / `status`，`status` 为 `"在售" | "停售"`）、表头常量、约 8 行样例、`productRowsToArray()`。课页 `setArray` 写入。不做 `node:test`（转换过于薄）。

## 依赖

不加包。License 仍是 `VITE_SPREADJS_LICENSE`。

## 目录与路由

```
src/spread/productRows.ts
src/lessons/10-product-sheet/Lesson.vue
```

| 课 | 路由 | 导航 |
|---|---|---|
| 10 | `/lessons/product-sheet` | 10. 表格像产品 |

课 1–9 不变。

## 布局（0-based）

| 区域 | 行/列 |
|---|---|
| 标题「季度订单」 | 行 0、列 0（seed 未合并） |
| 表头 产品/单价/数量/状态 | 行 1、列 0–3 |
| 数据 8 行 | 行 2–9、列 0–3 |

`sheet.name("产品表")`。设列宽。样例须同时包含 `在售`/`停售`，以及数量 `< 5` 与 `>= 5`。

## 课页行为

`sheet` 为 null 时按钮禁用。失败 `console.warn`，无 alert。

**合并标题**  
`addSpan(0, 0, 1, 4)`，标题单元格水平居中。若 `(0,0)` 已是合并区则 `removeSpan(0, 0)`（切换）。

**状态下拉**  
`DataValidation.createListValidator("在售,停售")`，`setDataValidator` 覆盖行 2–9、列 3。再点：对该区域 `setDataValidator(null)` 清掉（切换）。

**数量高亮**  
`conditionalFormats.clearRule()` 后 `addCellValueRule`：比较运算符大于等于、阈值 `5`、浅底样式、Range 为行 2–9 列 2。再点若该列已有条件格式则只 `clearRule`（切换）。实现上用课页布尔或「规则数是否为 0」区分开/关，避免叠规则。

**打开筛选**  
`rowFilter(new HideRowFilter(new Range(1, 0, 9, 4)))`（含表头）。再点 `rowFilter(null)`。若已存在 Table，不要再开 sheet 级筛选，`console.warn` 提示先用 Table 漏斗。

**按数量排序**  
始终 `sortRange(2, 0, 8, 4, true, [{ index: 2, ascending: false }])`（数据 8 行 × 4 列，数量列 `index: 2`，降序）。有 Table 时也走这套 Range，不把第 0 行标题算进去。

**转成 Table**  
先 `rowFilter(null)`。若已有名为 `Orders` 的表则 `tables.remove`。再 `tables.add("Orders", 1, 0, 9, 4, TableThemes.medium2)`（含表头、不含标题行）。再点：remove 该表（切回普通区域）。

## UI

中文说明，API 名称英文。写明 Table 自带筛选，转成 Table 会关掉 sheet 级 `rowFilter`。六个按钮，不新增面板，不改侧栏宽度和主题 CSS。

## 测试与验收

不做组件单测。手工：进门无合并/漏斗/条纹表；合并后 A1:D1 一体；状态下拉只能选两项；数量 ≥ 5 高亮；筛选漏斗在表头；排序按数量降序；Table 有主题条纹且 sheet 筛选已关；路由离开再进是 seed。

## 文档

README 课表加课 10。实现完成后勾掉 `TODO.md` 里「表格像产品」。
