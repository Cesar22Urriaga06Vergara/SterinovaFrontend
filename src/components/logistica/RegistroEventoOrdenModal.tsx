"use client";

import { FormEvent, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import type { OrdenServicio } from "@/lib/logistica-types";

export type EstadoEventoOrden =
  | "RECOGIDO"
  | "EN_PLANTA"
  | "ENTREGADO";
export type EventoOrdenInput = {
  responsable: string;
  recibido_por?: string;
  entregado_por?: string;
  transportista?: string;
  observaciones?: string;
  materiales: Array<{
    material_id: number;
    cantidad: number;
    cajas: number;
  }>;
};

type MaterialEventoCaptura = { cantidad: string; cajas: string };

const eventLabels: Record<EstadoEventoOrden, string> = {
  RECOGIDO: "Recogida del material",
  EN_PLANTA: "Recepción en planta",
  ENTREGADO: "Entrega al cliente",
};

export function RegistroEventoOrdenModal({
  orden,
  estado,
  saving,
  onClose,
  onSubmit,
}: {
  orden: OrdenServicio;
  estado: EstadoEventoOrden;
  saving: boolean;
  onClose: () => void;
  onSubmit: (evento: EventoOrdenInput) => void;
}) {
  const [responsable, setResponsable] = useState("");
  const [recibidoPor, setRecibidoPor] = useState("");
  const [entregadoPor, setEntregadoPor] = useState("");
  const [transportista, setTransportista] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [cantidades, setCantidades] = useState<Map<number, MaterialEventoCaptura>>(
    () =>
      new Map(
        (orden.materiales ?? []).flatMap((material) =>
          material.id
            ? [[material.id, { cantidad: "", cajas: "" }] as const]
            : [],
        ),
      ),
  );
  const needsReceiver = estado === "EN_PLANTA" || estado === "ENTREGADO";
  const needsSender = estado === "RECOGIDO";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const materiales = (orden.materiales ?? []).flatMap((material) => {
      if (!material.id) return [];
      const current = cantidades.get(material.id);
      if (!current) return [];
      return [{
        material_id: material.id,
        cantidad: Number(current.cantidad),
        cajas: Number(current.cajas),
      }];
    });
    onSubmit({
      responsable: responsable.trim(),
      ...(needsReceiver ? { recibido_por: recibidoPor.trim() } : {}),
      ...(needsSender ? { entregado_por: entregadoPor.trim() } : {}),
      ...(transportista.trim() ? { transportista: transportista.trim() } : {}),
      ...(observaciones.trim() ? { observaciones: observaciones.trim() } : {}),
      materiales,
    });
  }

  return (
    <Modal
      open
      title={`Registrar ${eventLabels[estado]} · ${orden.consecutivo}`}
      description="La fecha y hora se registrarán al guardar este evento."
      onClose={() => {
        if (!saving) onClose();
      }}
      size="xl"
      closeOnBackdrop={false}
    >
      <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Responsable del evento</span>
            <input
              required
              maxLength={255}
              value={responsable}
              onChange={(event) => setResponsable(event.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            />
          </label>
          {needsSender ? (
            <label className="block text-sm">
              <span className="mb-1 block font-medium">
                Entregado por el cliente
              </span>
              <input
                required
                maxLength={255}
                value={entregadoPor}
                onChange={(event) => setEntregadoPor(event.target.value)}
                className="w-full rounded-lg border px-3 py-2"
              />
            </label>
          ) : null}
          {needsReceiver ? (
            <label className="block text-sm">
              <span className="mb-1 block font-medium">
                {estado === "EN_PLANTA"
                  ? "Recibido por en planta"
                  : "Recibido por el cliente"}
              </span>
              <input
                required
                maxLength={255}
                value={recibidoPor}
                onChange={(event) => setRecibidoPor(event.target.value)}
                className="w-full rounded-lg border px-3 py-2"
              />
            </label>
          ) : null}
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Transportista (opcional)</span>
            <input
              maxLength={255}
              value={transportista}
              onChange={(event) => setTransportista(event.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            />
          </label>
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold">Cantidades reales</legend>
            {(orden.materiales ?? []).map((material) => {
              const materialId = material.id;
              if (!materialId) return null;
              const current = cantidades.get(materialId) ?? {
                cantidad: "",
                cajas: "",
              };
              return (
                <div
                  key={materialId}
                  className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_150px_150px]"
                >
                  <p className="self-center text-sm font-medium">
                    {material.descripcion}
                    {material.lote ? ` · Lote ${material.lote}` : ""}
                  </p>
                  <label className="text-sm">
                    <span className="mb-1 block">Unidades</span>
                    <input
                      required
                      type="number"
                      min={0}
                      max={4294967295}
                      step={1}
                      value={current.cantidad}
                      onChange={(event) =>
                        setCantidades((previous) => {
                          const next = new Map(previous);
                          next.set(materialId, {
                            ...current,
                            cantidad: event.target.value,
                          });
                          return next;
                        })
                      }
                      className="w-full rounded-lg border px-3 py-2"
                    />
                  </label>
                  <label className="text-sm">
                    <span className="mb-1 block">Cajas</span>
                    <input
                      required
                      type="number"
                      min={0}
                      max={4294967295}
                      step={1}
                      value={current.cajas}
                      onChange={(event) =>
                        setCantidades((previous) => {
                          const next = new Map(previous);
                          next.set(materialId, {
                            ...current,
                            cajas: event.target.value,
                          });
                          return next;
                        })
                      }
                      className="w-full rounded-lg border px-3 py-2"
                    />
                  </label>
                </div>
              );
            })}
          </fieldset>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Observaciones (opcional)</span>
            <textarea
              rows={2}
              maxLength={2000}
              value={observaciones}
              onChange={(event) => setObservaciones(event.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            />
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg px-4 py-2 text-sm font-medium text-surface-foreground hover:bg-background"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !orden.materiales?.length}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-70"
            >
              {saving ? "Guardando..." : "Registrar evento"}
            </button>
          </div>
        </form>
    </Modal>
  );
}
