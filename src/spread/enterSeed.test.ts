import assert from "node:assert/strict";
import { test } from "node:test";
import { createEnterSeed } from "./enterSeed.ts";

type FakeSheet = {
  a1: unknown;
  nameValue: string;
  name: (n: string) => void;
};

function workbook() {
  const used = new Set<string>();
  function makeSheet(initialName: string): FakeSheet {
    used.add(initialName);
    const sheet: FakeSheet = {
      a1: null,
      nameValue: initialName,
      name(n: string) {
        if (used.has(n) && n !== sheet.nameValue) {
          throw new Error("Not supported exception");
        }
        used.delete(sheet.nameValue);
        used.add(n);
        sheet.nameValue = n;
      },
    };
    return sheet;
  }
  return { makeSheet };
}

test("seed that always names 总览 throws on a second empty sheet (SpreadJS duplicate name)", () => {
  const { makeSheet } = workbook();
  const first = makeSheet("Sheet1");
  const second = makeSheet("Sheet2");
  const seed = (s: FakeSheet) => {
    s.name("总览");
    s.a1 = "seed";
  };
  seed(first);
  assert.throws(() => seed(second), { message: "Not supported exception" });
});

test("createEnterSeed runs seed only once so a later empty sheet does not rename to 总览", () => {
  const { makeSheet } = workbook();
  const first = makeSheet("Sheet1");
  const second = makeSheet("Sheet2");
  const seed = createEnterSeed((s: FakeSheet) => {
    s.name("总览");
    s.a1 = "seed";
  });
  seed(first);
  seed(second);
  assert.equal(first.nameValue, "总览");
  assert.equal(second.nameValue, "Sheet2");
  assert.equal(second.a1, null);
});
