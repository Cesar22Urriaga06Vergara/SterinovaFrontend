"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, CheckCircle2, Download, Eye, Plus, Send, X } from "lucide-react";
import { api, downloadPdfFromBackend } from "@/lib/api";
import {
  Cotizacion,
  isEditableDraft,
  formatCurrency,
  labelTipoServicio,
} from "@/lib/cotizacion-types";
import { CotizacionPDF } from "@/components/pdf/CotizacionPDF";
import { cotizacionFromPdfSnapshot, formatMetadataFromSnapshot } from "@/lib/pdf-render-data";
import type { PdfFormatMetadata } from "@/lib/pdf-render-data";
import { useSession, useQuoteHeaders } from "@/lib/session";
import { useStoredUser } from "@/lib/stored-user-hook";
import { SolicitudAnulacionButton } from "@/components/SolicitudAnulacionButton";

type CotizacionPreview = { source: Cotizacion; data: Cotizacion; metadata: PdfFormatMetadata };

function isEmitted(cotizacion: Cotizacion) {
  return Boolean(
    cotizacion.fecha_emision ||
      cotizacion.pdf_url ||
      cotizacion.estado?.toUpperCase() === "EMITIDA",
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("es-CO");
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
    } catch {
      setError(`No se pudo aprobar ${cotizacion.consecutivo}.`);
    } finally {
      setApprovingId(null);
    }
  }

  return (
    <>
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-sterinova-dark">Cotizaciones</h1>
            <p className="mt-1 text-sterinova-teal">
              Aprueba y emite documentos oficiales para las órdenes de logística.
            </p>
          </div>
          {can("cotizaciones.crear") && <Link
            href="/comercial/cotizaciones/nueva"
            className="inline-flex items-center gap-2 rounded-lg bg-sterinova-orange px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Nueva Cotización
          </Link>}
        </div>

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800" role="status">
            <BadgeCheck className="h-4 w-4 shrink-0" aria-hidden /> {success}
          </p>
        ) : null}

        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-sterinova-dark/10">
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full divide-y divide-sterinova-dark/10 text-left text-sm">
              <thead className="bg-sterinova-light text-sterinova-dark">
                <tr>
                  <th className="px-4 py-3 font-semibold">Consecutivo</th>
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 font-semibold">Tipo</th>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sterinova-dark/5">
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-sterinova-teal">Cargando...</td></tr>
                ) : cotizaciones.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-sterinova-teal">No hay cotizaciones registradas.</td></tr>
                ) : cotizaciones.map((cotizacion) => {
                  const emitted = isEmitted(cotizacion);
                  return (
                    <tr key={cotizacion.id} className="text-sterinova-dark">
                      <td className="px-4 py-3 font-medium">{cotizacion.consecutivo}</td>
                      <td className="px-4 py-3">{cotizacion.cliente?.razon_social ?? `#${cotizacion.cliente_id}`}</td>
                      <td className="px-4 py-3">{labelTipoServicio(cotizacion.tipo_servicio)}</td>
                      <td className="px-4 py-3">{formatDate(cotizacion.fecha)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${emitted ? "bg-emerald-100 text-emerald-800" : cotizacion.estado === "APROBADA" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                          {emitted ? "EMITIDA" : cotizacion.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3">{formatCurrency(cotizacion.total)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {can("cotizaciones.editar") && isEditableDraft(cotizacion) && <Link href={`/comercial/cotizaciones/${cotizacion.id}/editar`} className="rounded-lg border px-2.5 py-1.5 text-xs font-medium">Editar</Link>}
                          {!emitted ? (
                            <>
                              {can("cotizaciones.emitir") && <button
                                type="button"
                                onClick={() => void handleEmitir(cotizacion)}
                                disabled={emittingId !== null || downloadingId !== null}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-sterinova-dark px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-sterinova-teal disabled:opacity-60"
                              >
                                <Send className="h-3.5 w-3.5" aria-hidden />
                                {emittingId === cotizacion.id ? "Emitiendo..." : "Emitir Cotización"}
                              </button>}
                              {can("cotizaciones.previsualizar") && <button
                                type="button"
                                onClick={() => void handlePreview(cotizacion)}
                                disabled={downloadingId !== null || emittingId !== null}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-sterinova-dark/15 px-2.5 py-1.5 text-xs font-medium text-sterinova-dark hover:bg-sterinova-light disabled:opacity-60"
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
                              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-700/25 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-60"
                            >
                              <Download className="h-3.5 w-3.5" aria-hidden />
                              {downloadingId === cotizacion.id ? "Descargando..." : "Descargar PDF Oficial"}
                            </button>
                          ) : null}
                          <SolicitudAnulacionButton cotizacion={cotizacion} onSuccess={setSuccess} />
                          {can("cotizaciones.editar") && isEditableDraft(cotizacion) ? (
                            <button
                              type="button"
                              onClick={() => void handleAprobar(cotizacion)}
                              disabled={approvingId !== null || emittingId !== null}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-green-600/30 px-2.5 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50 disabled:opacity-60"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                              {approvingId === cotizacion.id ? "Aprobando..." : "Aprobar"}
                            </button>
                          ) : null}
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
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/70 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={`Vista previa ${previewCotizacion.data.consecutivo}`}>
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-t-xl bg-white px-4 py-3 shadow">
            <div>
              <h2 className="font-semibold text-sterinova-dark">Borrador · {previewCotizacion.data.consecutivo}</h2>
              <p className="text-xs text-slate-500">Vista previa. El PDF oficial se fija al emitir.</p>
            </div>
            {can("cotizaciones.editar") && isEditableDraft(previewCotizacion.source) && <Link href={`/comercial/cotizaciones/${previewCotizacion.source.id}/editar`} className="rounded border px-3 py-2">Editar</Link>}
            <SolicitudAnulacionButton cotizacion={previewCotizacion.source} onSuccess={(message) => { setSuccess(message); setPreviewCotizacion(null); }} />
            <button type="button" onClick={() => setPreviewCotizacion(null)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Cerrar vista previa">
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <div className="flex-1 overflow-auto rounded-b-xl bg-slate-200 p-4">
            <div className="pdf-print-root pdf-preview-root mx-auto w-fit shadow-lg">
          <CotizacionPDF data={previewCotizacion.data} metadata={previewCotizacion.metadata} creatorMode="preview" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
