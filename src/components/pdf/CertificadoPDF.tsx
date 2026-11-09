"use client";
import { forwardRef } from "react";
import Image from "next/image";
import type { CertificadoEsterilizacion } from "@/lib/calidad-types";
import {
  PARAMETER_LABELS,
  type DocumentPerson,
  type InformacionTecnica,
  type MaterialRecibido,
  type TechnicalRow,
} from "@/lib/operational-types";

type Snapshot = {
  documento?: {
    fecha_emision?: string;
    fecha_esterilizacion?: string;
    fecha_vencimiento?: string;
  };
  cliente?: { razon_social?: string; nit?: string };
  materiales?: MaterialRecibido[] | null;
  ciclo_esterilizacion?: {
    metodo?: "ETO" | "VAPOR";
    equipo?: string;
    control_biologico?: string;
    control_quimico?: string;
  };
  certificado?: { ciclo?: string };
  informacion_tecnica?: InformacionTecnica;
  elaborado_por?: DocumentPerson | null;
  verificado_por?: DocumentPerson | null;
  aprobador?: DocumentPerson | null;
};
function fecha(value?: string | null) {
  if (!value) return "—";
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) return `${match[3]}/${match[2]}/${match[1]}`;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString("es-CO", {
        timeZone: "America/Bogota",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
}
const display = (value: unknown) =>
  value === null || value === undefined || value === "" ? "N/A" : String(value);
const inactiveKeys = {
  ETO: [
    "temperatura",
    "humedad",
    "presion",
    "tiempo_exposicion",
    "tiempo_aireacion",
  ],
  VAPOR: [
    "temperatura",
    "tiempo_exposicion",
    "tiempo_secado",
    "humedad_presion",
    "tiempo_aireacion",
  ],
};
const cell = "border border-black px-[0.7mm] py-[0.5mm] break-words";

export const CertificadoPDF = forwardRef<
  HTMLDivElement,
  { data: CertificadoEsterilizacion }
>(function CertificadoPDF({ data }, ref) {
  const snapshot = (data.snapshot_datos ?? {}) as Snapshot;
  const document = snapshot.documento ?? {};
  const ciclo = snapshot.ciclo_esterilizacion ?? {};
  const cliente = snapshot.cliente;
  const materiales = snapshot.materiales?.length ? snapshot.materiales : [null];
  const issued = document.fecha_emision ?? data.fecha_emision;
  const method = ciclo.metodo ?? snapshot.informacion_tecnica?.metodo;
  const tables = snapshot.informacion_tecnica?.tablas;
  return (
    <article
      ref={ref}
      className="certificate-pdf pdf-document mx-auto bg-white text-black"
      data-pdf-document="certificado"
      data-pdf-schema-version="2"
      data-certificate-number={data.consecutivo}
    >
      <div className="mx-auto w-[168mm] py-[15mm] font-[Arial,Helvetica,sans-serif] text-[5.5pt] leading-[1.15]">
        <header className="grid min-h-[15mm] grid-cols-[35mm_1fr] border border-black">
          <div className="flex items-center justify-center border-r border-black p-[1mm]">
            <Image
              src="/Logo1.png"
              alt="Sterinova"
              width={440}
              height={180}
              unoptimized
              className="h-auto w-[30mm] object-contain"
            />
          </div>
          <h1 className="flex items-center justify-center px-[2mm] text-center text-[12pt] font-bold">
            CERTIFICADO DE ESTERILIZACIÓN
          </h1>
        </header>
        <table className="mt-[1.5mm] w-full table-fixed border-collapse text-center">
          <tbody>
            <tr className="h-[8mm]">
              <th className={`${cell} w-[14%] bg-[#bfbfbf]`}>
                FECHA DE EMISIÓN
              </th>
              <td className={`${cell} w-[13%]`}>{fecha(issued)}</td>
              <th className={`${cell} w-[11%] bg-[#bfbfbf]`}>CLIENTE</th>
              <td className={`${cell} w-[40%] text-[6pt]`}>
                {cliente?.razon_social ?? "—"}
                {cliente?.nit ? (
                  <span className="block text-[4.5pt]">NIT: {cliente.nit}</span>
                ) : null}
              </td>
              <th className={`${cell} w-[11%] bg-[#bfbfbf]`}>CONSECUTIVO</th>
              <td
                className={`${cell} w-[11%] bg-[#fff200] text-[8pt] font-bold`}
              >
                {data.consecutivo}
              </td>
            </tr>
          </tbody>
        </table>
        <table className="mt-[3mm] w-full table-fixed border-collapse text-center">
          <colgroup>
            {[13, 7, 7, 8, 6, 7, 14, 10, 15, 13].map((width, i) => (
              <col key={i} style={{ width: `${width}%` }} />
            ))}
          </colgroup>
          <tbody>
            <tr className="h-[8mm]">
              <th className={`${cell} bg-[#bfbfbf]`}>
                MÉTODO DE ESTERILIZACIÓN
              </th>
              <td className={cell}>
                {method === "ETO" ? "EtO" : method === "VAPOR" ? "VAPOR" : "—"}
              </td>
              <th className={`${cell} bg-[#bfbfbf]`}>EQUIPO</th>
              <td className={cell}>{ciclo.equipo ?? "—"}</td>
              <th className={`${cell} bg-[#bfbfbf]`}>CICLO</th>
              <td className={cell}>
                {snapshot.certificado?.ciclo ?? data.ciclo ?? "—"}
              </td>
              <th className={`${cell} bg-[#bfbfbf]`}>FECHA ESTERILIZACIÓN</th>
              <td className={cell}>
                {fecha(
                  document.fecha_esterilizacion ?? data.fecha_esterilizacion,
                )}
              </td>
              <th className={`${cell} bg-[#bfbfbf]`}>FECHA DE VENCIMIENTO</th>
              <td className={cell}>
                {fecha(document.fecha_vencimiento ?? data.fecha_vencimiento)}
              </td>
            </tr>
          </tbody>
        </table>
        <table className="mt-[1.5mm] w-full table-fixed border-collapse text-center text-[5pt]">
          <thead>
            <tr className="h-[7mm] bg-[#bfbfbf]">
              {[
                "DESCRIPCIÓN",
                "REFERENCIA",
                "LOTE",
                "CANTIDAD",
                "EMPAQUE",
                "MUESTRAS DE RETENCIÓN",
                "MUESTRAS CLIENTE",
                "MUESTRAS LABORATORIO",
              ].map((title) => (
                <th key={title} className={cell}>
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {materiales.map((material, i) => (
              <tr key={material?.id ?? i} className="h-[4mm]">
                {[
                  "descripcion",
                  "referencia",
                  "lote",
                  "cantidad",
                  "empaque",
                  "muestras_retencion",
                  "muestras_cliente",
                  "muestras_laboratorio",
                ].map((key) => (
                  <td
                    key={key}
                    className={`${cell} ${key === "descripcion" ? "text-left" : ""}`}
                  >
                    {display(material?.[key as keyof MaterialRecibido])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <section className="mt-[1.5mm] break-inside-avoid">
          <h2 className="border border-black bg-[#bfbfbf] py-[1mm] text-center text-[6pt] font-bold">
            INFORMACIÓN TÉCNICA DEL PROCESO
          </h2>
          <div className="grid grid-cols-2">
            {(["ETO", "VAPOR"] as const).map((m) => (
              <TechnicalTable
                key={m}
                method={m}
                active={method === m}
                rows={tables?.[m]}
              />
            ))}
          </div>
        </section>
        <section className="mt-[1.5mm] break-inside-avoid">
          <h2 className="border border-black bg-[#bfbfbf] py-[1mm] text-center text-[6pt] font-bold">
            MONITOREO DE ESTERILIZACIÓN
          </h2>
          <table className="w-full table-fixed border-collapse text-center text-[5pt]">
            <thead>
              <tr className="bg-[#bfbfbf]">
                {[
                  "PARÁMETRO",
                  "MÉTODO",
                  "ESPECIFICACIÓN",
                  "RESULTADO",
                  "CRITERIO DE ACEPTACIÓN",
                ].map((v) => (
                  <th key={v} className={cell}>
                    {v}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                [
                  "Control de Carga (Indicador Biológico)",
                  "Incubación",
                  "Crecimiento microbiano negativo",
                  ciclo.control_biologico,
                ],
                [
                  "Control del paquete (Integrador Químico)",
                  "Exposición",
                  "Cambio de color",
                  ciclo.control_quimico,
                ],
              ].map(([label, metodo, especificacion, result]) => (
                <tr key={label} className="h-[6mm]">
                  <td className={cell}>{label}</td>
                  <td className={cell}>{metodo}</td>
                  <td className={cell}>{especificacion}</td>
                  <td className={cell}>{display(result)}</td>
                  <td className={cell}>
                    {snapshot.informacion_tecnica ? "CUMPLE" : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <footer className="mt-[1.5mm] grid grid-cols-[1fr_34mm] border border-black break-inside-avoid">
          <div>
            <div className="grid grid-cols-2">
              <Signature
                label="Elaborado por:"
                person={snapshot.elaborado_por}
              />
              <Signature
                label="Verificado por:"
                person={snapshot.verificado_por}
              />
            </div>
            <div className="border-t border-black">
              <Signature
                label="Aprobado por:"
                person={snapshot.aprobador}
                date={issued}
              />
            </div>
          </div>
          <div data-stamp-box="true" className="border-l border-black" />
        </footer>
      </div>
    </article>
  );
});

function TechnicalTable({
  method,
  active,
  rows,
}: {
  method: "ETO" | "VAPOR";
  active: boolean;
  rows?: TechnicalRow[];
}) {
  const completeRows = inactiveKeys[method].map((parametro) =>
    active ? rows?.find((row) => row.parametro === parametro) : undefined,
  );
  return (
    <div>
      <h3
        className={`border border-black px-[1mm] py-[1mm] text-center text-[5.5pt] font-bold ${active ? "bg-[#fff200]" : "bg-[#d9d9d9]"}`}
      >
        {method === "ETO"
          ? "ESTERILIZACIÓN CON ÓXIDO DE ETILENO EtO"
          : "ESTERILIZACIÓN CON VAPOR"}
      </h3>
      <table className="w-full table-fixed border-collapse text-center text-[4.8pt]">
        <thead>
          <tr className="h-[6mm] bg-[#bfbfbf]">
            {[
              "PARÁMETROS",
              "ESPECIFICACIÓN",
              "RESULTADO",
              "CRITERIO DE ACEPTACIÓN",
            ].map((v) => (
              <th key={v} className={cell}>
                {v}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {completeRows.map((row, index) => {
            const key = inactiveKeys[method][index];
            const criterio =
              row?.criterio === "NO_CUMPLE"
                ? "NO CUMPLE"
                : (row?.criterio ?? "N/A");
            return (
              <tr
                key={key}
                data-technical-row={`${method}-${key}`}
                className="h-[7mm]"
              >
                <th className={`${cell} text-left font-semibold`}>
                  {PARAMETER_LABELS[key]?.toUpperCase()}
                  {row?.unidad ? ` (${row.unidad})` : ""}
                </th>
                <td className={cell}>{row?.especificacion ?? "N/A"}</td>
                <td className={cell}>{row ? display(row.resultado) : "N/A"}</td>
                <td className={`${cell} font-bold`}>{criterio}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
function Signature({
  label,
  person,
  date,
}: {
  label: string;
  person?: DocumentPerson | null;
  date?: string | null;
}) {
  return (
    <div className="min-h-[15mm] px-[1mm] py-[1mm] text-center">
      <p className="font-bold">{label}</p>
      <p className="mt-[1mm] min-h-[4mm] border-b border-black text-[6pt]">
        {person
          ? [person.nombre, person.apellido].filter(Boolean).join(" ")
          : ""}
      </p>
      <p className="mt-[0.5mm]">Cargo: {person?.cargo ?? "—"}</p>
      {date ? <p>Fecha: {fecha(date)}</p> : null}
    </div>
  );
}
export default CertificadoPDF;
