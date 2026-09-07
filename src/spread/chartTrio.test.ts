import assert from "node:assert/strict";
import { test } from "node:test";
import { SINGLE_CHART_NAME, TRIO_CHARTS } from "./chartTrio.ts";

test("trio uses three unique names besides SalesChart", () => {
  assert.equal(SINGLE_CHART_NAME, "SalesChart");
  assert.equal(TRIO_CHARTS.length, 3);
  const names = TRIO_CHARTS.map((c) => c.name);
  assert.deepEqual(names, ["SalesColumn", "SalesLine", "SalesPie"]);
  assert.equal(new Set(names).size, 3);
  assert.equal(names.includes(SINGLE_CHART_NAME), false);
});

test("column and line bind A1:D5; pie binds F1:G4", () => {
  assert.equal(TRIO_CHARTS[0]!.kind, "column");
  assert.equal(TRIO_CHARTS[1]!.kind, "line");
  assert.equal(TRIO_CHARTS[2]!.kind, "pie");
  assert.equal(TRIO_CHARTS[0]!.range, "A1:D5");
  assert.equal(TRIO_CHARTS[1]!.range, "A1:D5");
  assert.equal(TRIO_CHARTS[2]!.range, "F1:G4");
});

test("trio rectangles do not overlap", () => {
  for (let i = 0; i < TRIO_CHARTS.length; i++) {
    for (let j = i + 1; j < TRIO_CHARTS.length; j++) {
      const a = TRIO_CHARTS[i]!;
      const b = TRIO_CHARTS[j]!;
      const overlapX = a.x < b.x + b.width && a.x + a.width > b.x;
      const overlapY = a.y < b.y + b.height && a.y + a.height > b.y;
      assert.equal(
        overlapX && overlapY,
        false,
        `${a.name} overlaps ${b.name}`,
      );
    }
  }
});
