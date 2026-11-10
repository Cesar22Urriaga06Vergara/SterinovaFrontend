"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Check, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/states/EmptyState";
import { ErrorState } from "@/components/ui/states/ErrorState";
import { LoadingState } from "@/components/ui/states/LoadingState";
import {
  obtenerPendientes,
  resolverSolicitud,
} from "@/lib/solicitud-anulacion-api";
import {
  puedeResolverSolicitud,
  type DecisionSolicitud,
  type SolicitudAnulacion,
} from "@/lib/solicitud-anulacion-types";
import { getApiErrorMessage } from "@/lib/api-errors";
import { useQuoteHeaders, useSession } from "@/lib/session";

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Fecha no disponible"
    : date.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

export default function SolicitudesPage() {
  const { can, current_scope } = useSession();
  const headers = useQuoteHeaders();
  const canView = can("solicitudes_anulacion.ver");
  const canResolve = can("solicitudes_anulacion.aprobar");
  const [solicitudes, setSolicitudes] = useState<SolicitudAnulacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selection, setSelection] = useState<{
    solicitud: SolicitudAnulacion;
    estado: DecisionSolicitud;
  } | null>(null);
  const [observacion, setObservacion] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);
  const generation = useRef(0);
  const fieldId = useId();

  const load = useCallback(
    async (isActive: () => boolean = () => true) => {
      if (!canView) return;
      const version = ++generation.current;
      setLoading(true);
      setError("");
      try {
        const data = await obtenerPendientes(headers);
        if (version === generation.current && isActive()) setSolicitudes(data);
      } catch (cause) {
        if (version === generation.current && isActive())
          setError(getApiErrorMessage(cause));
      } finally {
        if (version === generation.current && isActive()) setLoading(false);
      }
    },
    [canView, headers],
  );

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) return load(() => active);
    });
    return () => {
      active = false;
    };
  }, [load]);

  function close() {
    if (!submitting.current) setSelection(null);
  }

  function select(solicitud: SolicitudAnulacion, estado: DecisionSolicitud) {
    setObservacion("");
    setFormError("");
    setSelection({ solicitud, estado });
  }

  async function resolve(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selection || !canResolve || submitting.current) return;
    if (!puedeResolverSolicitud(selection.estado, observacion)) {
      setFormError("Escribe una observación para explicar el rechazo.");
      return;
    }
    submitting.current = true;
    setSaving(true);
    setFormError("");
    try {
      await resolverSolicitud(
        selection.solicitud.id,
        selection.estado,
        observacion.trim(),
        headers,
      );
      setSuccess(
        selection.estado === "APROBADA"
          ? "Solicitud aprobada. La cotización quedó anulada."
          : "Solicitud rechazada. La cotización conserva su estado.",
      );
      setSelection(null);
      await load();
    } catch (cause) {
      setFormError(getApiErrorMessage(cause));
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }

  // The ERP layout redirects before rendering this page when permission is missing.
  if (!canView) return null;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-sterinova-dark">
            Solicitudes Pendientes
          </h1>
          <p className="mt-1 text-sm text-surface-subtle">
            Revisa las solicitudes de anulación de{" "}
            {current_scope?.name ?? "tus ámbitos autorizados"}.
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={() => void load()}
          disabled={loading || saving}
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" /> Actualizar
        </Button>
      </div>

      {success && (
        <p
          role="status"
          className="rounded-control border border-success/20 bg-success-light px-4 py-3 text-sm font-medium text-success-foreground"
        >
          {success}
        </p>
      )}
      {loading ? (
        <LoadingState label="Cargando solicitudes pendientes..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : solicitudes.length === 0 ? (
        <EmptyState
          title="No hay solicitudes pendientes"
          message="Las nuevas solicitudes de anulación de tu área aparecerán aquí."
        />
      ) : (
        <div className="overflow-hidden rounded-card border border-surface-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] divide-y divide-surface-border text-left text-sm text-surface-foreground">
              <caption className="sr-only">
                Solicitudes de anulación pendientes de tus ámbitos autorizados
              </caption>
              <thead className="bg-sterinova-light text-sterinova-dark">
                <tr>
                  {[
                    "Cliente",
                    "Consecutivo de Cotización",
                    "Asesor que solicita",
                    "Motivo",
                    "Fecha",
                    "Acciones",
                  ].map((label) => (
                    <th
                      key={label}
                      scope="col"
                      className="px-4 py-3 font-semibold"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {solicitudes.map((solicitud) => (
                  <tr key={solicitud.id} className="align-top">
                    <td className="px-4 py-4">
                      {solicitud.cotizacion?.cliente?.razon_social ??
                        `Cliente #${solicitud.cotizacion?.cliente_id ?? solicitud.cotizacion_id}`}
                    </td>
                    <th scope="row" className="px-4 py-4 font-semibold">
                      {solicitud.cotizacion?.consecutivo ??
                        `Cotización #${solicitud.cotizacion_id}`}
                    </th>
                    <td className="px-4 py-4">
                      {solicitud.creador
                        ? [solicitud.creador.nombre, solicitud.creador.apellido]
                            .filter(Boolean)
                            .join(" ")
                        : `Usuario #${solicitud.creador_id}`}
                    </td>
                    <td className="max-w-sm whitespace-pre-wrap break-words px-4 py-4">
                      {solicitud.motivo}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <time dateTime={solicitud.created_at}>
                        {formatDate(solicitud.created_at)}
                      </time>
                    </td>
                    <td className="px-4 py-4">
                      {canResolve ? (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => select(solicitud, "APROBADA")}
                            disabled={saving}
                            aria-label={`Aprobar ${solicitud.cotizacion?.consecutivo ?? solicitud.id}`}
                          >
                            <Check className="h-4 w-4" aria-hidden="true" />{" "}
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => select(solicitud, "RECHAZADA")}
                            disabled={saving}
                            aria-label={`Rechazar ${solicitud.cotizacion?.consecutivo ?? solicitud.id}`}
                          >
                            <X className="h-4 w-4" aria-hidden="true" />{" "}
                            Rechazar
                          </Button>
                        </div>
                      ) : (
                        <span className="text-surface-subtle">
                          Solo consulta
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={Boolean(selection)}
        title={
          selection?.estado === "APROBADA"
            ? "Aprobar anulación"
            : "Rechazar solicitud"
        }
        description={
          selection?.estado === "APROBADA"
            ? `La cotización ${selection.solicitud.cotizacion?.consecutivo ?? selection.solicitud.cotizacion_id} quedará anulada.`
            : "Explica al asesor por qué no procede la anulación."
        }
        onClose={close}
      >
        <form onSubmit={resolve} className="space-y-4">
          <div>
            <label
              htmlFor={fieldId}
              className="mb-2 block text-sm font-semibold text-surface-foreground"
            >
              Observación{" "}
              {selection?.estado === "RECHAZADA"
                ? "(obligatoria)"
                : "(opcional)"}
            </label>
            <textarea
              id={fieldId}
              value={observacion}
              onChange={(event) => setObservacion(event.target.value)}
              rows={4}
              required={selection?.estado === "RECHAZADA"}
              disabled={saving}
              aria-invalid={Boolean(formError)}
              aria-describedby={formError ? `${fieldId}-error` : undefined}
              className="w-full resize-y rounded-control border border-surface-border bg-surface p-3 text-sm text-surface-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
            />
            {formError && (
              <p
                id={`${fieldId}-error`}
                role="alert"
                className="mt-2 text-sm text-error"
              >
                {formError}
              </p>
            )}
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={close}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant={
                selection?.estado === "APROBADA" ? "secondary" : "danger"
              }
              loading={saving}
              loadingLabel="Guardando..."
            >
              {selection?.estado === "APROBADA"
                ? "Aprobar anulación"
                : "Rechazar solicitud"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
