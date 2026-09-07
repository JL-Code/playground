import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEFAULT_PRODUCT_ROWS,
  QTY_HIGHLIGHT_MIN,
  highlightedQtys,
} from "./productRows.ts";

test("qty highlight is >= 5, matching 12 / 8 / 7 / 5 in the sample", () => {
  assert.equal(QTY_HIGHLIGHT_MIN, 5);
  assert.deepEqual(
    highlightedQtys(DEFAULT_PRODUCT_ROWS).sort((a, b) => a - b),
    [5, 7, 8, 12],
  );
});
