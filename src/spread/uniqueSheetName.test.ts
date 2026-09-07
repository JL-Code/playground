import assert from "node:assert/strict";
import { test } from "node:test";
import { planTakeSheetName } from "./uniqueSheetName.ts";

test("takes 预算 when the name is free", () => {
  assert.deepEqual(planTakeSheetName("总览", ["总览"], "预算"), {
    kind: "take",
    currentTo: "预算",
  });
});

test("is a no-op when the current sheet already has the target name", () => {
  assert.deepEqual(planTakeSheetName("预算", ["预算", "Sheet2"], "预算"), {
    kind: "noop",
  });
});

test("displaces the occupant of 预算 to 预算_01", () => {
  assert.deepEqual(planTakeSheetName("Sheet2", ["预算", "Sheet2"], "预算"), {
    kind: "displace",
    occupantFrom: "预算",
    occupantTo: "预算_01",
    currentTo: "预算",
  });
});

test("skips 预算_01 if it is already taken", () => {
  assert.deepEqual(
    planTakeSheetName("Sheet2", ["预算", "预算_01", "Sheet2"], "预算"),
    {
      kind: "displace",
      occupantFrom: "预算",
      occupantTo: "预算_02",
      currentTo: "预算",
    },
  );
});
