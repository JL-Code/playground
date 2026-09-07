import * as GC from "@mescius/spread-sheets";

export function applySpreadLicense(): void {
  GC.Spread.Sheets.LicenseKey = import.meta.env.VITE_SPREADJS_LICENSE ?? "";
}
