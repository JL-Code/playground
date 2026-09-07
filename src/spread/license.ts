import * as GC from "@mescius/spread-sheets";
import "@mescius/spread-sheets-designer-resources-cn";
import "@mescius/spread-sheets-designer";
import * as DesignerMod from "@mescius/spread-sheets-designer";

declare module "@mescius/spread-sheets" {
  namespace Spread {
    namespace Sheets {
      export import Designer = DesignerMod.Spread.Sheets.Designer;
    }
  }
}

export function applySpreadLicense(): void {
  GC.Spread.Sheets.LicenseKey = import.meta.env.VITE_SPREADJS_LICENSE ?? "";
}

export function applyDesignerLicense(): void {
  const key =
    import.meta.env.VITE_SPREADJS_DESIGNER_LICENSE ??
    import.meta.env.VITE_SPREADJS_LICENSE ??
    "";
  GC.Spread.Sheets.Designer.LicenseKey = key;
}
