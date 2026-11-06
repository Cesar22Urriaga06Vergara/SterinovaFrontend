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
  "api-errors.ts",
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
const { getApiErrorMessage } = compiledModule.exports;

test("muestra el mensaje textual enviado por la API", () => {
  assert.equal(
    getApiErrorMessage({ response: { data: { message: "Dato inválido" } } }),
    "Dato inválido",
  );
});

test("combina mensajes de validación devueltos como arreglo", () => {
  assert.equal(
    getApiErrorMessage({ response: { data: { message: [
      " Email inválido ",
      "Nombre requerido",
    ] } } }),
    "Email inválido Nombre requerido",
  );
});

test("usa el campo error cuando la API no envía message", () => {
  assert.equal(
    getApiErrorMessage({ response: { data: { error: "Acceso denegado" } } }),
    "Acceso denegado",
  );
});

test("usa un mensaje seguro cuando la respuesta no contiene texto", () => {
  assert.equal(
    getApiErrorMessage({ response: { data: { message: { detail: "invalid" } } } }),
    "No fue posible completar la solicitud. Inténtalo de nuevo.",
  );
});
