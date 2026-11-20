"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, CheckCircle2, Download, Eye, Plus, Send, X } from "lucide-react";
import { api, downloadPdfFromBackend } from "@/lib/api";
import { formatDate } from "@/lib/format";
import {
  Cotizacion,
  isEditableDraft,
  isInternallyApproved,
  formatCurrency,
  labelTipoServicio,
} from "@/lib/cotizacion-types";
import { CotizacionPDF } from "@/components/pdf/CotizacionPDF";
import { cotizacionFromPdfSnapshot, formatMetadataFromSnapshot } from "@/lib/pdf-render-data";
import type { PdfFormatMetadata } from "@/lib/pdf-render-data";
import { useSession, useQuoteHeaders } from "@/lib/session";
import { useStoredUser } from "@/lib/stored-user-hook";
import { SolicitudAnulacionButton } from "@/components/SolicitudAnulacionButton";
import { TableState } from "@/components/ui/states/TableState";
import { useDialogA11y } from "@/components/ui/useDialogA11y";

type CotizacionPreview = { source: Cotizacion; data: Cotizacion; metadata: PdfFormatMetadata };

function isEmitted(cotizacion: Cotizacion) {
  return Boolean(
    cotizacion.fecha_emision ||
      cotizacion.pdf_url ||
      cotizacion.estado?.toUpperCase() === "EMITIDA",
  );
}

export default function CotizacionesPage() {
  const sessionUser = useStoredUser();
  const { can } = useSession();
  const headers = useQuoteHeaders();
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [emittingId, setEmittingId] = useState<number | null>(null);
  const [previewCotizacion, setPreviewCotizacion] = useState<CotizacionPreview | null>(null);
  const previewDialogRef = useDialogA11y({
    open: Boolean(previewCotizacion),
    onClose: () => setPreviewCotizacion(null),
  });

  async function loadCotizaciones() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get<Cotizacion[]>("/cotizaciones", { headers });
      setCotizaciones(data);
    } catch {
      setError("No se pudieron cargar las cotizaciones.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    api
      .get<Cotizacion[]>("/cotizaciones", { headers })
      .then(({ data }) => {
        if (active) setCotizaciones(data);
      })
      .catch(() => {
        if (active) setError("No se pudieron cargar las cotizaciones.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [headers]);

  async function handleEmitir(cotizacion: Cotizacion) {
    if (!can("cotizaciones.emitir")) return;
    setEmittingId(cotizacion.id);
    setError("");
    setSuccess("");
    try {
      const { data } = await api.post<Cotizacion>(
        `/cotizaciones/${cotizacion.id}/emitir`, undefined, { headers },
      );
      setSuccess(`Cotización ${data.consecutivo} emitida exitosamente.`);
      await loadCotizaciones();
    } catch {
      setError(`No se pudo emitir ${cotizacion.consecutivo}.`);
    } finally {
      setEmittingId(null);
    }
  }

  async function handleOfficialDownload(cotizacion: Cotizacion) {
    setDownloadingId(cotizacion.id);
    setError("");
    try {
      await downloadPdfFromBackend(
        `/cotizaciones/${cotizacion.id}/descargar`,
        `${cotizacion.consecutivo}.pdf`,
        headers,
      );
    } catch {
      setError(`No se pudo descargar el PDF oficial de ${cotizacion.consecutivo}.`);
    } finally {
      setDownloadingId(null);
    }
  }

  async function handlePreview(cotizacion: Cotizacion) {
    if (!can("cotizaciones.previsualizar")) return;
    setDownloadingId(cotizacion.id);
    setError("");
    try {
      const { data } = await api.get<Record<string, unknown>>(`/cotizaciones/${cotizacion.id}/previsualizar`, { headers });
      const previewData = cotizacionFromPdfSnapshot(data);
      previewData.creador = cotizacion.creador ?? (
        sessionUser?.id && cotizacion.creador_id === sessionUser.id
          ? {
              id: sessionUser.id,
              nombre: sessionUser.nombre ?? "",
              apellido: sessionUser.apellido,
              cargo: sessionUser.cargo,
              celular: sessionUser.celular,
              email_contacto: sessionUser.email_contacto,
            }
          : null
      );
      setPreviewCotizacion({
        source: cotizacion,
        data: previewData,
        metadata: formatMetadataFromSnapshot(data.formato as Record<string, unknown>),
      });
    } catch {
      setError(`No se pudo abrir el borrador de ${cotizacion.consecutivo}.`);
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleAprobar(cotizacion: Cotizacion) {
    setApprovingId(cotizacion.id);
    setError("");
    setSuccess("");
    try {
      await api.post(`/cotizaciones/${cotizacion.id}/aprobar`, { version: cotizacion.version }, { headers });
      await loadCotizaciones();
    } catch (cause) {
      const response = (
        cause as { response?: { data?: { message?: string | string[] } } }
      ).response;
      const message = response?.data?.message;
      setError(
        Array.isArray(message)
          ? message.join(". ")
          : message || `No se pudo aprobar ${cotizacion.consecutivo}.`,
      );
    } finally {
      setApprovingId(null);
    }
  }

  async function handleAceptar(cotizacion: Cotizacion) {
    setError(""); setSuccess("");
    try {
      const { data } = await api.post<Cotizacion>(`/cotizaciones/${cotizacion.id}/aceptar`, undefined, { headers });
      setSuccess(`Aceptación del cliente registrada para ${data.consecutivo}.`);
      await loadCotizaciones();
    } catch (cause) {
      const message = (cause as {response?:{data?:{message?:string|string[]}}}).response?.data?.message;
      setError(Array.isArray(message) ? message.join(". ") : message || `No se pudo registrar la aceptación de ${cotizacion.consecutivo}.`);
    }
  }

  return (
    <>
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-h3 text-surface-foreground">Cotizaciones</h1>
            <p className="mt-1 text-body text-surface-subtle">
              Aprueba y emite documentos oficiales para las órdenes de logística.
            </p>
          </div>
          {can("cotizaciones.crear") && <Link
            href="/comercial/cotizaciones/nueva"
            className="inline-flex items-center gap-2 rounded-control bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Nueva Cotización
          </Link>}
        </div>

        {error ? (
          <p className="rounded-control bg-error-light px-4 py-3 text-sm font-medium text-error-foreground" role="alert">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="flex items-center gap-2 rounded-control bg-success-light px-4 py-3 text-sm font-semibold text-success-foreground" role="status">
            <BadgeCheck className="h-4 w-4 shrink-0" aria-hidden /> {success}
          </p>
        ) : null}

        <div className="overflow-hidden rounded-card border border-surface-border bg-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-225 w-full divide-y divide-surface-border text-left text-body">
              <thead className="bg-background text-surface-foreground">
                <tr>
                  <th className="px-4 py-3 text-caption font-semibold uppercase tracking-wide">Consecutivo</th>
                  <th className="px-4 py-3 text-caption font-semibold uppercase tracking-wide">Cliente</th>
                  <th className="px-4 py-3 text-caption font-semibold uppercase tracking-wide">Tipo</th>
                  <th className="px-4 py-3 text-caption font-semibold uppercase tracking-wide">Fecha</th>
                  <th className="px-4 py-3 text-caption font-semibold uppercase tracking-wide">Estado</th>
                  <th className="px-4 py-3 text-caption font-semibold uppercase tracking-wide">Total</th>
                  <th className="px-4 py-3 text-caption font-semibold uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/60">
                {loading ? (
                  <TableState colSpan={7} message="Cargando cotizaciones..." loading />
                ) : cotizaciones.length === 0 ? (
                  <TableState colSpan={7} message="No hay cotizaciones registradas." />
                ) : cotizaciones.map((cotizacion) => {
                  const emitted = isEmitted(cotizacion);
                  return (
                    <tr key={cotizacion.id} className="text-surface-foreground transition-colors hover:bg-background/60">
                      <td className="px-4 py-3 font-medium">{cotizacion.consecutivo}</td>
                      <td className="px-4 py-3">{cotizacion.cliente?.razon_social ?? `#${cotizacion.cliente_id}`}</td>
                      <td className="px-4 py-3">{labelTipoServicio(cotizacion.tipo_servicio)}</td>
                      <td className="px-4 py-3">{formatDate(cotizacion.fecha)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${emitted ? "bg-success-light text-success-foreground" : cotizacion.estado === "APROBADA" ? "bg-success-light text-success-foreground" : "bg-warning-light text-warning-foreground"}`}>
                          {emitted ? "EMITIDA" : cotizacion.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3">{formatCurrency(cotizacion.total)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {can("cotizaciones.editar") && isEditableDraft(cotizacion) && <Link href={`/comercial/cotizaciones/${cotizacion.id}/editar`} className="rounded-control border border-surface-border px-2.5 py-1.5 text-xs font-medium text-surface-foreground transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">Editar</Link>}
                          {!emitted ? (
                            <>
                              {can("cotizaciones.emitir") && isInternallyApproved(cotizacion) && <button
                                type="button"
                                onClick={() => void handleEmitir(cotizacion)}
                                disabled={emittingId !== null || downloadingId !== null}
                                className="inline-flex items-center gap-1.5 rounded-control bg-secondary px-2.5 py-1.5 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <Send className="h-3.5 w-3.5" aria-hidden />
                                {emittingId === cotizacion.id ? "Emitiendo..." : "Emitir Cotización"}
                              </button>}
                              {can("cotizaciones.previsualizar") && <button
                                type="button"
                                onClick={() => void handlePreview(cotizacion)}
                                disabled={downloadingId !== null || emittingId !== null}
                                className="inline-flex items-center gap-1.5 rounded-control border border-surface-border px-2.5 py-1.5 text-xs font-medium text-surface-foreground transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <Eye className="h-3.5 w-3.5" aria-hidden />
                                {downloadingId === cotizacion.id ? "Abriendo..." : "Ver Borrador"}
                              </button>}
                            </>
                          ) : can("cotizaciones.descargar") ? (
                            <button
                              type="button"
                              onClick={() => void handleOfficialDownload(cotizacion)}
                              disabled={downloadingId !== null}
                              className="inline-flex items-center gap-1.5 rounded-control bg-success-light px-2.5 py-1.5 text-xs font-semibold text-success-foreground ring-1 ring-success/25 transition-colors hover:bg-success/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <Download className="h-3.5 w-3.5" aria-hidden />
                              {downloadingId === cotizacion.id ? "Descargando..." : "Descargar PDF Oficial"}
                            </button>
                          ) : null}
                          <SolicitudAnulacionButton cotizacion={cotizacion} onSuccess={setSuccess} />
                          {can("cotizaciones.aprobar_interna") && sessionUser?.id !== cotizacion.creador_id && isEditableDraft(cotizacion) ? (
                            <button
                              type="button"
                              onClick={() => void handleAprobar(cotizacion)}
                              disabled={approvingId !== null || emittingId !== null}
                              className="inline-flex items-center gap-1.5 rounded-control border border-success/30 px-2.5 py-1.5 text-xs font-medium text-success transition-colors hover:bg-success-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                              {approvingId === cotizacion.id ? "Aprobando..." : "Aprobar"}
                            </button>
                          ) : null}
                          {can("cotizaciones.aceptar") && cotizacion.fecha_emision && cotizacion.estado === "APROBADA" && <button type="button" onClick={()=>void handleAceptar(cotizacion)} className="rounded-control border border-secondary px-2.5 py-1.5 text-xs font-medium text-secondary">Registrar aceptación</button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {previewCotizacion ? (
        <div
          ref={previewDialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="quote-preview-title"
          tabIndex={-1}
          className="fixed inset-0 z-50 flex flex-col bg-slate-950/70 p-3 sm:p-6"
        >
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 rounded-t-xl bg-surface px-4 py-3 shadow">
            <div>
              <h2 id="quote-preview-title" className="font-semibold text-surface-foreground">Borrador · {previewCotizacion.data.consecutivo}</h2>
              <p className="text-xs text-surface-subtle">Vista previa. El PDF oficial se fija al emitir.</p>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-control border border-surface-border px-3 py-2 text-sm font-medium text-surface-foreground transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <Download className="h-4 w-4" aria-hidden />
              Exportar PDF
            </button>
            {can("cotizaciones.editar") && isEditableDraft(previewCotizacion.source) && <Link href={`/comercial/cotizaciones/${previewCotizacion.source.id}/editar`} className="rounded-control border border-surface-border px-3 py-2 text-sm font-medium text-surface-foreground transition-colors hover:bg-background">Editar</Link>}
            <SolicitudAnulacionButton cotizacion={previewCotizacion.source} onSuccess={(message) => { setSuccess(message); setPreviewCotizacion(null); }} />
            <button type="button" onClick={() => setPreviewCotizacion(null)} className="rounded-control p-2 text-surface-subtle transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Cerrar vista previa">
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <div className="flex-1 overflow-auto rounded-b-xl bg-background p-4">
            <div className="pdf-print-root pdf-preview-root mx-auto w-fit shadow-lg">
          <CotizacionPDF data={previewCotizacion.data} metadata={previewCotizacion.metadata} creatorMode="preview" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
