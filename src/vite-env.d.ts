/// <reference types="vite/client" />

declare module "@mescius/spread-sheets-resources-zh";
declare module "@mescius/spread-sheets-designer-resources-cn";

interface ImportMetaEnv {
  readonly VITE_SPREADJS_LICENSE?: string;
  readonly VITE_SPREADJS_DESIGNER_LICENSE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<object, object, unknown>;
  export default component;
}
