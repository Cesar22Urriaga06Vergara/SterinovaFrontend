"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Download, RefreshCw } from "lucide-react";
import { api, downloadPdfFromBackend } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/states/ErrorState";
import { TableState } from "@/components/ui/states/TableState";
import type { CertificadoEsterilizacion, CicloCalidad } from "@/lib/calidad-types";

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

export default function CalidadPage() {
  const [pendientes, setPendientes] = useState<CicloCalidad[]>([]);
  const [certificados, setCertificados] = useState<CertificadoEsterilizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  async function handleDownload(certificate: CertificadoEsterilizacion) {
    setDownloadingId(certificate.id);
    setError("");
    try {
      await downloadPdfFromBackend(
        `/certificados/${certificate.id}/descargar`,
        `CERTIFICADO-${certificate.consecutivo}.pdf`,
      );
    } catch {
      setError(`No se pudo descargar el certificado ${certificate.consecutivo}.`);
    } finally {
      setDownloadingId(null);
    }
  }

  async function loadData() {
    setLoading(true);
    setError("");
    setLoadError("");
    try {
      const [pendingResponse, certificateResponse] = await Promise.all([
        api.get<CicloCalidad[]>("/calidad/pendientes"),
        api.get<CertificadoEsterilizacion[]>("/certificados"),
      ]);
      setPendientes(pendingResponse.data);
      setCertificados(certificateResponse.data);
    } catch {
      setLoadError("No se pudieron cargar los ciclos y certificados de Calidad.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get<CicloCalidad[]>("/calidad/pendientes"),
      api.get<CertificadoEsterilizacion[]>("/certificados"),
    ])
      .then(([pendingResponse, certificateResponse]) => {
        if (!active) return;
        setPendientes(pendingResponse.data);
        setCertificados(certificateResponse.data);
      })
      .catch(() => {
        if (active) setLoadError("No se pudieron cargar los ciclos y certificados de Calidad.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
            Control de proceso
          </p>
          <h1 className="mt-1 text-3xl font-bold text-sterinova-dark">Calidad</h1>
          <p className="mt-1 text-sm text-slate-600">
            Revisa los ciclos de esterilización y consulta los certificados emitidos.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => void loadData()}
          disabled={loading}
          variant="ghost"
          className="border border-surface-border bg-surface text-surface-foreground shadow-sm hover:bg-background"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden />
          Actualizar
        </Button>
      </header>

      {loadError ? (
        <ErrorState
          message={loadError}
          onRetry={() => void loadData()}
        />
      ) : null}

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {loadError ? null : (
        <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-sterinova-dark">Ciclos pendientes</h2>
            <p className="text-sm text-surface-subtle">{pendientes.length} ciclos esperan revisión.</p>
          </div>
          <Badge variant="warning">
            {pendientes.length} pendientes
          </Badge>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-sterinova-dark/10">
          <div className="overflow-x-auto">
            <table className="min-w-[850px] w-full divide-y divide-sterinova-dark/10 text-left text-sm">
              <thead className="bg-sterinova-light text-sterinova-dark">
                <tr>
                  <th className="px-4 py-3 font-semibold">Orden</th>
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 font-semibold">Método</th>
                  <th className="px-4 py-3 font-semibold">Fecha de proceso</th>
                  <th className="px-4 py-3 font-semibold">Operador</th>
                  <th className="px-4 py-3 text-right font-semibold">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sterinova-dark/5">
                {loading ? (
                  <TableState colSpan={6} message="Cargando ciclos..." loading />
                ) : pendientes.length === 0 ? (
                  <TableState colSpan={6} message="No hay ciclos pendientes de revisión." />
                ) : pendientes.map((ciclo) => (
                  <tr key={ciclo.id} className="text-sterinova-dark hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-semibold">{ciclo.orden?.consecutivo ?? `#${ciclo.orden_id}`}</td>
                    <td className="px-4 py-3">{ciclo.orden?.cotizacion?.cliente?.razon_social ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant="info">
                        {ciclo.metodo === "ETO" ? "EtO" : "Vapor"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{formatDate(ciclo.fecha_proceso)}</td>
                    <td className="px-4 py-3">{ciclo.operador?.nombre ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/calidad/revisar/${ciclo.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-sterinova-dark px-3 py-2 text-xs font-bold text-white transition hover:bg-sterinova-teal"
                      >
                        Revisar <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <BadgeCheck className="h-5 w-5 text-emerald-700" aria-hidden />
          <h2 className="text-xl font-semibold text-sterinova-dark">Certificados emitidos</h2>
        </div>
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-sterinova-dark/10">
          <div className="overflow-x-auto">
            <table className="min-w-[700px] w-full divide-y divide-sterinova-dark/10 text-left text-sm">
              <thead className="bg-sterinova-light text-sterinova-dark">
                <tr>
                  <th className="px-4 py-3 font-semibold">Certificado</th>
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 font-semibold">Fecha de emisión</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 text-right font-semibold">Documento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sterinova-dark/5">
                {loading ? (
                  <TableState colSpan={5} message="Cargando certificados..." loading />
                ) : certificados.length === 0 ? (
                  <TableState colSpan={5} message="Aún no se han emitido certificados." />
                ) : certificados.map((certificado) => (
                  <tr key={certificado.id}>
                    <td className="px-4 py-3 font-bold text-sterinova-dark">{certificado.consecutivo}</td>
                    <td className="px-4 py-3 text-slate-700">{certificado.cicloEsterilizacion?.orden?.cotizacion?.cliente?.razon_social ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-700">{formatDate(certificado.fecha_emision ?? certificado.aprobado_at ?? certificado.created_at)}</td>
                    <td className="px-4 py-3"><Badge variant="success">Emitido</Badge></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link
                          href={`/calidad/certificados/${certificado.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-sterinova-teal/30 px-3 py-2 text-xs font-bold text-sterinova-dark hover:bg-sterinova-light"
                        >
                          Ver <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                        </Link>
                        <Button
                          type="button"
                          onClick={() => void handleDownload(certificado)}
                          disabled={!certificado.pdf_url || downloadingId !== null}
                          title={!certificado.pdf_url ? "Este registro histórico no tiene PDF oficial almacenado" : undefined}
                          variant="secondary"
                          size="sm"
                          loading={downloadingId === certificado.id}
                          loadingLabel="Descargando PDF"
                        >
                          <Download className="h-3.5 w-3.5" aria-hidden />
                          Descargar PDF
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
        </div>
      )}
    </div>
  );
}
