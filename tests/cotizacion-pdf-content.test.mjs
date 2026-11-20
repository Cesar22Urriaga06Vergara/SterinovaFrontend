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
  "cotizacion-pdf-content.ts",
);
const pdfRenderDataPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "lib",
  "pdf-render-data.ts",
);
const stylesheetPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "app",
  "globals.css",
);
const cotizacionesPagePath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "app",
  "(erp)",
  "comercial",
  "cotizaciones",
  "page.tsx",
);
const cotizacionPdfComponentPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "components",
  "pdf",
  "CotizacionPDF.tsx",
);
const source = readFileSync(sourcePath, "utf8");
const pdfRenderDataSource = readFileSync(pdfRenderDataPath, "utf8");
const stylesheet = readFileSync(stylesheetPath, "utf8");
const cotizacionesPage = readFileSync(cotizacionesPagePath, "utf8");
const cotizacionPdfComponent = readFileSync(cotizacionPdfComponentPath, "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
});
const compiledModule = { exports: {} };
runInNewContext(outputText, { exports: compiledModule.exports });
const { outputText: pdfRenderDataOutput } = ts.transpileModule(pdfRenderDataSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
});
const pdfRenderDataModule = { exports: {} };
runInNewContext(pdfRenderDataOutput, { exports: pdfRenderDataModule.exports });

const contentByService = [
  {
    type: "INDUSTRIAL_ETO",
    code: "R-CM-07-1",
    title: "ESTERILIZACIÓN INDUSTRIAL",
    paragraphs: [
      "En atención a su solicitud, nos permitimos presentar nuestra cotización correspondiente al servicio de esterilización industrial con Óxido de Etileno (EtO) de Sterinova, dirigido al procesamiento de productos que requieren este método de esterilización. Nuestro servicio está orientado a brindar soluciones confiables y adaptadas a las características y necesidades de cada producto y proceso.",
      "A continuación, presentamos el alcance del servicio y las condiciones comerciales correspondientes a su solicitud.",
    ],
  },
  {
    type: "INSTITUCIONAL_ETO",
    code: "R-CM-07-2",
    title: "ESTERILIZACIÓN INSTITUCIONAL EtO",
    paragraphs: [
      "En atención a su solicitud, nos permitimos presentar nuestra cotización correspondiente al servicio de esterilización institucional con Óxido de Etileno (EtO) de Sterinova, orientado a atender requerimientos de esterilización de productos compatibles con este método. Nuestro servicio brinda una solución oportuna y confiable de acuerdo con las necesidades y condiciones particulares de cada cliente.",
      "A continuación, presentamos el alcance del servicio y las condiciones comerciales correspondientes a su solicitud.",
    ],
  },
  {
    type: "INSTITUCIONAL_VAPOR",
    code: "R-CM-07-3",
    title: "ESTERILIZACIÓN INSTITUCIONAL VAPOR",
    paragraphs: [
      "En atención a su solicitud, nos permitimos presentar nuestra cotización correspondiente al servicio de esterilización institucional con vapor de Sterinova, orientado a atender requerimientos de esterilización de productos compatibles con este método, especialmente en situaciones de contingencia. Nuestro servicio busca brindar una solución oportuna y confiable, de acuerdo con las necesidades y condiciones particulares de cada cliente.",
      "A continuación, presentamos el alcance del servicio y las condiciones comerciales correspondientes a su solicitud.",
    ],
  },
  {
    type: "INSUMOS",
    code: "R-CM-07-4",
    title: "VENTA DE INSUMOS",
    paragraphs: [
      "En atención a su solicitud, nos permitimos presentar nuestra cotización correspondiente a la línea de venta de insumos de Sterinova, especializada en soluciones para procesos de esterilización y monitoreo.",
      "A continuación, presentamos los productos y condiciones comerciales correspondientes a su solicitud.",
    ],
  },
  {
    type: "LAVANDERIA",
    code: "R-CM-07-5",
    title: "LAVANDERIA DOTACIÓN FARMACÉUTICA",
    paragraphs: [
      "En atención a su solicitud, nos permitimos presentar nuestra cotización correspondiente al servicio de lavandería de dotación farmacéutica de Sterinova, orientado al lavado y acondicionamiento de prendas y elementos utilizados en ambientes farmacéuticos y áreas que requieren condiciones especiales de procesamiento.",
      "A continuación, presentamos el alcance del servicio y las condiciones comerciales correspondientes a su solicitud.",
    ],
  },
];

for (const expected of contentByService) {
  test(`usa el formato oficial ${expected.code}`, () => {
    const actual = compiledModule.exports.getCotizacionPdfContent(expected.type);
    assert.equal(actual.documentCode, expected.code);
    assert.equal(actual.title, expected.title);
    assert.deepEqual([...actual.paragraphs], expected.paragraphs);
    assert.equal(Object.hasOwn(actual, "pricingNote"), false);
  });
}

test("FARMACEUTICO y FABRICANTE comparten el formato aprobado R-CM-07-1", () => {
  const contents = ["FARMACEUTICO", "FABRICANTE"].map((type) => {
    const content = compiledModule.exports.getCotizacionPdfContent(type);
    assert.equal(content.title, "ESTERILIZACIÓN INDUSTRIAL");
    assert.equal(content.documentCode, "R-CM-07-1");
    assert.equal(content.paragraphs.length, 2);
    return content;
  });
  assert.deepEqual(contents[0], contents[1]);
});

test("mantiene la ruta interna imprimible en flujo para admitir varias páginas", () => {
  assert.match(stylesheet, /\.pdf-render-page\.pdf-print-root\s*\{\s*position:\s*static/s);
});

test("desactiva validación instant en el segmento de cotizaciones desde el server page", () => {
  assert.doesNotMatch(cotizacionesPage, /^["']use client["'];/);
  assert.match(cotizacionesPage, /export const instant = false;/);
});

test("no usa utilidades de color con opacidad en el HTML capturado por html2canvas", () => {
  assert.doesNotMatch(cotizacionPdfComponent, /\b(?:text|bg|border)-[^\s"]+\/\d{2,3}\b/);
});

test("aplica las paletas oficiales de los cinco formatos", () => {
  for (const color of ["#008000", "#365F91", "#00B0F0", "#4472C4", "#980098"]) {
    assert.ok(cotizacionPdfComponent.includes(color), `Falta el color ${color}`);
  }
});

test("la tabla dinámica solo renderiza los ítems de la cotización", () => {
  assert.match(cotizacionPdfComponent, /\(data\.items \?\? \[\]\)\.filter/);
  assert.match(cotizacionPdfComponent, /cells\.map/);
  assert.match(cotizacionPdfComponent, /\{columns\[0\] \?\? "DESCRIPCIÓN"\}/);
  assert.match(cotizacionPdfComponent, /No hay ítems registrados/);
  assert.doesNotMatch(cotizacionPdfComponent, /Rollo plano PGM|BOLSA PRECORTADA/);
});

test("las cotizaciones multipágina conservan encabezados y totales sin repetirlos", () => {
  assert.match(stylesheet, /\.cotizacion-pdf thead\s*\{\s*display:\s*table-header-group;/s);
  assert.match(stylesheet, /\.cotizacion-pdf tfoot\.quote-totals\s*\{\s*display:\s*table-row-group;/s);
  assert.match(stylesheet, /\.pdf-render-page\.pdf-print-root\s*\{\s*position:\s*static/s);
});

test("ajusta descripciones de procedimientos extensas y permite saltos de línea", () => {
  assert.match(cotizacionPdfComponent, /whitespace-pre-line break-words border px-\[1\.5mm\] py-\[1\.1mm\]/);
  assert.match(cotizacionPdfComponent, /whitespace-pre-line break-words border px-\[2mm\] py-\[0\.8mm\]/);
});

test("reconstruye los datos de QR y de la orden desde los certificados históricos migrados", () => {
  const certificate = pdfRenderDataModule.exports.certificadoFromPdfSnapshot({
    documento: { tipo: "CERTIFICADO", consecutivo: "001", token_publico: "legacy-token" },
    cliente: { razon_social: "Cliente histórico", nit: "900123456" },
    orden_servicio: { consecutivo: "ORD-090" },
    certificado: { consecutivo: "001", equipo: "E03", ciclo: "12" },
    cotizacion: {
      consecutivo: "COT-LAV-007",
      items: [{ id: 4, descripcion: "Bata", cantidad: 3 }],
    },
    ciclo_esterilizacion: { id: 12, equipo: "E03", metodo: "ETO" },
  });

  assert.equal(certificate.token_publico, "legacy-token");
  assert.equal(
    certificate.cicloEsterilizacion.orden.consecutivo,
    "ORD-090",
  );
  assert.equal(
    certificate.cicloEsterilizacion.orden.cotizacion.cliente.razon_social,
    "Cliente histórico",
  );
  assert.equal(
    certificate.cicloEsterilizacion.orden.cotizacion.items[0].descripcion,
    "Bata",
  );
});

test("conserva el transporte al reconstruir la cotización de una vista previa PDF", () => {
  const quote = pdfRenderDataModule.exports.cotizacionFromPdfSnapshot({
    documento: { consecutivo: "COT-001" },
    cliente: { id: 1 },
    cotizacion: {
      tipo_servicio: "INDUSTRIAL_ETO",
      subtotal: 25000,
      valor_transporte: 15000,
      aplica_transporte: true,
      iva: 4750,
      total: 29750,
      items: [],
    },
  });
  assert.equal(quote.valor_transporte, 15000);
  assert.equal(quote.aplica_transporte, true);
});

test("recupera el transporte si el snapshot solo conserva el subtotal combinado", () => {
  const quote = pdfRenderDataModule.exports.cotizacionFromPdfSnapshot({
    documento: { consecutivo: "COT-002" },
    cliente: { id: 1 },
    cotizacion: {
      tipo_servicio: "INDUSTRIAL_ETO",
      subtotal: 25000,
      iva: 4750,
      total: 29750,
      items: [{ descripcion: "Servicio", cantidad: 1, valor_unitario: 10000, valor_total: 10000 }],
    },
  });
  assert.equal(quote.valor_transporte, 15000);
  assert.equal(quote.aplica_transporte, true);
});
