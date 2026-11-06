import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { runInNewContext } from "node:vm";
import test from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadTypeScript(relativePath) {
  const source = readFileSync(path.join(root, relativePath), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  });
  const compiledModule = { exports: {} };
  runInNewContext(outputText, { exports: compiledModule.exports });
  return compiledModule.exports;
}

test("expone los siete tipos de cotización y sus prefijos del backend", () => {
  const { TIPOS_SERVICIO } = loadTypeScript("src/lib/cotizacion-types.ts");
  const quotePage = readFileSync(
    path.join(root, "src/app/(erp)/comercial/cotizaciones/nueva/page.tsx"),
    "utf8",
  );
  const templatesPage = readFileSync(
    path.join(root, "src/app/(erp)/configuracion/plantillas/PlantillasDocumentalesClient.tsx"),
    "utf8",
  );

  assert.deepEqual(
    [...TIPOS_SERVICIO].map(({ value, prefix }) => [value, prefix]),
    [
      ["INDUSTRIAL_ETO", "COT-IND-"],
      ["INSTITUCIONAL_ETO", "COT-CME-"],
      ["INSTITUCIONAL_VAPOR", "COT-CME-"],
      ["INSUMOS", "COT-CMI-"],
      ["LAVANDERIA", "COT-LAV-"],
      ["FARMACEUTICO", "COT-CEMFA-"],
      ["FABRICANTE", "COT-CMED-"],
    ],
  );
  assert.match(quotePage, /\{tipo\.label\} · \{tipo\.prefix\}/);
  assert.match(templatesPage, /\["FARMACEUTICO", "Farmacéutico"\]/);
  assert.match(templatesPage, /\["FABRICANTE", "Fabricante"\]/);
});

test("valida contraseñas según el mínimo de 10 caracteres del backend", () => {
  const { validateUserForm } = loadTypeScript("src/lib/user-validation.ts");
  const form = {
    nombre: "Ana",
    email: "ana@example.com",
    email_contacto: "",
    password: "Abcdef12",
  };

  assert.deepEqual({ ...validateUserForm(form, false) }, {
    password: "La contraseña debe tener al menos 10 caracteres.",
  });
  assert.deepEqual(
    { ...validateUserForm({ ...form, password: "abcdefghij" }, false) },
    {},
  );
  assert.deepEqual(
    { ...validateUserForm({ ...form, password: "" }, true) },
    {},
  );
});

test("valida campos requeridos y formato de correos con errores por campo", () => {
  const { validateUserForm } = loadTypeScript("src/lib/user-validation.ts");

  assert.deepEqual(
    { ...validateUserForm(
      { nombre: " ", email: "invalido", email_contacto: "contacto" },
      false,
    ) },
    {
      nombre: "El nombre es obligatorio.",
      email: "Ingresa un correo de acceso válido.",
      email_contacto: "Ingresa un correo de contacto válido.",
      password: "La contraseña es obligatoria.",
    },
  );
});

test("el rechazo de Calidad no acepta motivos vacíos ni de solo espacios", () => {
  const { getRejectReasonError } = loadTypeScript(
    "src/lib/calidad-validation.ts",
  );

  assert.equal(getRejectReasonError("   "), "El motivo del rechazo es obligatorio.");
  assert.equal(getRejectReasonError("Revisar parámetros"), "");
});

test("el Dashboard informa métricas en construcción sin usar datos de demo", () => {
  const dashboardPage = readFileSync(
    path.join(root, "src/app/(erp)/page.tsx"),
    "utf8",
  );
  const dashboardClient = readFileSync(
    path.join(root, "src/app/(erp)/DashboardClient.tsx"),
    "utf8",
  );

  assert.match(dashboardPage, /export const instant = false/);
  assert.match(dashboardClient, /EmptyState/);
  assert.match(dashboardClient, /Métricas en construcción/);
  assert.match(dashboardClient, /TODO:.*\/api\/metrics/);
  assert.doesNotMatch(dashboardClient, /Demo · Pendiente de conexión a la API/);
});

test("Calidad confirma con contraseña en modal y notifica errores de aprobación", () => {
  const qualityPage = readFileSync(
    path.join(root, "src/app/(erp)/calidad/revisar/[ciclo_id]/page.tsx"),
    "utf8",
  );
  const apiClient = readFileSync(path.join(root, "src/lib/api.ts"), "utf8");

  assert.match(qualityPage, /setApprovalOpen\(true\)/);
  assert.match(qualityPage, /getRejectReasonError/);
  assert.match(apiClient, /notifyToast\(getApiErrorMessage\(error\), "error"\)/);
});

test("Usuarios valida antes de crear y muestra errores junto a cada campo", () => {
  const usersPage = readFileSync(
    path.join(root, "src/app/(erp)/usuarios/page.tsx"),
    "utf8",
  );
  const userDialog = readFileSync(
    path.join(root, "src/app/(erp)/usuarios/UserDialogs.tsx"),
    "utf8",
  );

  assert.match(usersPage, /validateUserForm/);
  assert.match(usersPage, /api\.post\("\/users"/);
  assert.match(userDialog, /errors\.password/);
  assert.match(userDialog, /errors\.email/);
});
