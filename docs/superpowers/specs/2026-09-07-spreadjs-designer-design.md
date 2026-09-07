# SpreadJS：Designer 课（含 Excel 式透视）

日期：2026-09-07  
状态：已确认（对话中批准；**尚未实现**）  
前置：课 1–11。课 11 保持命令式透视 API，不在本课改 `11-pivot/Lesson.vue`。

## 目标

新增一课：挂官方 **Designer（Ribbon）**，体积最大。其中透视走 Excel 路径：插入透视 → **新 Sheet 上空透视**（绑定课 11 同源明细 Table）→ **右侧字段列表**拖筛选 / 列 / 行 / 值。课页不硬编码 `pivot.add` 的行/列/值。

成功标准（实现时）：`npm run dev` 打开本课能看到 Ribbon；按钮打开字段面板后可拖字段，透视出现在新 Sheet；移除后回到明细 Sheet，面板卸掉。`npm run build` 通过。

## 非目标

- 改课 11：仍用 `pivotTables.add` + 写死产品/状态/数量求和
- 自制 Vue 字段勾选面板
- 图表、打印/PDF、Nuxt、大数据量
- `@mescius/spread-sheets-vue`

## 与课 11 的分工

| | 课 11 | Designer 课 |
|---|---|---|
| 包 | `spread-sheets-pivot-addon` | Designer（含 Ribbon；透视字段 UI 走 Designer / `PivotPanel`） |
| 透视 | 同一张表明细下方，代码指定字段 | 新 Sheet 空透视，用户拖字段 |
| 目的 | 会调命令式 API | 接近 Excel 的搭透视交互 |

明细复用 `createOrderMocks` 与 Table 名 `OrderSource`（实现时再定是否复制 seed 逻辑，不改课 10）。

## 交互（已拍板）

- 进门：明细在源 Sheet；**没有**预置行列值。
- 「打开字段面板」：建空透视（新 Sheet）+ 右侧约 280px 字段面板（表格在左、面板在右）。
- 「移除透视」：删透视、面板、透视 Sheet，回到明细。
- 不预置产品 × 状态 × 数量求和。

## 架构（实现时再细化挂载）

Designer 与现有 `useSpread` 课页宿主是两套挂载，不要把 Ribbon 塞进课 1–11 的 `useSpread`。License 仍 `VITE_SPREADJS_LICENSE`（Designer 若另要 key，实现时写进 `.env.example`）。

## 目录与路由（建议，实现时可微调）

| 课 | 路由 | 导航 |
|---|---|---|
| Designer | `/lessons/designer` | n. Designer |

源码建议：`src/lessons/xx-designer/Lesson.vue`。号次排在图表、打印之后或按当时 TODO 顺序。

## 测试与验收

课页不做组件单测。手工：拖字段后透视变化；移除后字段面板和透视 Sheet 消失。

## 文档

实现时改 README、勾 `TODO.md`「Designer」。本 spec 先作为 TODO 的详细说明。
