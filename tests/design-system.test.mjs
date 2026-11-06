import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

test("Tailwind define tokens semánticos, escala tipográfica y radios compartidos", () => {
  const config = read("tailwind.config.ts");

  for (const token of ["primary", "secondary", "success", "warning", "error", "surface", "background"]) {
    assert.match(config, new RegExp(`${token}:`));
  }
  for (const style of ["h1", "h2", "h3", "h4", "h5", "h6", "body", "caption"]) {
    assert.match(config, new RegExp(`${style}:`));
  }
  assert.match(config, /borderRadius:/);
});

test("los átomos UI declaran sus variantes y estados accesibles", () => {
  const button = read("src/components/ui/Button.tsx");
  const input = read("src/components/ui/Input.tsx");
  const select = read("src/components/ui/Select.tsx");
  const badge = read("src/components/ui/Badge.tsx");
  const modal = read("src/components/ui/Modal.tsx");

  for (const variant of ["primary", "secondary", "danger", "ghost"]) {
    assert.match(button, new RegExp(`${variant}:`));
  }
  assert.match(button, /focus-visible:/);
  assert.match(button, /aria-busy/);
  assert.match(button, /LoaderCircle/);
  assert.match(input, /htmlFor/);
  assert.match(input, /aria-invalid/);
  assert.match(input, /aria-describedby/);
  assert.match(select, /htmlFor/);
  assert.match(select, /aria-invalid/);
  for (const variant of ["success", "warning", "error", "info"]) {
    assert.match(badge, new RegExp(`${variant}:`));
  }
  assert.match(modal, /aria-modal="true"/);
  assert.match(modal, /document\.body\.style\.overflow/);
  assert.match(modal, /Escape/);
  assert.match(modal, /focus/);
});

test("las vistas piloto reutilizan los componentes del sistema visual", () => {
  const login = read("src/app/login/page.tsx");
  const customers = read("src/app/(erp)/comercial/clientes/ClientesPageClient.tsx");
  const quality = read("src/app/(erp)/calidad/page.tsx");

  assert.match(login, /<Input\b/);
  assert.match(login, /<Button\b/);
  assert.match(customers, /<Input\b/);
  assert.match(customers, /<Button\b/);
  assert.match(customers, /<Modal\b/);
  assert.match(quality, /<Badge\b/);
});
