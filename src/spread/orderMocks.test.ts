import assert from "node:assert/strict";
import { test } from "node:test";
import { createOrderMocks } from "./orderMocks.ts";

test("count option controls length", () => {
  assert.equal(createOrderMocks({ count: 3 }).length, 3);
});

test("default seed is reproducible", () => {
  assert.deepEqual(createOrderMocks(), createOrderMocks());
});

test("different seed yields different rows", () => {
  assert.notDeepEqual(
    createOrderMocks({ seed: 1 }),
    createOrderMocks({ seed: 2 }),
  );
});

test("empty names and statuses fall back to defaults", () => {
  const rows = createOrderMocks({ count: 2, names: [], statuses: [] });
  assert.equal(rows.length, 2);
  assert.ok(rows.every((row) => row.name.length > 0 && row.status.length > 0));
});

test("amount is price times qty as integers", () => {
  const [row] = createOrderMocks({ count: 1, seed: 11 });
  assert.equal(Number.isInteger(row.qty), true);
  assert.equal(Number.isInteger(row.amount), true);
  assert.ok(row.amount >= row.qty);
});
