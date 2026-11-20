"use client";
import type { MaterialRecibido } from "@/lib/operational-types";
import { nuevoMaterial } from "@/lib/operational-forms";
import type { Cotizacion } from "@/lib/cotizacion-types";

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
  cotizacion,
  cantidadEntregada,
  modoCreacion = false,
}: {
  value: MaterialRecibido[];
  onChange: (value: MaterialRecibido[]) => void;
  disabled?: boolean;
  cotizacion?: Cotizacion;
  cantidadEntregada?: number | null;
  modoCreacion?: boolean;
}) {
  const update = (index: number, patch: Partial<MaterialRecibido>) =>
    onChange(value.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  return (
    <fieldset
      disabled={disabled}
      className="space-y-4 border-t border-slate-200 pt-4"
    >
      <legend className="px-1 text-lg font-bold text-surface-foreground">
        {modoCreacion ? "Materiales de la Orden" : "Material recibido"}
      </legend>
      {!modoCreacion ? <p className="text-sm text-slate-600">
        Una fila por producto, lote y empaque. Muestras vacías = N/A; 0 =
        ninguna muestra.
      </p> : null}
      {value.map((m, index) => (
        <fieldset
          key={index}
          className="grid gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-2"
        >
          <legend className="px-1 text-sm font-semibold">{modoCreacion ? `Ítem ${index + 1}` : `Material ${index + 1}`}</legend>
          {modoCreacion ? (
            <>
              <div className="space-y-1 text-sm"><span className="block font-medium">Descripción oficial</span><p className="rounded-lg bg-background px-3 py-2 text-surface-foreground">{m.descripcion}</p></div>
              <div className="space-y-1 text-sm"><span className="block font-medium">Cantidad cotizada</span><p className="rounded-lg bg-background px-3 py-2 text-surface-foreground">{cotizacion?.items?.find(i=>i.id===m.cotizacion_item_id)?.cantidad ?? "—"}</p></div>
              <label className="space-y-1 text-sm">Lote (opcional)<input aria-label={`Lote ítem ${index+1}`} maxLength={150} value={m.lote ?? ""} onChange={e=>update(index,{lote:e.target.value||null})} className="w-full rounded-lg border border-surface-border px-3 py-2"/></label>
              <label className="space-y-1 text-sm">Cantidad inicial/programada<input aria-label={`Cantidad inicial ítem ${index+1}`} type="number" required min={1} max={4294967295} step={1} value={m.cantidad||""} onChange={e=>update(index,{cantidad:Number(e.target.value)})} className="w-full rounded-lg border border-surface-border px-3 py-2"/></label>
            </>
          ) : <>
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
                className="w-full rounded-lg border border-surface-border px-3 py-2"
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
              className="w-full rounded-lg border border-surface-border px-3 py-2"
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
                className="w-full rounded-lg border border-surface-border px-3 py-2"
              />
            </label>
          ))}
          </>}
          {!modoCreacion ? (() => { const item = cotizacion?.items?.find(i => i.id === m.cotizacion_item_id); return item ? <div className="sm:col-span-2 grid grid-cols-2 gap-2 rounded bg-background p-2 text-xs"><span>Cantidad cotizada: {item.cantidad}</span><span>Cantidad recibida/verificada: {m.cantidad}</span><span>Cantidad entregada: {cantidadEntregada ?? "Pendiente"}</span><span>Valor unitario pactado: ${Number(item.valor_unitario).toLocaleString("es-CO")} (bloqueado)</span><span>Subtotal línea: ${(Number(item.valor_unitario)*Number(m.cantidad||0)).toLocaleString("es-CO")}</span></div> : null; })() : null}
          {!modoCreacion ? <button
            type="button"
            onClick={() => onChange(value.filter((_, i) => i !== index))}
            className="justify-self-start text-sm font-semibold text-red-700"
          >
            Eliminar material {index + 1}
          </button> : null}
        </fieldset>
      ))}
      {!modoCreacion ? <button
        type="button"
        disabled={value.length >= 200}
        onClick={() => onChange([...value, nuevoMaterial()])}
        className="rounded-lg border border-secondary px-3 py-2 text-sm font-semibold text-secondary"
      >
        Añadir material
      </button> : null}
    </fieldset>
  );
}
