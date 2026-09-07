import {
  DEFAULT_PRODUCT_ROWS,
  PRODUCT_HEADER,
  PRODUCT_TITLE,
  type ProductRow,
} from "./productRows.ts";

export const PRINT_SHEET_ROW_COUNT = 36;
export const PRINT_SHEET_COL_COUNT = 7;

const EXTRA_HEADERS = ["仓库", "类别", "备注"] as const;
const WAREHOUSES = ["上海", "深圳", "成都", "北京"];
const CATEGORIES = ["配件", "外设", "办公", "耗材"];

export function printSheetArray(
  rows: ProductRow[] = DEFAULT_PRODUCT_ROWS,
): (string | number)[][] {
  const title: (string | number)[] = Array.from(
    { length: PRINT_SHEET_COL_COUNT },
    (_, i) => (i === 0 ? PRODUCT_TITLE : ""),
  );
  const header: (string | number)[] = [...PRODUCT_HEADER, ...EXTRA_HEADERS];
  const dataCount = PRINT_SHEET_ROW_COUNT - 2;
  const data = Array.from({ length: dataCount }, (_, i) => {
    const src = rows[i % rows.length]!;
    const wrap = Math.floor(i / rows.length);
    const name = wrap === 0 ? src.name : `${src.name}-${wrap + 1}`;
    return [
      name,
      src.price,
      src.qty,
      src.status,
      WAREHOUSES[i % WAREHOUSES.length]!,
      CATEGORIES[i % CATEGORIES.length]!,
      wrap === 0 ? "" : `批次${wrap + 1}`,
    ];
  });
  return [title, header, ...data];
}
