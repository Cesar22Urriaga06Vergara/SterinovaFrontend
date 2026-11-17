"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { MaterialesEditor } from "@/components/logistica/MaterialesEditor";
import {
  RegistroEventoOrdenModal,
  type EstadoEventoOrden,
  type EventoOrdenInput,
} from "@/components/logistica/RegistroEventoOrdenModal";
import { nuevoMaterial, validarMateriales } from "@/lib/operational-forms";
import type { MaterialRecibido } from "@/lib/operational-types";
import { api, downloadPdfFromBackend } from "@/lib/api";
import {
  Cotizacion,
  labelTipoServicio,
} from "@/lib/cotizacion-types";
import {
  ESTADO_COLORES,
  ESTADO_LABELS,
  OrdenServicio,
  nextEstadoAction,
} from "@/lib/logistica-types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { useDialogA11y } from "@/components/ui/useDialogA11y";
import { ErrorState } from "@/components/ui/states/ErrorState";
import { TableState } from "@/components/ui/states/TableState";
import { useSession } from "@/lib/session";

function isEstadoEventoOrden(
  estado: string,
): estado is EstadoEventoOrden {
  return (
    estado === "RECOGIDO" ||
    estado === "EN_PLANTA" ||
    estado === "ENTREGADO"
  );
}

export default function LogisticaPage() {
  const { can } = useSession();
  const canViewApprovedQuotes = can("logistica.cotizaciones_disponibles.ver");
  const canCreateOrder = can("logistica.ordenes.crear") && canViewApprovedQuotes;
  const canRegisterReception = can("logistica.recepciones.registrar");
  const canChangeState = can("logistica.ordenes.cambiar_estado");
  const [materiales, setMateriales] = useState<MaterialRecibido[]>([
    nuevoMaterial(),
  ]);
  const [editOrder, setEditOrder] = useState<OrdenServicio | null>(null);
  const [metodo, setMetodo] = useState("");
  const [conflict, setConflict] = useState(false);
  const [ordenes, setOrdenes] = useState<OrdenServicio[]>([]);
  const [aprobadas, setAprobadas] = useState<Cotizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
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
  const [eventoPendiente, setEventoPendiente] = useState<{
    orden: OrdenServicio;
    estado: EstadoEventoOrden;
  } | null>(null);
  const [savingEvent, setSavingEvent] = useState(false);
  const pdfPreviewDialogRef = useDialogA11y({
    open: Boolean(pdfPreview),
    onClose: () => setPdfPreview(null),
  });

  const loadData = useCallback(async () => {
    const [ordenesRes, aprobadasRes] = await Promise.all([
      api.get<OrdenServicio[]>("/logistica/ordenes"),
      canViewApprovedQuotes
        ? api.get<Cotizacion[]>("/logistica/cotizaciones-aprobadas")
        : Promise.resolve({ data: [] as Cotizacion[] }),
    ]);
    return { ordenes: ordenesRes.data, aprobadas: aprobadasRes.data };
  }, [canViewApprovedQuotes]);

  useEffect(() => {
    let active = true;
    loadData()
      .then(({ ordenes: loadedOrders, aprobadas: approvedQuotes }) => {
        if (!active) return;
        setLoadError("");
        setError("");
        setOrdenes(loadedOrders);
        setAprobadas(approvedQuotes);
      })
      .catch(() => {
        if (active) setLoadError("No se pudo cargar el tablero de logística.");
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
    setLoading(true);
    setLoadError("");
    try {
      const { ordenes: loadedOrders, aprobadas: approvedQuotes } =
        await loadData();
      setError("");
      setOrdenes(loadedOrders);
      setAprobadas(approvedQuotes);
    } catch {
      setLoadError("No se pudo cargar el tablero de logística.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || (editOrder ? !canRegisterReception : !canCreateOrder)) return;
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
    if (!canChangeState) return;
    const action = nextEstadoAction(orden.estado);
    if (!action) return;
    if (isEstadoEventoOrden(action.next)) {
      setEventoPendiente({
        orden,
        estado: action.next,
      });
      return;
    }
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

  async function handleEvento(evento: EventoOrdenInput) {
    if (!eventoPendiente || !canChangeState || savingEvent) return;
    setSavingEvent(true);
    setError("");
    try {
      await api.put(
        `/logistica/ordenes/${eventoPendiente.orden.id}/estado`,
        { estado: eventoPendiente.estado, evento },
      );
      setEventoPendiente(null);
      await refreshData();
    } catch (cause) {
      const message = (
        cause as { response?: { data?: { message?: string | string[] } } }
      ).response?.data?.message;
      setError(
        Array.isArray(message)
          ? message.join(". ")
          : message || "No se pudo registrar el evento logístico.",
      );
    } finally {
      setSavingEvent(false);
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
        title: `${tipo === "acta" ? orden.acta_consecutivo ?? orden.consecutivo : orden.consecutivo} - ${tipo === "acta" ? "Acta" : "Orden"}`,
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
        `${tipo === "acta" ? orden.acta_consecutivo ?? orden.consecutivo : orden.consecutivo}-${tipo === "acta" ? "acta" : "orden"}.pdf`,
      );
    } catch {
      setError(`No se pudo generar el documento ${orden.consecutivo}.`);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <PageHeader
        title="Logística"
        description="Órdenes de servicio y recolección para conductores."
        actions={canCreateOrder ? (
          <Button
            type="button"
            onClick={() => {
              setEditOrder(null);
              setConflict(false);
              setMateriales([nuevoMaterial()]);
              setMetodo("");
              setError("");
              setModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" aria-hidden />
            Generar Orden de Recolección
          </Button>
        ) : null}
      />

      {error ? (
        <p
          className="rounded-control bg-error-light px-4 py-3 text-sm font-medium text-error-foreground"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {loadError ? (
        <ErrorState
          message={loadError}
          onRetry={() => void refreshData()}
        />
      ) : (
        <div className="overflow-hidden rounded-xl bg-surface shadow-sm ring-1 ring-surface-border">
          <table className="min-w-full divide-y divide-surface-border text-left text-sm">
            <thead className="bg-background text-surface-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Consecutivo OS</th>
                <th className="px-4 py-3 font-semibold">Consecutivo Acta</th>
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Cotización</th>
                <th className="px-4 py-3 font-semibold">Fecha Programada</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Conductor</th>
                <th className="px-4 py-3 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {loading ? (
                <TableState
                  colSpan={8}
                  message="Cargando órdenes de servicio..."
                  loading
                />
              ) : ordenes.length === 0 ? (
                <TableState
                  colSpan={8}
                  message="No hay órdenes de servicio. Aprueba una cotización y genera una orden."
                />
              ) : (
                ordenes.map((orden) => {
                  const action = nextEstadoAction(orden.estado);
                  return (
                    <tr key={orden.id} className="text-surface-foreground">
                      <td className="px-4 py-3 font-medium">
                        {orden.consecutivo}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {orden.acta_consecutivo ?? "—"}
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
                        {canRegisterReception && !["PROCESADO", "ENTREGADO", "CANCELADO"].includes(orden.estado) &&
                        !orden.eventos?.length ? (
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
                            className="block text-xs font-semibold text-secondary"
                          >
                            Editar material recibido
                          </button>
                        ) : null}
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => void previewPdf(orden, "orden")}
                            className="rounded-lg border border-secondary/40 px-2.5 py-1.5 text-xs font-medium text-secondary hover:bg-secondary-hover/10"
                          >
                            Ver Orden
                          </button>
                          <button
                            type="button"
                            onClick={() => void downloadPdf(orden, "orden")}
                            className="rounded-lg border border-secondary/40 px-2.5 py-1.5 text-xs font-medium text-secondary hover:bg-secondary-hover/10"
                          >
                            Descargar Orden
                          </button>
                          <button
                            type="button"
                            onClick={() => void previewPdf(orden, "acta")}
                            className="rounded-lg border border-surface-border px-2.5 py-1.5 text-xs font-medium text-surface-foreground hover:bg-background"
                          >
                            Ver Acta
                          </button>
                          <button
                            type="button"
                            onClick={() => void downloadPdf(orden, "acta")}
                            className="rounded-lg border border-surface-border px-2.5 py-1.5 text-xs font-medium text-surface-foreground hover:bg-background"
                          >
                            Descargar Acta
                          </button>
                        </div>
                        {canChangeState && action ? (
                          <button
                            type="button"
                            onClick={() => void handleEstado(orden)}
                            className="mt-2 rounded-lg border border-secondary/40 px-2.5 py-1.5 text-xs font-medium text-secondary hover:bg-secondary-hover/10"
                          >
                            {action.label}
                          </button>
                        ) : (
                          <span className="mt-2 block text-xs text-secondary">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {pdfPreview ? (
        <div
          ref={pdfPreviewDialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pdf-preview-title"
          tabIndex={-1}
          className="fixed inset-0 z-[60] flex flex-col bg-black/70 p-3 sm:p-6"
        >
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-t-xl bg-surface px-4 py-3">
            <h2
              id="pdf-preview-title"
              className="font-semibold text-surface-foreground"
            >
              {pdfPreview.title}
            </h2>
            <button
              type="button"
              onClick={() => setPdfPreview(null)}
              className="rounded-lg p-1 text-surface-foreground hover:bg-background"
              aria-label="Cerrar vista previa"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <iframe
            src={pdfPreview.url}
            title={`Vista previa: ${pdfPreview.title}`}
            className="mx-auto h-full w-full max-w-6xl rounded-b-xl bg-surface"
          />
        </div>
      ) : null}

      {eventoPendiente ? (
        <RegistroEventoOrdenModal
          orden={eventoPendiente.orden}
          estado={eventoPendiente.estado}
          saving={savingEvent}
          onClose={() => {
            if (!savingEvent) setEventoPendiente(null);
          }}
          onSubmit={(evento) => void handleEvento(evento)}
        />
      ) : null}

      {modalOpen ? (
        <Modal
          open
          title={
            editOrder
              ? `Material recibido: ${editOrder.consecutivo}`
              : "Generar Orden de Recolecci\u00f3n"
          }
          onClose={() => {
            if (!saving) setModalOpen(false);
          }}
          size="xl"
          closeOnBackdrop={false}
        >
            <form onSubmit={handleCreate} className="space-y-4">
              {!editOrder ? (
                <>
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium text-surface-foreground">
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
                      className="w-full rounded-lg border border-surface-border bg-background px-3 py-2 text-surface-foreground outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
                    >
                      <option value="">Seleccione...</option>
                      {aprobadas.map((cotizacion) => (
                        <option key={cotizacion.id} value={cotizacion.id}>
                          {cotizacion.consecutivo} —{" "}
                          {cotizacion.cliente?.razon_social ?? "Cliente"} —{" "}
                          {labelTipoServicio(cotizacion.tipo_servicio)}
                        </option>
                      ))}
                    </select>
                    {aprobadas.length === 0 ? (
                      <p className="mt-1 text-xs text-secondary">
                        No hay cotizaciones APROBADAS disponibles. Aprueba una
                        en Comercial primero.
                      </p>
                    ) : null}
                  </label>

                  <label className="block text-sm">
                    <span className="mb-1 block font-medium text-surface-foreground">
                      Fecha programada
                    </span>
                    <input
                      required
                      type="date"
                      value={fechaProgramada}
                      onChange={(e) => setFechaProgramada(e.target.value)}
                      className="w-full rounded-lg border border-surface-border bg-background px-3 py-2 text-surface-foreground outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
                    />
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block text-sm">
                      <span className="mb-1 block font-medium text-surface-foreground">
                        Conductor (opcional)
                      </span>
                      <input
                        value={conductor}
                        onChange={(e) => setConductor(e.target.value)}
                        className="w-full rounded-lg border border-surface-border bg-background px-3 py-2 text-surface-foreground outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
                      />
                    </label>
                    <label className="block text-sm">
                      <span className="mb-1 block font-medium text-surface-foreground">
                        Placa (opcional)
                      </span>
                      <input
                        value={placa}
                        onChange={(e) => setPlaca(e.target.value)}
                        className="w-full rounded-lg border border-surface-border bg-background px-3 py-2 text-surface-foreground outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
                      />
                    </label>
                  </div>

                  <label className="block text-sm">
                    <span className="mb-1 block font-medium text-surface-foreground">
                      Observaciones (opcional)
                    </span>
                    <textarea
                      rows={2}
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      className="w-full rounded-lg border border-surface-border bg-background px-3 py-2 text-surface-foreground outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
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
                  className="text-sm font-bold text-secondary"
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
                  className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2"
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
                  className="rounded-lg px-4 py-2 text-sm font-medium text-surface-foreground hover:bg-background"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={
                    saving || conflict || (!editOrder && aprobadas.length === 0)
                  }
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-70"
                >
                  {saving
                    ? "Guardando..."
                    : editOrder
                      ? "Guardar materiales"
                      : "Crear Orden"}
                </button>
              </div>
            </form>
        </Modal>
      ) : null}
    </div>
  );
}
