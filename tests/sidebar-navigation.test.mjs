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

test("las rutas operativas y documentales comprueban la capacidad específica", () => {
  const { canAccessPath } = compiledModule.exports;
  assert.equal(canAccessPath('/calidad', ['certificados.ver']), true);
  assert.equal(canAccessPath('/calidad/certificados/1', ['certificados.ver']), true);
  assert.equal(canAccessPath('/calidad/certificados/1', ['calidad.ciclos.ver']), false);
  assert.equal(canAccessPath('/planta', ['planta.ciclos.ver']), true);
  assert.equal(canAccessPath('/planta/ciclo/nuevo', ['planta.ordenes.ver']), false);
  assert.equal(canAccessPath('/planta/ciclo/nuevo', ['planta.ciclos.crear']), true);
  assert.equal(canAccessPath('/calidad/protocolos', ['planta.protocolos.ver']), true);
  assert.equal(canAccessPath('/calidad/protocolos', ['calidad.ciclos.ver']), false);
  assert.equal(canAccessPath('/administracion/roles-ambitos', ['roles.gestionar']), false);
  assert.equal(canAccessPath('/administracion/roles-ambitos', [], true), true);
});

test("muestra rutas de módulos usando permisos RBAC en vez del rol legacy", () => {
  const sections = compiledModule.exports.navigationSections;
  const labels = sections.map((section) => section.title);
  const links = sections.flatMap((section) => section.links);
  const usersLink = links.find((link) => link.href === "/usuarios");

  assert.ok(labels.includes("Comercial"));
  assert.ok(labels.includes("Operación"));
  assert.ok(links.some((link) => link.href === "/comercial/clientes"));
  assert.ok(links.some((link) => link.href === "/comercial/productos"));
  assert.ok(links.some((link) => link.href === "/comercial/cotizaciones"));
  assert.ok(links.some((link) => link.href === "/calidad/protocolos" && link.permission === "planta.protocolos.ver"));
  assert.ok(usersLink);
  assert.equal(usersLink.permission, "usuarios.ver");

  const { canAccessPath, getVisibleNavigationSections } = compiledModule.exports;
  assert.equal(canAccessPath("/usuarios", []), false);
  assert.equal(canAccessPath("/usuarios", ["Admin"]), false);
  assert.equal(canAccessPath("/comercial/productos", []), false);
  assert.equal(canAccessPath("/comercial/productos", ["productos.gestionar"]), true);
  assert.equal(canAccessPath("/comercial", ["clientes.ver"]), true);
  assert.equal(canAccessPath("/logistica/ordenes", ["logistica.ordenes.ver"]), true);
  assert.equal(canAccessPath("/planta", ["planta.ordenes.ver"]), true);
  assert.equal(canAccessPath("/calidad", ["clientes.ver"]), false);
  assert.equal(
    getVisibleNavigationSections(["usuarios.ver"])
      .flatMap((section) => section.links)
      .some((link) => link.href === "/usuarios"),
    true,
  );
  assert.equal(
    getVisibleNavigationSections(["clientes.ver"])
      .flatMap((section) => section.links)
      .some((link) => link.href === "/comercial"),
    false,
  );
  assert.equal(
    getVisibleNavigationSections(["roles.gestionar"])
      .flatMap((section) => section.links)
      .some((link) => link.href === "/administracion/roles-ambitos"),
    false,
  );
  assert.equal(
    getVisibleNavigationSections([], true)
      .flatMap((section) => section.links)
      .some((link) => link.href === "/administracion/roles-ambitos"),
    true,
  );
});

test("organiza tareas por sección y combina permisos sin duplicar accesos", () => {
  const { getVisibleNavigationSections } = compiledModule.exports;
  const permissions = ['clientes.ver', 'productos.gestionar', 'cotizaciones.ver',
    'logistica.ordenes.ver', 'planta.ordenes.ver', 'calidad.ciclos.ver',
    'solicitudes_anulacion.ver', 'usuarios.ver', 'formatos.ver', 'sellos.ver'];
  const result = JSON.parse(JSON.stringify(getVisibleNavigationSections(permissions)))
    .map(({ title, links }) => [title, links.map(({ label }) => label)]);
  assert.deepEqual(result, [
    ['Principal', ['Inicio']],
    ['Comercial', ['Clientes', 'Catálogo', 'Cotizaciones']],
    ['Operación', ['Logística', 'Conductores', 'Planta', 'Calidad']],
    ['Gestión', ['Solicitudes de anulación', 'Usuarios']],
    ['Documentos', ['Plantillas', 'Sellos']],
  ]);
  const hrefs = getVisibleNavigationSections([...permissions, ...permissions]).flatMap(({ links }) => links.map(({ href }) => href));
  assert.equal(hrefs.length, new Set(hrefs).size);
});

test("oculta grupos vacíos y conserva el orden para usuarios de varias áreas", () => {
  const { getVisibleNavigationSections } = compiledModule.exports;
  const titles = (permissions) => Array.from(getVisibleNavigationSections(permissions), ({ title }) => title);
  assert.deepEqual(titles([]), ['Principal']);
  assert.deepEqual(titles(['Admin']), ['Principal']);
  assert.deepEqual(titles(['planta.ordenes.ver']), ['Principal', 'Operación']);
  assert.deepEqual(titles(['clientes.ver', 'planta.ciclos.ver', 'sellos.ver']), ['Principal', 'Comercial', 'Operación', 'Documentos']);
  assert.deepEqual(titles(['sellos.ver', 'planta.ciclos.ver', 'clientes.ver']), ['Principal', 'Comercial', 'Operación', 'Documentos']);
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
