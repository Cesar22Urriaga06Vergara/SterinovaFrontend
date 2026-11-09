"use client";
import type { MaterialRecibido } from "@/lib/operational-types";
import { nuevoMaterial } from "@/lib/operational-forms";

const textFields = [
  ["descripcion", "Descripción"],
  ["referencia", "Referencia"],
  ["lote", "Lote"],
  ["empaque", "Empaque"],
] as const;
const sampleFields = [
  ["muestras_retencion", "Muestras de retención"],
  ["muestras_cliente", "Muestras cliente"],
  ["muestras_laboratorio", "Muestras laboratorio"],
] as const;
export function MaterialesEditor({
  value,
  onChange,
  disabled = false,
}: {
  value: MaterialRecibido[];
  onChange: (value: MaterialRecibido[]) => void;
  disabled?: boolean;
}) {
  const update = (index: number, patch: Partial<MaterialRecibido>) =>
    onChange(value.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  return (
    <fieldset
      disabled={disabled}
      className="space-y-4 border-t border-slate-200 pt-4"
    >
      <legend className="px-1 text-lg font-bold text-sterinova-dark">
        Material recibido
      </legend>
      <p className="text-sm text-slate-600">
        Una fila por producto, lote y empaque. Muestras vacías = N/A; 0 =
        ninguna muestra.
      </p>
      {value.map((m, index) => (
        <fieldset
          key={index}
          className="grid gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-2"
        >
          <legend className="px-1 text-sm font-semibold">
            Material {index + 1}
          </legend>
          {textFields.map(([key, label]) => (
            <label key={key} className="space-y-1 text-sm">
              {label}
              <input
                aria-label={`${label} material ${index + 1}`}
                required={key === "descripcion"}
                maxLength={
                  key === "descripcion" ? 500 : key === "empaque" ? 255 : 150
                }
                value={m[key] ?? ""}
                onChange={(e) =>
                  update(index, { [key]: e.target.value || null })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
          ))}
          <label className="space-y-1 text-sm">
            Cantidad
            <input
              aria-label={`Cantidad material ${index + 1}`}
              type="number"
              required
              min={1}
              max={4294967295}
              step={1}
              value={m.cantidad || ""}
              onChange={(e) =>
                update(index, { cantidad: Number(e.target.value) })
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          {sampleFields.map(([key, label]) => (
            <label key={key} className="space-y-1 text-sm">
              {label}
              <input
                aria-label={`${label} material ${index + 1}`}
                type="number"
                min={0}
                max={4294967295}
                step={1}
                placeholder="N/A"
                value={m[key] ?? ""}
                onChange={(e) =>
                  update(index, {
                    [key]:
                      e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
          ))}
          <button
            type="button"
            onClick={() => onChange(value.filter((_, i) => i !== index))}
            className="justify-self-start text-sm font-semibold text-red-700"
          >
            Eliminar material {index + 1}
          </button>
        </fieldset>
      ))}
      <button
        type="button"
        disabled={value.length >= 200}
        onClick={() => onChange([...value, nuevoMaterial()])}
        className="rounded-lg border border-sterinova-teal px-3 py-2 text-sm font-semibold text-sterinova-teal"
      >
        Añadir material
      </button>
    </fieldset>
  );
}
