import assert from "node:assert/strict";
import { test } from "node:test";
import { nextSortAscending } from "./nextSortAscending.ts";

test("never sorted uses descending", () => {
  assert.equal(nextSortAscending(undefined, 2), false);
  assert.equal(nextSortAscending(null, 2), false);
  assert.equal(nextSortAscending({}, 2), false);
});

test("toggles the same column", () => {
  assert.equal(
    nextSortAscending(
      { sortConditions: [{ index: 2, ascending: false }] },
      2,
    ),
    true,
  );
  assert.equal(
    nextSortAscending(
      { sortConditions: [{ index: 2, ascending: true }] },
      2,
    ),
    false,
  );
});

test("a different column is treated as first sort", () => {
  assert.equal(
    nextSortAscending(
      { sortConditions: [{ index: 0, ascending: false }] },
      2,
    ),
    false,
  );
});
