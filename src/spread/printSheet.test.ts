import assert from "node:assert/strict";
import { test } from "node:test";
import { formatPrintRange } from "./printRange.ts";
import {
  PRINT_SHEET_COL_COUNT,
  PRINT_SHEET_ROW_COUNT,
  printSheetArray,
} from "./printSheet.ts";

test("print sheet seed is 36 rows by 7 columns", () => {
  const table = printSheetArray();
  assert.equal(PRINT_SHEET_ROW_COUNT, 36);
  assert.equal(PRINT_SHEET_COL_COUNT, 7);
  assert.equal(table.length, 36);
  for (const row of table) {
    assert.equal(row.length, 7);
  }
});

test("print used range formats as A1:G36", () => {
  assert.equal(
    formatPrintRange({
      row: 0,
      col: 0,
      rowCount: PRINT_SHEET_ROW_COUNT,
      colCount: PRINT_SHEET_COL_COUNT,
    }),
    "A1:G36",
  );
});
