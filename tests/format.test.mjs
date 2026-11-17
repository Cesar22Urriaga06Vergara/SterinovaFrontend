import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const sourcePath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "lib",
  "format.ts",
);
const source = readFileSync(sourcePath, "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
});
const compiledModule = { exports: {} };
runInNewContext(outputText, {
  exports: compiledModule.exports,
  require,
});

test("parseDate interpreta una fecha sin hora como fecha civil local", () => {
  const date = compiledModule.exports.parseDate("2026-01-15");

  assert.equal(date.getFullYear(), 2026);
  assert.equal(date.getMonth(), 0);
  assert.equal(date.getDate(), 15);
  assert.equal(date.getHours(), 12);
});

test("formatDate conserva el día civil de una fecha sin hora", () => {
  const expected = new Date(2026, 0, 15, 12).toLocaleDateString("es-CO");

  assert.equal(compiledModule.exports.formatDate("2026-01-15"), expected);
});

test("formatDate conserva las fechas que ya incluyen hora", () => {
  const value = "2026-01-15T23:30:00-05:00";

  assert.equal(
    compiledModule.exports.formatDate(value),
    new Date(value).toLocaleDateString("es-CO"),
  );
});
