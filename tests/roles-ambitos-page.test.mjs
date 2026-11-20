import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const viewModelPath = path.join(
  root,
  "src",
  "app",
  "(erp)",
  "administracion",
  "roles-ambitos",
  "view-model.ts",
);
const pagePath = path.join(
  root,
  "src",
  "app",
  "(erp)",
  "administracion",
  "roles-ambitos",
  "page.tsx",
);
const source = readFileSync(viewModelPath, "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
});
const module = { exports: {} };
runInNewContext(outputText, { exports: module.exports });

test("la vista conserva la opción de crear el primer ámbito cuando la lista está vacía", () => {
  const view = module.exports.buildRolesAmbitosViewModel([], true);
  const page = readFileSync(pagePath, "utf8");

  assert.equal(view.scopeCount, 0);
  assert.deepEqual(Array.from(view.scopeOptions), []);
  assert.deepEqual(Array.from(view.parentScopeOptions, (option) => ({ ...option })), [
    { value: "1", label: "Global (raíz)" },
  ]);
  assert.equal(view.showCreateScope, true);
  assert.equal(view.createScopeLabel, "Crear primer ámbito operativo");
  assert.match(page, /scopeFormOpen && canManageScopes/);
  assert.match(page, /No hay ámbitos registrados\. Crea el primer ámbito operativo\./);
  assert.doesNotMatch(page, /a\.user\.|a\.role\.|a\.scope\./);
});

test("el ámbito global permite crear el primer ámbito operativo", () => {
  const view = module.exports.buildRolesAmbitosViewModel(
    [{ id: 1, code: "GLOBAL", name: "Global", kind: "GLOBAL" }],
    true,
  );

  assert.equal(view.scopeCount, 1);
  assert.equal(view.showCreateScope, true);
  assert.equal(view.createScopeLabel, "Crear primer ámbito operativo");
});
