import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const pkg = JSON.parse(
  readFileSync(join(root, "package.json"), "utf8"),
) as { dependencies: Record<string, string> };
const require = createRequire(import.meta.url);

function designerCjsRequires(): string[] {
  const entry = require.resolve("@mescius/spread-sheets-designer");
  const bundle = join(
    dirname(entry),
    "dist/gc.spread.sheets.designer.all.min.js",
  );
  const source = readFileSync(bundle, "utf8");
  return [
    ...new Set(
      [...source.matchAll(/require\('(@mescius\/[^']+)'\)/g)].map(
        (match) => match[1]!,
      ),
    ),
  ];
}

test("package.json depends on every package Designer require()s", () => {
  const names = designerCjsRequires();
  assert.ok(names.includes("@mescius/spread-sheets-barcode"));
  assert.ok(names.includes("@mescius/spread-sheets-languagepackages"));
  assert.ok(names.includes("@mescius/spread-sheets-shapes"));
  const missing = names.filter((name) => !pkg.dependencies[name]);
  assert.deepEqual(missing, []);
});
