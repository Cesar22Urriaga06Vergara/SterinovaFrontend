"use client";

import { forwardRef } from "react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { API_BASE_URL } from "@/lib/api";
import type { CertificadoEsterilizacion } from "@/lib/calidad-types";

type Props = {
  data: CertificadoEsterilizacion;
};

function dateValue(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function datePlusThreeYears(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  date.setFullYear(date.getFullYear() + 3);
  return dateValue(date.toISOString());
}

function display(value: string | number | null | undefined, unit = "") {
  if (value === null || value === undefined || value === "") return "—";
  return `${value}${unit ? ` ${unit}` : ""}`;
}

const technicalData = (data: CertificadoEsterilizacion) => data.cicloEsterilizacion;

export const LegacyCertificadoPDF = forwardRef<HTMLDivElement, Props>(
  function LegacyCertificadoPDF({ data }, ref) {
    const ciclo = technicalData(data);
    const issuedAt = data.aprobado_at ?? data.created_at;
    const validationUrl = new URL(
      `/certificados/validar/${encodeURIComponent(data.token_publico)}`,
      API_BASE_URL,
    ).toString();
    const cliente = ciclo.orden?.cotizacion?.cliente;
    const items = ciclo.orden?.cotizacion?.items ?? [];
    const minimumRows = Math.max(18, items.length);
    const isEto = ciclo.metodo === "ETO";
    const snapshotFormat = (data.snapshot_datos?.formato ?? {}) as Record<string, unknown>;
    const formatConfig = (snapshotFormat.configuracion_json ?? {}) as Record<string, unknown>;
    const formatCode = String(snapshotFormat.codigo ?? formatConfig.document_code ?? "R-AQ-09");
    const formatVersion = String(formatConfig.version_label ?? snapshotFormat.version ?? "05");
    const rawVersionDate = String(formatConfig.version_date ?? snapshotFormat.fecha_version ?? "2024-11-25");
    const parsedVersionDate = /^\d{4}-\d{2}-\d{2}$/.test(rawVersionDate)
      ? `${rawVersionDate.slice(8, 10)}/${rawVersionDate.slice(5, 7)}/${rawVersionDate.slice(0, 4)}`
      : rawVersionDate;
    const formatTitle = String(formatConfig.title ?? "CERTIFICADO DE ESTERILIZACION");

    return (
      <article ref={ref} className="certificate-pdf pdf-document mx-auto bg-white text-black" data-certificate-number={data.consecutivo} data-pdf-document="certificado">
        <div className="mx-auto flex min-h-[279mm] w-[168mm] flex-col pt-[12mm] pb-[11mm] font-[Arial,Helvetica,sans-serif] text-[5.2pt] leading-[1.15]">
          <header className="grid min-h-[15mm] grid-cols-[43mm_1fr_25mm] border border-black">
            <div className="flex items-center justify-center gap-[1.5mm] border-r border-black px-[1mm]">
              <Image src="/Logo1.png" alt="Sterinova" width={440} height={180} unoptimized className="h-auto w-[24mm] object-contain" />
              <Image src="/certificaciones-icontec-iqnet.jpeg" alt="Certificaciones Icontec e IQNET" width={442} height={110} unoptimized className="h-auto w-[16mm] object-contain" />
            </div>
            <div className="flex items-center justify-center border-r border-black px-2 text-center text-[12pt] font-bold leading-tight">
              {formatTitle}
            </div>
            <div className="grid grid-rows-3 text-center text-[4.5pt]">
              <div className="flex items-center justify-center border-b border-black font-bold">{formatCode}</div>
              <div className="flex items-center justify-center border-b border-black">VERSION: {formatVersion}</div>
              <div className="flex items-center justify-center">{parsedVersionDate}</div>
            </div>
          </header>

          <table className="mt-[1.5mm] w-full table-fixed border-collapse text-center text-[5pt]">
            <tbody>
              <tr className="h-[8mm]">
                <th className="w-[12%] border border-black bg-[#bfbfbf] px-1 font-bold">FECHA DE EMISIÓN</th>
                <td className="w-[11%] border border-black px-1">{dateValue(issuedAt)}</td>
                <th className="w-[11%] border border-black bg-[#bfbfbf] px-1 font-bold">CLIENTE / NIT</th>
                <td className="w-[48%] border border-black px-1 text-[6pt] font-medium">
                  <span className="block">{cliente?.razon_social ?? "—"}</span>
                  <span className="block text-[4.5pt]">NIT: {cliente?.nit ?? "—"}</span>
                </td>
                <th className="w-[8%] border border-black bg-[#bfbfbf] px-1 font-bold">CONSECUTIVO</th>
                <td className="w-[10%] border border-black bg-[#fff200] px-1 text-[10pt] font-extrabold">{data.consecutivo}</td>
              </tr>
            </tbody>
          </table>

          <table className="mt-[3mm] w-full table-fixed border-collapse text-center text-[4.8pt]">
            <tbody>
              <tr className="h-[8mm]">
                <th className="w-[13%] border border-black bg-[#bfbfbf] px-1 font-bold">MÉTODO DE ESTERILIZACIÓN</th>
                <td className={`w-[7%] border border-black px-1 font-bold ${isEto ? "bg-[#fff200]" : ""}`}>{isEto ? "ETO" : "VAPOR"}</td>
                <th className="w-[8%] border border-black bg-[#bfbfbf] px-1 font-bold">EQUIPO</th>
                <td className="w-[8%] border border-black px-1">{ciclo.equipo}</td>
                <th className="w-[7%] border border-black bg-[#bfbfbf] px-1 font-bold">CICLO</th>
                <td className="w-[8%] border border-black px-1">{data.ciclo ?? ciclo.id}</td>
                <th className="w-[14%] border border-black bg-[#bfbfbf] px-1 font-bold">FECHA ESTERILIZACIÓN</th>
                <td className="w-[10%] border border-black px-1">{dateValue(ciclo.fecha_proceso)}</td>
                <th className="w-[13%] border border-black bg-[#bfbfbf] px-1 font-bold">FECHA DE VENCIMIENTO</th>
                <td className="w-[12%] border border-black px-1">{datePlusThreeYears(issuedAt)}</td>
              </tr>
            </tbody>
          </table>

          <table className="mt-[1.5mm] w-full table-fixed border-collapse text-center text-[4.3pt]">
            <thead>
              <tr className="h-[7mm] bg-[#bfbfbf] font-bold">
                {[
                  ["DESCRIPCIÓN", "18%"], ["REFERENCIA", "16%"], ["LOTE", "12%"],
                  ["CANTIDAD", "9%"], ["EMPAQUE", "13%"], ["MUESTRAS DE RETENCIÓN", "11%"],
                  ["MUESTRAS CLIENTE", "10%"], ["MUESTRAS LABORATORIO", "11%"],
                ].map(([title, width]) => <th key={title} style={{ width }} className="border border-black px-[0.5mm]">{title}</th>)}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: minimumRows }, (_, index) => {
                const item = items[index];
                return (
                  <tr key={item?.id ?? `empty-${index}`} className="h-[4mm]">
                    <td className="border border-black px-[0.8mm] text-left">{item?.descripcion ?? "·"}</td>
                    <td className="border border-black px-[0.8mm]">{item ? "N.A." : "·"}</td>
                    <td className="border border-black px-[0.8mm]">{item ? (ciclo.orden?.consecutivo ?? "N.A.") : "·"}</td>
                    <td className="border border-black px-[0.8mm]">{item ? item.cantidad : "·"}</td>
                    <td className="border border-black px-[0.8mm]">{item ? "N.A." : "·"}</td>
                    <td className="border border-black px-[0.8mm]">{item ? "N.A." : "·"}</td>
                    <td className="border border-black px-[0.8mm]">{item ? "N.A." : "·"}</td>
                    <td className="border border-black px-[0.8mm]">{item ? "N.A." : "·"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <section className="mt-[1.5mm]">
            <h2 className="flex h-[5mm] items-center justify-center border border-black bg-[#bfbfbf] text-[6pt] font-bold">INFORMACIÓN TÉCNICA DEL PROCESO</h2>
            <div className="grid grid-cols-2">
              <TechnicalMethodTable method="ETO" active={isEto} ciclo={ciclo} />
              <TechnicalMethodTable method="VAPOR" active={!isEto} ciclo={ciclo} />
            </div>
          </section>

          <section className="mt-[1.5mm]">
            <h2 className="flex h-[5mm] items-center justify-center border border-black bg-[#bfbfbf] text-[6pt] font-bold">MONITOREO DE ESTERILIZACIÓN</h2>
            <table className="w-full table-fixed border-collapse text-center text-[4.7pt]">
              <thead>
                <tr className="h-[5mm] bg-[#bfbfbf] font-bold">
                  <th className="w-[30%] border border-black">PARÁMETRO</th>
                  <th className="w-[17%] border border-black">MÉTODO</th>
                  <th className="w-[22%] border border-black">ESPECIFICACIÓN</th>
                  <th className="w-[21%] border border-black">RESULTADO</th>
                  <th className="w-[10%] border border-black">CRITERIO</th>
                </tr>
              </thead>
              <tbody>
                <tr className="h-[6mm]">
                  <td className="border border-black px-1 text-left">Control de Carga (Indicador Biológico)</td>
                  <td className="border border-black">Incubación</td>
                  <td className="border border-black">Crecimiento microbiano negativo</td>
                  <td className="border border-black font-semibold">{ciclo.control_biologico}</td>
                  <td className="border border-black font-bold">APROBADO</td>
                </tr>
                <tr className="h-[6mm]">
                  <td className="border border-black px-1 text-left">Control del paquete (Integrador Químico)</td>
                  <td className="border border-black">Exposición</td>
                  <td className="border border-black">Cambio de color</td>
                  <td className="border border-black font-semibold">{ciclo.control_quimico}</td>
                  <td className="border border-black font-bold">APROBADO</td>
                </tr>
              </tbody>
            </table>
          </section>

          <footer className="mt-[1.5mm] grid grid-cols-[1fr_34mm] border border-black text-center text-[4.6pt]">
            <div className="grid grid-rows-[11mm_5mm_11mm_5mm]">
              <div className="grid grid-cols-2">
                <SignatureCell label="Elaborado por:" name="N. FUENTES" />
                <SignatureCell label="Verificado por:" name="Y. MELO" borderLeft />
              </div>
              <div className="grid grid-cols-2 border-t border-black bg-[#bfbfbf]">
                <div className="flex items-center justify-center border-r border-black font-bold">Cargo: AUXILIAR DE DOCUMENTACIÓN</div>
                <div className="flex items-center justify-center font-bold">Cargo: COORDINADOR ASEGURAMIENTO DE CALIDAD</div>
              </div>
              <div className="border-t border-black">
                <SignatureCell label="Aprobado por:" name={data.aprobador?.nombre?.toUpperCase() ?? "J. BARRERO"} />
              </div>
              <div className="grid grid-cols-2 border-t border-black bg-[#bfbfbf]">
                <div className="flex items-center justify-center border-r border-black font-bold">Cargo: DIRECTOR TÉCNICO</div>
                <div className="flex items-center justify-center font-bold">Fecha: {dateValue(issuedAt)}</div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-[1mm] border-l border-black p-[1mm]">
              <Image src="/sello-calidad.png" alt="Sello de Aseguramiento de Calidad" width={139} height={140} unoptimized className="h-[14mm] w-[14mm] object-contain" />
              <QRCodeSVG value={validationUrl} size={50} level="M" marginSize={1} title={`Validar certificado ${data.consecutivo}`} />
              <span className="font-bold">SELLO / QR DE VALIDACIÓN</span>
            </div>
          </footer>
          <p className="mt-[1mm] text-right text-[3.8pt] text-slate-500">Verificación electrónica: {data.aprobador?.nombre ?? "Coordinación de Calidad"} · {dateValue(issuedAt)}</p>
        </div>
      </article>
    );
  },
);

type TechnicalMethodTableProps = {
  method: "ETO" | "VAPOR";
  active: boolean;
  ciclo: CertificadoEsterilizacion["cicloEsterilizacion"];
};

function TechnicalMethodTable({ method, active, ciclo }: TechnicalMethodTableProps) {
  const isEto = method === "ETO";
  const rows = isEto
    ? [
        ["TEMPERATURA (°C)", "Según protocolo EtO", display(ciclo.temperatura, "°C")],
        ["HUMEDAD RELATIVA (%)", "Según protocolo EtO", display(ciclo.humedad, "%")],
        ["PRESIÓN (inHg)", "Según protocolo EtO", display(ciclo.presion, "inHg")],
        ["TIEMPO DE EXPOSICIÓN (min)", "Según protocolo EtO", display(ciclo.tiempo_exposicion, "min")],
        ["AIREACIÓN (min)", "Según protocolo EtO", display(ciclo.tiempo_aireacion, "min")],
      ]
    : [
        ["TEMPERATURA (°C)", "121 ± 2 / 134 ± 2", display(ciclo.temperatura, "°C")],
        ["TIEMPO DE EXPOSICIÓN (min)", "Según protocolo Vapor", display(ciclo.tiempo_exposicion, "min")],
        ["TIEMPO DE SECADO (min)", "Según protocolo Vapor", display(ciclo.tiempo_aireacion, "min")],
        ["HUMEDAD / PRESIÓN", "No aplica", "—"],
        ["AIREACIÓN (min)", "No aplica", "—"],
      ];

  return (
    <div className={`relative ${isEto ? "border-r" : ""} border-x-0 border-b border-black`}>
      <h3 className={`flex h-[5mm] items-center justify-center border-x border-b border-black text-[5pt] font-bold ${active ? "bg-[#fff200]" : "bg-[#d9d9d9]"}`}>
        {isEto ? "ESTERILIZACIÓN CON ÓXIDO DE ETILENO EtO" : "ESTERILIZACIÓN CON VAPOR"}
      </h3>
      <table className={`w-full table-fixed border-collapse text-center text-[4.2pt] ${active ? "" : "text-slate-500"}`}>
        <thead>
          <tr className="h-[6mm] bg-[#bfbfbf] font-bold">
            <th className="w-[31%] border border-black px-[0.4mm]">PARÁMETROS</th>
            <th className="w-[32%] border border-black px-[0.4mm]">ESPECIFICACIÓN</th>
            <th className="w-[18%] border border-black px-[0.4mm]">RESULTADO</th>
            <th className="w-[19%] border border-black px-[0.4mm]">CRITERIO</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, specification, result]) => (
            <tr key={label} className="h-[8mm]">
              <th className="border border-black px-[0.6mm] text-left font-semibold">{label}</th>
              <td className="border border-black px-[0.5mm]">{specification}</td>
              <td className="border border-black px-[0.5mm] font-semibold">{active ? result : "—"}</td>
              <td className="border border-black px-[0.5mm] font-bold">{active ? "APROBADO" : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!active ? (
        <div className="pointer-events-none absolute inset-0 top-[5mm]" aria-hidden>
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="0" y1="0" x2="100" y2="100" stroke="#3467d6" strokeWidth="0.45" />
          </svg>
        </div>
      ) : null}
    </div>
  );
}

type SignatureCellProps = { label: string; name: string; borderLeft?: boolean };

function SignatureCell({ label, name, borderLeft = false }: SignatureCellProps) {
  return (
    <div className={`flex flex-col items-center justify-end px-1 pb-[1mm] ${borderLeft ? "border-l border-black" : ""}`}>
      <div className="mb-[0.8mm] flex h-[5mm] w-full items-end justify-center border-b border-black text-[5.2pt] italic">{name}</div>
      <strong>{label}</strong>
    </div>
  );
}

export default LegacyCertificadoPDF;
