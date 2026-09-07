export type ProductStatus = "在售" | "停售";

export type ProductRow = {
  name: string;
  price: number;
  qty: number;
  status: ProductStatus;
};

export const PRODUCT_TITLE = "季度订单";

export const PRODUCT_HEADER: [string, string, string, string] = [
  "产品",
  "单价",
  "数量",
  "状态",
];

/** 课 10 条件格式：数量列大于等于该值才高亮。 */
export const QTY_HIGHLIGHT_MIN = 5;

export const STATUS_LIST_SOURCE = "在售,停售";

export function highlightedQtys(
  rows: ProductRow[],
  min = QTY_HIGHLIGHT_MIN,
): number[] {
  return rows.filter((row) => row.qty >= min).map((row) => row.qty);
}

export const DEFAULT_PRODUCT_ROWS: ProductRow[] = [
  { name: "键盘", price: 199, qty: 3, status: "在售" },
  { name: "鼠标", price: 79, qty: 12, status: "在售" },
  { name: "显示器", price: 1299, qty: 2, status: "在售" },
  { name: "耳机", price: 299, qty: 5, status: "停售" },
  { name: "摄像头", price: 159, qty: 8, status: "在售" },
  { name: "支架", price: 89, qty: 1, status: "停售" },
  { name: "扩展坞", price: 459, qty: 4, status: "在售" },
  { name: "台灯", price: 129, qty: 7, status: "在售" },
];

export function productRowsToArray(
  rows: ProductRow[],
): (string | number)[][] {
  return [
    [PRODUCT_TITLE, "", "", ""],
    [...PRODUCT_HEADER],
    ...rows.map((row) => [row.name, row.price, row.qty, row.status]),
  ];
}
