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

  assert.ok(layout.indexOf('id="erp-menu-toggle"') < layout.indexOf("<Sidebar"));
  assert.match(layout, /sr-only[^"]*focus:not-sr-only/);
  assert.match(sidebar, /<nav[^>]*aria-label=/);
  assert.match(sidebar, /inert=\{/);
  assert.match(sidebar, /aria-hidden="true"/);
  assert.match(sidebar, /tabIndex=\{-1\}/);
  assert.match(layout, /event\.key !== "Escape"/);
  assert.match(layout, /focus\(\)/);
  assert.match(layout, /setMobileNavOpen\(\(open\) => !open\)/);
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

test("el diálogo expone su semántica y controla el foco por teclado", () => {
  const modal = read("src/components/ui/Modal.tsx");

  assert.match(modal, /role="dialog"/);
  assert.match(modal, /aria-modal="true"/);
  assert.match(modal, /aria-labelledby=/);
  assert.match(modal, /event\.key === "Escape"/);
  assert.match(modal, /event\.key !== "Tab"/);
  assert.match(modal, /previousFocus\?\.focus\(\)/);
});
