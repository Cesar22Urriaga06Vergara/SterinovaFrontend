"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/states/ErrorState";
import { TableState } from "@/components/ui/states/TableState";
import { useSession } from "@/lib/session";
import type { ResumenGerencia, IndicadorGerencia } from "@/lib/gerencia-types";

const INDICADOR_LABELS: Record<IndicadorGerencia, string> = {
  cotizaciones_creadas: "Cotizaciones creadas",
  cotizaciones_emitidas: "Cotizaciones emitidas",
  ordenes_creadas: "Órdenes creadas",
  ciclos_realizados: "Ciclos realizados",
  ciclos_aprobados: "Ciclos aprobados",
  ciclos_rechazados: "Ciclos rechazados",
  certificados_emitidos: "Certificados emitidos",
  entregas: "Entregas",
  cotizaciones_borrador: "Cotizaciones borrador",
  cotizaciones_por_emitir: "Cotizaciones por emitir",
  ordenes_abiertas: "Órdenes abiertas",
  calidad_por_revisar: "Calidad por revisar",
};

export default function GerenciaPage() {
  const { can, current_scope } = useSession();
  const canView = can("gerencia.metricas.ver");
  const [resumen, setResumen] = useState<ResumenGerencia | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadResumen = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (current_scope?.kind !== "GLOBAL" && current_scope?.id) {
        params.set("scope_id", String(current_scope.id));
      }
      const { data } = await api.get<ResumenGerencia>("/gerencia/resumen", { params });
      setResumen(data);
    } catch {
      setError("No se pudieron cargar las métricas gerenciales.");
    } finally {
      setLoading(false);
    }
  }, [current_scope]);

  useEffect(() => {
    if (canView) {
      const id = setTimeout(() => void loadResumen(), 0);
      return () => clearTimeout(id);
    }
  }, [canView, loadResumen]);

  if (!canView) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <PageHeader
        title="Métricas Gerenciales"
        description="Resumen de indicadores del negocio por período y ámbito."
        actions={
          <Button
            variant="ghost"
            onClick={() => void loadResumen()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden />
            Actualizar
          </Button>
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={() => void loadResumen()} />
      ) : resumen ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Cotizaciones creadas</CardTitle>
                <CardDescription>{resumen.total_cotizaciones}</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Cotizaciones emitidas</CardTitle>
                <CardDescription>{resumen.total_emitidas}</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Órdenes creadas</CardTitle>
                <CardDescription>{resumen.total_ordenes}</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Certificados emitidos</CardTitle>
                <CardDescription>{resumen.total_certificados}</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-surface-border text-left text-sm">
                <thead className="bg-background text-surface-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Indicador</th>
                    <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Valor</th>
                    <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Período</th>
                    <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/60 bg-surface">
                  {loading ? (
                    <TableState colSpan={4} message="Cargando indicadores..." loading />
                  ) : (resumen.indicadores ?? []).length === 0 ? (
                    <TableState colSpan={4} message="No hay indicadores disponibles." />
                  ) : (
                    (resumen.indicadores ?? []).map((metrica) => (
                      <tr key={metrica.indicador} className="text-surface-foreground hover:bg-background/60 transition-colors">
                        <td className="px-4 py-3 font-medium">
                          {INDICADOR_LABELS[metrica.indicador] ?? metrica.indicador}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm font-semibold">
                          {metrica.valor}
                        </td>
                        <td className="px-4 py-3 text-surface-subtle text-sm">
                          {metrica.periodo}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/gerencia/detalle?indicador=${metrica.indicador}`}
                            className="text-sm text-secondary hover:underline"
                          >
                            Ver detalle <ArrowRight className="h-3 w-3" aria-hidden />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 text-xs text-surface-subtle border-t border-surface-border">
              Período: {formatDateTime(resumen.fecha_desde)} → {formatDateTime(resumen.fecha_hasta)}
              {current_scope ? ` · Ámbito: ${current_scope.name}` : ""}
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}
