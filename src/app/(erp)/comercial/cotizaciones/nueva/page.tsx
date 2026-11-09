"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { LoadingState } from "@/components/ui/states/LoadingState";
import { getApiErrorMessage } from "@/lib/api-errors";
import { notifyToast } from "@/components/ui/states/toast-events";
import type { Cliente } from "@/lib/cliente-types";
import { useSession, useQuoteHeaders } from "@/lib/session";
import { useStoredUser } from "@/lib/stored-user-hook";
import {
  TIPOS_SERVICIO,
  TipoServicioCotizacion,
  formatCurrency,
} from "@/lib/cotizacion-types";

type DraftItem = {
  key: string;
  descripcion: string;
  cantidad: string;
  valor_unitario: string;
};

function createEmptyItem(): DraftItem {
  return {
    key: crypto.randomUUID(),
    descripcion: "",
    cantidad: "1",
    valor_unitario: "0",
  };
}

export default function NuevaCotizacionPage() {
  const router = useRouter();
  const sessionUser = useStoredUser();
  const { can, current_scope } = useSession();
  const headers = useQuoteHeaders();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [tipoServicio, setTipoServicio] = useState<TipoServicioCotizacion>(
    "INDUSTRIAL_ETO",
  );
  const [condiciones, setCondiciones] = useState("");
  const [items, setItems] = useState<DraftItem[]>([createEmptyItem()]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const submitLock = useRef(false);
  const refreshLock = useRef(false);

  useEffect(() => {
    api
      .get<Cliente[]>("/clientes")
      .then(({ data }) => setClientes(data))
      .catch((loadError: unknown) =>
        setError(getApiErrorMessage(loadError)),
      )
      .finally(() => setLoading(false));
  }, []);

  async function refreshClientes() {
    if (refreshLock.current) return;
    refreshLock.current = true;
    setRefreshing(true);
    setError("");
    try {
      const { data } = await api.get<Cliente[]>("/clientes");
      setClientes(data);
    } catch (refreshError) {
      setError(getApiErrorMessage(refreshError));
    } finally {
      refreshLock.current = false;
      setRefreshing(false);
    }
  }

  const selectedCliente = useMemo(
    () => clientes.find((c) => String(c.id) === clienteId) ?? null,
    [clientes, clienteId],
  );

  const computedItems = useMemo(
    () =>
      items.map((item) => {
        const cantidad = Number(item.cantidad) || 0;
        const valor_unitario = Number(item.valor_unitario) || 0;
        return {
          ...item,
          cantidad,
          valor_unitario,
          valor_total: cantidad * valor_unitario,
        };
      }),
    [items],
  );

  const subtotal = computedItems.reduce((sum, item) => sum + item.valor_total, 0);
  const iva = subtotal * 0.19;
  const total = subtotal + iva;

  function updateItem(key: string, field: keyof DraftItem, value: string) {
    setItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, [field]: value } : item)),
    );
  }

  function addItem() {
    setItems((prev) => [...prev, createEmptyItem()]);
  }

  function removeItem(key: string) {
    setItems((prev) =>
      prev.length === 1 ? prev : prev.filter((item) => item.key !== key),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitLock.current || !can("cotizaciones.crear") || !current_scope || current_scope.kind === "GLOBAL") return;
    setError("");

    if (!clienteId) {
      setError("Seleccione un cliente.");
      return;
    }

    const payloadItems = computedItems
      .filter((item) => item.descripcion.trim())
      .map((item) => ({
        descripcion: item.descripcion.trim(),
        cantidad: item.cantidad,
        valor_unitario: item.valor_unitario,
      }));

    if (!payloadItems.length) {
      setError("Agregue al menos un ítem con descripción.");
      return;
    }

    submitLock.current = true;
    setSaving(true);
    try {
      await api.post("/cotizaciones", {
        cliente_id: Number(clienteId),
        tipo_servicio: tipoServicio,
        condiciones_comerciales: condiciones || undefined,
        items: payloadItems,
      }, { headers });
      notifyToast("Cotización guardada correctamente.", "success");
      router.push("/comercial/cotizaciones");
    } catch (saveError) {
      setError(getApiErrorMessage(saveError));
    } finally {
      submitLock.current = false;
      setSaving(false);
    }
  }

  if (!current_scope || current_scope.kind === "GLOBAL") return <p role="alert">Selecciona un ámbito operativo para crear la cotización.</p>;

  if (loading) {
    return <LoadingState label="Cargando formulario de cotización..." />;
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-sterinova-dark">
          Nueva Cotización
        </h1>
        <p className="mt-1 text-sterinova-teal">
          Formato comercial Sterinova — 7 tipos de servicio.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <p role="status" className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-sterinova-dark">
          Responsable de esta cotización: <strong>{[sessionUser?.nombre, sessionUser?.apellido].filter(Boolean).join(" ") || sessionUser?.email || "Usuario autenticado"}</strong>
          {sessionUser?.cargo ? ` · ${sessionUser.cargo}` : ""}. El sistema la asociará automáticamente a esta cuenta.
        </p>
        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-sterinova-dark/10">
          <h2 className="text-lg font-semibold text-sterinova-dark">
            1. Cliente
          </h2>
          <label className="mt-3 block text-sm">
            <span className="mb-1 block font-medium text-sterinova-dark">
              Seleccionar cliente
            </span>
            <select
              required
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className="w-full rounded-lg border border-sterinova-dark/20 bg-sterinova-light px-3 py-2 text-sterinova-dark outline-none focus:border-sterinova-teal focus:ring-2 focus:ring-sterinova-teal/30"
            >
              <option value="">Seleccione...</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.razon_social}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            {clientes.length === 0 ? (
              <span className="text-sterinova-dark/70">
                No hay clientes disponibles.
              </span>
            ) : (
              <span className="text-sterinova-dark/70">
                ¿No encuentra al cliente?
              </span>
            )}
            <Link
              href="/comercial/clientes"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-sterinova-teal underline"
            >
              Gestionar clientes
            </Link>
            <button
              type="button"
              onClick={() => void refreshClientes()}
              disabled={refreshing}
              aria-busy={refreshing}
              className="font-semibold text-sterinova-teal underline disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing ? "Actualizando..." : "Actualizar lista"}
            </button>
          </div>

          {selectedCliente ? (
            <div className="mt-4 grid gap-2 rounded-lg bg-sterinova-light p-4 text-sm text-sterinova-dark sm:grid-cols-2">
              <p>
                <span className="font-semibold">NIT:</span> {selectedCliente.nit}
              </p>
              <p>
                <span className="font-semibold">Contacto:</span>{" "}
                {selectedCliente.contacto}
              </p>
              <p>
                <span className="font-semibold">Teléfono:</span>{" "}
                {selectedCliente.telefono}
              </p>
              <p>
                <span className="font-semibold">Email:</span>{" "}
                {selectedCliente.email}
              </p>
              <p className="sm:col-span-2">
                <span className="font-semibold">Dirección:</span>{" "}
                {selectedCliente.direccion}
              </p>
            </div>
          ) : null}
        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-sterinova-dark/10">
          <h2 className="text-lg font-semibold text-sterinova-dark">
            2. Configuración
          </h2>
          <label className="mt-3 block text-sm">
            <span className="mb-1 block font-medium text-sterinova-dark">
              Tipo de cotización
            </span>
            <select
              value={tipoServicio}
              onChange={(e) =>
                setTipoServicio(e.target.value as TipoServicioCotizacion)
              }
              className="w-full rounded-lg border border-sterinova-dark/20 bg-sterinova-light px-3 py-2 text-sterinova-dark outline-none focus:border-sterinova-teal focus:ring-2 focus:ring-sterinova-teal/30"
            >
              {TIPOS_SERVICIO.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label} · {tipo.prefix}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-3 block text-sm">
            <span className="mb-1 block font-medium text-sterinova-dark">
              Condiciones comerciales (opcional)
            </span>
            <textarea
              rows={3}
              value={condiciones}
              onChange={(e) => setCondiciones(e.target.value)}
              className="w-full rounded-lg border border-sterinova-dark/20 bg-sterinova-light px-3 py-2 text-sterinova-dark outline-none focus:border-sterinova-teal focus:ring-2 focus:ring-sterinova-teal/30"
              placeholder="Vigencia, forma de pago, tiempos de entrega..."
            />
          </label>
        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-sterinova-dark/10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-sterinova-dark">
              3. Detalle de ítems
            </h2>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-2 rounded-lg border border-sterinova-teal px-3 py-2 text-sm font-medium text-sterinova-teal hover:bg-sterinova-teal/10"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Añadir Ítem
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-sterinova-light text-sterinova-dark">
                <tr>
                  <th className="px-3 py-2 font-semibold">Descripción</th>
                  <th className="px-3 py-2 font-semibold">Cantidad</th>
                  <th className="px-3 py-2 font-semibold">Valor Unitario</th>
                  <th className="px-3 py-2 font-semibold">Valor Total</th>
                  <th className="px-3 py-2 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {computedItems.map((item) => (
                  <tr key={item.key} className="border-t border-sterinova-dark/5">
                    <td className="px-3 py-2">
                      <input
                        required
                        value={item.descripcion}
                        onChange={(e) =>
                          updateItem(item.key, "descripcion", e.target.value)
                        }
                        className="w-full min-w-[220px] rounded-lg border border-sterinova-dark/20 bg-sterinova-light px-2 py-1.5"
                        placeholder="Servicio de esterilización EtO"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.cantidad}
                        onChange={(e) =>
                          updateItem(item.key, "cantidad", e.target.value)
                        }
                        className="w-28 rounded-lg border border-sterinova-dark/20 bg-sterinova-light px-2 py-1.5"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.valor_unitario}
                        onChange={(e) =>
                          updateItem(item.key, "valor_unitario", e.target.value)
                        }
                        className="w-36 rounded-lg border border-sterinova-dark/20 bg-sterinova-light px-2 py-1.5"
                      />
                    </td>
                    <td className="px-3 py-2 font-medium text-sterinova-dark">
                      {formatCurrency(item.valor_total)}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        aria-label="Eliminar ítem"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-sterinova-dark/10">
          <h2 className="text-lg font-semibold text-sterinova-dark">
            4. Totales
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between text-sterinova-dark">
              <dt>Subtotal</dt>
              <dd className="font-medium">{formatCurrency(subtotal)}</dd>
            </div>
            <div className="flex justify-between text-sterinova-dark">
              <dt>IVA (19%)</dt>
              <dd className="font-medium">{formatCurrency(iva)}</dd>
            </div>
            <div className="flex justify-between border-t border-sterinova-dark/10 pt-2 text-base font-bold text-sterinova-orange">
              <dt>Total General</dt>
              <dd>{formatCurrency(total)}</dd>
            </div>
          </dl>
        </section>

        {error ? (
          <p className="text-sm font-medium text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <section className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/comercial/cotizaciones")}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-sterinova-dark hover:bg-white"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || clientes.length === 0}
            aria-busy={saving}
            className="rounded-lg bg-sterinova-orange px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-70"
          >
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
                Guardando...
              </span>
            ) : (
              "Guardar Cotización"
            )}
          </button>
        </section>
      </form>
    </div>
  );
}
