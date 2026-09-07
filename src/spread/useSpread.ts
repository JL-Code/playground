import { onMounted, onUnmounted, shallowRef, type Ref, type ShallowRef } from "vue";
import * as GC from "@mescius/spread-sheets";
import { applySpreadLicense } from "./license";

export function useSpread(host: Ref<HTMLElement | null>): {
  spread: ShallowRef<GC.Spread.Sheets.Workbook | null>;
  sheet: ShallowRef<GC.Spread.Sheets.Worksheet | null>;
} {
  const spread = shallowRef<GC.Spread.Sheets.Workbook | null>(null);
  const sheet = shallowRef<GC.Spread.Sheets.Worksheet | null>(null);

  onMounted(() => {
    const el = host.value;
    if (!el) {
      console.warn("useSpread: host element is null");
      return;
    }

    applySpreadLicense();
    const workbook = new GC.Spread.Sheets.Workbook(el, { sheetCount: 1 });
    const onActiveSheetChanged = () => {
      sheet.value = workbook.getActiveSheet();
    };

    spread.value = workbook;
    sheet.value = workbook.getActiveSheet();
    workbook.bind(GC.Spread.Sheets.Events.ActiveSheetChanged, onActiveSheetChanged);

    onUnmounted(() => {
      workbook.unbind(GC.Spread.Sheets.Events.ActiveSheetChanged, onActiveSheetChanged);
      workbook.destroy();
      spread.value = null;
      sheet.value = null;
    });
  });

  return { spread, sheet };
}
