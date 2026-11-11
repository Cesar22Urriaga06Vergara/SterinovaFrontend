"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { MaterialesEditor } from "@/components/logistica/MaterialesEditor";
import { nuevoMaterial, validarMateriales } from "@/lib/operational-forms";
import type { MaterialRecibido } from "@/lib/operational-types";
import { api, downloadPdfFromBackend } from "@/lib/api";
import {
  Cotizacion,
  formatCurrency,
  labelTipoServicio,
} from "@/lib/cotizacion-types";
import {
  ESTADO_COLORES,
  ESTADO_LABELS,
  OrdenServicio,
  nextEstadoAction,
} from "@/lib/logistica-types";

export default function LogisticaPage() {
  const [materiales, setMateriales] = useState<MaterialRecibido[]>([
    nuevoMaterial(),
  ]);
  const [editOrder, setEditOrder] = useState<OrdenServicio | null>(null);
  const [metodo, setMetodo] = useState("");
  const [conflict, setConflict] = useState(false);
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
  const [pdfPreview, setPdfPreview] = useState<{
    url: string;
    title: string;
  } | null>(null);

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

  useEffect(() => {
    if (!pdfPreview) return;
    return () => URL.revokeObjectURL(pdfPreview.url);
  }, [pdfPreview]);

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
    const validation = validarMateriales(materiales);
    if (validation) {
      setError(validation);
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editOrder)
        await api.patch(`/logistica/ordenes/${editOrder.id}/materiales`, {
          version: editOrder.version,
          materiales,
          metodo_esterilizacion: metodo || undefined,
        });
      else
        await api.post("/logistica/ordenes", {
          materiales,
          metodo_esterilizacion: metodo || undefined,
          cotizacion_id: Number(cotizacionId),
          fecha_programada: fechaProgramada,
          conductor_asignado: conductor || undefined,
          vehiculo_placa: placa || undefined,
          observaciones: observaciones || undefined,
        });
      setModalOpen(false);
      setEditOrder(null);
      setMateriales([nuevoMaterial()]);
      setCotizacionId("");
      setFechaProgramada("");
      setConductor("");
      setPlaca("");
      setObservaciones("");
      await refreshData();
    } catch (cause) {
      const response = (
        cause as { response?: { status?: number; data?: { message?: string } } }
      ).response;
      setError(
        response?.data?.message ||
          "No se pudo guardar la orden. Verifique los datos recibidos.",
      );
      if (response?.status === 409) setConflict(true);
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

  async function previewPdf(orden: OrdenServicio, tipo: "orden" | "acta") {
    setError("");
    try {
      const { data } = await api.get<Blob>(
        `/logistica/ordenes/${orden.id}/pdf?tipo=${tipo}`,
        { responseType: "blob" },
      );
      setPdfPreview({
        url: URL.createObjectURL(data),
        title: `${orden.consecutivo} - ${tipo === "acta" ? "Acta" : "Orden"}`,
      });
    } catch {
      setError(`No se pudo previsualizar el documento ${orden.consecutivo}.`);
    }
  }

  async function downloadPdf(orden: OrdenServicio, tipo: "orden" | "acta") {
    setError("");
    try {
      await downloadPdfFromBackend(
        `/logistica/ordenes/${orden.id}/pdf?tipo=${tipo}`,
        `${orden.consecutivo}-${tipo === "acta" ? "acta" : "orden"}.pdf`,
      );
    } catch {
      setError(`No se pudo generar el documento ${orden.consecutivo}.`);
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
          onClick={() => {
            setEditOrder(null);
            setConflict(false);
            setMateriales([nuevoMaterial()]);
            setMetodo("");
            setError("");
            setModalOpen(true);
          }}
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
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-sterinova-teal"
                >
                  Cargando...
                </td>
              </tr>
            ) : ordenes.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-sterinova-teal"
                >
                  No hay órdenes de servicio. Aprueba una cotización y genera
                  una orden.
                </td>
              </tr>
            ) : (
              ordenes.map((orden) => {
                const action = nextEstadoAction(orden.estado);
                return (
                  <tr key={orden.id} className="text-sterinova-dark">
                    <td className="px-4 py-3 font-medium">
                      {orden.consecutivo}
                    </td>
                    <td className="px-4 py-3">
                      {orden.cotizacion?.cliente?.razon_social ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      {orden.cotizacion?.consecutivo ??
                        `#${orden.cotizacion_id}`}
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
                    <td className="space-y-2 px-4 py-3">
                      {!["PROCESADO", "CANCELADO"].includes(orden.estado) ? (
                        <button
                          type="button"
                          onClick={() => {
                            setEditOrder(orden);
                            setConflict(false);
                            setError("");
                            setMateriales(
                              orden.materiales?.length
                                ? orden.materiales.map((m) => ({ ...m }))
                                : [nuevoMaterial()],
                            );
                            setMetodo(orden.metodo_esterilizacion ?? "");
                            setModalOpen(true);
                          }}
                          className="block text-xs font-semibold text-sterinova-teal"
                        >
                          Editar material recibido
                        </button>
                      ) : null}
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => void previewPdf(orden, "orden")}
                          className="rounded-lg border border-sterinova-teal/40 px-2.5 py-1.5 text-xs font-medium text-sterinova-teal hover:bg-sterinova-teal/10"
                        >
                          Ver Orden
                        </button>
                        <button
                          type="button"
                          onClick={() => void downloadPdf(orden, "orden")}
                          className="rounded-lg border border-sterinova-teal/40 px-2.5 py-1.5 text-xs font-medium text-sterinova-teal hover:bg-sterinova-teal/10"
                        >
                          Descargar Orden
                        </button>
                        <button
                          type="button"
                          onClick={() => void previewPdf(orden, "acta")}
                          className="rounded-lg border border-sterinova-dark/20 px-2.5 py-1.5 text-xs font-medium text-sterinova-dark hover:bg-sterinova-light"
                        >
                          Ver Acta
                        </button>
                        <button
                          type="button"
                          onClick={() => void downloadPdf(orden, "acta")}
                          className="rounded-lg border border-sterinova-dark/20 px-2.5 py-1.5 text-xs font-medium text-sterinova-dark hover:bg-sterinova-light"
                        >
                          Descargar Acta
                        </button>
                      </div>
                      {action ? (
                        <button
                          type="button"
                          onClick={() => void handleEstado(orden)}
                          className="mt-2 rounded-lg border border-sterinova-teal/40 px-2.5 py-1.5 text-xs font-medium text-sterinova-teal hover:bg-sterinova-teal/10"
                        >
                          {action.label}
                        </button>
                      ) : (
                        <span className="mt-2 block text-xs text-sterinova-teal">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pdfPreview ? (
        <div className="fixed inset-0 z-[60] flex flex-col bg-black/70 p-3 sm:p-6">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-t-xl bg-white px-4 py-3">
            <h2 className="font-semibold text-sterinova-dark">
              {pdfPreview.title}
            </h2>
            <button
              type="button"
              onClick={() => setPdfPreview(null)}
              className="rounded-lg p-1 text-sterinova-dark hover:bg-sterinova-light"
              aria-label="Cerrar vista previa"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <iframe
            src={pdfPreview.url}
            title={`Vista previa: ${pdfPreview.title}`}
            className="mx-auto h-full w-full max-w-6xl rounded-b-xl bg-white"
          />
        </div>
      ) : null}

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-sterinova-dark/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label={
              editOrder ? "Editar material recibido" : "Generar orden"
            }
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-sterinova-dark">
                {editOrder
                  ? `Material recibido: ${editOrder.consecutivo}`
                  : "Generar Orden de Recolecci\u00f3n"}
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
              {!editOrder ? (
                <>
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium text-sterinova-dark">
                      Cotización aprobada
                    </span>
                    <select
                      required
                      value={cotizacionId}
                      onChange={(e) => {
                        setCotizacionId(e.target.value);
                        const tipo = aprobadas.find(
                          (q) => q.id === Number(e.target.value),
                        )?.tipo_servicio;
                        setMetodo(
                          tipo?.endsWith("_ETO")
                            ? "ETO"
                            : tipo?.endsWith("_VAPOR")
                              ? "VAPOR"
                              : "",
                        );
                      }}
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
                        No hay cotizaciones APROBADAS disponibles. Aprueba una
                        en Comercial primero.
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
                </>
              ) : null}
              {error ? (
                <p role="alert" className="text-sm text-red-700">
                  {error}
                </p>
              ) : null}
              {conflict ? (
                <button
                  type="button"
                  onClick={async () => {
                    await refreshData();
                    setModalOpen(false);
                    setConflict(false);
                  }}
                  className="text-sm font-bold text-sterinova-teal"
                >
                  Recargar órdenes antes de volver a editar
                </button>
              ) : null}
              <label className="block text-sm">
                Método de esterilización
                <select
                  aria-label="Método de la orden"
                  value={metodo}
                  onChange={(e) => setMetodo(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="">No aplica</option>
                  <option value="ETO">EtO</option>
                  <option value="VAPOR">Vapor</option>
                </select>
              </label>
              <MaterialesEditor
                value={materiales}
                onChange={setMateriales}
                disabled={saving || conflict}
              />
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
                  disabled={
                    saving || conflict || (!editOrder && aprobadas.length === 0)
                  }
                  className="rounded-lg bg-sterinova-orange px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
                >
                  {saving
                    ? "Guardando..."
                    : editOrder
                      ? "Guardar materiales"
                      : "Crear Orden"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
