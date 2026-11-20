import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

test("el layout ERP ofrece salto por teclado a un main enfocable", () => {
  const layout = read("src/app/(erp)/layout.tsx");

  assert.match(layout, /href="#main-content"/);
  assert.match(layout, /<main\b[^>]*id="main-content"[^>]*tabIndex=\{-1\}/);
});

test("la navegación móvil anuncia su landmark, oculta links cerrados y se cierra con Escape", () => {
  const layout = read("src/app/(erp)/layout.tsx");
  const sidebar = read("src/components/Sidebar.tsx");

  assert.ok(
    layout.indexOf('id="erp-menu-toggle"') < layout.indexOf("<Sidebar"),
  );
  assert.match(layout, /sr-only[^"]*focus:not-sr-only/);
  assert.match(sidebar, /<nav[^>]*aria-label=/);
  assert.match(sidebar, /inert=\{/);
  assert.match(sidebar, /aria-hidden="true"/);
  assert.match(sidebar, /tabIndex=\{-1\}/);
  assert.match(layout, /event\.key !== "Escape"/);
  assert.match(layout, /focus\(\)/);
  assert.match(layout, /setMobileNavOpen\(\(open\) => !open\)/);
  assert.match(
    layout,
    /function closeMobileNav\(\) \{\s*menuButtonRef\.current\?\.focus\(\);\s*setMobileNavOpen\(false\);\s*\}/,
  );
  assert.match(layout, /onNavigate=\{closeMobileNav\}/);
});

test("el dashboard comercial opta explícitamente de validación de navegación instantánea", () => {
  const comercial = read("src/app/(erp)/comercial/page.tsx");

  assert.doesNotMatch(comercial, /^\s*["']use client["'];/);
  assert.match(comercial, /export const instant = false/);
  assert.doesNotMatch(comercial, /Reportes/);
  assert.doesNotMatch(comercial, /Próximamente/);
});

test("la hidratación del layout ERP usa una snapshot externa en lugar de setState en un efecto", () => {
  const layout = read("src/app/(erp)/layout.tsx");

  assert.match(layout, /useSyncExternalStore/);
  assert.match(layout, /getClientHydrationSnapshot/);
  assert.match(layout, /getServerHydrationSnapshot/);
  assert.doesNotMatch(layout, /setHydrated/);
});

test("las imágenes de los sellos tienen dimensiones explícitas y omiten optimización remota", () => {
  const sealsTable = read("src/app/(erp)/configuracion/sellos/SealsTable.tsx");

  assert.match(sealsTable, /from "next\/image"/);
  assert.match(sealsTable, /<Image\b/);
  assert.match(sealsTable, /width=\{80\}/);
  assert.match(sealsTable, /height=\{56\}/);
  assert.match(sealsTable, /unoptimized/);
});

test("los campos anuncian errores vinculados y marcados como inválidos", () => {
  for (const component of ["Input", "Select"]) {
    const source = read(`src/components/ui/${component}.tsx`);

    assert.match(source, /aria-invalid/);
    assert.match(source, /aria-describedby/);
    assert.match(source, /aria-live="polite"/);
  }
});

test("los errores del login se anuncian y el botón conserva atributos de nombre accesible", () => {
  const login = read("src/app/login/page.tsx");
  const button = read("src/components/ui/Button.tsx");
  const header = read("src/components/Header.tsx");

  assert.match(login, /<main\b/);
  assert.match(login, /role="alert"/);
  assert.match(button, /\{\.\.\.props\}/);
  assert.match(button, /aria-busy/);
  assert.match(header, /focus-visible:ring-/);
});

test("los textos de estado y usuario usan colores con contraste AA", () => {
  const header = read("src/components/Header.tsx");
  const emptyState = read("src/components/ui/states/EmptyState.tsx");
  const quality = read("src/app/(erp)/calidad/page.tsx");

  assert.match(header, /text-secondary/);
  assert.match(emptyState, /text-secondary/);
  assert.match(emptyState, /bg-primary/);
  assert.match(emptyState, /text-primary-foreground/);
  assert.match(quality, /text-surface-subtle/);
});

test("las tablas operativas comparten el estado visual de carga y vacío", () => {
  const tableState = read("src/components/ui/states/TableState.tsx");
  assert.match(tableState, /role="status"/);
  assert.match(tableState, /colSpan/);

  for (const relativePath of [
    "src/app/(erp)/planta/page.tsx",
    "src/app/(erp)/logistica/page.tsx",
    "src/app/(erp)/calidad/page.tsx",
    "src/app/(erp)/comercial/cotizaciones/CotizacionesClient.tsx",
    "src/app/(erp)/usuarios/UsersTable.tsx",
    "src/app/(erp)/configuracion/plantillas/PlantillasDocumentalesClient.tsx",
  ]) {
    const source = read(relativePath);
    assert.match(source, /TableState/);
  }
});

test("las vistas operativas separan error de carga de un vacío válido", () => {
  const quality = read("src/app/(erp)/calidad/page.tsx");
  const plant = read("src/app/(erp)/planta/page.tsx");
  const logistics = read("src/app/(erp)/logistica/page.tsx");
  const templates = read("src/app/(erp)/configuracion/plantillas/PlantillasDocumentalesClient.tsx");

  assert.match(quality, /loadError/);
  assert.match(quality, /loadError \? null/);
  assert.match(plant, /loadError/);
  assert.match(plant, /<ErrorState\b/);
  assert.match(plant, /onRetry=\{\(\) => void refreshData\(\)\}/);
  assert.match(logistics, /onRetry=\{\(\) => void refreshData\(\)\}/);
  assert.match(plant, /can\("planta\.ciclos\.crear"\)/);
  assert.match(templates, /formatos\.crear/);
  assert.match(templates, /formatos\.versiones\.crear/);
});

test("las vistas comerciales delegan el ámbito al contrato del recurso", () => {
  const products = read("src/app/(erp)/comercial/productos/ProductosCatalogoClient.tsx");
  const quoteForm = read("src/components/cotizaciones/CotizacionForm.tsx");

  assert.match(products, /if \(sessionLoading\) return/);
  assert.match(products, /if \(!allowed \|\| !scopeContextReady\)/);
  assert.match(products, /productos\.gestionar/);
  assert.match(products, /api\.get<ProductoCatalogo\[]>\("\/productos"/);
  assert.doesNotMatch(quoteForm, /Selecciona un ámbito operativo/);
});

test("la navegación distingue el enlace activo del fondo de la barra lateral", () => {
  const sidebar = read("src/components/Sidebar.tsx");

  assert.match(sidebar, /aria-current=\{active \? "page" : undefined\}/);
  assert.match(sidebar, /active\s*\?\s*"bg-secondary-light text-secondary/);
  assert.doesNotMatch(sidebar, /active\s*\?\s*"bg-secondary text-white"/);
});

test("el diálogo expone su semántica y controla el foco por teclado", () => {
  const modal = read("src/components/ui/Modal.tsx");
  const dialogA11y = read("src/components/ui/useDialogA11y.ts");

  assert.match(modal, /role="dialog"/);
  assert.match(modal, /aria-modal="true"/);
  assert.match(modal, /aria-labelledby=/);
  assert.match(dialogA11y, /event\.key === "Escape"/);
  assert.match(dialogA11y, /event\.key !== "Tab"/);
  assert.match(dialogA11y, /previousFocus\?\.focus\(\)/);
});

test("los diálogos de formulario reutilizan el Modal accesible", () => {
  for (const relativePath of [
    "src/app/(erp)/configuracion/sellos/UploadSealDialog.tsx",
    "src/app/(erp)/usuarios/UserDialogs.tsx",
    "src/app/(erp)/usuarios/UserRolesDialog.tsx",
    "src/components/logistica/RegistroEventoOrdenModal.tsx",
  ]) {
    assert.match(read(relativePath), /<Modal\b/);
  }
});

test("las vistas previas a pantalla completa usan la trampa de foco compartida", () => {
  for (const relativePath of [
    "src/app/(erp)/logistica/page.tsx",
    "src/app/(erp)/comercial/cotizaciones/CotizacionesClient.tsx",
  ]) {
    assert.match(read(relativePath), /useDialogA11y/);
  }
});
