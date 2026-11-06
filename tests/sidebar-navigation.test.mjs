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
  "navigation.ts",
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

test("organiza rutas existentes y restringe Usuarios al rol Admin", () => {
  const sections = compiledModule.exports.navigationSections;
  const labels = sections.map((section) => section.title);
  const links = sections.flatMap((section) => section.links);
  const usersLink = links.find((link) => link.href === "/usuarios");

  assert.ok(labels.includes("Maestros"));
  assert.ok(labels.includes("Operación"));
  assert.ok(links.some((link) => link.href === "/comercial/clientes"));
  assert.ok(links.some((link) => link.href === "/comercial/cotizaciones"));
  assert.ok(usersLink);
  assert.equal(usersLink.roles.length, 1);
  assert.equal(usersLink.roles[0], "Admin");
});

test("activa la ruta más específica dentro de módulos anidados", () => {
  const { navigationSections, getActiveNavigationHref } =
    compiledModule.exports;
  const hrefs = navigationSections.flatMap((section) =>
    section.links.map((link) => link.href),
  );

  assert.equal(
    getActiveNavigationHref("/comercial/cotizaciones/nueva", hrefs),
    "/comercial/cotizaciones",
  );
  assert.equal(getActiveNavigationHref("/", hrefs), "/");
  assert.equal(getActiveNavigationHref("/ruta-inexistente", hrefs), null);
});
