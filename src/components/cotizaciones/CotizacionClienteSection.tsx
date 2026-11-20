import Link from "next/link";
import type { Cliente } from "@/lib/cliente-types";

export function CotizacionClienteSection({ clientes, clienteId, selectedCliente, refreshing, onSelect, onRefresh }: {
  clientes: Cliente[]; clienteId: string; selectedCliente: Cliente | null; refreshing: boolean;
  onSelect: (value: string) => void; onRefresh: () => void;
}) {
  return <section className="rounded-xl bg-surface p-5 shadow-sm ring-1 ring-surface-border">
    <h2 className="text-lg font-semibold text-surface-foreground">1. Cliente</h2>
    <label className="mt-3 block text-sm"><span className="mb-1 block font-medium text-surface-foreground">Seleccionar cliente</span>
      <select required value={clienteId} onChange={(e) => onSelect(e.target.value)} className="w-full rounded-lg border border-surface-border bg-background px-3 py-2 text-surface-foreground outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30">
        <option value="">Seleccione...</option>{clientes.map((cliente) => <option key={cliente.id} value={cliente.id}>{cliente.razon_social}</option>)}
      </select>
    </label>
    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">{clientes.length === 0 ? <span className="text-surface-subtle">No hay clientes disponibles.</span> : <span className="text-surface-subtle">¿No encuentra al cliente?</span>}
      <Link href="/comercial/clientes" target="_blank" rel="noreferrer" className="font-semibold text-secondary underline">Gestionar clientes</Link>
      <button type="button" onClick={onRefresh} disabled={refreshing} aria-busy={refreshing} className="font-semibold text-secondary underline disabled:cursor-not-allowed disabled:opacity-60">{refreshing ? "Actualizando..." : "Actualizar lista"}</button>
    </div>
    {selectedCliente && <div className="mt-4 grid gap-2 rounded-lg bg-background p-4 text-sm text-surface-foreground sm:grid-cols-2">
      <p><b>Razón social:</b> {selectedCliente.razon_social}</p><p><b>NIT:</b> {selectedCliente.nit}</p>
      <p><b>Cargo:</b> {selectedCliente.cargo || "—"}</p><p><b>Ciudad:</b> {selectedCliente.ciudad || "—"}</p>
      <p><b>Contacto:</b> {selectedCliente.contacto}</p><p><b>Teléfono:</b> {selectedCliente.telefono}</p>
      <p><b>Email:</b> {selectedCliente.email}</p><p className="sm:col-span-2"><b>Dirección:</b> {selectedCliente.direccion}</p>
    </div>}
  </section>;
}
