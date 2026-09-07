import { DEFAULT_PRODUCT_ROWS } from "./productRows.ts";

export type OrderMock = {
  name: string;
  status: string;
  qty: number;
  amount: number;
};

export type OrderMockOptions = {
  count?: number;
  names?: string[];
  statuses?: string[];
  qty?: { min: number; max: number };
  price?: { min: number; max: number };
  seed?: number;
};

export const ORDER_MOCK_HEADER: [string, string, string, string] = [
  "产品",
  "状态",
  "数量",
  "金额",
];

const DEFAULT_NAMES = DEFAULT_PRODUCT_ROWS.map((row) => row.name);
const DEFAULT_STATUSES = ["在售", "停售"];

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rand: () => number, items: T[]): T {
  return items[Math.floor(rand() * items.length)]!;
}

function intInRange(
  rand: () => number,
  min: number,
  max: number,
): number {
  return min + Math.floor(rand() * (max - min + 1));
}

export function createOrderMocks(
  options: OrderMockOptions = {},
): OrderMock[] {
  const count = options.count ?? 16;
  const names =
    options.names && options.names.length > 0
      ? options.names
      : DEFAULT_NAMES;
  const statuses =
    options.statuses && options.statuses.length > 0
      ? options.statuses
      : DEFAULT_STATUSES;
  const qty = options.qty ?? { min: 1, max: 12 };
  const price = options.price ?? { min: 50, max: 1500 };
  const rand = mulberry32(options.seed ?? 11);

  return Array.from({ length: count }, () => {
    const unit = intInRange(rand, price.min, price.max);
    const quantity = intInRange(rand, qty.min, qty.max);
    return {
      name: pick(rand, names),
      status: pick(rand, statuses),
      qty: quantity,
      amount: unit * quantity,
    };
  });
}

export function orderMocksToArray(
  rows: OrderMock[],
): (string | number)[][] {
  return [ORDER_MOCK_HEADER, ...rows.map((row) => [row.name, row.status, row.qty, row.amount])];
}
