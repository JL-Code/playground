import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DESIGNER_PANEL_WIDTH,
  DESIGNER_PIVOT_NAME,
  DESIGNER_PIVOT_SHEET,
  DESIGNER_SOURCE_SHEET,
  DESIGNER_SOURCE_TABLE,
  allocateSheetName,
} from "./designerPivot.ts";

test("designer pivot constants match the spec", () => {
  assert.equal(DESIGNER_SOURCE_SHEET, "明细");
  assert.equal(DESIGNER_PIVOT_SHEET, "透视");
  assert.equal(DESIGNER_SOURCE_TABLE, "OrderSource");
  assert.equal(DESIGNER_PIVOT_NAME, "OrdersPivot");
  assert.equal(DESIGNER_PANEL_WIDTH, 280);
});

test("allocateSheetName uses the base when free", () => {
  assert.equal(allocateSheetName("透视", ["明细"]), "透视");
});

test("allocateSheetName indexes when the base is taken", () => {
  assert.equal(allocateSheetName("透视", ["明细", "透视"]), "透视_01");
  assert.equal(
    allocateSheetName("透视", ["明细", "透视", "透视_01"]),
    "透视_02",
  );
});
