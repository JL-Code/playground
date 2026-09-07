import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router";
import "./styles/app.css";
import "@mescius/spread-sheets/styles/gc.spread.sheets.excel2013white.css";
import "@mescius/spread-sheets-io";
import "@mescius/spread-sheets-pivot-addon";
import "@mescius/spread-sheets-print";
import "@mescius/spread-sheets-pdf";
import "@mescius/spread-sheets-charts";
import "@mescius/spread-sheets-designer-resources-cn";
import "@mescius/spread-sheets-designer";
import "@mescius/spread-sheets-designer/styles/gc.spread.sheets.designer.min.css";

createApp(App).use(router).mount("#app");
