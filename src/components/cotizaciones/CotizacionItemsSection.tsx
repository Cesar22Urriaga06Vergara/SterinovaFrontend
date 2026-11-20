import { Plus } from "lucide-react";
import type { ProductoCatalogo } from "@/lib/producto-types";
import type { TipoServicioCotizacion } from "@/lib/cotizacion-types";
import type { DraftItem } from "./cotizacion-draft.types";
import { CotizacionCatalogSearch } from "./CotizacionCatalogSearch";
import { CotizacionItemsTable } from "./CotizacionItemsTable";
type ComputedItem = Omit<DraftItem, "cantidad" | "valor_unitario"> & { cantidad: number; valor_unitario: number; valor_total: number };
export function CotizacionItemsSection(props: { tipoServicio: TipoServicioCotizacion; items: ComputedItem[]; query: string; results: ProductoCatalogo[]; loading: boolean; catalogError: string; onQuery: (value: string) => void; onAddCatalog: (product: ProductoCatalogo) => void; onAddManual: () => void; onUpdate: (key: string, field: keyof DraftItem, value: unknown) => void; onRemove: (key: string) => void; onToggleImage: (key: string, include: boolean) => void; onSetImage: (key: string, file?: File) => void; onError: (message: string) => void }) {
  return <section className="rounded-xl bg-surface p-5 shadow-sm ring-1 ring-surface-border"><h2 className="text-lg font-semibold text-surface-foreground">4. Detalle de ítems</h2>
    <div className="mt-4 flex flex-col items-end gap-3 sm:flex-row"><CotizacionCatalogSearch tipoServicio={props.tipoServicio} query={props.query} results={props.results} loading={props.loading} error={props.catalogError} onQuery={props.onQuery} onAdd={props.onAddCatalog} /><button type="button" onClick={props.onAddManual} className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-secondary px-3 py-2 text-sm font-medium text-secondary hover:bg-secondary-hover/10"><Plus className="h-4 w-4" aria-hidden />Agregar ítem manual</button></div>
    <div className="mt-4"><CotizacionItemsTable items={props.items} isInsumos={props.tipoServicio === "INSUMOS"} onUpdate={props.onUpdate} onRemove={props.onRemove} onToggleImage={props.onToggleImage} onSetImage={props.onSetImage} onError={props.onError} /></div>
  </section>;
}

