import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEFAULT_ORDERS,
  arrayToOrders,
  ordersToArray,
  shouldReadOrdersFromEvent,
} from "./orders.ts";

test("ordersToArray prefixes the Chinese header row", () => {
  assert.deepEqual(ordersToArray([{ name: "键盘", price: 199, qty: 3 }]), [
    ["产品", "单价", "数量"],
    ["键盘", 199, 3],
  ]);
});

test("arrayToOrders skips the header and fills missing cells", () => {
  assert.deepEqual(
    arrayToOrders([
      ["产品", "单价", "数量"],
      ["鼠标", 79],
      [],
    ]),
    [
      { name: "鼠标", price: 79, qty: 0 },
      { name: "", price: 0, qty: 0 },
    ],
  );
});

test("DEFAULT_ORDERS round-trips through the converters", () => {
  assert.deepEqual(arrayToOrders(ordersToArray(DEFAULT_ORDERS)), DEFAULT_ORDERS);
});

test("shouldReadOrdersFromEvent skips syncing writes and the header row", () => {
  assert.equal(shouldReadOrdersFromEvent(true, 2), false);
  assert.equal(shouldReadOrdersFromEvent(false, 0), false);
  assert.equal(shouldReadOrdersFromEvent(false, 1), true);
});
