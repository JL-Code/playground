# SpreadJS 课 9：Excel 进出

日期：2026-09-07  
状态：已确认（对话中分节批准）  
前置：课 1–8；订单数据 `src/spread/orders.ts` 的 `DEFAULT_ORDERS` / `ordersToArray`

## 目标

增加一课，用命令式 Workbook API 完成 **`.xlsx` 导入与导出**。样例与课 8 同一份三行订单，但不改课 8、不做双向同步。

成功标准：`npm run dev` 打开课 9 能看到订单表；导出得到 `orders.xlsx`；再把该文件导入，表中仍是订单数据；离开再进入 seed 恢复默认三行。

## 非目标

- ssjson、csv、`.xls`
- `file-saver`、`@mescius/spread-sheets-vue`
- 改课 8 / `useSpread` 语义
- 服务端上传、改 License 流程
- 10 万 / 50 万行渲染（`TODO.md` 待做，另开 spec）
- 表格像产品、图表、透视、打印、Designer、Nuxt

## 架构

沿用侧栏 + `LessonShell` + 宿主 `div` + `useSpread` + `createEnterSeed`。

在 `main.ts` 副作用导入 `@mescius/spread-sheets-io`，给 Workbook 挂上 `import` / `export`。课页只调这两个方法和 `FileType.excel`。

下载：`URL.createObjectURL` + 临时 `<a download="orders.xlsx">`，随后 `revokeObjectURL`。不装 `file-saver`。

## 依赖

`package.json` 增加 `@mescius/spread-sheets-io`，版本与 `@mescius/spread-sheets` 同主版本（^19）。License 仍是 `VITE_SPREADJS_LICENSE`。

## 目录与路由

```
src/lessons/09-excel-io/Lesson.vue
```

| 课 | 路由 | 导航 |
|---|---|---|
| 9 | `/lessons/excel-io` | 9. Excel 进出 |

课 1–8 不变。

## 课页行为

**Seed**  
`sheet.name("订单导出")`；`setArray(0, 0, ordersToArray(DEFAULT_ORDERS))`。无 `orders` ref，无 `ValueChanged`。

**导入**  
`<input type="file" accept=".xlsx">`。选中文件后：

`spread.import(file, onOk, onErr, { fileType: GC.Spread.Sheets.FileType.excel })`

`onOk`：Workbook 已被 IO 就地替换内容。不修改 `useSpread`。若已有 `ActiveSheetChanged` 绑定，`sheet` 会跟着更新；课页不要另写一套全局 sheet 镜像。非 `.xlsx`（按文件名扩展名，大小写不敏感）：`console.warn`，不调用 `import`。

**导出**  
按钮文案「导出 xlsx」：

`spread.export(onBlob, onErr, { fileType: GC.Spread.Sheets.FileType.excel })`

`onBlob` 触发下载 `orders.xlsx`。

**错误**  
`spread`/`sheet` 为 null 时禁用 file input 与导出按钮。失败回调 `console.warn`，无 alert / 模态框。

## UI

中文说明，API 名称英文（`import`、`export`、`FileType.excel`）。原生 file input。不新增 Vue 面板组件。不改侧栏宽度和主题 CSS。

## 测试与验收

不做组件单测。可选：若下载逻辑抽成纯函数再补 `node:test`；不是必须。

手工：`npm run build`；课 9 有三行订单；导出文件能打开（Excel 或再导入本课）；再导入后数据仍在；路由离开再进是默认 seed。

## 文档

README 课表加课 9，并写明依赖 `@mescius/spread-sheets-io`。实现完成后勾掉 `TODO.md` 里「Excel 进出」。
