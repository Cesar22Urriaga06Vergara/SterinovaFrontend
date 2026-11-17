import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import * as XLSX from "@e965/xlsx";

const sourcePath = path.join("src", "lib", "cliente-import.ts");
const source = readFileSync(sourcePath, "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
});
const compiledModule = { exports: {} };

const require = function (id) {
  if (id === "@e965/xlsx") return XLSX;
  return {};
};

runInNewContext(outputText, {
  exports: compiledModule.exports,
  require: require,
});

test("mapClienteExcelRow maps a parsed Excel row", () => {
  const buffer = readFileSync(path.resolve("tests", "fixtures", "clientes.xlsx"));
  const wb = XLSX.read(buffer, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws);
  assert.equal(rows.length, 1);
  const mapped = compiledModule.exports.mapClienteExcelRow(rows[0]);
  assert.equal(mapped.razon_social, "Acme SAS");
  assert.equal(mapped.nit, "9001");
  assert.equal(mapped.contacto, "Ana");
  assert.equal(mapped.telefono, "300");
  assert.equal(mapped.email, "a@b.com");
  assert.equal(mapped.direccion, "Cra 1");
});