"use client";
import type { CicloCalidad } from "@/lib/calidad-types";
import { PARAMETER_LABELS } from "@/lib/operational-types";

export type SeleccionesCalidad = Record<
  string,
  { criterio: string; opcion: string }
>;
export function EvaluacionTecnica({
  ciclo,
  value,
  onChange,
  disabled,
}: {
  ciclo: CicloCalidad;
  value: SeleccionesCalidad;
  onChange: (v: SeleccionesCalidad) => void;
  disabled: boolean;
}) {
  const protocolo = ciclo.protocolo_version;
  if (!protocolo)
    return (
      <p
        role="alert"
        className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900"
      >
        Este ciclo no tiene protocolo documentado. Requiere conciliación antes
        de emitir.
      </p>
    );
  return (
    <fieldset
      disabled={disabled}
      className="space-y-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
    >
      <legend className="px-1 text-xl font-bold text-sterinova-dark">
        Evaluación técnica
      </legend>
      <p className="text-sm text-slate-600">
        Protocolo {protocolo.metodo}, versión {protocolo.version}. Selecciona la
        especificación y evalúa cada parámetro aplicable.
      </p>
      {protocolo.especificaciones_json.filas.map((row) => {
        const label = PARAMETER_LABELS[row.parametro] ?? row.parametro;
        const seleccion = value[row.parametro] ?? { criterio: "", opcion: "" };
        const result = (ciclo as unknown as Record<string, unknown>)[
          row.parametro
        ];
        const update = (patch: Partial<typeof seleccion>) =>
          onChange({ ...value, [row.parametro]: { ...seleccion, ...patch } });
        return (
          <div
            key={row.parametro}
            className="grid gap-3 border-t border-slate-200 pt-3 sm:grid-cols-[1fr_1.2fr_1fr]"
          >
            <div>
              <p className="font-semibold">{label}</p>
              <p className="text-sm">
                {row.aplicable
                  ? `${result ?? "Sin resultado"} ${row.unidad ?? ""}`
                  : "N/A"}
              </p>
            </div>
            {row.aplicable ? (
              <>
                <label className="text-sm">
                  Especificación de {label}
                  <select
                    aria-label={`Especificación de ${label}`}
                    value={seleccion.opcion}
                    onChange={(e) => update({ opcion: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2"
                  >
                    <option value="">Seleccionar...</option>
                    {row.opciones.map((opcion, i) => (
                      <option key={i} value={i}>
                        {opcion}
                        {row.unidad ? ` (${row.unidad})` : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm">
                  Evaluación de {label}
                  <select
                    aria-label={`Evaluación de ${label}`}
                    value={seleccion.criterio}
                    onChange={(e) => update({ criterio: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="CUMPLE">Cumple</option>
                    <option value="NO_CUMPLE">No cumple</option>
                  </select>
                </label>
              </>
            ) : (
              <p className="text-sm text-slate-500 sm:col-span-2">
                No aplica según el protocolo
              </p>
            )}
          </div>
        );
      })}
      {Object.values(value).some((v) => v.criterio === "NO_CUMPLE") ? (
        <p role="status" className="text-sm font-semibold text-red-700">
          Hay parámetros que no cumplen. Rechaza el ciclo e indica el motivo.
        </p>
      ) : null}
    </fieldset>
  );
}
