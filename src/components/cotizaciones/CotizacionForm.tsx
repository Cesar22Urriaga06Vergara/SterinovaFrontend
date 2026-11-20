"use client";

import { LoaderCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/states/LoadingState";
import { CotizacionClienteSection } from "./CotizacionClienteSection";
import { CotizacionConfiguracionSection } from "./CotizacionConfiguracionSection";
import { CotizacionCondicionesSection } from "./CotizacionCondicionesSection";
import { CotizacionItemsSection } from "./CotizacionItemsSection";
import { CotizacionTotalesCard } from "./CotizacionTotalesCard";
import { useCotizacionDraft } from "./useCotizacionDraft";

export default function CotizacionForm({ quoteId }: { quoteId?: string }) {
  const draft = useCotizacionDraft(quoteId);
  if (!draft.allowed || (quoteId && !draft.ready && !draft.error) || draft.loading) return <LoadingState label="Cargando formulario de cotización..." />;
  return <div className="mx-auto w-full max-w-5xl space-y-6"><PageHeader title={quoteId ? "Editar Cotización" : "Nueva Cotización"} description="Formato comercial Sterinova — 7 tipos de servicio." />
    <form onSubmit={draft.handleSubmit} className="space-y-6">
      {!quoteId && <p role="status" className="rounded-lg border border-secondary/30 bg-secondary-light px-4 py-3 text-sm text-surface-foreground">Responsable de esta cotización: <strong>{[draft.sessionUser?.nombre, draft.sessionUser?.apellido].filter(Boolean).join(" ") || draft.sessionUser?.email || "Usuario autenticado"}</strong>{draft.sessionUser?.cargo ? ` · ${draft.sessionUser.cargo}` : ""}. El sistema la asociará automáticamente a esta cuenta.</p>}
      <CotizacionClienteSection clientes={draft.clientes} clienteId={draft.clienteId} selectedCliente={draft.selectedCliente} refreshing={draft.refreshing} onSelect={draft.setClienteId} onRefresh={() => void draft.refreshClientes()} />
      <CotizacionConfiguracionSection tipoServicio={draft.tipoServicio} onChange={draft.changeTipoServicio} metodo={draft.metodo} onMetodo={draft.setMetodo} alcance={draft.alcance} onAlcance={(key,value)=>draft.setAlcance(prev=>({...prev,[key]:value}))} transporte={draft.valorTransporte} onTransporte={draft.setValorTransporte} />
      <CotizacionCondicionesSection values={draft.commercialConditions} notas={draft.condiciones} onChange={draft.updateCommercialCondition} onNotesChange={draft.setCondiciones} />
      <CotizacionItemsSection tipoServicio={draft.tipoServicio} items={draft.computedItems} query={draft.catalogQuery} results={draft.catalogResults} loading={draft.catalogLoading} catalogError={draft.catalogError} onQuery={draft.updateCatalogQuery} onAddCatalog={draft.addCatalogProduct} onAddManual={draft.addItem} onUpdate={draft.updateItem} onRemove={draft.removeItem} onToggleImage={draft.toggleItemImage} onSetImage={draft.setItemImage} onError={draft.setError} />
      <CotizacionTotalesCard tax={draft.tax} transporte={draft.freight} {...draft.totals} />
      {draft.error && <p className="text-sm font-medium text-error" role="alert">{draft.error}</p>}
      {draft.conflict && <p role="status">Tus cambios siguen en el formulario. Recarga la página para obtener la versión actual antes de guardar.</p>}
      <section className="flex flex-wrap justify-end gap-3"><button type="button" onClick={() => draft.router.push("/comercial/cotizaciones")} className="rounded-lg px-4 py-2.5 text-sm font-medium text-surface-foreground hover:bg-surface">Cancelar</button><button type="submit" disabled={draft.saving || !draft.tax || !draft.ready || draft.conflict || (Boolean(quoteId) && draft.version == null) || draft.clientes.length === 0} aria-busy={draft.saving} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-70">{draft.saving ? <span className="inline-flex items-center gap-2"><LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />Guardando...</span> : "Guardar Cotización"}</button></section>
    </form>
  </div>;
}
