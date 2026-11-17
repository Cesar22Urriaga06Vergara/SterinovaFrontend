"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Download, RefreshCw } from "lucide-react";
import { api, downloadPdfFromBackend } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/states/ErrorState";
import { TableState } from "@/components/ui/states/TableState";
import type { CertificadoEsterilizacion, CicloCalidad } from "@/lib/calidad-types";
import { useSession } from "@/lib/session";

function formatDate(value: string) {
  return formatDateTime(value);
}

export default function CalidadPage() {
  const { can } = useSession();
  const canViewPending = can("calidad.ciclos.ver");
  const canViewCertificates = can("certificados.ver");
  const canDownloadCertificates = can("certificados.descargar");
  const [pendientes, setPendientes] = useState<CicloCalidad[]>([]);
  const [certificados, setCertificados] = useState<CertificadoEsterilizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  async function handleDownload(certificate: CertificadoEsterilizacion) {
    if (!canDownloadCertificates || downloadingId !== null) return;
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
        canViewPending ? api.get<CicloCalidad[]>("/calidad/pendientes") : Promise.resolve({ data: [] }),
        canViewCertificates ? api.get<CertificadoEsterilizacion[]>("/certificados") : Promise.resolve({ data: [] }),
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
      canViewPending ? api.get<CicloCalidad[]>("/calidad/pendientes") : Promise.resolve({ data: [] }),
      canViewCertificates ? api.get<CertificadoEsterilizacion[]>("/certificados") : Promise.resolve({ data: [] }),
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
  }, [canViewPending, canViewCertificates]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
            Control de proceso
          </p>
          <h1 className="mt-1 text-h2 text-surface-foreground">Calidad</h1>
          <p className="mt-1 text-body text-surface-subtle">
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
        <p className="rounded-control bg-error-light px-4 py-3 text-sm font-medium text-error-foreground" role="alert">
          {error}
        </p>
      ) : null}

      {loadError ? null : (
        <div className="space-y-8">
      {canViewPending ? <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-h4 text-surface-foreground">Ciclos pendientes</h2>
            <p className="text-sm text-surface-subtle">{pendientes.length} ciclos esperan revisión.</p>
          </div>
          <Badge variant="warning">
            {pendientes.length} pendientes
          </Badge>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[850px] w-full divide-y divide-surface-border text-left text-body">
              <thead className="bg-background text-surface-foreground">
                <tr>
                  <th className="px-4 py-3 text-caption font-semibold uppercase tracking-wide">Orden</th>
                  <th className="px-4 py-3 text-caption font-semibold uppercase tracking-wide">Cliente</th>
                  <th className="px-4 py-3 text-caption font-semibold uppercase tracking-wide">Método</th>
                  <th className="px-4 py-3 text-caption font-semibold uppercase tracking-wide">Fecha de proceso</th>
                  <th className="px-4 py-3 text-caption font-semibold uppercase tracking-wide">Operador</th>
                  <th className="px-4 py-3 text-right text-caption font-semibold uppercase tracking-wide">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/60 bg-surface">
                {loading ? (
                  <TableState colSpan={6} message="Cargando ciclos..." loading />
                ) : pendientes.length === 0 ? (
                  <TableState colSpan={6} message="No hay ciclos pendientes de revisión." />
                ) : pendientes.map((ciclo) => (
                  <tr key={ciclo.id} className="text-surface-foreground transition-colors hover:bg-background/60">
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
                        className="inline-flex items-center gap-1.5 rounded-control bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      >
                        Revisar <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section> : null}

      {canViewCertificates ? <section className="space-y-3">
        <div className="flex items-center gap-2">
          <BadgeCheck className="h-5 w-5 text-success" aria-hidden />
          <h2 className="text-h4 text-surface-foreground">Certificados emitidos</h2>
        </div>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[700px] w-full divide-y divide-surface-border text-left text-body">
              <thead className="bg-background text-surface-foreground">
                <tr>
                  <th className="px-4 py-3 text-caption font-semibold uppercase tracking-wide">Certificado</th>
                  <th className="px-4 py-3 text-caption font-semibold uppercase tracking-wide">Cliente</th>
                  <th className="px-4 py-3 text-caption font-semibold uppercase tracking-wide">Fecha de emisión</th>
                  <th className="px-4 py-3 text-caption font-semibold uppercase tracking-wide">Estado</th>
                  <th className="px-4 py-3 text-right text-caption font-semibold uppercase tracking-wide">Documento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/60 bg-surface">
                {loading ? (
                  <TableState colSpan={5} message="Cargando certificados..." loading />
                ) : certificados.length === 0 ? (
                  <TableState colSpan={5} message="Aún no se han emitido certificados." />
                ) : certificados.map((certificado) => (
                  <tr key={certificado.id} className="transition-colors hover:bg-background/60">
                    <td className="px-4 py-3 font-semibold text-surface-foreground">{certificado.consecutivo}</td>
                    <td className="px-4 py-3 text-surface-foreground">{certificado.cicloEsterilizacion?.orden?.cotizacion?.cliente?.razon_social ?? "—"}</td>
                    <td className="px-4 py-3 text-surface-subtle">{formatDate(certificado.fecha_emision ?? certificado.aprobado_at ?? certificado.created_at)}</td>
                    <td className="px-4 py-3"><Badge variant="success">Emitido</Badge></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link
                          href={`/calidad/certificados/${certificado.id}`}
                          className="inline-flex items-center gap-1.5 rounded-control border border-surface-border px-3 py-2 text-xs font-semibold text-surface-foreground transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        >
                          Ver <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                        </Link>
                        {canDownloadCertificates ? <Button
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
                        </Button> : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section> : null}
        </div>
      )}
    </div>
  );
}
