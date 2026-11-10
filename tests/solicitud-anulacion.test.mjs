import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import test from "node:test";
import ts from "typescript";
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import { Ban } from "lucide-react";

function load(file, imports = {}) {
  const source = readFileSync(
    new URL(`../src/lib/${file}`, import.meta.url),
    "utf8",
  );
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  });
  const exports = {};
  runInNewContext(outputText, {
    exports,
    require: (name) => {
      if (!(name in imports)) throw new Error(`Import no simulado: ${name}`);
      return imports[name];
    },
  });
  return exports;
}

test("oculta Solicitar Anulación en borradores, anuladas y sin permiso", () => {
  const { puedeSolicitarAnulacion } = load("solicitud-anulacion-types.ts");
  for (const estado of ["Borrador", "BORRADOR", "ANULADA", "RECHAZADA"]) {
    assert.equal(puedeSolicitarAnulacion(estado, true), false);
  }
  for (const estado of ["EMITIDA", "APROBADA"]) {
    assert.equal(puedeSolicitarAnulacion(estado, true), true);
    assert.equal(puedeSolicitarAnulacion(estado, false), false);
  }
});

test("rechazo requiere una observación con contenido", () => {
  const { puedeResolverSolicitud } = load("solicitud-anulacion-types.ts");
  assert.equal(puedeResolverSolicitud("RECHAZADA", "  "), false);
  assert.equal(puedeResolverSolicitud("RECHAZADA", "No procede"), true);
  assert.equal(puedeResolverSolicitud("APROBADA", ""), true);
  assert.equal(puedeResolverSolicitud("PENDIENTE", "texto"), false);
});

test("Axios usa las rutas, bodies y ámbito correctos sin enviar identidades", async () => {
  const calls = [];
  const api = Object.fromEntries(
    ["post", "get", "patch"].map((method) => [
      method,
      async (...args) => {
        calls.push({ method, args });
        return { data: method === "get" ? [] : { id: 12 } };
      },
    ]),
  );
  const service = load("solicitud-anulacion-api.ts", { "@/lib/api": { api } });
  const headers = { "x-scope-id": "2" };
  await service.crearSolicitud(42, "Error", headers);
  await service.obtenerPendientes(headers);
  await service.resolverSolicitud(12, "RECHAZADA", "No procede", headers);
  assert.equal(
    JSON.stringify(calls),
    JSON.stringify([
      {
        method: "post",
        args: [
          "/cotizaciones/42/solicitud-anulacion",
          { motivo: "Error" },
          { headers },
        ],
      },
      {
        method: "get",
        args: ["/solicitudes-anulacion/pendientes", { headers }],
      },
      {
        method: "patch",
        args: [
          "/solicitudes-anulacion/12/resolver",
          { estado: "RECHAZADA", observacion: "No procede" },
          { headers },
        ],
      },
    ]),
  );
});

test("ruta y menú de solicitudes dependen del permiso validado, incluso para Admin", () => {
  const { canAccessPath, getVisibleNavigationSections } = load("navigation.ts");
  for (const role of ["Comercial", "Admin", "Logistica"]) {
    assert.equal(canAccessPath("/solicitudes", role, []), false);
    assert.equal(
      canAccessPath("/solicitudes", role, ["solicitudes_anulacion.ver"]),
      true,
    );
    const hrefs = (permissions) =>
      getVisibleNavigationSections(role, permissions).flatMap((s) =>
        s.links.map((l) => l.href),
      );
    assert.equal(hrefs([]).includes("/solicitudes"), false);
    assert.equal(
      hrefs(["solicitudes_anulacion.ver"]).includes("/solicitudes"),
      true,
    );
  }
});

test("el componente real no renderiza el botón en borrador ni sin permiso", () => {
  let allowed = true;
  const source = readFileSync(
    new URL("../src/components/SolicitudAnulacionButton.tsx", import.meta.url),
    "utf8",
  );
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
    },
  });
  const imports = {
    react: React,
    "react/jsx-runtime": jsxRuntime,
    "lucide-react": { Ban },
    "@/components/ui/Button": {
      Button: ({ children }) => React.createElement("button", null, children),
    },
    "@/components/ui/Modal": { Modal: () => null },
    "@/lib/solicitud-anulacion-api": {
      crearSolicitud: () => {
        throw new Error("No debe enviar durante el render");
      },
    },
    "@/lib/solicitud-anulacion-types": load("solicitud-anulacion-types.ts"),
    "@/lib/session": {
      useSession: () => ({ can: () => allowed }),
      useQuoteHeaders: () => ({}),
    },
  };
  const exports = {};
  runInNewContext(outputText, { exports, require: (name) => imports[name] });
  const render = (estado) =>
    renderToStaticMarkup(
      React.createElement(exports.SolicitudAnulacionButton, {
        cotizacion: { id: 42, consecutivo: "COT-42", estado },
        onSuccess: () => {},
      }),
    );
  assert.equal(render("Borrador"), "");
  assert.match(render("EMITIDA"), /Solicitar Anulación/);
  assert.match(render("APROBADA"), /Solicitar Anulación/);
  allowed = false;
  assert.equal(render("EMITIDA"), "");
});
