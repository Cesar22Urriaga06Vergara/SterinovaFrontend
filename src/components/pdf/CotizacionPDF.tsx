"use client";
import { ivaLabel } from "@/lib/iva";

import { Fragment, forwardRef, type CSSProperties } from "react";
import Image from "next/image";
import { Cotizacion, formatearMoneda } from "@/lib/cotizacion-types";
import { formatDate } from "@/lib/format";
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
  ["TIEMPO DE DESPACHO", (data: Cotizacion) => data.tiempo_despacho],
  ["TRANSPORTE", (data: Cotizacion) => data.transporte],
  ["FORMA DE PAGO", (data: Cotizacion) => data.forma_pago],
  ["VALIDEZ DE LA OFERTA", (data: Cotizacion) => data.validez_oferta],
  ["EL PRECIO INCLUYE", (data: Cotizacion) => data.precio_incluye],
  ["EL PRECIO NO INCLUYE", (data: Cotizacion) => data.precio_no_incluye],
] as const;

function valueOrBlank(value: string | null | undefined) {
  return value?.trim() || "";
}

export const CotizacionPDF = forwardRef<HTMLDivElement, Props>(
  function CotizacionPDF({ data, metadata, creatorMode = "document" }, ref) {
    const baseContent = getCotizacionPdfContent(data.tipo_servicio);
    const configuration = metadata?.configuration ?? {};
    const detail = (configuration.detail ?? {}) as Record<string, unknown>;
    const branding = (configuration.branding ?? {}) as Record<string, unknown>;
    const content = {
      ...baseContent,
      title: metadata?.title || baseContent.title,
      subtitle: String(configuration.subtitle ?? baseContent.subtitle),
      paragraphs: Array.isArray(configuration.paragraphs)
        ? configuration.paragraphs.filter((value): value is string => typeof value === "string")
        : baseContent.paragraphs,
    };
    const baseTemplate = templateStyles[data.tipo_servicio];
    const template = {
      ...baseTemplate,
      accent: typeof branding.accent === "string" ? branding.accent : baseTemplate.accent,
      secondary: typeof branding.secondary === "string" ? branding.secondary : typeof branding.accent === "string" ? branding.accent : baseTemplate.secondary,
      light: typeof branding.light === "string" ? branding.light : baseTemplate.light,
      border: typeof branding.border === "string" ? branding.border : baseTemplate.border,
    };
    const configuredClientFields = Array.isArray(configuration.client_fields) ? configuration.client_fields as string[] : [];
    const columns = Array.isArray(detail.columns) ? detail.columns as string[] : ["DESCRIPCIÓN", "CANTIDAD", "VALOR UNITARIO", "VALOR TOTAL"];
    const configuredTermLabels = Array.isArray(configuration.commercial_terms) ? configuration.commercial_terms as string[] : [];
    const signatures = Array.isArray(configuration.signatures) ? configuration.signatures as Array<{label?: string;name?: string;role?: string;phone?: string;email?: string}> : [];
    const seals = data.sellos?.certificaciones?.length ? data.sellos.certificaciones : data.sellos?.icontec ? [data.sellos.icontec] : [];
    const itemSubtotal = Math.max(0, Number(data.subtotal) - Number(data.valor_transporte ?? 0));
    const creatorName = [data.creador?.nombre, data.creador?.apellido]
      .filter(Boolean)
      .join(" ");
    const documentStyle = {
      padding: `${template.topPadding} ${template.horizontalPadding} ${template.bottomPadding}`,
    } satisfies CSSProperties;
    const productSections = Array.isArray(configuration.product_sections) ? configuration.product_sections as string[] : ["EMPAQUES PARA ESTERILIZACIÓN", "MONITOREO ESTERILIZACIÓN", "EQUIPOS APOYO TECNOLÓGICO"];
    const insumosGroups = data.tipo_servicio === "INSUMOS"
      ? (["EMPAQUES", "MONITOREO", "EQUIPOS"] as const)
          .map((category) => ({
            category,
            items: (data.items ?? []).filter(
              (item) => (item.categoria ?? "EMPAQUES") === category,
            ),
          }))
          .filter((group) => group.items.length > 0)
      : [];

    function renderItemRow(item: NonNullable<Cotizacion["items"]>[number], index: number) {
      const isInsumos = data.tipo_servicio === "INSUMOS";
      const cells = isInsumos
        ? [
            item.codigo || "",
            <div key="reference" className="flex items-start justify-between gap-2"><div><strong>{item.referencia}</strong><p>{item.descripcion}</p></div>{item.imagen_src ? <Image src={item.imagen_src} alt={`Imagen de ${item.descripcion}`} width={100} height={70} unoptimized className="h-[18mm] w-[24mm] shrink-0 object-contain" /> : null}</div>,
            [item.presentacion, item.metodo, item.marca].filter(Boolean).join(" · "),
            formatearMoneda(item.valor_unitario),
          ]
        : [item.descripcion, `${item.cantidad}${item.unidad ? ` ${item.unidad}` : ""}`, formatearMoneda(item.valor_unitario), formatearMoneda(item.valor_total)];
      return (
        <tr key={item.id ?? `${item.descripcion}-${index}`} className="break-inside-avoid">
          {cells.map((value, cellIndex) => <td key={cellIndex} className={`whitespace-pre-line break-words border px-[1.5mm] py-[1.1mm] ${cellIndex === 0 && isInsumos ? "text-center" : cellIndex > 1 ? "text-right" : "text-left"}`} style={{ borderColor: template.border }}>{value}</td>)}
        </tr>
      );
    }

    return (
      <article
        ref={ref}
        className="cotizacion-pdf pdf-document box-border bg-white text-[9pt] leading-[1.25] text-[#222222]"
        data-pdf-accent={template.accent}
        data-pdf-document="cotizacion"
        data-pdf-schema-version="2"
      >
        <div className="min-h-[267mm]" style={documentStyle}>
          <header
            className="grid grid-cols-[1fr_1fr_0.8fr] items-center gap-3 border-b-2 pb-[4mm]"
            style={{ borderColor: template.accent }}
          >
            <Image
              src="/Logo1.png"
              alt="Sterinova — Aseguramiento en esterilización"
              width={440}
              height={180}
              unoptimized
              className="h-auto w-[43mm] object-contain"
            />
            {seals.length ? (
              <div className="flex flex-wrap items-center justify-center gap-1">
                {seals.map((seal) => <Image key={`${seal.sello_id}-${seal.version_id}`} src={seal.imagen_src} alt={seal.nombre_norma || "Sello de certificación"} width={442} height={110} unoptimized className="h-auto max-h-[18mm] w-[32mm] object-contain" />)}
              </div>
            ) : (
              <div aria-label="Sello ICONTEC pendiente de emision" />
            )}
            <div
              className="text-right text-[7.5pt] leading-[1.5]"
              style={{ color: template.accent }}
            >
              <p className="font-bold">
                {metadata?.codigo || content.documentCode}
              </p>
              <p>VERSION: {metadata?.versionLabel || "04"}</p>
              <p>{metadata?.fechaVersion || "17-09-2026"}</p>
            </div>
          </header>

          <table className="mt-[3mm] w-full table-fixed border-collapse text-[8pt]">
            <tbody>
              <tr>
                <th
                  className="w-[36%] border px-[3mm] py-[1.4mm] text-left font-bold text-white"
                  style={{
                    backgroundColor: template.accent,
                    borderColor: template.accent,
                  }}
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
                  style={{
                    backgroundColor: template.accent,
                    borderColor: template.accent,
                  }}
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
            <h1
              className="text-[16pt] font-bold leading-tight"
              style={{ color: template.accent }}
            >
              {content.title}
            </h1>
            <h2
              className="mt-[1mm] text-[10pt] font-semibold"
              style={{ color: template.secondary }}
            >
              {content.subtitle}
            </h2>
          </section>

          <table className="w-full table-fixed border-collapse text-[8pt]">
            <tbody>
              {clientFields.map(([defaultLabel, getValue], index) => {
                const label = index === 1 ? String(configuration.nit_label ?? configuredClientFields[index] ?? defaultLabel) : configuredClientFields[index] ?? defaultLabel;
                return (
                <tr key={label} className="break-inside-avoid">
                  <td
                    className="w-[3mm] border px-0 py-[0.9mm]"
                    style={{
                      backgroundColor: template.accent,
                      borderColor: template.accent,
                    }}
                  />
                  <th
                    scope="row"
                    className="w-[37%] border px-[2.5mm] py-[0.9mm] text-left font-bold"
                    style={{
                      backgroundColor: template.light,
                      borderColor: template.border,
                      color: template.accent,
                    }}
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
              );})}
            </tbody>
          </table>

          <section className="my-[3mm] space-y-[1.5mm] text-justify text-[8.5pt] leading-[1.35]">
              {content.paragraphs.map((paragraph, index) => (
                <p key={`${index}-${paragraph}`}>{paragraph}</p>
            ))}
          </section>

          <h2
            className="mb-[2mm] border-b pb-[1.5mm] text-[9pt] font-bold tracking-wide"
            style={{ borderColor: template.border, color: template.accent }}
          >
            {String(detail.title ?? "DETALLE DE COTIZACIÓN:")}
          </h2>
          <table className="w-full table-fixed border-collapse text-[8pt]">
            <thead className="table-header-group">
              <tr className="text-white">
                <th
                  className={`${data.tipo_servicio === "INSUMOS" ? "w-[14%]" : "w-[46%]"} border px-[2mm] py-[1.6mm] text-left font-bold`}
                  style={{
                    backgroundColor: template.secondary,
                    borderColor: template.secondary,
                  }}
                >
                  {columns[0] ?? "DESCRIPCIÓN"}
                </th>
                <th
                  className={`${data.tipo_servicio === "INSUMOS" ? "w-[42%]" : "w-[14%]"} border px-[1.5mm] py-[1.6mm] text-center font-bold`}
                  style={{
                    backgroundColor: template.secondary,
                    borderColor: template.secondary,
                  }}
                >
                  {columns[1] ?? "CANTIDAD"}
                </th>
                <th
                  className={`${data.tipo_servicio === "INSUMOS" ? "w-[24%]" : "w-[20%]"} border px-[1.5mm] py-[1.6mm] text-right font-bold`}
                  style={{
                    backgroundColor: template.secondary,
                    borderColor: template.secondary,
                  }}
                >
                  {columns[2] ?? "VALOR UNITARIO"}
                </th>
                <th
                  className="w-[20%] border px-[1.5mm] py-[1.6mm] text-right font-bold"
                  style={{
                    backgroundColor: template.secondary,
                    borderColor: template.secondary,
                  }}
                >
                  {columns[3] ?? "VALOR TOTAL"}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.tipo_servicio === "INSUMOS"
                ? insumosGroups.map((group) => (
                    <Fragment key={group.category}>
                      <tr className="break-inside-avoid">
                        <th
                          colSpan={4}
                          className="border px-[2mm] py-[1.2mm] text-left font-bold"
                          style={{
                            backgroundColor: template.light,
                            borderColor: template.border,
                            color: template.secondary,
                          }}
                        >
                          {group.category === "EMPAQUES" ? productSections[0] : group.category === "MONITOREO" ? productSections[1] : productSections[2]}
                        </th>
                      </tr>
                      {group.items.map((item, index) => renderItemRow(item, index))}
                    </Fragment>
                  ))
                : data.items?.map((item, index) => renderItemRow(item, index))}
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
              <tr aria-hidden="true">
                <td
                  colSpan={4}
                  className="border-0 p-0"
                  style={{ borderTop: `1.5pt solid ${template.secondary}`, height: "1.2mm" }}
                />
              </tr>
              {[
                ["SUBTOTAL", itemSubtotal],
                ...(Number(data.valor_transporte ?? 0) > 0 ? [["TRANSPORTE", data.valor_transporte] as [string, string | number]] : []),
                [ivaLabel(data.iva_tasa), data.iva],
                ["TOTAL", data.total],
              ].map(([label, amount]) => (
                <tr
                  key={label}
                  className={`break-inside-avoid ${label === "TOTAL" ? "font-bold" : ""}`}
                  style={label === "TOTAL" ? { backgroundColor: template.light } : undefined}
                >
                  <td colSpan={2} className="border-0 px-0 py-[1mm]" aria-hidden="true" />
                  <th
                    className={`w-[20%] border px-[1.5mm] py-[1mm] text-right ${label === "TOTAL" ? "font-bold" : "font-medium"}`}
                    style={{
                      borderColor: template.border,
                      color: template.accent,
                    }}
                  >
                    {label}
                  </th>
                  <td
                    className={`w-[20%] border px-[1.5mm] py-[1mm] text-right ${label === "TOTAL" ? "font-bold" : "font-medium"}`}
                    style={{
                      borderColor: template.border,
                      color: template.accent,
                    }}
                  >
                    {formatearMoneda(amount)}
                  </td>
                </tr>
              ))}
            </tfoot>
          </table>

          {typeof detail.pricing_note === "string" && detail.pricing_note.trim() ? <p className="mt-[1mm] text-[7pt] text-slate-600">{detail.pricing_note}</p> : null}
          <section className="mt-[2.5mm]">
            <h2
              className="mb-[1.5mm] text-[9pt] font-bold tracking-wide"
              style={{ color: template.accent }}
            >
              {String(configuration.commercial_terms_title ?? "CONDICIONES COMERCIALES")}
            </h2>
            <table className="w-full table-fixed border-collapse text-[7.5pt]">
              <tbody>
                {commercialTerms.map(([defaultTerm, getValue], index) => {
                  const term = configuredTermLabels[index] ?? defaultTerm;
                  return (
                  <tr key={term} className="break-inside-avoid">
                    <th
                      scope="row"
                      className="w-[38%] border px-[2mm] py-[0.8mm] text-left font-bold"
                      style={{
                        backgroundColor: template.light,
                        borderColor: template.border,
                        color: template.accent,
                      }}
                    >
                      {term}
                    </th>
                    <td
                      className="whitespace-pre-line break-words border px-[2mm] py-[0.8mm]"
                      style={{ borderColor: template.border }}
                    >
                      {getValue(data)?.trim() ?? ""}
                    </td>
                  </tr>
                );})}
                {data.condiciones_comerciales?.trim() ? (
                  <tr className="break-inside-avoid">
                    <th
                      scope="row"
                      className="w-[38%] border px-[2mm] py-[0.8mm] text-left font-bold"
                      style={{
                        backgroundColor: template.light,
                        borderColor: template.border,
                        color: template.accent,
                      }}
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
            {(signatures.length ? signatures : [
              { label: "Realizó", name: creatorMode === "preview" ? creatorName || "—" : "Juan José Hernández", role: creatorMode === "preview" ? data.creador?.cargo || "—" : "Analista Comercial", phone: creatorMode === "preview" ? data.creador?.celular || "" : "317 718 3115", email: creatorMode === "preview" ? data.creador?.email_contacto || "" : "comercial1@sterinova.co" },
              { label: "Aprobó", name: "Ing. Daniel Riveros", role: "Subgerente Comercial", phone: "318 338 8210", email: "daniel.riveros@sterinova.co" },
            ]).map((signature, index) => (
              <div key={`${signature.label}-${index}`} className="flex flex-col items-center">
                <div className="mb-[1.5mm] h-[8mm] w-full border-b" style={{ borderColor: template.accent }} />
                <strong className="text-[8pt]" style={{ color: template.accent }}>{signature.label || "Firma"}:</strong>
                <strong>{signature.name}</strong>
                <span>{signature.role}</span>
                {signature.phone ? <span>Cel: {signature.phone}</span> : null}
                {signature.email ? <span>Email: {signature.email}</span> : null}
              </div>
            ))}
          </section>
          {typeof configuration.footer_notes === "string" && configuration.footer_notes.trim() ? <p className="mt-[2mm] whitespace-pre-line text-[7pt] text-slate-600">{configuration.footer_notes}</p> : null}

          <footer className="mt-[2mm] flex flex-wrap items-center justify-between gap-2 border-t pt-[1mm] text-[6.5pt] text-slate-600 break-inside-avoid">
            <span>
              {metadata?.codigo || content.documentCode} | VERSION{" "}
              {metadata?.versionLabel || "04"} |{" "}
              {metadata?.fechaVersion || "17-09-2026"}
            </span>
            <span>{String(configuration.footer_text ?? "STERINOVA | Documento controlado")}</span>
          </footer>
        </div>
      </article>
    );
  },
);

export default CotizacionPDF;
