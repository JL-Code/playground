import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router";
import "./styles/app.css";
import "@mescius/spread-sheets/styles/gc.spread.sheets.excel2013white.css";

createApp(App).use(router).mount("#app");
