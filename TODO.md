# Playground 后续教程

已完成：课 1–5 表格核心，课 6–8 Vue 同步，课 9 Excel `.xlsx` 进出，课 10 表格像产品，课 11 数据透视，课 12 打印 / PDF。刻意不做：官方 `@mescius/spread-sheets-vue`、Pinia 镜像整张表、在线代码编辑器。

## 待做

- [ ] **图表**  
  柱状/折线等，依赖 charts 插件。

- [x] **打印 / PDF**  
  课 12：`printInfo` + 预览 + 导出 PDF。见 `docs/superpowers/specs/2026-09-07-spreadjs-print-pdf-design.md`。

- [ ] **Designer**  
  Ribbon 设计器，体积最大。含 Excel 式透视：新 Sheet 空透视 + 右侧字段列表拖筛选/列/行/值（详见 `docs/superpowers/specs/2026-09-07-spreadjs-designer-design.md`）。课 11 只保留命令式 `pivot.add`。

- [ ] **接到 Nuxt**  
  客户端插件、`ssr: false`，不再加 SpreadJS API，只练落地。

- [ ] **大数据量渲染实战**（Excel 这一轮做完后单独开 spec）  
  10 万、50 万行：`setArray` vs 逐行写入、suspendPaint / resumePaint、滚动是否卡顿。和 IO 是两套课题。
