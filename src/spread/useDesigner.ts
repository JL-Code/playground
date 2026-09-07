import {
  onMounted,
  onUnmounted,
  shallowRef,
  type Ref,
  type ShallowRef,
} from "vue";
import * as GC from "@mescius/spread-sheets";
import { applySpreadCulture } from "./culture";
import { applyDesignerLicense, applySpreadLicense } from "./license";

export function useDesigner(host: Ref<HTMLElement | null>): {
  designer: ShallowRef<GC.Spread.Sheets.Designer.Designer | null>;
  spread: ShallowRef<GC.Spread.Sheets.Workbook | null>;
  sheet: ShallowRef<GC.Spread.Sheets.Worksheet | null>;
} {
  const designer = shallowRef<GC.Spread.Sheets.Designer.Designer | null>(
    null,
  );
  const spread = shallowRef<GC.Spread.Sheets.Workbook | null>(null);
  const sheet = shallowRef<GC.Spread.Sheets.Worksheet | null>(null);

  onMounted(() => {
    const el = host.value;
    if (!el) {
      console.warn("useDesigner: host element is null");
      return;
    }

    applySpreadLicense();
    applyDesignerLicense();
    applySpreadCulture();

    const instance = new GC.Spread.Sheets.Designer.Designer(
      el as HTMLDivElement,
      undefined,
      undefined,
      {
        sheetCount: 1,
      },
    );
    const workbook = instance.getWorkbook() as GC.Spread.Sheets.Workbook;
    const onActiveSheetChanged = () => {
      sheet.value = workbook.getActiveSheet();
    };

    designer.value = instance;
    spread.value = workbook;
    sheet.value = workbook.getActiveSheet();
    workbook.bind(
      GC.Spread.Sheets.Events.ActiveSheetChanged,
      onActiveSheetChanged,
    );

    onUnmounted(() => {
      workbook.unbind(
        GC.Spread.Sheets.Events.ActiveSheetChanged,
        onActiveSheetChanged,
      );
      instance.destroy();
      designer.value = null;
      spread.value = null;
      sheet.value = null;
    });
  });

  return { designer, spread, sheet };
}
