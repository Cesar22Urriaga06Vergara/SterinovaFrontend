"use client";
import { useEffect, useState } from "react";
import type { DraftItem } from "./cotizacion-draft.types";
import type { CategoriaProducto, TipoItemCatalogo } from "@/lib/producto-types";
import { Modal } from "@/components/ui/Modal";
export function CotizacionManualItemDialog({ item, showCategory, onClose, onSave }: { item: DraftItem | null; showCategory: boolean; onClose: () => void; onSave: (key: string, patch: Partial<DraftItem>) => void }) {
  const [draft, setDraft] = useState<Partial<DraftItem>>({});
  useEffect(() => { setDraft(item ? { tipo_item: item.tipo_item, categoria: item.categoria, codigo: item.codigo, referencia: item.referencia, metodo: item.metodo, presentacion: item.presentacion, marca: item.marca, precision_cantidad: item.precision_cantidad } : {}); }, [item]);
  if (!item || item.producto_id) return null;
  const set = (field: keyof DraftItem, value: unknown) => setDraft((current) => ({ ...current, [field]: value }));
  return <Modal open={Boolean(item)} title="Detalles del ítem manual" onClose={onClose}>
    <section className="w-full max-w-xl">
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">Tipo<select className="mt-1 w-full rounded border bg-background px-2 py-2" value={draft.tipo_item ?? item.tipo_item} onChange={(e) => set("tipo_item", e.target.value as TipoItemCatalogo)}><option value="PRODUCTO">Producto</option><option value="SERVICIO">Servicio</option></select></label>
        <label className="text-sm">Decimales permitidos<select className="mt-1 w-full rounded border bg-background px-2 py-2" value={draft.precision_cantidad ?? item.precision_cantidad} onChange={(e) => set("precision_cantidad", Number(e.target.value))}><option value={0}>0 (unidades enteras)</option><option value={1}>1 decimal</option><option value={2}>2 decimales</option></select></label>
        {showCategory ? <label className="text-sm">Categoría<select required className="mt-1 w-full rounded border bg-background px-2 py-2" value={draft.categoria ?? item.categoria ?? ""} onChange={(e) => set("categoria", e.target.value as CategoriaProducto)}><option value="">Seleccione...</option><option value="EMPAQUES">Empaques</option><option value="MONITOREO">Monitoreo</option><option value="EQUIPOS">Equipos</option></select></label> : null}
        {([ ["Código", "codigo", 80], ["Referencia", "referencia", 160], ["Método", "metodo", 120], ["Presentación", "presentacion", 160], ["Marca", "marca", 120] ] as const).map(([label, field, max]) => <label key={field} className="text-sm">{label}<input maxLength={max} value={String(draft[field] ?? item[field])} onChange={(e) => set(field, e.target.value)} className="mt-1 w-full rounded border bg-background px-2 py-2" /></label>)}
      </div>
      <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded border px-3 py-2 text-sm">Cancelar</button><button type="button" onClick={() => { onSave(item.key, draft); onClose(); }} className="rounded bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">Guardar detalles</button></div>
    </section>
  </Modal>;
}

