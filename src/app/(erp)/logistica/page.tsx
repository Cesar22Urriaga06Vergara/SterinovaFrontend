"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { api } from "@/lib/api";
import { Cotizacion, formatCurrency, labelTipoServicio } from "@/lib/cotizacion-types";
import {
  ESTADO_COLORES,
  ESTADO_LABELS,
  OrdenServicio,
  nextEstadoAction,
} from "@/lib/logistica-types";

export default function LogisticaPage() {
  const [ordenes, setOrdenes] = useState<OrdenServicio[]>([]);
  const [aprobadas, setAprobadas] = useState<Cotizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cotizacionId, setCotizacionId] = useState("");
  const [fechaProgramada, setFechaProgramada] = useState("");
  const [conductor, setConductor] = useState("");
  const [placa, setPlaca] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const loadData = useCallback(async () => {
    const [ordenesRes, aprobadasRes] = await Promise.all([
      api.get<OrdenServicio[]>("/logistica/ordenes"),
      api.get<Cotizacion[]>("/logistica/cotizaciones-aprobadas"),
    ]);
    return { ordenes: ordenesRes.data, aprobadas: aprobadasRes.data };
  }, []);

  useEffect(() => {
    let active = true;
    loadData()
      .then(({ ordenes: loadedOrders, aprobadas: approvedQuotes }) => {
        if (!active) return;
        setError("");
        setOrdenes(loadedOrders);
        setAprobadas(approvedQuotes);
      })
      .catch(() => {
        if (active) setError("No se pudo cargar el tablero de logística.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loadData]);

  async function refreshData() {
    try {
      const { ordenes: loadedOrders, aprobadas: approvedQuotes } =
        await loadData();
      setError("");
      setOrdenes(loadedOrders);
      setAprobadas(approvedQuotes);
    } catch {
      setError("No se pudo cargar el tablero de logística.");
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/logistica/ordenes", {
        cotizacion_id: Number(cotizacionId),
        fecha_programada: fechaProgramada,
        conductor_asignado: conductor || undefined,
        vehiculo_placa: placa || undefined,
        observaciones: observaciones || undefined,
      });
      setModalOpen(false);
      setCotizacionId("");
      setFechaProgramada("");
      setConductor("");
      setPlaca("");
      setObservaciones("");
      await refreshData();
    } catch {
      setError(
        "No se pudo generar la orden. Verifique que la cotización esté APROBADA y sin orden previa.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleEstado(orden: OrdenServicio) {
    const action = nextEstadoAction(orden.estado);
    if (!action) return;
    setError("");
    try {
      await api.put(`/logistica/ordenes/${orden.id}/estado`, {
        estado: action.next,
      });
      await refreshData();
    } catch {
      setError(`No se pudo actualizar el estado de ${orden.consecutivo}.`);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-sterinova-dark">Logística</h1>
          <p className="mt-1 text-sterinova-teal">
            Órdenes de servicio y recolección para conductores.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-sterinova-orange px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Generar Orden de Recolección
        </button>
      </div>

      {error ? (
        <p className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-sterinova-dark/10">
        <table className="min-w-full divide-y divide-sterinova-dark/10 text-left text-sm">
          <thead className="bg-sterinova-light text-sterinova-dark">
            <tr>
              <th className="px-4 py-3 font-semibold">Consecutivo OS</th>
              <th className="px-4 py-3 font-semibold">Cliente</th>
              <th className="px-4 py-3 font-semibold">Cotización</th>
              <th className="px-4 py-3 font-semibold">Fecha Programada</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Conductor</th>
              <th className="px-4 py-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sterinova-dark/5">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sterinova-teal">
                  Cargando...
                </td>
              </tr>
            ) : ordenes.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sterinova-teal">
                  No hay órdenes de servicio. Aprueba una cotización y genera una
                  orden.
                </td>
              </tr>
            ) : (
              ordenes.map((orden) => {
                const action = nextEstadoAction(orden.estado);
                return (
                  <tr key={orden.id} className="text-sterinova-dark">
                    <td className="px-4 py-3 font-medium">{orden.consecutivo}</td>
                    <td className="px-4 py-3">
                      {orden.cotizacion?.cliente?.razon_social ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      {orden.cotizacion?.consecutivo ?? `#${orden.cotizacion_id}`}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(
                        `${orden.fecha_programada}T00:00:00`,
                      ).toLocaleDateString("es-CO")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${ESTADO_COLORES[orden.estado]}`}
                      >
                        {ESTADO_LABELS[orden.estado]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {orden.conductor_asignado ?? "Sin asignar"}
                    </td>
                    <td className="px-4 py-3">
                      {action ? (
                        <button
                          type="button"
                          onClick={() => void handleEstado(orden)}
                          className="rounded-lg border border-sterinova-teal/40 px-2.5 py-1.5 text-xs font-medium text-sterinova-teal hover:bg-sterinova-teal/10"
                        >
                          {action.label}
                        </button>
                      ) : (
                        <span className="text-xs text-sterinova-teal">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-sterinova-dark/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-sterinova-dark">
                Generar Orden de Recolección
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-sterinova-dark hover:bg-sterinova-light"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-sterinova-dark">
                  Cotización aprobada
                </span>
                <select
                  required
                  value={cotizacionId}
                  onChange={(e) => setCotizacionId(e.target.value)}
                  className="w-full rounded-lg border border-sterinova-dark/20 bg-sterinova-light px-3 py-2 text-sterinova-dark outline-none focus:border-sterinova-teal focus:ring-2 focus:ring-sterinova-teal/30"
                >
                  <option value="">Seleccione...</option>
                  {aprobadas.map((cotizacion) => (
                    <option key={cotizacion.id} value={cotizacion.id}>
                      {cotizacion.consecutivo} —{" "}
                      {cotizacion.cliente?.razon_social ?? "Cliente"} —{" "}
                      {labelTipoServicio(cotizacion.tipo_servicio)} —{" "}
                      {formatCurrency(cotizacion.total)}
                    </option>
                  ))}
                </select>
                {aprobadas.length === 0 ? (
                  <p className="mt-1 text-xs text-sterinova-teal">
                    No hay cotizaciones APROBADAS disponibles. Aprueba una en
                    Comercial primero.
                  </p>
                ) : null}
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-sterinova-dark">
                  Fecha programada
                </span>
                <input
                  required
                  type="date"
                  value={fechaProgramada}
                  onChange={(e) => setFechaProgramada(e.target.value)}
                  className="w-full rounded-lg border border-sterinova-dark/20 bg-sterinova-light px-3 py-2 text-sterinova-dark outline-none focus:border-sterinova-teal focus:ring-2 focus:ring-sterinova-teal/30"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-sterinova-dark">
                    Conductor (opcional)
                  </span>
                  <input
                    value={conductor}
                    onChange={(e) => setConductor(e.target.value)}
                    className="w-full rounded-lg border border-sterinova-dark/20 bg-sterinova-light px-3 py-2 text-sterinova-dark outline-none focus:border-sterinova-teal focus:ring-2 focus:ring-sterinova-teal/30"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-sterinova-dark">
                    Placa (opcional)
                  </span>
                  <input
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value)}
                    className="w-full rounded-lg border border-sterinova-dark/20 bg-sterinova-light px-3 py-2 text-sterinova-dark outline-none focus:border-sterinova-teal focus:ring-2 focus:ring-sterinova-teal/30"
                  />
                </label>
              </div>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-sterinova-dark">
                  Observaciones (opcional)
                </span>
                <textarea
                  rows={2}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full rounded-lg border border-sterinova-dark/20 bg-sterinova-light px-3 py-2 text-sterinova-dark outline-none focus:border-sterinova-teal focus:ring-2 focus:ring-sterinova-teal/30"
                />
              </label>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-sterinova-dark hover:bg-sterinova-light"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || aprobadas.length === 0}
                  className="rounded-lg bg-sterinova-orange px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
                >
                  {saving ? "Generando..." : "Crear Orden"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
