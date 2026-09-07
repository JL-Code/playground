export type Order = { name: string; price: number; qty: number };

export const ORDER_HEADER: [string, string, string] = ["产品", "单价", "数量"];

export const DEFAULT_ORDERS: Order[] = [
  { name: "键盘", price: 199, qty: 3 },
  { name: "鼠标", price: 79, qty: 5 },
  { name: "显示器", price: 1299, qty: 2 },
];

function cellString(value: unknown): string {
  if (value == null) {
    return "";
  }
  return String(value);
}

function cellNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function ordersToArray(orders: Order[]): (string | number)[][] {
  return [ORDER_HEADER, ...orders.map((row) => [row.name, row.price, row.qty])];
}

export function arrayToOrders(rows: unknown[][]): Order[] {
  return rows.slice(1).map((row) => ({
    name: cellString(row[0]),
    price: cellNumber(row[1]),
    qty: cellNumber(row[2]),
  }));
}

export function shouldReadOrdersFromEvent(
  syncing: boolean,
  row: number,
): boolean {
  return !syncing && row >= 1;
}
