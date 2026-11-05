import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { runInNewContext } from "node:vm";
import test from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const sourcePath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "lib",
  "cotizacion-types.ts",
);
const source = readFileSync(sourcePath, "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
});
const compiledModule = { exports: {} };
runInNewContext(outputText, { exports: compiledModule.exports });

test("formatea COP sin decimales ni caracteres de escape", () => {
  const formatted = compiledModule.exports.formatearMoneda(11000);

  assert.equal(formatted, "$\u00a011.000");
  assert.doesNotMatch(formatted, /[\\()[\]]/);
});

test("acepta valores enteros representados por el backend como texto", () => {
  assert.equal(compiledModule.exports.formatearMoneda("25000000"), "$\u00a025.000.000");
});
