# Playground 后续教程

已完成：课 1–5 表格核心，课 6–8 Vue 同步，课 9 Excel `.xlsx` 进出，课 10 表格像产品。刻意不做：官方 `@mescius/spread-sheets-vue`、Pinia 镜像整张表、在线代码编辑器。

## 待做

- [ ] **图表**  
  柱状/折线等，依赖 charts 插件。

- [ ] **数据透视**  
  Pivot，包更重，可与图表分轮。

- [ ] **打印 / PDF**  
  打印预览与导出 PDF。

- [ ] **Designer**  
  Ribbon 设计器，体积最大。

- [ ] **接到 Nuxt**  
  客户端插件、`ssr: false`，不再加 SpreadJS API，只练落地。

- [ ] **大数据量渲染实战**（Excel 这一轮做完后单独开 spec）  
  10 万、50 万行：`setArray` vs 逐行写入、suspendPaint / resumePaint、滚动是否卡顿。和 IO 是两套课题。
