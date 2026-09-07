import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CHART_SHEET_COL_COUNT,
  CHART_SHEET_ROW_COUNT,
  chartSheetArray,
} from "./chartSheet.ts";

test("chart sheet seed is 6 rows by 4 columns", () => {
  const table = chartSheetArray();
  assert.equal(CHART_SHEET_ROW_COUNT, 6);
  assert.equal(CHART_SHEET_COL_COUNT, 4);
  assert.equal(table.length, 6);
  for (const row of table) {
    assert.equal(row.length, 4);
  }
});

test("header and quarter labels match the spec", () => {
  const table = chartSheetArray();
  assert.deepEqual(table[0], ["季度", "键盘", "鼠标", "显示器"]);
  assert.equal(table[1]![0], "Q1");
  assert.equal(table[2]![0], "Q2");
  assert.equal(table[3]![0], "Q3");
  assert.equal(table[4]![0], "Q4");
});

test("totals row equals the sum of four quarters", () => {
  const table = chartSheetArray();
  assert.equal(table[5]![0], "合计");
  assert.deepEqual(table[5], ["合计", 51, 76, 41]);
  for (let col = 1; col <= 3; col++) {
    const sum =
      Number(table[1]![col]) +
      Number(table[2]![col]) +
      Number(table[3]![col]) +
      Number(table[4]![col]);
    assert.equal(table[5]![col], sum);
  }
});
