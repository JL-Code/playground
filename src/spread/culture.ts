import * as GC from "@mescius/spread-sheets";
import "@mescius/spread-sheets-resources-zh";

/** 必须在创建 Workbook 之前调用，否则界面仍是英文。 */
export function applySpreadCulture(): void {
  GC.Spread.Common.CultureManager.culture("zh-cn");
}
