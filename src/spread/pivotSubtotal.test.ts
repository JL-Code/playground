import assert from "node:assert/strict";
import { test } from "node:test";
import { pivotSubtotalSum } from "./pivotSubtotal.ts";

test("reads GC.Pivot.SubtotalType from the live CJS default, not a star-import snapshot", () => {
  const live = { Pivot: { SubtotalType: { sum: 8 } } };
  const snapshot = { Spread: { Pivot: {} }, default: live };
  assert.equal(pivotSubtotalSum(snapshot), 8);
});

test("reads GC.Pivot when the import is already the live object", () => {
  assert.equal(
    pivotSubtotalSum({ Pivot: { SubtotalType: { sum: 8 } } }),
    8,
  );
});

test("throws when the addon did not attach GC.Pivot", () => {
  assert.throws(() => pivotSubtotalSum({}), /GC\.Pivot\.SubtotalType/);
});
