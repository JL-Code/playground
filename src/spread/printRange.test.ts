import assert from "node:assert/strict";
import { test } from "node:test";
import { formatPrintRange, parsePrintRange, shouldFollowUsedRange } from "./printRange.ts";

test("A1:G36 is the print-sheet used range", () => {
  assert.deepEqual(parsePrintRange("A1:G36"), {
    row: 0,
    col: 0,
    rowCount: 36,
    colCount: 7,
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

test("formatPrintRange writes A1:G36 for the print used range", () => {
  assert.equal(
    formatPrintRange({ row: 0, col: 0, rowCount: 36, colCount: 7 }),
    "A1:G36",
  );
});

test("formatPrintRange writes a single cell as A1", () => {
  assert.equal(
    formatPrintRange({ row: 0, col: 0, rowCount: 1, colCount: 1 }),
    "A1",
  );
});

test("auto print area follows used range until the user edits it", () => {
  assert.equal(shouldFollowUsedRange("", "A1:G36"), true);
  assert.equal(shouldFollowUsedRange("A1:G36", "A1:G36"), true);
  assert.equal(shouldFollowUsedRange("A1:D1", "A1:G36"), false);
});
