"use client";

import { forwardRef, type CSSProperties } from "react";
import Image from "next/image";
import { Cotizacion, formatearMoneda } from "@/lib/cotizacion-types";
import { getCotizacionPdfContent } from "@/lib/cotizacion-pdf-content";
import type { PdfFormatMetadata } from "@/lib/pdf-render-data";

type Props = {
  data: Cotizacion;
  metadata?: PdfFormatMetadata;
  creatorMode?: "document" | "preview";
};

type TemplateStyle = {
  accent: string;
  secondary: string;
  light: string;
  border: string;
  horizontalPadding: string;
  topPadding: string;
  bottomPadding: string;
};

const templateStyles: Record<Cotizacion["tipo_servicio"], TemplateStyle> = {
  INDUSTRIAL_ETO: {
    accent: "#008000",
    secondary: "#008000",
    light: "#FFFFFF",
    border: "#A6C9A6",
    horizontalPadding: "20mm",
    topPadding: "12mm",
    bottomPadding: "10mm",
  },
  INSTITUCIONAL_ETO: {
    accent: "#365F91",
    secondary: "#365F91",
    light: "#FFFFFF",
    border: "#A9B9D0",
    horizontalPadding: "19mm",
    topPadding: "12mm",
    bottomPadding: "10mm",
  },
  INSTITUCIONAL_VAPOR: {
    accent: "#00B0F0",
    secondary: "#00B0F0",
    light: "#FFFFFF",
    border: "#9CCFE3",
    horizontalPadding: "19mm",
    topPadding: "12mm",
    bottomPadding: "10mm",
  },
  INSUMOS: {
    accent: "#000000",
    secondary: "#4472C4",
    light: "#D9E1F2",
    border: "#B4C7E7",
    horizontalPadding: "30mm",
    topPadding: "12mm",
    bottomPadding: "10mm",
  },
  LAVANDERIA: {
    accent: "#980098",
    secondary: "#990099",
    light: "#FFFFFF",
    border: "#D0A6D0",
    horizontalPadding: "30mm",
    topPadding: "12mm",
    bottomPadding: "10mm",
  },
  FARMACEUTICO: {
    accent: "#008000",
    secondary: "#008000",
    light: "#FFFFFF",
    border: "#A6C9A6",
    horizontalPadding: "20mm",
    topPadding: "12mm",
    bottomPadding: "10mm",
  },
  FABRICANTE: {
    accent: "#365F91",
    secondary: "#365F91",
    light: "#FFFFFF",
    border: "#A9B9D0",
    horizontalPadding: "19mm",
    topPadding: "12mm",
    bottomPadding: "10mm",
  },
};

const clientFields = [
  ["CLIENTE", (data: Cotizacion) => data.cliente?.razon_social],
  ["NIT / C.C. / C.E. / OTRO", (data: Cotizacion) => data.cliente?.nit],
  ["CONTACTO", (data: Cotizacion) => data.cliente?.contacto],
  ["CARGO", (data: Cotizacion) => data.cliente?.cargo],
  ["TELÉFONO", (data: Cotizacion) => data.cliente?.telefono],
  ["E-MAIL", (data: Cotizacion) => data.cliente?.email],
  ["DIRECCIÓN", (data: Cotizacion) => data.cliente?.direccion],
  ["CIUDAD", (data: Cotizacion) => data.cliente?.ciudad],
] as const;

const commercialTerms = [
  "TIEMPO DE DESPACHO",
  "TRANSPORTE",
  "FORMA DE PAGO",
  "VALIDEZ DE LA OFERTA",
  "EL PRECIO INCLUYE",
  "EL PRECIO NO INCLUYE",
];

function valueOrBlank(value: string | null | undefined) {
  return value?.trim() || "";
}

function formatDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("es-CO");
}

export const CotizacionPDF = forwardRef<HTMLDivElement, Props>(
  function CotizacionPDF({ data, metadata, creatorMode = "document" }, ref) {
    const content = getCotizacionPdfContent(data.tipo_servicio);
    const template = templateStyles[data.tipo_servicio];
    const creatorName = [data.creador?.nombre, data.creador?.apellido].filter(Boolean).join(" ");
    const documentStyle = {
      padding: `${template.topPadding} ${template.horizontalPadding} ${template.bottomPadding}`,
    } satisfies CSSProperties;

    return (
      <article
        ref={ref}
        className="cotizacion-pdf pdf-document box-border bg-white text-[9pt] leading-[1.25] text-[#222222]"
        data-pdf-accent={template.accent}
        data-pdf-document="cotizacion"
      >
        <div className="min-h-[267mm]" style={documentStyle}>
          <header className="grid grid-cols-[1fr_1fr_0.8fr] items-center gap-3 border-b-2 pb-[4mm]" style={{ borderColor: template.accent }}>
            <Image
              src="/Logo1.png"
              alt="Sterinova — Aseguramiento en esterilización"
              width={440}
              height={180}
              unoptimized
              className="h-auto w-[43mm] object-contain"
            />
            <Image
              src="/certificaciones-icontec-iqnet.jpeg"
              alt="Certificaciones Icontec ISO 9001, ISO 13485 e IQNET"
              width={442}
              height={110}
              unoptimized
              className="mx-auto h-auto w-[43mm] object-contain"
            />
            <div className="text-right text-[7.5pt] leading-[1.5]" style={{ color: template.accent }}>
              <p className="font-bold">{metadata?.codigo || content.documentCode}</p>
              <p>VERSION: {metadata?.versionLabel || "04"}</p>
              <p>{metadata?.fechaVersion || "17-09-2026"}</p>
            </div>
          </header>

          <table className="mt-[3mm] w-full table-fixed border-collapse text-[8pt]">
            <tbody>
              <tr>
                <th
                  className="w-[36%] border px-[3mm] py-[1.4mm] text-left font-bold text-white"
                  style={{ backgroundColor: template.accent, borderColor: template.accent }}
                >
                  Cotización No.
                </th>
                <td
                  className="w-[64%] border px-[3mm] py-[1.4mm] font-semibold"
                  style={{ borderColor: template.border }}
                >
                  {data.consecutivo}
                </td>
              </tr>
              <tr>
                <th
                  className="border px-[3mm] py-[1.4mm] text-left font-bold text-white"
                  style={{ backgroundColor: template.accent, borderColor: template.accent }}
                >
                  FECHA
                </th>
                <td
                  className="border px-[3mm] py-[1.4mm]"
                  style={{ borderColor: template.border }}
                >
                  {formatDate(data.fecha)}
                </td>
              </tr>
            </tbody>
          </table>

          <section className="mb-[3mm] mt-[3mm] text-center">
            <h1 className="text-[16pt] font-bold leading-tight" style={{ color: template.accent }}>
              {content.title}
            </h1>
            <h2 className="mt-[1mm] text-[10pt] font-semibold" style={{ color: template.secondary }}>
              {content.subtitle}
            </h2>
          </section>

          <table className="w-full table-fixed border-collapse text-[8pt]">
            <tbody>
              {clientFields.map(([label, getValue]) => (
                  <tr key={label} className="break-inside-avoid">
                  <td
                    className="w-[3mm] border px-0 py-[0.9mm]"
                    style={{ backgroundColor: template.accent, borderColor: template.accent }}
                  />
                  <th
                    scope="row"
                    className="w-[37%] border px-[2.5mm] py-[0.9mm] text-left font-bold"
                    style={{ backgroundColor: template.light, borderColor: template.border, color: template.accent }}
                  >
                    {label}
                  </th>
                  <td
                    className="border px-[2.5mm] py-[0.9mm]"
                    style={{ borderColor: template.border }}
                  >
                    {valueOrBlank(getValue(data))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <section className="my-[3mm] space-y-[1.5mm] text-justify text-[8.5pt] leading-[1.35]">
            {content.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>

          <h2
            className="mb-[2mm] border-b pb-[1.5mm] text-[9pt] font-bold tracking-wide"
            style={{ borderColor: template.border, color: template.accent }}
          >
            DETALLE DE COTIZACIÓN:
          </h2>
          {data.tipo_servicio === "INSUMOS" ? (
            <h3
              className="mb-[1.5mm] text-[8pt] font-bold"
              style={{ color: template.secondary }}
            >
              EMPAQUES PARA ESTERILIZACIÓN:
            </h3>
          ) : null}
          <table className="w-full table-fixed border-collapse text-[8pt]">
            <thead className="table-header-group">
              <tr className="text-white">
                <th
                  className="w-[46%] border px-[2mm] py-[1.6mm] text-left font-bold"
                  style={{ backgroundColor: template.secondary, borderColor: template.secondary }}
                >
                  {data.tipo_servicio === "INSUMOS" ? "REFERENCIA / DESCRIPCIÓN" : "DESCRIPCIÓN"}
                </th>
                <th
                  className="w-[14%] border px-[1.5mm] py-[1.6mm] text-center font-bold"
                  style={{ backgroundColor: template.secondary, borderColor: template.secondary }}
                >
                  CANTIDAD
                </th>
                <th
                  className="w-[20%] border px-[1.5mm] py-[1.6mm] text-right font-bold"
                  style={{ backgroundColor: template.secondary, borderColor: template.secondary }}
                >
                  VALOR UNITARIO
                </th>
                <th
                  className="w-[20%] border px-[1.5mm] py-[1.6mm] text-right font-bold"
                  style={{ backgroundColor: template.secondary, borderColor: template.secondary }}
                >
                  VALOR TOTAL
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items?.map((item, index) => (
                <tr
                  key={item.id ?? `${item.descripcion}-${index}`}
                  className="break-inside-avoid"
                >
                  <td className="whitespace-pre-line break-words border px-[2mm] py-[1.1mm]" style={{ borderColor: template.border }}>
                    {item.descripcion}
                  </td>
                  <td className="border px-[1.5mm] py-[1.1mm] text-center" style={{ borderColor: template.border }}>
                    {item.cantidad}
                  </td>
                  <td className="border px-[1.5mm] py-[1.1mm] text-right" style={{ borderColor: template.border }}>
                    {formatearMoneda(item.valor_unitario)}
                  </td>
                  <td className="border px-[1.5mm] py-[1.1mm] text-right" style={{ borderColor: template.border }}>
                    {formatearMoneda(item.valor_total)}
                  </td>
                </tr>
              ))}
              {!data.items?.length ? (
                <tr>
                  <td
                    colSpan={4}
                    className="border px-2 py-2 text-center"
                    style={{ borderColor: template.border }}
                  >
                    No hay ítems registrados.
                  </td>
                </tr>
              ) : null}
            </tbody>
            <tfoot className="quote-totals">
              {[
                ["SUBTOTAL", data.subtotal],
                ["IVA (19%)", data.iva],
                ["TOTAL", data.total],
              ].map(([label, amount]) => (
                <tr key={label} className="break-inside-avoid">
                  <th
                    colSpan={3}
                    className="border px-[2mm] py-[1mm] text-right font-bold"
                    style={{ backgroundColor: template.light, borderColor: template.border, color: template.accent }}
                  >
                    {label}
                  </th>
                  <td
                    className="border px-[2mm] py-[1mm] text-right font-semibold"
                    style={{ borderColor: template.border, color: template.accent }}
                  >
                    {formatearMoneda(amount)}
                  </td>
                </tr>
              ))}
            </tfoot>
          </table>

          <p className="mt-[2mm] text-[8pt] italic">
            {content.pricingNote}
          </p>

          <section className="mt-[2.5mm]">
            <h2
              className="mb-[1.5mm] text-[9pt] font-bold tracking-wide"
              style={{ color: template.accent }}
            >
              CONDICIONES COMERCIALES
            </h2>
            <table className="w-full table-fixed border-collapse text-[7.5pt]">
              <tbody>
                {commercialTerms.map((term) => (
                  <tr key={term} className="break-inside-avoid">
                    <th
                      scope="row"
                      className="w-[38%] border px-[2mm] py-[0.8mm] text-left font-bold"
                      style={{ backgroundColor: template.light, borderColor: template.border, color: template.accent }}
                    >
                      {term}
                    </th>
                    <td className="border px-[2mm] py-[0.8mm]" style={{ borderColor: template.border }} />
                  </tr>
                ))}
                {data.condiciones_comerciales?.trim() ? (
                  <tr className="break-inside-avoid">
                    <th
                      scope="row"
                      className="w-[38%] border px-[2mm] py-[0.8mm] text-left font-bold"
                      style={{ backgroundColor: template.light, borderColor: template.border, color: template.accent }}
                    >
                      CONDICIONES ADICIONALES
                    </th>
                    <td
                      className="whitespace-pre-line break-words border px-[2mm] py-[0.8mm]"
                      style={{ borderColor: template.border }}
                    >
                      {data.condiciones_comerciales}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </section>

          <section className="mt-[4mm] grid grid-cols-2 gap-[12mm] break-inside-avoid text-center text-[7.5pt]">
            <div className="flex flex-col items-center">
              <div className="mb-[1.5mm] h-[8mm] w-full border-b" style={{ borderColor: template.accent }} />
              <strong className="text-[8pt]" style={{ color: template.accent }}>Realizó:</strong>
              <strong>{creatorMode === "preview" ? creatorName || "—" : "Juan José Hernández"}</strong>
              <span>{creatorMode === "preview" ? data.creador?.cargo || "—" : "Analista Comercial"}</span>
              <span>{creatorMode === "preview" ? `Cel: ${data.creador?.celular || "—"}` : "Cel: 317 718 3115"}</span>
              <span>{creatorMode === "preview" ? `Email: ${data.creador?.email_contacto || "—"}` : "Email: comercial1@sterinova.co"}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-[1.5mm] h-[8mm] w-full border-b" style={{ borderColor: template.accent }} />
              <strong className="text-[8pt]" style={{ color: template.accent }}>Aprobó:</strong>
              <strong>Ing. Daniel Riveros</strong>
              <span>Subgerente Comercial</span>
              <span>Cel: 318 338 8210</span>
              <span>Email: daniel.riveros@sterinova.co</span>
            </div>
          </section>

          <footer className="mt-[2mm] flex flex-wrap items-center justify-between gap-2 border-t pt-[1mm] text-[6.5pt] text-slate-600 break-inside-avoid">
            <span>{metadata?.codigo || content.documentCode} | VERSION {metadata?.versionLabel || "04"} | {metadata?.fechaVersion || "17-09-2026"}</span>
            <span>STERINOVA | Documento controlado</span>
          </footer>

        </div>
      </article>
    );
  },
);

export default CotizacionPDF;
