import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const sourcePath = path.join("src", "lib", "format.ts");
const source = readFileSync(sourcePath, "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
});
const compiledModule = { exports: {} };

// Provide a require function for the transpiled CJS module
const require = function(id) {
  // Try resolving from the project root
  const resolved = path.resolve("C:\\Users\\urria\\SterinovaFrontend", id);
  try {
    const m = readFileSync(resolved, "utf8");
    const mod = { exports: {} };
    runInNewContext(m, {
      exports: module.exports,
      require: require,
    });
    return mod.exports;
  } catch {
    return {};
  }
};

runInNewContext(outputText, {
  exports: compiledModule.exports,
  require: require,
});

test("parseDate interprets a date without time as a local date", () => {
  const date = compiledModule.exports.parseDate("2026-01-15");

  assert.equal(date.getFullYear(), 2026);
  assert.equal(date.getMonth(), 0); // January
  assert.equal(date.getDate(), 15);
  assert.equal(date.getHours(), 12);
});

test("formatDate conserves the civil day of a date without time", () => {
  const expected = new Date(2026, 0, 15, 12).toLocaleDateString("es-CO");

  assert.equal(compiledModule.exports.formatDate("2026-01-15"), expected);
});

test("formatDate conserves dates that already include hour", () => {
  const value = "2026-01-15T23:30:00-05:00";

  assert.equal(
    compiledModule.exports.formatDate(value),
    new Date(value).toLocaleDateString("es-CO"),
  );
});