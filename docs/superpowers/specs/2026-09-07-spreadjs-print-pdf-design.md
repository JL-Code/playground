# SpreadJS 课 12：打印 / PDF

日期：2026-09-07  
状态：已确认（对话中分节批准）  
前置：课 1–11；不改课 10 / 11 文件；Designer 课仍待做（见 designer spec）。

## 目标

增加一课：产品表明细上用命令式 `printInfo` 设置页眉、页脚、边距、打印区域，再打印预览、导出 PDF。设置来自课页小表单，不硬编码一锤子打完。

成功标准：`npm run dev` 打开课 12 看到与课 10 相同的标题+表头+8 行产品；改页眉后预览可见；合法 `A1:D10` 能预览/导出；非法区域 `console.warn` 且不预览。`npm run build` 通过。打印区域解析有 `node:test`。

## 非目标

- 纸张方向、缩放、行列标题开关、完整 Excel 打印对话框
- 课 10 的合并 / 校验 / 条件格式 / 筛选 / Table
- 改 `useSpread`、课 10/11、Designer
- 图表、Nuxt、自定义 alert
- 10 万 / 50 万行

## 架构

侧栏 + `LessonShell` + `useSpread` + `createEnterSeed`。seed：`productRowsToArray(DEFAULT_PRODUCT_ROWS)`（import 现有 `productRows.ts`，不改该文件）。

Vue `ref` 存表单。`应用到表` 写入当前 sheet 的 `printInfo`。`打印预览` / `导出 PDF` 在表单相对上次成功应用有变化时先应用再执行。

`main.ts` 副作用 `import "@mescius/spread-sheets-print"` 与 `import "@mescius/spread-sheets-pdf"`。PDF blob 下载对齐课 9（`createObjectURL` + `<a download>`）。

抽出 `src/spread/printRange.ts`：`A1:D10` → `{ row, col, rowCount, colCount }` 或 `null`。课页把结果写到 `printInfo` 的行列起止。

## 依赖

`@mescius/spread-sheets-print`、`@mescius/spread-sheets-pdf`（与现有 sheets 主版本对齐，^19）。License：`VITE_SPREADJS_LICENSE`。

## 目录与路由

```
src/spread/printRange.ts
src/spread/printRange.test.ts
src/lessons/12-print/Lesson.vue
```

| 课 | 路由 | 导航 |
|---|---|---|
| 12 | `/lessons/print` | 12. 打印 / PDF |

## 布局（0-based）

与课 10 seed 相同：

| 区域 | 行/列 |
|---|---|
| 标题「季度订单」 | 行 0、列 0 |
| 表头 | 行 1、列 0–3 |
| 数据 8 行 | 行 2–9、列 0–3 |

`sheet.name("打印")`。设列宽。默认打印区域 **`A1:D10`**。

## 课页行为

`sheet` 为 null 时按钮禁用。失败 `console.warn`。

**表单默认**

- 页眉（居中）：`季度订单`
- 页脚（居中）：`第 &P 页`
- 边距：一个数字，上下左右相同（英寸，默认 `0.75`）
- 打印区域：`A1:D10`

只做居中页眉/页脚，不做左/右页眉。

**应用到表**  
解析打印区域；失败则 warn 并中止。成功则写 `printInfo`（页眉居中、页脚居中、四边距、打印行列范围）。

**打印预览**  
需要时先应用；再调 Workbook 打印预览 API。

**导出 PDF**  
需要时先应用；导出 blob，下载 `products.pdf`。

## UI

中文说明，API 英文。表单 + 三颗按钮。不改侧栏宽度和主题 CSS。表单样式跟现有课页按钮同一套，不新开设计体系。

## 测试与验收

`printRange`：`A1:D10` 得到行 0、列 0、10 行、4 列；`A1` 单格；非法（空、`Z`、`A1:`、`1A:D10`）为 `null`。课页不做组件单测。

手工：进门是产品 seed；改页眉后预览能看到；区域改成 `A1:D1` 再导出，PDF 几乎只有标题；离开再进表单与 seed 恢复默认。

## 文档

README 加课 12 与 print/pdf 包。完成后勾掉 `TODO.md`「打印 / PDF」。图表、Designer、Nuxt 仍待做。
