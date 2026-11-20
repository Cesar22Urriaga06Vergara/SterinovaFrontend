import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { runInNewContext } from "node:vm";
import test from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
function load(relative) {
  const source = readFileSync(path.join(root, relative), "utf8");
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} };
  runInNewContext(output, { exports: mod.exports, crypto: { randomUUID: () => "draft-key" } });
  return mod.exports;
}

test("create and edit clients hydrate and submit cargo and city", () => {
  const { clienteToForm, clienteFormPayload } = load("src/lib/cliente-form.ts");
  const form = clienteToForm({ id: 9, razon_social: "Cliente", nit: "NIT", cargo: "Compras", ciudad: "Bogotá", contacto: "Ana", telefono: "123", email: "a@b.co", direccion: "Calle 1" });
  assert.equal(form.cargo, "Compras");
  assert.equal(form.ciudad, "Bogotá");
  const page = readFileSync(path.join(root, "src/app/(erp)/comercial/clientes/ClientesPageClient.tsx"), "utf8");
  assert.match(page, /api\.post\("\/clientes", clienteFormPayload\(form\)\)/);
  assert.match(page, /api\.put\(`\/clientes\/\$\{editingCliente\.id\}`, clienteFormPayload\(form\)\)/);
  assert.deepEqual({ ...clienteFormPayload({ ...form, cargo: " Compras ", ciudad: " Bogotá " }) }, { ...form, cargo: "Compras", ciudad: "Bogotá" });
});

test("draft helpers add catalog/manual items and calculate decimal quantities", () => {
  const { createEmptyItem } = load("src/components/cotizaciones/cotizacion-draft.types.ts");
  const { appendDraftItem, calculateDraftItems, createCatalogDraftItem } = load("src/components/cotizaciones/cotizacion-draft.logic.ts");
  const manual = createEmptyItem();
  const catalog = createCatalogDraftItem({ id: 4, tipo_item: "PRODUCTO", descripcion: "Referencia", unidad: "caja", precision_cantidad: 2 });
  const items = appendDraftItem([manual], catalog);
  assert.equal(items.length, 1);
  assert.equal(items[0].producto_id, 4);
  assert.equal(items[0].unidad, "caja");
  const withManual = appendDraftItem(items, { ...manual, key: "manual", descripcion: "Servicio", cantidad: "1.25", valor_unitario: "10" });
  assert.equal(withManual.length, 2);
  assert.equal(calculateDraftItems(withManual)[1].valor_total, 12.5);
});

test("the modular draft hook keeps edit loading, IVA, image operations and submission contract", () => {
  const hook = readFileSync(path.join(root, "src/components/cotizaciones/useCotizacionDraft.ts"), "utf8");
  for (const contract of ["/cotizaciones/${quoteId}", "/cotizaciones/iva-vigente", "/productos/buscar/${action}", "api.put<Cotizacion>", "api.post<Cotizacion>", "/items/${itemId}/imagen", "quoteAmounts", "handleSubmit"]) assert.ok(hook.includes(contract), `missing ${contract}`);
});

test("customer summary and item editor expose requested modular UI", () => {
  const customer = readFileSync(path.join(root, "src/components/cotizaciones/CotizacionClienteSection.tsx"), "utf8");
  const items = readFileSync(path.join(root, "src/components/cotizaciones/CotizacionItemsTable.tsx"), "utf8");
  const form = readFileSync(path.join(root, "src/components/cotizaciones/CotizacionForm.tsx"), "utf8");
  assert.match(customer, /selectedCliente\.cargo/);
  assert.match(customer, /selectedCliente\.ciudad/);
  assert.match(items, /Editar detalles/);
  assert.match(items, /Unidad/);
  assert.doesNotMatch(items, /<details/);
  assert.match(form, /CotizacionItemsSection/);
});

test("catalog captures only its three active fields; quote lines own editable units and decimals", () => {
  const catalog = readFileSync(path.join(root, "src/app/(erp)/comercial/productos/ProductosCatalogoClient.tsx"), "utf8");
  const table = readFileSync(path.join(root, "src/components/cotizaciones/CotizacionItemsTable.tsx"), "utf8");
  const hook = readFileSync(path.join(root, "src/components/cotizaciones/useCotizacionDraft.ts"), "utf8");
  assert.match(catalog, /const payload = \{ tipo_servicio: form\.tipo_servicio, tipo_item: form\.tipo_item, descripcion: form\.descripcion\.trim\(\) \}/);
  for (const removed of ["Unidad", "Decimales permitidos en cantidad", "Código / referencia", "Presentación"]) assert.doesNotMatch(catalog, new RegExp(removed));
  assert.match(table, /aria-label="Unidad" value=\{item\.unidad\} onChange/);
  assert.match(table, /step=\{10 \*\* -item\.precision_cantidad\}/);
  assert.match(hook, /producto_id: item\.producto_id, unidad: item\.unidad\.trim\(\), precision_cantidad: item\.precision_cantidad/);
});

