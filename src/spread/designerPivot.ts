import { nextIndexedName } from "./uniqueSheetName.ts";

export const DESIGNER_SOURCE_SHEET = "明细";
export const DESIGNER_PIVOT_SHEET = "透视";
export const DESIGNER_SOURCE_TABLE = "OrderSource";
export const DESIGNER_PIVOT_NAME = "OrdersPivot";
export const DESIGNER_PANEL_NAME = "OrdersPivotPanel";
export const DESIGNER_PANEL_WIDTH = 280;

export function allocateSheetName(
  base: string,
  taken: Iterable<string>,
): string {
  const used = new Set(taken);
  if (!used.has(base)) {
    return base;
  }
  return nextIndexedName(base, taken);
}
