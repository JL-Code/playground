# SpreadJS Vue3 playground 设计

日期：2026-09-07  
状态：已确认（对话中分节批准）

## 目标

给已有 Vue 3 + TypeScript（及 Nuxt）经验的人一个 **Vite SPA playground**，用最短路径学会 SpreadJS **表格核心**：Workbook / Sheet、单元格读写、公式、样式、行列操作。

成功标准：本地 `npm run dev` 后，能按课切换、每课按钮能改表格、对照课页源码能看懂对应 API。

## 非目标

- Nuxt / SSR
- `@mescius/spread-sheets-vue` 官方包装组件
- Designer、图表、条件格式进阶、数据透视
- Excel 导入导出（`.xlsx` / IO 插件）
- Pinia 或其它全局表状态
- 组件单元测试、在线代码编辑器

## 心智模型

| Vue / Nuxt | SpreadJS |
|---|---|
| `createApp` | `Workbook`（一份工作簿） |
| 路由页面 | `Worksheet`（一张工作表） |
| 组件实例 | `Cell` / `Range` |
| `ref` 读写 | `getValue` / `setValue` |
| `computed` | `setFormula` |
| 布局 class | `Style`、数字格式 |

表格状态只存在 Workbook 实例里，不镜像到 Vue 响应式对象。

## 技术栈

- Vite + Vue 3 + TypeScript + Vue Router
- `@mescius/spread-sheets`（核心 API）
- 官方 Excel 白主题 CSS（包内 `excel2013white` 或当前版本等价文件）
- 不安装 `@mescius/spread-sheets-vue`

## 架构

```
App
 ├─ 左侧：课程序列（RouterLink，当前课高亮）
 └─ 右侧：<router-view>
      每课 = 标题 + 中文说明 + 操作按钮 + 表格宿主 div
```

路由切换必须销毁旧 Workbook，避免宿主复用导致泄漏或空白表。

## 目录

```
src/
  main.ts
  App.vue
  router.ts
  spread/
    license.ts            # 设置 GC.Spread.Sheets.LicenseKey
    useSpread.ts          # 创建 / 销毁 Workbook
  lessons/
    01-workbook/
    02-cells/
    03-formulas/
    04-styles/
    05-rows-cols/
  styles/
    app.css
.env.example              # VITE_SPREADJS_LICENSE=
```

课目录内一个 `Lesson.vue`（或等价单文件）即可，不强制拆子组件。

## `useSpread`

```ts
function useSpread(host: Ref<HTMLElement | null>): {
  spread: ShallowRef<Workbook | null>
  sheet: ShallowRef<Worksheet | null>
}
```

行为：

- `onMounted`：在 `host` 上 `new GC.Spread.Sheets.Workbook(el)`；`sheet` 指向 `getActiveSheet()`。
- 监听 sheet 切换时（仅 Workbook 课需要）可更新 `sheet`；其它课可以只拿当前活动表。
- `onUnmounted`：`spread.destroy()`，refs 置 `null`。
- 使用 `shallowRef`：Workbook 不是普通响应式对象。
- 课页只通过 `spread` / `sheet` 调 API，不直接操作表格 DOM。

License：`license.ts` 在创建 Workbook 之前执行  
`GC.Spread.Sheets.LicenseKey = import.meta.env.VITE_SPREADJS_LICENSE ?? ""`  
无 key 时带试用水印，功能仍可用。`.env` 不进 git。

## 数据流与错误

- 无全局 store。每课进入时把该课样例数据写入 sheet。
- 按钮只调用本课 API，不跨课跳转。
- `sheet` 为 `null`（尚未挂载）时按钮禁用；异常 `console.warn`，不弹复杂错误 UI。

## UI

- 左栏约 240px；右栏上方说明 + 一排按钮，下方表格铺满剩余高度。
- 浅色、偏文档站；不另做 Excel 外壳。
- 界面和说明用中文；API 名称保持官方英文。
- 无在线编辑器；实现以课页源码为准。

## 五课

进入即写入样例，无需先点「初始化」。

1. **Workbook / Sheet**  
   默认一张表。按钮：新增 Sheet、重命名、激活、删除。建立「工作簿 vs 工作表」概念。

2. **单元格读写**  
   `getCell` / `value` / `text`、`setValue`、`setArray`、`getSelections`。按钮：读 A1、写入样例数据块。

3. **公式**  
   销售额样例；`setFormula` 使用 `SUM`、`IF`；改源单元格后自动重算。对照 `computed`。

4. **样式**  
   字体、填充、边框、对齐、数字格式（货币、百分比、日期）。按钮作用于当前选区。

5. **行列**  
   插入/删除行列、行高列宽、隐藏、冻结窗格。

## 测试与验收

不做单元测试。手工验收：

- `npm run dev` 可启动
- 五课路由可切换
- 每课按钮改变可见表格状态
- 离开再进入同一课，是新的 Workbook 实例（样例数据重新出现，上一课操作不残留）

## 依赖与脚本

`package.json` 提供 `dev` / `build` / `preview`。README 说明如何填 license、如何按课阅读源码。
