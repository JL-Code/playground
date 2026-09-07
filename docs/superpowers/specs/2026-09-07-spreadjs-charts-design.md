# SpreadJS 课 13：图表

日期：2026-09-07  
状态：已确认（对话中分节批准）  
前置：课 1–12；不改课 1–12 文件；Designer / Nuxt / 大数据量仍待做。

## 目标

增加一课：进门一张「三产品 × 四季度」表，末行是合计；用命令式 `sheet.charts` 加柱状图、改成折线或饼图、移除。柱状/折线绑季度行（不含合计），饼图绑产品名 + 合计行。不改课 1–12，不用 Designer / `@mescius/spread-sheets-vue`。

成功标准：`npm run dev` 打开课 13 看到 6 行 × 4 列（表头 + Q1–Q4 + 合计）；加柱状图出现在表右侧；改折线/饼图是同一张图换类型和数据区；移除后图消失。`npm run build` 通过。seed 数组有 `node:test`。

## 非目标

- 面积 / 条形 / 组合图、图表标题 / 图例 / 坐标轴细调
- 数据区域或类型表单、多张图并存、透视出图
- 改 `useSpread`、课 1–12、自定义 alert
- Designer、Nuxt、10 万 / 50 万行

## 架构

侧栏 + `LessonShell` + `useSpread` + `createEnterSeed`。seed：`chartSheetArray()`（`src/spread/chartSheet.ts`）。课页 `setArray` 后设列宽；进门不加图。

图的名字固定 `SalesChart`。加柱状：已有则先 `charts.remove` 再 `add`。改折线 / 改饼图：改已有图的 `chartType` 与 `dataRange`。类型用 `GC.Spread.Sheets.Charts.ChartType` 的 `columnClustered`、`line`、`pie`。

`main.ts` 副作用 `import "@mescius/spread-sheets-charts"`。

## 依赖

`@mescius/spread-sheets-charts`（与现有 sheets 主版本对齐，^19）。License：`VITE_SPREADJS_LICENSE`。

## 目录与路由

```
src/spread/chartSheet.ts
src/spread/chartSheet.test.ts
src/lessons/13-charts/Lesson.vue
```

| 课 | 路由 | 导航 |
|---|---|---|
| 13 | `/lessons/charts` | 13. 图表 |

## 布局（0-based）

产品名与课 10 短名一致。销量为小整数，合计行写死为四季度之和（不用单元格公式）。

| 季度 | 键盘 | 鼠标 | 显示器 |
|---|---:|---:|---:|
| Q1 | 12 | 20 | 8 |
| Q2 | 15 | 18 | 11 |
| Q3 | 10 | 22 | 9 |
| Q4 | 14 | 16 | 13 |
| 合计 | 51 | 76 | 41 |

| 区域 | 行/列 |
|---|---|
| 表头 | 行 0：季度、键盘、鼠标、显示器 |
| 季度 | 行 1–4：Q1–Q4 |
| 合计 | 行 5：各产品四季度之和 |
| 柱状 / 折线数据区 | `A1:D5`（不含合计） |
| 饼图数据区 | `B1:D1,B6:D6`（分类=三产品名，值=合计三列）。`charts.add` / `dataRange` 传入该公式字符串。若运行时插件拒绝非连续区域，改用连续辅助区 `F1:G4`（表头「产品」「全年」+ 三行产品名与合计，数字与合计行相同），课页说明写明绑的是辅助区。 |
| 图 | `charts.add` 像素：`x=420`、`y=10`、`width=480`、`height=280`，避免盖住 `A:D` |

`sheet.name("图表")`。列宽：列 0 为 80，列 1–3 为 80。

## 课页行为

`sheet` 为 null 时按钮禁用。失败 `console.warn`。进门只有表、没有图。离开再进：表回到上表，图不在。

改单元格后，已绑定的图跟着变（插件默认，课页不 `bind` 事件）。

**加柱状图**  
已有 `SalesChart` 则 `charts.remove("SalesChart")`。再 `charts.add("SalesChart", columnClustered, 420, 10, 480, 280, "A1:D5")`。

**改成折线**  
没有图则 `console.warn("还没有图表")` 并中止。有则 `chartType(line)`，`dataRange("A1:D5")`。

**改成饼图**  
没有图则 warn「还没有图表」。有则 `chartType(pie)`，`dataRange("B1:D1,B6:D6")`（或回退辅助区 `F1:G4`）。

**移除图表**  
没有图则 warn「还没有图表」。有则 `charts.remove("SalesChart")`。

查找已有图：`charts.get("SalesChart")`；没有则视为不存在（不要 throw 到未捕获）。

## UI

中文说明，API 英文。四颗按钮。不改侧栏宽度和主题 CSS。按钮样式跟现有课页同一套。

说明里写清：柱状/折线用 `A1:D5`；饼图用产品名 + 合计（或辅助区）。依赖 `@mescius/spread-sheets-charts`（`main.ts` 副作用导入）。

## 测试与验收

`chartSheetArray`：长度为 6，每行 4 列；`[0]` 为 `["季度","键盘","鼠标","显示器"]`；行 1–4 第一列为 `Q1`…`Q4`；行 5 为 `["合计", 51, 76, 41]`；列 1–3 的行 5 等于行 1–4 同列之和。课页不做组件单测。

手工：进门无图；加柱状在右侧且三系列为三产品；改折线/饼图是同一张图；饼图三块对应键盘/鼠标/显示器；移除后空；再进课恢复无图。

## 文档

README 加课 13 与 charts 包。完成后勾掉 `TODO.md`「图表」。Designer、Nuxt、大数据量仍待做。
