import assert from "node:assert/strict";
import { test } from "node:test";
import { parsePrintRange } from "./printRange.ts";

test("A1:D10 is the product-sheet used range", () => {
  assert.deepEqual(parsePrintRange("A1:D10"), {
    row: 0,
    col: 0,
    rowCount: 10,
    colCount: 4,
  });
});

test("A1 is a single cell", () => {
  assert.deepEqual(parsePrintRange("A1"), {
    row: 0,
    col: 0,
    rowCount: 1,
    colCount: 1,
  });
});

test("illegal ranges are null", () => {
  assert.equal(parsePrintRange(""), null);
  assert.equal(parsePrintRange("Z"), null);
  assert.equal(parsePrintRange("A1:"), null);
  assert.equal(parsePrintRange("1A:D10"), null);
});
