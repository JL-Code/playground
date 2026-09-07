export const CHART_SHEET_ROW_COUNT = 6;
export const CHART_SHEET_COL_COUNT = 4;

export function chartSheetArray(): (string | number)[][] {
  return [
    ["季度", "键盘", "鼠标", "显示器"],
    ["Q1", 12, 20, 8],
    ["Q2", 15, 18, 11],
    ["Q3", 10, 22, 9],
    ["Q4", 14, 16, 13],
    ["合计", 51, 76, 41],
  ];
}
