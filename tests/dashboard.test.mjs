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

test("un usuario con solo sellos aterriza en la ruta de sellos", () => {
  const sections = compiledModule.exports.getDashboardSections(["sellos.ver"]);

  assert.deepEqual(
    JSON.parse(JSON.stringify(sections.map(({ id, href }) => ({ id, href })))),
    [{ id: "documentos", href: "/configuracion/sellos" }],
  );
});

test("quien puede plantillas y sellos aterriza en plantillas", () => {
  const sections = compiledModule.exports.getDashboardSections([
    "sellos.ver",
    "formatos.ver",
  ]);

  assert.deepEqual(
    JSON.parse(JSON.stringify(sections.map(({ id, href }) => ({ id, href })))),
    [{ id: "documentos", href: "/configuracion/plantillas" }],
  );
});

test("no expone tarjetas de trabajo cuando no hay permisos de módulo", () => {
  assert.equal(compiledModule.exports.getDashboardSections([]).length, 0);
});

test("el landing comercial expone clientes, catálogo y cotizaciones por permiso", () => {
  const accesses = compiledModule.exports.getComercialAccesses([
    "clientes.ver",
    "productos.gestionar",
    "cotizaciones.ver",
  ]);

  assert.deepEqual(
    JSON.parse(JSON.stringify(accesses.map(({ id, href }) => ({ id, href })))),
    [
      { id: "clientes", href: "/comercial/clientes" },
      { id: "catalogo", href: "/comercial/productos" },
      { id: "cotizaciones", href: "/comercial/cotizaciones" },
    ],
  );
});

test("el landing comercial solo muestra las funciones autorizadas", () => {
  const accesses = compiledModule.exports.getComercialAccesses([
    "cotizaciones.ver",
  ]);

  assert.deepEqual(
    JSON.parse(JSON.stringify(accesses.map(({ id }) => id))),
    ["cotizaciones"],
  );
  assert.equal(compiledModule.exports.getComercialAccesses([]).length, 0);
});

test("el landing comercial no muestra placeholders ni selectores de área", () => {
  const clientSource = readFileSync(
    path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "..",
      "src",
      "app",
      "(erp)",
      "comercial",
      "ComercialPageClient.tsx",
    ),
    "utf8",
  );

  assert.doesNotMatch(clientSource, /Reportes|Próximamente|Métricas en construcción/);
  assert.doesNotMatch(clientSource, /<select/i);
  assert.match(clientSource, /getComercialAccesses\(permissions\)/);
});
