# SpreadJS 课 11：数据透视

日期：2026-09-07  
状态：已确认（对话中分节批准）  
前置：课 1–10；不改课 10 文件。打印 / PDF 另开课 12。

## 目标

增加一课：用可定制工厂函数生成订单明细，建成 Table 作为源，再在**同一张表下方**用命令式 API 生成 / 移除数据透视。

成功标准：`npm run dev` 打开课 11 看到 16 行明细 Table；「生成透视」出现产品×状态、数量求和；「移除透视」只去掉透视；同一 `seed` 每次进入明细相同。`npm run build` 通过。`createOrderMocks` 有 `node:test`（count、seed 可复现、options 覆盖）。

## 非目标

- faker / Mock.js 等第三方 mock 库
- 课页表单改 mock 参数（改调用处的 options 即可）
- 透视字段面板、拖拽、按金额切换（Excel 式面板见 Designer 课 spec）
- 图表、打印/PDF、Designer、Nuxt
- 改课 10、`useSpread`、Vue 双向同步
- 10 万 / 50 万行渲染

## 架构

沿用侧栏 + `LessonShell` + `useSpread` + `createEnterSeed`。

`src/spread/orderMocks.ts` 导出 `createOrderMocks(options?)`。课页 seed 调用默认 options，把结果 `setArray` 后 `tables.add("OrderSource", …)`。按钮只动 `pivotTables`。

`main.ts` 副作用 `import "@mescius/spread-sheets-pivot-addon"`。

## Mock

```ts
type OrderMock = { name: string; status: string; qty: number; amount: number };

createOrderMocks({
  count?: number;              // 默认 16
  names?: string[];            // 默认课 10 产品名列表
  statuses?: string[];         // 默认 ["在售","停售"]
  qty?: { min: number; max: number };    // 默认 1–12
  price?: { min: number; max: number };  // 默认 50–1500
  seed?: number;               // 默认 11
}): OrderMock[]
```

用种子伪随机（mulberry32 或等价），不引库。`amount = price * qty`（整数即可）。表头：`["产品","状态","数量","金额"]`。price 不单独成列。空 `names` / `statuses` 时抛错或回退默认（实现选回退默认并在测试里锁死）。

## 依赖

`@mescius/spread-sheets-pivot-addon` ^19。License：`VITE_SPREADJS_LICENSE`。

## 目录与路由

```
src/spread/orderMocks.ts
src/spread/orderMocks.test.ts
src/lessons/11-pivot/Lesson.vue
```

| 课 | 路由 | 导航 |
|---|---|---|
| 11 | `/lessons/pivot` | 11. 数据透视 |

## 布局（0-based）

| 区域 | 行/列 |
|---|---|
| 表头 | 行 0、列 0–3 |
| 明细 16 行 | 行 1–16 |
| 空行 | 行 17 |
| 透视起点 | 行 18、列 0 |

`sheet.name("透视")`。Table 名 `OrderSource`，范围含表头：`tables.add("OrderSource", 0, 0, 17, 4)`。

## 课页行为

**生成透视**  
`find`/`get` 到名为 `OrdersPivot` 的透视则 remove。  
`pivotTables.add("OrdersPivot", "OrderSource", 18, 0, tabular, medium2)`。  
`suspendLayout`；`options.showRowHeader/showColumnHeader = true`；  
`add("产品", "产品", rowField)`；`add("状态", "状态", columnField)`；  
`add("数量", "数量求和", valueField, sum)`；`resumeLayout`。  
枚举以 d.ts 为准（`GC.Spread.Pivot` / `GC.Pivot`）。

**移除透视**  
没有 `OrdersPivot` 时 `console.warn`。有则 remove。不删 `OrderSource`。

`sheet` 为 null 时按钮禁用。

## UI

中文说明，API 英文。两颗按钮。不新增面板，不改侧栏宽度和主题 CSS。

## 测试与验收

`createOrderMocks`：`count: 3` 长度为 3；两次默认 seed 数组深等；改 seed 结果不同。课页不做组件单测。

手工：进门无透视；生成后有产品行、状态列、数量汇总；移除后透视没了明细还在；离开再进是默认 seed。

## 文档

README 加课 11 与 pivot-addon。完成后勾掉 `TODO.md`「数据透视」。打印 / PDF 仍待做。
