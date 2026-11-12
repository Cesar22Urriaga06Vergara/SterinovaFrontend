import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const sourcePath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "lib",
  "dashboard.ts",
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

test("construye un dashboard comercial solo con las capacidades disponibles", () => {
  const sections = compiledModule.exports.getDashboardSections([
    "clientes.ver",
    "cotizaciones.ver",
  ]);

  assert.deepEqual(
    JSON.parse(JSON.stringify(sections.map(({ id, href }) => ({ id, href })))),
    [{ id: "comercial", href: "/comercial" }],
  );
});

test("muestra Comercial aunque la sesión solo tenga una capacidad comercial", () => {
  const sections = compiledModule.exports.getDashboardSections(["clientes.ver"]);

  assert.deepEqual(
    JSON.parse(JSON.stringify(sections.map(({ id }) => id))),
    ["comercial"],
  );
});

test("combina áreas autorizadas sin pedir al usuario seleccionar un área", () => {
  const sections = compiledModule.exports.getDashboardSections([
    "cotizaciones.ver",
    "logistica.ordenes.ver",
    "planta.ordenes.ver",
    "calidad.ciclos.ver",
    "usuarios.ver",
  ]);

  assert.deepEqual(
    JSON.parse(JSON.stringify(sections.map(({ id }) => id))),
    ["comercial", "logistica", "planta", "calidad", "administracion"],
  );
  assert.ok(sections.every((section) => !("requiresAreaSelection" in section)));
});

test("dirige las capacidades documentales a una ruta documental autorizada", () => {
  const sections = compiledModule.exports.getDashboardSections(["formatos.ver"]);

  assert.deepEqual(
    JSON.parse(JSON.stringify(sections.map(({ id, href }) => ({ id, href })))),
    [{ id: "documentos", href: "/configuracion/plantillas" }],
  );
});

test("no expone tarjetas de trabajo cuando no hay permisos de módulo", () => {
  assert.equal(compiledModule.exports.getDashboardSections([]).length, 0);
});
